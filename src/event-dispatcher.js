'use strict';

var toDispatch = [
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
  'click'
]

function EventDispatcher (elem, emit) {

  this.events = toDispatch.slice()
  this.elem = elem

  this.events.forEach(function (evt, index, arr) {
    arr[index] = {
      name: evt,
      listener: function (e) {
        emit(evt, e)
      }
    }
  })

  this.unpause()
}

/**
 * pause() removes event listeners from the element, which stops the
 * emitting of events on Compose.
 */
EventDispatcher.prototype.pause = function () {

  this.events.forEach(function (evt) {
    this.elem.removeEventListener(evt.name, evt.listener, true)
  }.bind(this))
}

/**
 * unpause() attaches event listeners to the element and emits those
 * events on Compose.
 */
EventDispatcher.prototype.unpause = function () {

  this.events.forEach(function (evt) {
    this.elem.addEventListener(evt.name, evt.listener, true)
  }.bind(this))
}

EventDispatcher.prototype.disable = function () {
  this.pause()

  delete this.elem
  delete this.events
}

function eventPlugin (Compose) {
  Compose.provide('event-dispatcher', new EventDispatcher(Compose.elem, Compose.emit))
}

module.exports = eventPlugin
