'use strict';

function Enter (Compose) {
  var View = Compose.require('view'),
      Delta = Compose.require('delta'),
      events = Compose.require('events'),
      Selection = Compose.require('selection'),
      startSpace = /^[\u00A0 \u200A]/,
      endSpace = /[\u00A0 \u200A]$/,
      listRegex = /^[OU]L$/i,
      nbsp = '\u00A0'

  Compose.on('keydown', function (e) {
    var sel = Selection.get(),
        fallthrough = false,
        startIndex,
        startPair,
        endPair,
        markup,
        type,
        start,
        end,
        i

    if (!events.enterKey(e)) return

    e.preventDefault()

    startPair = sel.isBackwards() ? sel.end : sel.start
    endPair = sel.isBackwards() ? sel.start : sel.end
    start = View.paragraphs[startPair[0]]
    end = View.paragraphs[endPair[0]]

    startIndex = startPair[0]
    type = start.type

    if (e.shiftKey && start.text[startPair[1] - 1] === '\n') {
      startPair = startPair.slice()
      startPair[1] -= 1
      fallthrough = true
    }

    if (e.shiftKey && end.text[endPair[1]] === '\n' &&
      endPair[1] < end.length - 1) {
        endPair = endPair.slice()
        endPair[1] += 1
        fallthrough = true
      }

    if (e.shiftKey && !fallthrough) {
      if (sel.isCollapsed() && startPair[1] === 0) return

      start = start.substr(0, startPair[1])
      end = end.substr(endPair[1])

      start = start.replace(endSpace, nbsp)
      end = end.replace(startSpace, nbsp)

      if (!end.text) {
        end.text = '\n'
        end.length = 1
      }

      start.text += '\n'
      start.length += 1

      for (i = 0; i < start.markups.length; i += 1) {
        markup = start.markups[i]

        if (markup.start >= startPair[1])
          markup.start += 1
        if (markup.end >= startPair[1])
          markup.end += 1
      }

      start = start.append(end)

      for (i = startIndex + 1; i <= endPair[0]; i += 1) {
        if (View.isSectionStart(i))
          View.render(new Delta('sectionDelete', startIndex + 1))

        View.render(new Delta('paragraphDelete', startIndex + 1))
      }

      View.render(new Delta('paragraphUpdate', startIndex, start))
      Compose.once('render', function () {
        Selection.set(new Selection([startIndex, startPair[1] + 1]))
      })

      return
    }

    if (sel.isCollapsed() && start.text === '\n') {
      start = start.substr(0)

      if (listRegex.test(type)) {
        start.type = 'p'
        View.render(new Delta('paragraphUpdate', startIndex, start))
      } else if (!View.isSectionStart(startIndex)) {
        View.render(
          new Delta('sectionInsert', startIndex, { start: startIndex })
        )
      } else return

      Compose.once('render', function () {
        Selection.set(new Selection([startIndex, 0]))
      })

      return
    }

    for (i = startIndex + 1; i <= endPair[0]; i += 1) {
      if (View.isSectionStart(i))
        View.render(new Delta('sectionDelete', startIndex + 1))

      View.render(new Delta('paragraphDelete', startIndex + 1))
    }

    start = start.substr(0, startPair[1])
    end = end.substr(endPair[1])

    start = start.replace(endSpace, nbsp)
    end = end.replace(startSpace, nbsp)

    if (end.text[0] === '\n')
      end = end.substr(1)

    if (!start.text || /[^\n]\n$/.test(start.text)) {
      start.text += '\n'
      start.length += 1
    }

    if (!end.text) {
      end.type = listRegex.test(type) ? type : 'p'
      end.text = '\n'
      end.length = 1
    } else if (listRegex.test(type)) {
      end.type = type
    }

    View.render(new Delta('paragraphUpdate', startIndex, start))
    View.render(new Delta('paragraphInsert', startIndex + 1, end))
    Compose.once('render', function () {
      Selection.set(new Selection([startIndex + 1, 0]))
    })
  })
}

module.exports = Enter
