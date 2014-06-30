/* global describe, it, expect, beforeEach, afterEach, Compose */

'use strict';

describe('The event dispatcher', function () {

  var compose

  function disabler (Compose) {
    var dispatcher = Compose.require('event-dispatcher')

    dispatcher.pause()
  }

  function enabler (Compose) {
    var dispatcher = Compose.require('event-dispatcher')

    dispatcher.unpause()
  }

  beforeEach(function () {
    this.elem = document.createElement('div')
    document.body.appendChild(this.elem)

    compose = new Compose(this.elem)
  })

  afterEach(function () {
    document.body.removeChild(this.elem)

    try {
      compose.destroy()
    } catch (e) {}
  })

  it('should emit events on Compose', function () {
    var emitted = false

    compose.once('mousedown', function () {
      emitted = true
    })

    fireEvent(this.elem, 'mousedown')

    expect(emitted).toBe(true)
  })

  it('can stop emitting events on Compose.', function () {
    var emitted = false

    compose.on('keypress', function () {
      emitted = true
    })

    compose.use(disabler)

    fireEvent(this.elem, 'keypress')

    expect(emitted).toBe(false)
  })

  it('can resume emitting events on Compose', function () {
    var emitted = false

    compose.on('mousedown', function () {
      emitted = true
    })

    compose.use(disabler)

    fireEvent(this.elem, 'mousedown')

    expect(emitted).toBe(false)

    compose.use(enabler)

    fireEvent(this.elem, 'mousedown')

    expect(emitted).toBe(true)
  })
})

function fireEvent (element, event, keyCode, ctrlKey) {
  var evt

  evt = document.createEvent('HTMLEvents')
  evt.initEvent(event, true, true )

  if (keyCode) {
    evt.keyCode = keyCode
  }

  if (ctrlKey) {
    evt.ctrlKey = true
  }

  return !element.dispatchEvent(evt)
}
