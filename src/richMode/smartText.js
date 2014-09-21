'use strict';

function replaceQuotes (open, close, prime) {
  return function (match, index, str) {
    var before = str[index - 1]

    if (!before || /[\s\(\[\{]/.test(before)) return open
    if (/\d/.test(before)) return prime

    return close
  }
}

function smartText (Compose) {
  var types = Compose.require('serialize').types,
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
}

module.exports = smartText
