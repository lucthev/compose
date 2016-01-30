'use strict'

const startSpace = /^[^\S\r\n\v\f]/
const endSpace = /[^\S\r\n\v\f]$/
const nbsp = '\u00A0'

export default function backspacePlugin (editor) {
  const Selection = editor.require('selection')
  const view = editor.require('view')

  function forwardDelete () {
    let sel = view.getSelection()

    if (!sel.isCollapsed) {
      removeSelectedText(sel)
      return
    }

    let startPair = sel.absoluteStart
    let endPair = sel.absoluteEnd
    let end = view.paragraphs[endPair[0]]

    let atEnd = isAtEnd(end, endPair[1])
    if (atEnd && endPair[0] < view.paragraphs.length - 1) {
      endPair[0] += 1
      endPair[1] = 0
    } else if (!atEnd) {
      endPair[1] += 1
    }

    removeSelectedText(new Selection(startPair, endPair))
  }

  // Check that a given index is at the end of a paragraph,
  // ignoring trailing BRs.
  function isAtEnd (p, index) {
    return (
      index === p.length ||
      (index === p.length - 1 && p.text[p.length - 1] === '\n')
    )
  }

  function backspace () {
    let sel = view.getSelection()

    if (!sel.isCollapsed) {
      removeSelectedText(sel)
      return
    }

    let startPair = sel.absoluteStart
    let endPair = sel.absoluteEnd

    if (endPair[0] > 0 && endPair[1] === 0) {
      startPair[0] -= 1
      let start = view.paragraphs[startPair[0]]

      // Place the cursor behind a potential trailing newline; this also
      // accounts for the case that the previous paragraph ends in a double
      // newline.
      if (start.text[start.length - 1] === '\n') {
        startPair[1] = start.length - 1
      } else {
        startPair[1] = start.length
      }
    } else if (endPair[1] > 0) {
      startPair[1] -= 1
    }

    removeSelectedText(new Selection(startPair, endPair))
  }

  function removeSelectedText (sel) {
    sel = sel || view.getSelection()

    if (sel.isCollapsed) return

    let startPair = sel.absoluteStart
    let endPair = sel.absoluteEnd

    let start = view.paragraphs[startPair[0]].substr(0, startPair[1])
    let end = view.paragraphs[endPair[0]].substr(endPair[1])

    // If appending start and end would result in two adjacent spaces,
    // remove one of them. If one of the spaces is "exotic" (not a
    // regular space, not a non-breaking space), keep that one.
    if (endSpace.test(start.text) && startSpace.test(end.text)) {
      if (/[ \u00A0]$/.test(start.text)) {
        start = start.substr(0, start.length - 1)
      } else {
        end = end.substr(1)
      }
    } else if (start.text[start.length - 1] === '\n' && !end.text) {
      end.text = '\n'
    } else if (start.text[start.length - 1] !== '\n' && end.text === '\n') {
      end = end.substr(1)
    }

    start = start
      .append(end)
      .replace(startSpace, nbsp)
      .replace(endSpace, nbsp)

    if (!start.text) {
      start.text = '\n'
    }

    view.update(startPair[0], start)
    for (let i = startPair[0] + 1; i <= endPair[0]; i += 1) {
      view.remove(startPair[0] + 1)
    }

    view.setSelection(new Selection(startPair.slice()))
  }

  editor.provide('backspace', {
    forwardDelete,
    backspace,
    removeSelectedText
  })
}
