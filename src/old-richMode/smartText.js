'use strict';

/**
 * replaceQuotes(), given an opening, closing and prime variant of a
 * quotation mark (e.g “, ”, ″), returns a function that can be used
 * in String#replace or similar to replace straight quotation marks
 * with curly (or prime) ones.
 *
 * @param {String} open
 * @param {String} close
 * @param {String} prime
 * @return {Function}
 */
function replaceQuotes (open, close, prime) {
  return function (match, index, str) {
    var before = str[index - 1]

    if (!before || /[\s\(\[\{]/.test(before)) return open
    if (/\d/.test(before)) return prime

    return close
  }
}

/**
 * Smart text shortcuts. All are disabled in <pre> blocks and
 * <code> markups.
 *
 *  <3      →   ❤
 *  ...     →   …
 *  :)      →   ☺
 *  :(      →   ☹
 *  '       →   One of “” (quotation marks) or ″ (prime)
 *  "       →   One of ‘’ (quotation marks) or ′ (prime)
 *  ->      →   →
 */
function smartText (Compose) {
  var simpleText = /(?:\.\.\.|<3|:\)|:\(|[\-–—]>|'|")/g,
      types = Compose.require('serialize').types,
      Formatter = Compose.require('formatter'),
      Selection = Compose.require('selection'),
      Delta = Compose.require('delta'),
      View = Compose.require('view'),
      startNbsp = /^[\u00A0]/,
      endNbsp = /[\u00A0]$/

  Compose.on('keypress', function (e) {
    var key = String.fromCharCode(e.which),
        sel = Selection.get(),
        startPair,
        endPair,
        markup,
        length,
        start,
        end,
        i

    if (!/[3\.\(\)'">]/.test(key))
      return

    startPair = sel.isBackwards() ? sel.end : sel.start
    endPair = sel.isBackwards() ? sel.start : sel.end
    start = View.paragraphs[startPair[0]]
    end = View.paragraphs[endPair[0]]

    if (start.type === 'pre' || Formatter.inline.status('code'))
      return

    /**
     * All browsers, in the following cases, will treat the next input
     * character as being in a <code>; disable smart text accordingly.
     *    |<code>1</code>23|
     *    <code>1|2</code>3|
     */
    for (i = 0; i < start.markups.length; i += 1) {
      markup = start.markups[i]

      if (markup.type < types.code) continue
      if (markup.type > types.code) break

      if (markup.start <= startPair[1] && startPair[1] < markup.end)
        return
    }

    e.preventDefault()

    start = start.substr(0, startPair[1]).replace(endNbsp, ' ')
    end = end.substr(endPair[1]).replace(startNbsp, ' ')

    start = start.append(key)
      .replace(/<3$/, '❤')
      .replace(/\.\.\.$/, '…')
      .replace(/:\)$/, '☺')
      .replace(/:\($/, '☹')

      // Dash, en-dash, em-dash are all valid arrow tails.
      .replace(/[\-–—]>$/, '→')
      .replace(/'$/, replaceQuotes('‘', '’', '′'))
      .replace(/"$/, replaceQuotes('“', '”', '″'))

    length = start.length
    if (length <= startPair[1])
      Formatter.inline.preventDefault()

    start = start.append(end)

    for (i = startPair[0] + 1; i <= endPair[0]; i += 1) {
      if (View.isSectionStart(i))
        View.render(new Delta('sectionDelete', startPair[0] + 1))

      View.render(new Delta('paragraphDelete', startPair[0] + 1))
    }

    View.render(new Delta('paragraphUpdate', startPair[0], start))
    Compose.once('render', function () {
      Selection.set(new Selection([startPair[0], length]))
    })
  })

  /**
   * smarten(paragraph) takes an instance of Serialize and applies the
   * various smart text filters to it.
   *
   * @param {Serialize} paragraph
   * @return {Serialize}
   */
  function smarten (paragraph) {
    return paragraph.replace(simpleText, function (match, index, string) {
      var before = string[index - 1],
          end = index + match.length,
          markup,
          i

      for (i = 0; i < paragraph.markups.length; i += 1) {
        markup = paragraph.markups[i]

        if (markup.type < types.code) continue
        if (markup.type > types.code) break

        // If the matched simple text overlaps a <code> markup, do nothing.
        if (index >= markup.start && index < markup.end ||
            end > markup.start && end <= markup.end)
          return match
      }

      switch (match) {
        case '...':
          return '…'
        case '<3':
          return '❤'
        case ':)':
          return '☺'
        case ':(':
          return '☹'
        case '->': // Regular dash
        case '\u2013>': // En dash
        case '\u2014>': // Em dash
          return '→'
        case '\'':
          if (!before || /[\s\(\[\{]/.test(before))
            return '‘'
          if (/\d/.test(before))
            return '′'

          return '’'
        case '"':
          if (!before || /[\s\(\[\{]/.test(before))
            return '“'
          if (/\d/.test(before))
            return '″'

          return '”'
        default:
          return match
      }
    })
  }

  // Sanitizer plugin.
  Compose.on('sanitize', function (e) {
    if (e.paragraph.type === 'pre')
      return

    e.paragraph = smarten(e.paragraph)
  })
}

module.exports = smartText
