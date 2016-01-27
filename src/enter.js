'use strict'

const leadingSpace = /^[^\S\r\n\v\f]/
const trailingSpace = /[^\S\r\n\v\f]$/
const nbsp = '\u00A0'

export default function enterPlugin (editor) {
  const view = editor.require('view')
  const Selection = editor.require('selection')

  function newline () {
    let sel = view.getSelection()

    if (!sel) return

    let startPair = sel.absoluteStart
    let endPair = sel.absoluteEnd

    let start = view.paragraphs[startPair[0]]
    let end = view.paragraphs[endPair[0]]

    // Replace double newlines with a new paragraph; they look the same,
    // but the latter is more semantic.
    if (start.text[startPair[1] - 1] === '\n') {
      startPair[1] -= 1
      view.setSelection(sel)
      return newParagraph()
    } else if (endPair[1] < end.length - 1 && end.text[endPair[1]] === '\n') {
      endPair[1] += 1
      view.setSelection(sel)
      return newParagraph()
    }

    start = start.substr(0, startPair[1]).replace(trailingSpace, nbsp)
    end = end.substr(endPair[1]).replace(leadingSpace, nbsp)

    if (!end.text) {
      end.text = '\n'
    }

    // += is used instead of .append(), since markups shouldn't be extended
    // across newlines.
    start.text += '\n'

    view.update(startPair[0], start.append(end))
    for (let i = startPair[0] + 1; i <= endPair[0]; i += 1) {
      view.remove(startPair[0] + 1)
    }

    view.setSelection(new Selection([startPair[0], startPair[1] + 1]))
  }

  function newParagraph () {
    let sel = view.getSelection()

    let startPair = sel.absoluteStart
    let endPair = sel.absoluteEnd

    let start = view.paragraphs[startPair[0]]
    let end = view.paragraphs[endPair[0]]

    start = start.substr(0, startPair[1]).replace(trailingSpace, nbsp)
    end = end.substr(endPair[1]).replace(leadingSpace, nbsp)

    if (!start.text || start.text[start.length - 1] === '\n') {
      start.text += '\n'
    }

    if (!end.text || end.text === '\n') {
      end.type = start.type
      end.text = '\n'
    }

    view.update(startPair[0], start)
    for (let i = startPair[0] + 1; i <= endPair[0]; i += 1) {
      view.remove(startPair[0] + 1)
    }
    view.insert(startPair[0] + 1, end)

    view.setSelection(new Selection([startPair[0] + 1, 0]))
  }

  editor.provide('enter', {
    newline,
    newParagraph
  })
}
