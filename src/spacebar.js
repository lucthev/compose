'use strict'

const spaces = /^[^\S\r\n\v\f]$/
const nbsp = '\u00A0'

export default function spacebarPlugin (editor) {
  const Selection = editor.require('selection')
  const backspace = editor.require('backspace')
  const view = editor.require('view')
  const types = view.converters.P.types

  /**
   * auto() inserts a regular space, a non-breaking space, or neither,
   * depending on the current state of the editor.
   */
  function auto () {
    backspace.removeSelectedText()

    let sel = view.getSelection()
    let index = sel.start[1]
    let start = view.paragraphs[sel.start[0]]

    if (spaces.test(start.text[index - 1])) {
      return
    }

    if (spaces.test(start.text[index])) {
      view.setSelection(new Selection([sel.start[0], index + 1]))
      return
    }

    if (start.text[index - 1] === '\n' || start.text[index] === '\n' ||
        !start.text[index - 1] || !start.text[index]) {
      insert(nbsp)
      return
    }

    insert(' ')
  }

  /**
   * insert(space) inserts the given type of space at the start of the
   * current selection. Inserts the space no matter what, even if it
   * results in two adjacent spaces.
   *
   * @param {String} space
   */
  function insert (space) {
    backspace.removeSelectedText()

    let sel = view.getSelection()
    let startPair = sel.absoluteStart
    let endPair = sel.absoluteEnd

    let start = view.paragraphs[startPair[0]].substr(0, startPair[1])
    let end = view.paragraphs[endPair[0]].substr(endPair[1])

    let result = start.append(space)

    // Using Serialize#append extends all markups, including links,
    // which is somewhat counterintuitive. Restore links back to their
    // original size.
    result.removeMarkup({
      type: types.link,
      start: result.length - 1,
      end: result.length
    })

    result = result.append(end)

    view.update(startPair[0], result)
    for (let i = startPair[0] + 1; i <= endPair[0]; i += 1) {
      view.remove(startPair[0] + 1)
    }

    view.setSelection(new Selection([startPair[0], startPair[1] + 1]))
  }

  editor.provide('spacebar', {
    auto,
    insert
  })
}
