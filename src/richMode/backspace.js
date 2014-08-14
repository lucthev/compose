'use strict';

function Backspace (Compose) {
  var View = Compose.require('view'),
      Delta = Compose.require('delta'),
      events = Compose.require('events'),
      Selection = Compose.require('selection'),
      startSpace = /^[\u00A0 \u200A]/,
      endSpace = /[\u00A0 \u200A]$/,
      nbsp = '\u00A0'

  Compose.on('keydown', function (e) {
    var backspace = events.backspace(e),
        sel = Selection.get(),
        startIndex,
        textIndex,
        startPair,
        endPair,
        start,
        end,
        next,
        i

    if (!backspace && !events.forwardDelete(e))
      return

    e.preventDefault()
    View.sync()

    startPair = sel.isBackwards() ? sel.end : sel.start
    endPair = sel.isBackwards() ? sel.start : sel.end
    start = View.paragraphs[startPair[0]]
    end = View.paragraphs[endPair[0]]

    startIndex = startPair[0]
    textIndex = startPair[1]

    if (!sel.isCollapsed()) {
      for (i = startIndex + 1; i <= endPair[0]; i += 1) {
        if (View.isSectionStart(i))
          View.render(new Delta('sectionDelete', startIndex + 1))

        View.render(new Delta('paragraphDelete', startIndex + 1))
      }

      start = start
        .substr(0, textIndex)
        .replace(endSpace, ' ')
      end = end
        .substr(endPair[1])
        .replace(startSpace, ' ')

      if (endSpace.test(start.text) && startSpace.test(end.text))
        end = end.substr(1)
      else if (end.text[0] === '\n')
        end = end.substr(1)

      start = start
        .append(end)
        .replace(startSpace, nbsp)
        .replace(endSpace, nbsp)

      if (!start.text) {
        start.text = '\n'
        start.length = 1
      }

      View.render(new Delta('paragraphUpdate', startIndex, start))
      Compose.once('render', function () {
        Selection.set(new Selection([startIndex, textIndex]))
      })

      return
    }

    if (backspace && textIndex === 0 && /^[ou]l$/.test(start.type)) {
      start = start.substr(0)
      start.type = 'p'

      View.render(new Delta('paragraphUpdate', startIndex, start))
      Compose.once('render', function () {
        Selection.set(new Selection([startIndex, 0]))
      })

    } else if (backspace && textIndex === 0) {
      if (startIndex === 0) return

      if (View.isSectionStart(startIndex)) {
        View.render(new Delta('sectionDelete', startIndex))
        Compose.once('render', function () {
          Selection.set(new Selection([startIndex, 0]))
        })

        return
      }

      start = start.replace(startSpace, ' ')
      next = View.paragraphs[startIndex - 1]
        .substr(0)
        .replace(endSpace, ' ')

      textIndex = next.length

      if (endSpace.test(next.text) && startSpace.test(start.text))
        start = start.substr(1)

      next = next
        .append(start)
        .replace(endSpace, nbsp)

      View.render(new Delta('paragraphDelete', startIndex))
      View.render(new Delta('paragraphUpdate', startIndex - 1, next))
      Compose.once('render', function () {
        Selection.set(new Selection([startIndex - 1, textIndex]))
      })

    } else if (!backspace && textIndex === start.length) {
      if (startIndex === View.paragraphs.length - 1) return

      if (View.isSectionStart(startIndex + 1)) {
        View.render(new Delta('sectionDelete', startIndex + 1))
        Compose.once('render', function () {
          Selection.set(new Selection([startIndex, textIndex]))
        })

        return
      }

      textIndex = start.length
      start = start
        .replace(endSpace, ' ')
      next = View.paragraphs[startIndex + 1]
        .substr(0)
        .replace(startSpace, ' ')

      if (endSpace.test(start.text) && startSpace.test(next.text))
        next = next.substr(1)

      start = start
        .append(next)
        .replace(endSpace, nbsp)

      View.render(new Delta('paragraphDelete', startIndex + 1))
      View.render(new Delta('paragraphUpdate', startIndex, start))

      Compose.once('render', function () {
        Selection.set(new Selection([startIndex, textIndex]))
      })

    } else {
      next = start
        .substr(textIndex + (backspace ? 0 : 1))
        .replace(startSpace, ' ')

      start = start
        .substr(0 , textIndex - (backspace ? 1 : 0))
        .replace(endSpace, ' ')

      if (endSpace.test(start.text) && startSpace.test(next.text))
        next = next.substr(1)

      start = start
        .append(next)
        .replace(startSpace, nbsp)
        .replace(endSpace, nbsp)

      if (!start.text) {
        start.text = '\n'
        start.length = 1
      }

      textIndex -= (backspace ? 1 : 0)

      View.render(new Delta('paragraphUpdate', startIndex, start))
      Compose.once('render', function () {
        Selection.set(new Selection([startIndex, textIndex]))
      })
    }
  })
}

module.exports = Backspace
