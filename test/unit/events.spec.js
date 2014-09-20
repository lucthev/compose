/* jshint ignore:start */
var expect = chai.expect

describe('The event module', function () {

  var compose

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

    expect(emitted).to.be.true
  })

  it('can stop emitting events on Compose.', function () {
    var emitted = false

    compose.on('keypress', function () {
      emitted = true
    })

    compose.use(disabler)

    fireEvent(this.elem, 'keypress')

    expect(emitted).to.not.be.true
  })

  it('can resume emitting events on Compose', function () {
    var emitted = false

    compose.on('mousedown', function () {
      emitted = true
    })

    compose.use(disabler)

    fireEvent(this.elem, 'mousedown')

    expect(emitted).to.not.be.true

    compose.use(enabler)

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
