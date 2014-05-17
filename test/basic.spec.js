/* jshint ignore:start */

describe('Compose', function () {

  var id = 'editor',
      compose

  beforeEach(function () {
    this.elem = document.createElement('div')
    this.elem.id = id
    document.body.appendChild(this.elem)
  })

  afterEach(function (done) {
    document.body.removeChild(this.elem)

    setTimeout(function () {
      if (compose && compose.destroy && !compose._destroyed)
        compose = compose.destroy()

      done()
    }, 10)
  })

  it('should be available as a global.', function () {
    expect(window.Compose).not.toBeUndefined()
  })

  it('can be called as a constructor.', function () {
    compose = new Compose('#' + id)

    expect(compose).toEqual(jasmine.any(Compose))
  })

  it('can be called as a function.', function () {
    compose = Compose(document.getElementById(id))

    expect(compose).toEqual(jasmine.any(Compose))
  })

  it('should allow multiple instances.', function () {
    var el = document.createElement('div')
    el.id = 'temp'
    document.body.appendChild(el)

    var q1 = Compose('#' + id)
    var q2 = new Compose(el)

    q1.destroy()
    q2.destroy()

    document.body.removeChild(el)
  })

  it('can take an element as a first parameter.', function () {
    compose = Compose(document.getElementById(id))

    expect(compose.elem).toEqual(this.elem)
  })

  it('can take a string as a first parameter.', function () {
    compose = new Compose('#' + id)

    expect(compose.elem).toEqual(this.elem)
  })

  it('should present a destroy method.', function () {
    compose = new Compose('#' + id)

    expect(compose.destroy).toEqual(jasmine.any(Function))
  })

  // Note that this doesn't actually check that listeners were properly
  // removed.
  it('should remove all event listeners upon destruction.', function () {
    spyOn(this.elem, 'addEventListener').and.callThrough()
    spyOn(this.elem, 'removeEventListener').and.callThrough()

    new Compose('#' + id).destroy()

    expect(this.elem.addEventListener.calls.count())
      .toEqual(this.elem.removeEventListener.calls.count())
  })

  it('should delete references to the element upon destruction.', function () {
    compose = Compose(this.elem)
    expect(compose.elem).toEqual(this.elem)

    compose.destroy()
    expect(compose.elem).not.toEqual(this.elem)
  })

  it('can use custom modes.', function () {

    // This mode is going to change the content to be 'abc' on every
    // keyup event.
    function sillyMode (Compose) {
      this.onKeyup = function () {
        Compose.elem.innerHTML = 'abc'
      }

      this.elem = Compose.elem
      this.elem.addEventListener('keyup', this.onKeyup)
    }

    sillyMode.prototype.destroy = function () {
      this.elem.removeEventListener('keyup', this.onKeyup)
    }

    // Don't forget the mode's name:
    sillyMode.plugin = 'silly'

    compose = new Compose(this.elem, { mode: sillyMode })

    setContent(this.elem, 'xyz')
    expect(this.elem.innerHTML).toEqual('xyz')
    fireEvent(this.elem, 'keyup')
    expect(this.elem.innerHTML).toEqual('abc')

    compose.destroy()
  })

  describe('has a plugin system which', function () {

    function fakePlugin () {}
    fakePlugin.prototype.destroy = function () {}

    var compose,
        elem

    beforeEach(function () {
      elem = document.createElement('div')
      document.body.appendChild(elem)

      fakePlugin.plugin = 'fake'

      compose = new Compose(elem)
    })

    afterEach(function (done) {
      document.body.removeChild(elem)

      setTimeout(function () {
        if (!compose._destroyed)
          compose.destroy()

        done()
      }, 10)
    })

    it('can add plugins via the \'use\' method.', function () {
      expect(compose.use).toEqual(jasmine.any(Function))
    })

    it('should only accept plugins named via a \'plugin\' property.', function () {
      expect(function () {
        compose.use(fakePlugin)
      }).not.toThrow()

      delete fakePlugin.plugin
      expect(function () {
        new Compose.use(fakePlugin)
      }).toThrow()
    })

    it('should reject plugins with the same name.', function () {
      compose.use(fakePlugin)

      function newPlugin () {}
      newPlugin.plugin = 'fake'

      expect(function () {
        compose.use(newPlugin)
      }).toThrow()
    })

    it('should add a property matching the plugin name.', function () {
      fakePlugin.plugin = 'fake'
      compose.use(fakePlugin)

      expect(compose.fake).not.toBeUndefined()
      expect(compose.fake).toEqual(jasmine.any(fakePlugin))
    })

    it('should call a plugin\'s destroy method upon destruction.', function () {
      var temp = new fakePlugin()
      compose.plugins.push(fakePlugin.plugin)
      compose.fake = temp

      spyOn(temp, 'destroy')

      compose.destroy()

      expect(temp.destroy).toHaveBeenCalled()
      expect(compose.fake).toBeUndefined()
    })

    it('should not fail if a plugin fails.', function () {
      function sillyPlugin () {
        throw new Error('This plugin sucks.')
      }
      sillyPlugin.plugin = 'silly'

      expect(function () {
        compose.use(sillyPlugin)
      }).not.toThrow()
    })

    it('can pass an options object along to plugins.', function () {
      var fakePlugin = jasmine.createSpy('fakePlugin'),
          opts = { one: 1, two: 2 }

      fakePlugin.plugin = 'fakePlugin'
      compose.use(fakePlugin, opts)

      expect(fakePlugin).toHaveBeenCalledWith(jasmine.any(Compose), opts)
    })
  })
})
