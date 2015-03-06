/* jshint mocha:true, expr:true *//* global Compose,chai */
'use strict';

var expect = chai.expect

describe('The event module', function () {
  var editor

  function disabler (Compose) {
    var events = Compose.require('events')

    events.pause()
  }

  function enabler (Compose) {
    var events = Compose.require('events')

    events.unpause()
  }

  beforeEach(function () {
    this.elem = document.createElement('div')
    this.elem.innerHTML = '<section><hr><p><br></p></section>'
    document.body.appendChild(this.elem)

    editor = new Compose(this.elem)
  })

  afterEach(function () {
    try {
      editor.destroy()
    } catch (e) {}

    document.body.removeChild(this.elem)
  })

  it('should emit events on Compose', function () {
    var emitted = false

    editor.once('mousedown', function () {
      emitted = true
    })

    fireEvent(this.elem, 'mousedown')

    expect(emitted).to.be.true
  })

  it('can stop emitting events on Compose.', function () {
    var emitted = false

    editor.on('keypress', function () {
      emitted = true
    })

    editor.use(disabler)

    fireEvent(this.elem, 'keypress')

    expect(emitted).to.not.be.true
  })

  it('can resume emitting events on Compose', function () {
    var emitted = false

    editor.on('mousedown', function () {
      emitted = true
    })

    editor.use(disabler)

    fireEvent(this.elem, 'mousedown')

    expect(emitted).to.not.be.true

    editor.use(enabler)

    fireEvent(this.elem, 'mousedown')

    expect(emitted).to.be.true
  })
})

function fireEvent (element, event, keyCode, ctrlKey) {
  var evt

  evt = document.createEvent('HTMLEvents')
  evt.initEvent(event, true, true)

  if (keyCode) {
    evt.keyCode = keyCode
  }

  if (ctrlKey) {
    evt.ctrlKey = true
  }

  return !element.dispatchEvent(evt)
}
