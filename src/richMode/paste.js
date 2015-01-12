'use strict';

function Paste (Compose) {
  var debug = Compose.require('debug')('compose:paste'),
      Selection = Compose.require('selection'),
      sanitize = Compose.require('sanitize'),
      Delta = Compose.require('delta'),
      View = Compose.require('view'),
      startSpace = /^[ \u00A0\u200A]/,
      endSpace = /[ \u00A0\u200A]$/,
      nbsp = '\u00A0'

  /**
   * join(first, second) joins two paragraphs, being mindful of spaces
   * and whatnot.
   *
   * @param {Serialize} first
   * @param {Serialize} second
   * @return {Serialize}
   */
  function join (first, second) {
    var result

    if (startSpace.test(second.text) && endSpace.test(first.text))
      second = second.substr(1)
    if (second.text === '\n')
      second = second.substr(1)

    first = first.replace(endSpace, ' ')
    second = second.replace(startSpace, ' ')

    result = first.append(second)
    if (result[0] === ' ')
      result = result.replace(startSpace, nbsp)
    if (result.text[result.length - 1] === ' ')
      result = result.replace(endSpace, nbsp)

    return result
  }

  Compose.on('paste', function onPaste (e) {
    var sel = Selection.get(),
        extracted,
        paragraph,
        startPair,
        endPair,
        types,
        start,
        type,
        data,
        len,
        end,
        i

    e.preventDefault()

    types = e.clipboardData.types
    debug('Available types: %o', types)

    if (types.indexOf('text/html') >= 0)
      type = 'text/html'
    else if (types.indexOf('text/plain') >= 0)
      type = 'text/plain'
    else
      return debug('No usable type.')

    data = e.clipboardData.getData(type)
    debug('Using data “%s”', data)

    if (type === 'text/plain')
      extracted = sanitize.text(data).paragraphs
    else
      extracted = sanitize(data).paragraphs

    debug('Extracted %d paragraph(s): %o', extracted.length, extracted)

    startPair = sel.isBackwards() ? sel.end : sel.start
    endPair = sel.isBackwards() ? sel.start : sel.end

    start = View.paragraphs[startPair[0]].substr(0, startPair[1])
    end = View.paragraphs[endPair[0]].substr(endPair[1])

    if (end.text === '\n')
      end = end.substr(1)

    for (i = startPair[0] + 1; i <= endPair[0]; i += 1) {
      if (View.isSectionStart(startPair[0] + i))
        View.render(new Delta('sectionDelete', startPair[0] + 1))

      View.render(new Delta('paragraphDelete', startPair[0] + 1))
    }

    for (i = 0; i < extracted.length; i += 1) {
      paragraph = extracted[i]

      if (i === 0 && start.length)
        paragraph = join(start, paragraph)

      if (i === extracted.length - 1) {
        len = paragraph.length
        paragraph = join(paragraph, end)
      }

      // This shouldn’t happen, at least in theory.
      if (!paragraph.text)
        paragraph.text = '\n'

      if (i === 0)
        View.render(new Delta('paragraphUpdate', startPair[0], paragraph))
      else
        View.render(new Delta('paragraphInsert', startPair[0] + i, paragraph))
    }

    Compose.once('render', function postPaste () {
      Selection.set(new Selection([startPair[0] + extracted.length - 1, len]))
    })
  })
}

module.exports = Paste
