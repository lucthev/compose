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
      compose

  beforeEach(function () {
    this.elem = document.createElement('article')
    document.body.appendChild(this.elem)
    jasmine.clock().install()

    if (!Throttle) {
      compose = new Compose(this.elem)
      Throttle = compose.throttle.constructor
      compose.destroy()
    }

    compose = new Compose(this.elem)
    spyOn(compose, 'emit').and.callThrough()

    // Disable the default throttle.
    compose.disable('throttle')

    this.throttle = new Throttle(compose)
    this.throttle.setSpeed(20, 80)
  })

  afterEach(function () {
    this.throttle.destroy()

    document.body.removeChild(this.elem)
    jasmine.clock().uninstall()
  })

  it('should fire change events on Compose.', function () {
    fireEvent(this.elem, 'input')
    expect(compose.emit).not.toHaveBeenCalledWith('change')

    jasmine.clock().tick(21)
    expect(compose.emit).toHaveBeenCalledWith('change')
  })

  it('should not fire change events too often.', function () {
    fireEvent(this.elem, 'input')
    fireEvent(this.elem, 'input')
    expect(compose.emit).not.toHaveBeenCalledWith('change')

    jasmine.clock().tick(21)

    expect(count(flatten(compose.emit.calls.allArgs()), 'change'))
      .toEqual(1)
  })

  it('should fire multiple times when the events are spaced out.', function () {
    fireEvent(this.elem, 'input')
    expect(compose.emit).not.toHaveBeenCalledWith('change')

    jasmine.clock().tick(21)
    expect(count(flatten(compose.emit.calls.allArgs()), 'change'))
      .toEqual(1)

    fireEvent(this.elem, 'input')

    jasmine.clock().tick(20)
    expect(count(flatten(compose.emit.calls.allArgs()), 'change'))
      .toEqual(2)
  })

  it('should eventually fire an event even with constant input.', function () {
    var interval = setInterval(function () {
      fireEvent(this.elem, 'input')
    }.bind(this), 19)

    jasmine.clock().tick(20)
    expect(compose.emit).not.toHaveBeenCalledWith('change')

    jasmine.clock().tick(81)
    expect(count(flatten(compose.emit.calls.allArgs()), 'change'))
      .toEqual(1)

    clearInterval(interval)
  })

  it('should present a destroy method.', function () {
    expect(this.throttle.destroy).toEqual(jasmine.any(Function))
  })

  it('should remove all listeners upon destruction.', function () {
    spyOn(this.elem, 'addEventListener').and.callThrough()
    spyOn(this.elem, 'removeEventListener').and.callThrough()

    new Throttle(compose).destroy()

    expect(this.elem.addEventListener.calls.count())
      .toEqual(this.elem.removeEventListener.calls.count())
  })
})
