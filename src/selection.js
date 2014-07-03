/**
 * A module that fires a 'selectionchange' event on Compose. Note that
 * the event this module fires is NOT the same as the native selectionchange
 * event which some browser have implemented. The new selection, an instance
 * of Choice.Selection, is passed to listeners as a first parameter.
 *
 * NOTE: although this module is not specific to any mode, is does
 * require the 'getChildren' function of those modes. It should not
 * be 'used' by Compose itself but by the modes.
 *
 * Module overview:
 * @require {timers, getChildren}
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

function Selection (Compose) {
  var setImmediate = Compose.require('timers').setImmediate,
      getChildren = Compose.require('getChildren'),
      choice = new Choice(Compose.elem, getChildren),
      oldSelection = false,
      checkChanged

  function ifChanged () {
    var newSelection = choice.getSelection()

    if (areSame(oldSelection, newSelection))
      return

    Compose.emit('selectionchange', newSelection)
    oldSelection = newSelection
  }

  checkChanged = setImmediate.bind(null, ifChanged)

  Compose.on('mouseup', checkChanged)
  Compose.on('focus', checkChanged)
  Compose.on('blur', checkChanged)

  // TODO: be more specific with keydown event?
  Compose.on('keydown', checkChanged)
}

module.exports = Selection
