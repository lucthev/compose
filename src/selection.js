/**
 * A module that fires a 'selectionchange' event on Compose. The event
 * this module fires is NOT the same as the native selectionchange event
 * which some browser have implemented. The new selection, an instance
 * of Choice.Selection, is passed to listeners as a first parameter;
 * the old selection is passed as a second parameter. Note that the
 * second parameter is not guaranteed to be an instance of Choice.Selection;
 * in the case the editor was previously blurred, it will be false.
 *
 * NOTE: although this module is not specific to any mode, is does
 * require the 'getChildren' function of those modes. It should not
 * be 'used' by Compose itself but by the modes.
 *
 * Module overview:
 * @require {setImmediate, getChildren}
 * @listen {mouseup, focus, blur, keydown}
 * @emit {selectionchange}
 */
'use strict';

var Choice = require('choice')

/**
 * areSame(old, new) compares two selections and determines if they
 * are the same.
 *
 * @param {Choice.Selection} older
 * @param {Choice.Selection} newer
 * @return {Boolean}
 */
function areSame (older, newer) {

  if (!older || !newer)
    return !older && !newer

  return (
    older.start[0] === newer.start[0] &&
    older.start[1] === newer.start[1] &&
    older.end[0] === newer.end[0] &&
    older.end[1] === newer.end[1]
  )
}

function SelectionPlugin (Compose) {
  var setImmediate = Compose.require('setImmediate'),
      getChildren = Compose.require('getChildren'),
      choice = new Choice(Compose.elem, getChildren),
      Selection = Choice.Selection,
      oldSelection = false,
      checkChanged

  function ifChanged () {
    var newSelection = choice.getSelection()

    if (areSame(oldSelection, newSelection))
      return

    // Normalize the selection.
    choice.restore(newSelection)

    Compose.emit('selectionchange', newSelection, oldSelection)
    oldSelection = newSelection
  }

  checkChanged = setImmediate.bind(null, ifChanged)

  Compose.on('keydown', checkChanged)
  Compose.on('mouseup', checkChanged)
  Compose.on('focus', checkChanged)

  /*
   * On blur, the selectionchange event is not fired; however, we
   * want to make sure a selectionchange event is fired when the
   * editor is focussed again. If we don’t set oldSelection to
   * false, the selectionchange event will not be fired when the
   * editor is repeatedly focussed and blurred in the same location.
   */
  Compose.on('blur', function () {
    oldSelection = false
  })

  Selection.restore = choice.restore.bind(choice)
  Compose.provide('selection', Selection)
}

module.exports = SelectionPlugin
