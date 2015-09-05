'use strict'

module.exports = Spacebar

/**
 * The Spacebar plugin provides a set of functions that might map to
 * the spacebar; they insert spaces into the editor.
 *
 * @param {Compose} Compose
 */
function Spacebar (Compose) {
  var Serialize = Compose.require('serialize')
  var Selection = Compose.require('selection')
  var rm = Compose.require('backspace')
  var Delta = Compose.require('delta')
  var View = Compose.require('view')
  var spaces = /^[^\S\r\n\v\f]$/
  var nbsp = '\u00A0'

  /**
   * auto() inserts a regular space, a non-breaking space, or neither,
   * depending on the current state of the editor.
   */
  function auto () {
    rm.usingSelection()

    var sel = View.selection.clone()
    var index = sel.start[1]
    var start = View.paragraphs[sel.start[0]]

    if (spaces.test(start.text[index - 1])) {
      return
    }

    if (spaces.test(start.text[index])) {
      View.selection = new Selection([sel.start[0], index + 1])
      return
    }

    if (start.text[index - 1] === '\n' || start.text[index] === '\n' ||
        !start.text[index - 1] || !start.text[index]) {
      return insert(nbsp)
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
    var sel = View.selection.clone()
    var startPair
    var endPair
    var start
    var end

    // In theory, this function could be used for just about anything;
    // that seems bad.
    if (!spaces.test(space)) {
      Compose.emit('error', TypeError(space + ' is not a valid space.'))
      return
    }

    startPair = sel.absoluteStart
    endPair = sel.absoluteEnd

    start = View.paragraphs[startPair[0]]
    end = View.paragraphs[endPair[0]]

    start = start.substr(0, startPair[1])
    end = end.substr(endPair[1])

    start = start.append(space)

    // Using Serialize#append extends all markups, including links,
    // which is somewhat counterintuitive. Restore links back to their
    // original size.
    start.removeMarkup({
      type: Serialize.types.link,
      start: start.length - 1,
      end: start.length
    })

    start = start.append(end)

    View.resolve(new Delta('paragraphUpdate', startPair[0], start))
    for (var i = startPair[0] + 1; i <= endPair[0]; i += 1) {
      if (View.isSectionStart(startPair[0] + 1)) {
        View.resolve(new Delta('sectionDelete', startPair[0] + 1))
      }

      View.resolve(new Delta('paragraphDelete', startPair[0] + 1))
    }

    View.selection = new Selection([startPair[0], startPair[1] + 1])
  }

  Compose.provide('spacebar', {
    auto: auto,
    insert: insert
  })
}
