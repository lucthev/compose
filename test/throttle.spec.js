/* jshint ignore:start */

describe('The Throttle plugin', function () {

  var Throttle = Quill.getPlugin('throttle'),
      quill

  beforeEach(function () {
    this.elem = document.createElement('article')
    document.body.appendChild(this.elem)
    jasmine.clock().install()

    quill = new Quill(this.elem)
    spyOn(quill, 'emit').and.callThrough()

    // Disable the default throttle.
    quill.disable('throttle')

    this.throttle = new Throttle(quill)
    this.throttle.setSpeed(20, 80)
  })

  afterEach(function () {
    this.throttle.destroy()

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
    expect(quill.emit).not.toHaveBeenCalledWith('change')

    jasmine.clock().tick(21)
    expect(quill.emit).toHaveBeenCalledWith('change')
  })

  it('should not fire change events too often.', function () {
    fireEvent(this.elem, 'input')
    fireEvent(this.elem, 'input')
    expect(quill.emit).not.toHaveBeenCalledWith('change')

    jasmine.clock().tick(21)

    expect(quill.emit.calls.allArgs())
      .toEqual([['input'], ['input'], ['change']])
  })

  it('should fire multiple times when the events are spaced out.', function () {
    fireEvent(this.elem, 'input')
    expect(quill.emit).not.toHaveBeenCalledWith('change')

    jasmine.clock().tick(21)
    expect(quill.emit.calls.allArgs())
      .toEqual([['input'], ['change']])

    fireEvent(this.elem, 'input')

    jasmine.clock().tick(20)
    expect(quill.emit.calls.allArgs())
      .toEqual([['input'], ['change'], ['input'], ['change']])
  })

  it('should eventually fire an event even with constant input.', function () {
    var interval = setInterval(function () {
      fireEvent(this.elem, 'input')
    }.bind(this), 19)

    jasmine.clock().tick(20)
    expect(quill.emit).not.toHaveBeenCalledWith('change')

    jasmine.clock().tick(81)
    expect(quill.emit.calls.allArgs())
      .toEqual([['input'], ['input'], ['input'], ['input'], ['input'], ['change']])

    clearInterval(interval)
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