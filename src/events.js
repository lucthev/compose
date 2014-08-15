'use strict';

/**
 * modKey(e) determines if a platform's modifier key was pressed
 * during an event. Assumes Cmd for Mac, Ctrl otherwise.
 *
 * @param {Event} e
 * @return {Boolean}
 */
var modKey = exports.modKey = function (e) {
  if (/Mac/.test(navigator.platform))
    return e.metaKey

  return e.ctrlKey
}

/**
 * enterKey(e) determines if the sequence of keys pressed during
 * an event would result in a carriage return. Known: enter key
 * and Ctrl+M.
 *
 * @param {Event} e
 * @return {Boolean}
 */
exports.enterKey = function (e) {
  return e.keyCode === 13 || (e.keyCode === 77 && e.ctrlKey)
}

exports.backspace = function (e) {
  return e.keyCode === 8
}

exports.forwardDelete = function (e) {
  return e.keyCode === 46
}

exports.spacebar = function (e) {
  return e.keyCode === 32
}

exports.selectall = function (e) {
  return e.keyCode === 65 && modKey(e)
}

/**
 * Keys that cause the caret to move. Obviously most keys cause the
 * caret to move, but these are the ones that don’t simply move the
 * caret forward by one.
 */
var selectionKeys = {
  8: 1,   // Backspace
  9: 1,   // Tab
  13: 1,  // Enter
  33: 1,  // Page up
  34: 1,  // Page down
  35: 1,  // End
  36: 1,  // Home
  37: 1,  // Left
  38: 1,  // Up
  39: 1,  // Right
  40: 1,  // Down
  46: 1   // Forward delete
}

exports.selectKey = function (e) {
  return !!selectionKeys[e.keyCode]
}
