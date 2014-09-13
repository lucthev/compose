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
        collapsed = sel.isCollapsed(),
        startIndex,
        textIndex,
        startPair,
        endPair,
        start,
        end,
        i

    if (!backspace && !events.forwardDelete(e))
      return

    e.preventDefault()

    startPair = sel.isBackwards() ? sel.end : sel.start
    endPair = sel.isBackwards() ? sel.start : sel.end
    start = View.paragraphs[startPair[0]]
    end = View.paragraphs[endPair[0]]

    startIndex = startPair[0]
    textIndex = startPair[1]

    if (collapsed) {
      if (backspace && textIndex === 0 && /^[ou]l$/.test(start.type)) {
        start = start.substr(0)
        start.type = 'p'

        View.render(new Delta('paragraphUpdate', startIndex, start))
        Compose.once('render', function () {
          Selection.set(new Selection([startIndex, 0]))
        })

        return
      }

      if (backspace && textIndex === 0) {
        if (startIndex === 0) return

        if (View.isSectionStart(startIndex)) {
          View.render(new Delta('sectionDelete', startIndex))
          Compose.once('render', function () {
            Selection.set(new Selection([startIndex, 0]))
          })

          return
        }

        startPair = startPair.slice()
        startPair[0] -= 1
        start = View.paragraphs[startPair[0]]

        if (start.text[start.length - 1] === '\n')
          startPair[1] = start.length -1
        else
          startPair[1] = start.length
      } else if (backspace) {
        startPair = startPair.slice()
        startPair[1] -= 1
      } else if ((textIndex === start.length - 1 && /\n$/.test(start.text)) ||
          textIndex === start.length) {
        if (startIndex === View.paragraphs.length - 1) return

        if (View.isSectionStart(startIndex + 1)) {
          View.render(new Delta('sectionDelete', startIndex + 1))
          Compose.once('render', function () {
            Selection.set(new Selection([startIndex, textIndex]))
          })

          return
        }

        endPair = endPair.slice()
        endPair[0] += 1
        endPair[1] = 0
      } else {
        endPair = endPair.slice()
        endPair[1] += 1
      }
    }

    // Indices may have changed.
    start = View.paragraphs[startPair[0]]
    end = View.paragraphs[endPair[0]]
    startIndex = startPair[0]
    textIndex = startPair[1]

    for (i = startIndex + 1; i <= endPair[0]; i += 1) {
      if (View.isSectionStart(i))
        View.render(new Delta('sectionDelete', startIndex + 1))

      View.render(new Delta('paragraphDelete', startIndex + 1))
    }

    start = start.substr(0, textIndex)
    end = end.substr(endPair[1])

    if ((endSpace.test(start.text) && startSpace.test(end.text)) ||
      end.text === '\n') {
      end = end.substr(1)
    }

    if (startSpace.test(end.text))
      end = end.replace(startSpace, /[^^\n]$/.test(start.text) ? ' ' : nbsp)
    else if (endSpace.test(start.text))
      start = start.replace(endSpace, /^[^\n$]/.test(end.text) ? ' ' : nbsp)
    else if (/\n$/.test(start.text) && !end.text)
      end.text = '\n'

    start = start.append(end)
    if (!start.text)
      start.text = '\n'

    View.render(new Delta('paragraphUpdate', startIndex, start))
    Compose.once('render', function () {
      Selection.set(new Selection([startIndex, textIndex]))
    })
  })
}

module.exports = Backspace
