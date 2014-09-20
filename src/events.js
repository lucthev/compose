'use strict';

var listenTo = [
  'keydown',
  'keyup',
  'keypress',
  'focus',
  'blur',
  'cut',
  'copy',
  'paste',
  'mousedown',
  'mouseup',
  'click',
  'compositionstart',
  'compositionupdate',
  'compositionend'
]

/**
 * Keys that cause the caret to move. Obviously most keys cause the
 * caret to move, but these are the ones that don’t produce keypresses.
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

function Events (Compose) {
  var debug = Compose.require('debug'),
      events = {},
      handlers,
      modKey

  handlers = listenTo.map(function (name) {
    var db = debug('compose:events:' + name)

    return {
      event: name,
      fn: function (e) {
        db(e)
        Compose.emit(name, e)
      }
    }
  })

  /**
   * modKey(e) determines if a platform's modifier key was pressed
   * during an event. Assumes Cmd for Mac, Ctrl otherwise.
   *
   * @param {Event} e
   * @return {Boolean}
   */
  modKey = events.modKey = function (e) {
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
  events.enterKey = function (e) {
    return e.keyCode === 13 || (e.keyCode === 77 && e.ctrlKey)
  }

  events.backspace = function (e) {
    return e.keyCode === 8
  }

  events.forwardDelete = function (e) {
    return e.keyCode === 46
  }

  events.spacebar = function (e) {

    if (e.type === 'keypress') {
      return /[\u0020\u00A0\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/
        .test(String.fromCharCode(e.which))
    }

    return e.keyCode === 32
  }

  events.selectall = function (e) {
    return e.keyCode === 65 && modKey(e)
  }

  events.selectKey = function (e) {
    return !!selectionKeys[e.keyCode]
  }

  /**
   * pause() removes event listeners from the element, which stops the
   * emitting of events on Compose.
   */
  events.pause = function () {
    handlers.forEach(function (handler) {
      Compose.elem.removeEventListener(handler.event, handler.fn)
    })
  }

  /**
   * unpause() attaches event listeners to the element and emits those
   * events on Compose.
   */
  events.unpause = function () {
    handlers.forEach(function (handler) {
      Compose.elem.addEventListener(handler.event, handler.fn)
    })
  }

  events.disable = function () {
    this.pause()
  }

  events.unpause()
  Compose.provide('events', events)
}

module.exports = Events
