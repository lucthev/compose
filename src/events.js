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
