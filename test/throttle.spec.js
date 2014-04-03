/* jshint ignore:start */

describe('The Throttle plugin', function () {

  var Throttle = Quill.getPlugin('throttle'),
      quill

  beforeEach(function () {
    this.elem = document.createElement('article')
    document.body.appendChild(this.elem)
    jasmine.clock().install()

    quill = jasmine.createSpyObj('quill', ['trigger'])
    quill.elem = this.elem

    this.throttle = new Throttle(quill)
    this.throttle.setSpeed(20, 80)
  })

  afterEach(function () {
    document.body.removeChild(this.elem)
    jasmine.clock().uninstall()
  })

  it('should listen to the input event on an element.', function () {
    spyOn(this.elem, 'addEventListener').and.callThrough()

    new Throttle(quill)

    expect(this.elem.addEventListener)
      .toHaveBeenCalledWith('input', jasmine.any(Function))
  })

  it('should fire change events on Quill.', function () {
    fireEvent(this.elem, 'input')
    expect(quill.trigger).not.toHaveBeenCalled()

    jasmine.clock().tick(21)
    expect(quill.trigger).toHaveBeenCalledWith('change')
  })

  it('should not fire change events too often.', function () {
    fireEvent(this.elem, 'input')
    fireEvent(this.elem, 'input')
    expect(quill.trigger).not.toHaveBeenCalled()

    jasmine.clock().tick(21)

    expect(quill.trigger.calls.count()).toEqual(1)
  })

  it('should fire multiple times when the events are spaced out.', function () {
    fireEvent(this.elem, 'input')
    expect(quill.trigger).not.toHaveBeenCalled()

    jasmine.clock().tick(21)
    expect(quill.trigger.calls.count()).toEqual(1)
    fireEvent(this.elem, 'input')

    jasmine.clock().tick(20)
    expect(quill.trigger.calls.count()).toEqual(2)
  })

  it('should eventually fire an event even with constant input.', function () {
    var interval = setInterval(function () {
      fireEvent(this.elem, 'input')
    }.bind(this), 19)

    jasmine.clock().tick(20)
    expect(quill.trigger).not.toHaveBeenCalled()

    jasmine.clock().tick(81)
    expect(quill.trigger.calls.count()).toEqual(1)

    clearInterval(interval)
  })

  it('should fire events immediately if the max/min is 0.', function () {
    var t = new Throttle(quill)
    t.setSpeed(0, 0)

    fireEvent(this.elem, 'input')
    fireEvent(this.elem, 'input')

    expect(quill.trigger).toHaveBeenCalledWith('change')
    expect(quill.trigger.calls.count()).toEqual(2)
  })

  it('can let you know if a state save is pending.', function () {
    expect(this.throttle.isTyping()).toBe(false)

    fireEvent(this.elem, 'input')

    expect(this.throttle.isTyping()).toBe(true)

    jasmine.clock().tick(21)

    expect(this.throttle.isTyping()).toBe(false)
  })

  it('should present a destroy method.', function () {
    expect(this.throttle.destroy).toEqual(jasmine.any(Function))
  })

  it('should remove all listeners upon destruction.', function () {
    spyOn(this.elem, 'addEventListener').and.callThrough()
    spyOn(this.elem, 'removeEventListener').and.callThrough()

    new Throttle(quill).destroy()

    expect(this.elem.addEventListener.calls.count())
      .toEqual(this.elem.removeEventListener.calls.count())
  })
})