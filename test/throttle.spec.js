/* jshint ignore:start */

function flatten (array) {
  var result = [],
      value,
      i, j

  for (i = 0; i < array.length; i += 1) {
    value = array[i]

    if (Array.isArray(value)) {
      value = flatten(value)

      for (j = 0; j < value.length; j += 1)
        result.push(value[j])
    } else result.push(value)
  }

  return result
}

function count (array, elem) {
  var count = 0,
      i

  for (i = 0; i < array.length; i += 1) {
    if (array[i] === elem) count += 1
  }

  return count
}

describe('The Throttle plugin', function () {

  var Throttle,
      quill

  beforeEach(function () {
    this.elem = document.createElement('article')
    document.body.appendChild(this.elem)
    jasmine.clock().install()

    if (!Throttle) {
      quill = new Quill(this.elem)
      Throttle = quill.throttle.constructor
      quill.destroy()
    }

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

    expect(count(flatten(quill.emit.calls.allArgs()), 'change'))
      .toEqual(1)
  })

  it('should fire multiple times when the events are spaced out.', function () {
    fireEvent(this.elem, 'input')
    expect(quill.emit).not.toHaveBeenCalledWith('change')

    jasmine.clock().tick(21)
    expect(count(flatten(quill.emit.calls.allArgs()), 'change'))
      .toEqual(1)

    fireEvent(this.elem, 'input')

    jasmine.clock().tick(20)
    expect(count(flatten(quill.emit.calls.allArgs()), 'change'))
      .toEqual(2)
  })

  it('should eventually fire an event even with constant input.', function () {
    var interval = setInterval(function () {
      fireEvent(this.elem, 'input')
    }.bind(this), 19)

    jasmine.clock().tick(20)
    expect(quill.emit).not.toHaveBeenCalledWith('change')

    jasmine.clock().tick(81)
    expect(count(flatten(quill.emit.calls.allArgs()), 'change'))
      .toEqual(1)

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
