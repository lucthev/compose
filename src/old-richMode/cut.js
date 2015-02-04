'use strict';

function ancestor (node) {
  while (node.parentNode)
    node = node.parentNode

  return node
}

function Cut (Compose) {
  var debug = Compose.require('debug')('compose:cut'),
      Selection = Compose.require('selection'),
      Converter = Compose.require('converter'),
      Delta = Compose.require('delta'),
      View = Compose.require('view'),
      dom = Compose.require('dom'),
      startSpace = /^[\u00A0 \u200A]/,
      endSpace = /[\u00A0 \u200A]$/,
      nbsp = '\u00A0'

  Compose.on('cut', function (e) {
    var sel = Selection.get(),
        cutHtml = '',
        cutText = '',
        paragraph,
        startPair,
        endPair,
        current,
        before,
        start,
        end,
        i

    e.preventDefault()

    startPair = sel.isBackwards() ? sel.end : sel.start
    endPair = sel.isBackwards() ? sel.start : sel.end

    for (i = startPair[0]; i <= endPair[0]; i += 1) {
      paragraph = View.paragraphs[i]
      start = i === startPair[0] ? startPair[1] : 0
      end = i === endPair[0] ?
        endPair[1] :
        paragraph.length - Number(/.\n$/.test(paragraph.text))

      paragraph = paragraph.substring(start, end)

      // FIXME: should Windows get '\r's?
      if (i !== startPair[0])
        cutText += '\n\n'

      cutText += paragraph.text

      if (i !== startPair[0] && View.isSectionStart(i))
        View.render(new Delta('sectionDelete', startPair[0] + 1))

      if (i !== startPair[0])
        View.render(new Delta('paragraphDelete', startPair[0] + 1))

      if (!before) {
        before = ancestor(Converter.toElement(paragraph))
        continue
      }

      current = ancestor(Converter.toElement(paragraph))

      while (Converter.canMerge(current, before)) {
        before = before.lastChild

        while (current.lastChild)
          dom.after(before, dom.remove(current.lastChild))

        current = before.nextSibling
      }

      if (current !== ancestor(current)) {
        before = ancestor(current)
        continue
      }

      cutHtml += before.outerHTML
      before = ancestor(current)
    }

    cutHtml += before.outerHTML

    start = View.paragraphs[startPair[0]].substr(0, startPair[1])
    end = View.paragraphs[endPair[0]].substr(endPair[1])

    // TODO: this is literally copy-pasted from the backspace handler.
    // Maybe find a way to reduce the duplication.
    if ((endSpace.test(start.text) && startSpace.test(end.text)) ||
        end.text === '\n')
      end = end.substr(1)

    if (startSpace.test(end.text))
      end = end.replace(startSpace, /.$/.test(start.text) ? ' ' : nbsp)
    else if (endSpace.test(start.text))
      start = start.replace(endSpace, /^./.test(end.text) ? ' ' : nbsp)
    else if (/\n$/.test(start.text) && !end.text)
      end.text = '\n'

    start = start.append(end)
    if (!start.text)
      start.text = '\n'

    e.clipboardData.clearData()
    e.clipboardData.setData('text/plain', cutText)
    e.clipboardData.setData('text/html', cutHtml)

    debug('Set text data to "%s"', cutText)
    debug('Set html data to "%s"', cutHtml)

    View.render(new Delta('paragraphUpdate', startPair[0], start))
    Compose.once('render', function () {
      Selection.set(new Selection(startPair))
    })
  })
}

module.exports = Cut
