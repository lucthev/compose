'use strict';

var events = [
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

function Dispatcher (Compose) {
  var debug = Compose.require('debug'),
      dispatcher,
      _events

  _events = events.map(function (name) {
    var db = debug('compose:events:' + name)

    return {
      event: name,
      fn: function (e) {
        db(e)
        Compose.emit(name, e)
      }
    }
  })

  dispatcher = {

    /**
     * pause() removes event listeners from the element, which stops the
     * emitting of events on Compose.
     */
    pause: function () {
      _events.forEach(function (handler) {
        Compose.elem.removeEventListener(handler.event, handler.fn)
      })

      return this
    },

    /**
     * unpause() attaches event listeners to the element and emits those
     * events on Compose.
     */
    unpause: function () {
      _events.forEach(function (handler) {
        Compose.elem.addEventListener(handler.event, handler.fn)
      })

      return this
    },

    disable: function () {
      this.pause()

      return null
    }
  }

  dispatcher.unpause()
  Compose.provide('event-dispatcher', dispatcher)
}

module.exports = Dispatcher
