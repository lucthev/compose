/* jshint ignore:start */

describe('The Throttle plugin', function () {

  var Throttle = Quill.getPlugin('throttle'),
      elem = document.createElement('article'),
      throttle,
      quill

  beforeEach(function () {
    document.body.appendChild(elem)
    jasmine.clock().install()

    quill = jasmine.createSpyObj('quill', ['trigger'])
    quill.elem = elem

    throttle = new Throttle(quill)
    throttle.setSpeed(20, 80)
  })

  afterEach(function () {
    document.body.removeChild(elem)
    jasmine.clock().uninstall()
  })

  it('should listen to the input event on an element.', function () {
    spyOn(elem, 'addEventListener').and.callThrough()

    new Throttle(quill)

    expect(elem.addEventListener)
      .toHaveBeenCalledWith('input', jasmine.any(Function))
  })

  it('should fire change events on Quill.', function () {
    fireEvent(elem, 'input')
    expect(quill.trigger).not.toHaveBeenCalled()

    jasmine.clock().tick(21)
    expect(quill.trigger).toHaveBeenCalledWith('change')
  })

  it('should not fire change events too often.', function () {
    fireEvent(elem, 'input')
    fireEvent(elem, 'input')
    expect(quill.trigger).not.toHaveBeenCalled()

    jasmine.clock().tick(21)

    expect(quill.trigger.calls.count()).toEqual(1)
  })

  it('should fire multiple times when the events are spaced out.', function () {
    fireEvent(elem, 'input')
    expect(quill.trigger).not.toHaveBeenCalled()

    jasmine.clock().tick(21)
    expect(quill.trigger.calls.count()).toEqual(1)
    fireEvent(elem, 'input')

    jasmine.clock().tick(20)
    expect(quill.trigger.calls.count()).toEqual(2)
  })

  it('should eventually fire an event even with constant input.', function () {
    var interval = setInterval(function () {
      fireEvent(elem, 'input')
    }, 19)

    jasmine.clock().tick(20)
    expect(quill.trigger).not.toHaveBeenCalled()

    jasmine.clock().tick(81)
    expect(quill.trigger.calls.count()).toEqual(1)

    clearInterval(interval)
  })

  it('should fire events immediately if the max/min is 0.', function () {
    var t = new Throttle(quill)
    t.setSpeed(0, 0)

    fireEvent(elem, 'input')
    fireEvent(elem, 'input')

    expect(quill.trigger).toHaveBeenCalledWith('change')
    expect(quill.trigger.calls.count()).toEqual(2)
  })

  it('should present a destroy method.', function () {
    expect(throttle.destroy).toEqual(jasmine.any(Function))
  })

  it('should remove all listeners upon destruction.', function () {
    spyOn(elem, 'addEventListener').and.callThrough()
    spyOn(elem, 'removeEventListener').and.callThrough()

    new Throttle(quill).destroy()

    expect(elem.addEventListener.calls.count())
      .toEqual(elem.removeEventListener.calls.count())
  })
})