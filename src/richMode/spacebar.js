'use strict';

function Spacebar (Compose) {
  var Selection = Compose.require('selection'),
      events = Compose.require('events'),
      Delta = Compose.require('delta'),
      View = Compose.require('view'),

      // Non-breaking space, normal space, hair space.
      spaceRegex = /[\u00A0 \u200A]/,
      nbsp = '\u00A0'

  Compose.on('keypress', function (e) {
    var sel = Selection.get(),
        startIndex,
        textIndex,
        markup,
        startPair,
        endPair,
        start,
        end,
        last,
        i

    if (!events.spacebar(e)) return

    e.preventDefault()
    View.sync()

    startPair = sel.isBackwards() ? sel.end : sel.start
    endPair = sel.isBackwards() ? sel.start : sel.end
    start = View.paragraphs[startPair[0]]
    end = View.paragraphs[endPair[0]]

    startIndex = startPair[0]
    textIndex = startPair[1]

    if (sel.isCollapsed() && start.type === 'p' &&
        ((/^1\./.test(start.text) && textIndex === 2) ||
         (/^[\*\-\u2022]/.test(start.text) && textIndex === 1))) {
      end = end.substr(textIndex)
      end.type = start.text[0] === '1' ? 'ol' : 'ul'
      if (!end.text) {
        end.text = '\n'
        end.length = 1
      }

      View.render(new Delta('paragraphUpdate', startIndex, end))
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

    start = start.substr(0, textIndex)
    end = end.substr(endPair[1])
    last = start.text[start.length - 1]

    if (spaceRegex.test(last) && spaceRegex.test(end.text[0]))
      end = end.substr(1)

    if (end.text === '\n') {
      end.markups = []
      end.text = ''
      end.length = 0
    }

    if (!end.text && spaceRegex.test(last)) {
      start.text = start.text.substr(0, start.length - 1) + nbsp
      textIndex -= 1
    } else if (!start.text && spaceRegex.test(end.text[0])) {
      end.text = nbsp + end.text.substr(1)
      textIndex -= 1
    } else if (spaceRegex.test(last)) {
      textIndex -= 1
    } else if (!spaceRegex.test(end.text[0])) {
      if (!end.text || !start.text || start.text[start.length - 1] === '\n')
        start.text +=  nbsp
      else
        start.text += ' '

      start.length += 1

      for (i = 0; i < start.markups.length; i += 1) {
        markup = start.markups[i]

        if (markup.start >= textIndex)
          markup.start += 1
        if (markup.end >= textIndex)
          markup.end += 1
      }
    }

    start = start.append(end)
    View.render(new Delta('paragraphUpdate', startIndex, start))
    Compose.once('render', function () {
      Selection.set(new Selection([startIndex, textIndex + 1]))
    })
  })
}

module.exports = Spacebar
