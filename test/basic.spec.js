/* jshint ignore:start */

describe('Quill', function () {

  var id = 'editor',
      quill

  beforeEach(function () {
    this.elem = document.createElement('div')
    this.elem.id = id
    document.body.appendChild(this.elem)
  })

  afterEach(function () {
    if (quill && quill.destroy && !quill._destroyed)
      quill = quill.destroy()

    document.body.removeChild(this.elem)
  })

  it('should be available as a global.', function () {
    expect(window.Quill).not.toBeUndefined()
  })

  it('can be called as a constructor.', function () {
    quill = new Quill('#' + id)

    expect(quill).toEqual(jasmine.any(Quill))
  })

  it('can be called as a function.', function () {
    quill = Quill(document.getElementById(id))

    expect(quill).toEqual(jasmine.any(Quill))
  })

  it('should allow multiple instances.', function () {
    var el = document.createElement('div')
    el.id = 'temp'
    document.body.appendChild(el)

    var q1 = Quill('#' + id)
    var q2 = new Quill(el)

    q1.destroy()
    q2.destroy()

    document.body.removeChild(el)
  })

  it('can take an element as a first parameter.', function () {
    quill = Quill(document.getElementById(id))

    expect(quill.elem).toEqual(this.elem)
  })

  it('can take a string as a first parameter.', function () {
    quill = new Quill('#' + id)

    expect(quill.elem).toEqual(this.elem)
  })

  it('should present a destroy method.', function () {
    quill = new Quill('#' + id)

    expect(quill.destroy).toEqual(jasmine.any(Function))
  })

  // Note that this doesn't actually check that listeners were properly
  // removed.
  it('should remove all event listeners upon destruction.', function () {
    spyOn(this.elem, 'addEventListener').and.callThrough()
    spyOn(this.elem, 'removeEventListener').and.callThrough()

    new Quill('#' + id).destroy()

    expect(this.elem.addEventListener.calls.count())
      .toEqual(this.elem.removeEventListener.calls.count())
  })

  it('should delete references to the element upon destruction.', function () {
    quill = Quill(this.elem)
    expect(quill.elem).toEqual(this.elem)

    quill.destroy()
    expect(quill.elem).not.toEqual(this.elem)
  })

  it('can use custom modes.', function () {

    // This mode is going to change the content to be 'abc' on every
    // keyup event.
    function sillyMode (Quill) {
      this.onKeyup = function () {
        Quill.elem.innerHTML = 'abc'
      }

      this.elem = Quill.elem
      this.elem.addEventListener('keyup', this.onKeyup)
    }

    sillyMode.prototype.destroy = function () {
      this.elem.removeEventListener('keyup', this.onKeyup)
    }

    // Don't forget the mode's name:
    sillyMode.plugin = 'silly'

    quill = new Quill(this.elem, { mode: sillyMode })

    setContent(this.elem, 'xyz')
    expect(this.elem.innerHTML).toEqual('xyz')
    fireEvent(this.elem, 'keyup')
    expect(this.elem.innerHTML).toEqual('abc')

    quill.destroy()
  })

  describe('has a plugin system which', function () {

    function fakePlugin () {}
    fakePlugin.prototype.destroy = function () {}

    var quill,
        elem

    beforeEach(function () {
      elem = document.createElement('div')
      document.body.appendChild(elem)

      fakePlugin.plugin = 'fake'

      quill = new Quill(elem)
    })

    afterEach(function () {
      if (!quill._destroyed)
        quill.destroy()

      document.body.removeChild(elem)
    })

    it('can add plugins via the \'use\' method.', function () {
      expect(quill.use).toEqual(jasmine.any(Function))
    })

    it('should only accept plugins named via a \'plugin\' property.', function () {
      expect(function () {
        quill.use(fakePlugin)
      }).not.toThrow()

      delete fakePlugin.plugin
      expect(function () {
        new Quill.use(fakePlugin)
      }).toThrow()
    })

    it('should reject plugins with the same name.', function () {
      quill.use(fakePlugin)

      function newPlugin () {}
      newPlugin.plugin = 'fake'

      expect(function () {
        quill.use(newPlugin)
      }).toThrow()
    })

    it('should add a property matching the plugin name.', function () {
      fakePlugin.plugin = 'fake'
      quill.use(fakePlugin)

      expect(quill.fake).not.toBeUndefined()
      expect(quill.fake).toEqual(jasmine.any(fakePlugin))
    })

    it('should call a plugin\'s destroy method upon destruction.', function () {
      var temp = new fakePlugin()
      quill.plugins.push(fakePlugin.plugin)
      quill.fake = temp

      spyOn(temp, 'destroy')

      quill.destroy()

      expect(temp.destroy).toHaveBeenCalled()
      expect(quill.fake).toBeUndefined()
    })

    it('should not fail if a plugin fails.', function () {
      function sillyPlugin () {
        throw new Error('This plugin sucks.')
      }
      sillyPlugin.plugin = 'silly'

      expect(function () {
        quill.use(sillyPlugin)
      }).not.toThrow()
    })

    it('can pass an options object along to plugins.', function () {
      var fakePlugin = jasmine.createSpy('fakePlugin'),
          opts = { one: 1, two: 2 }

      fakePlugin.plugin = 'fakePlugin'
      quill.use(fakePlugin, opts)

      expect(fakePlugin).toHaveBeenCalledWith(jasmine.any(Quill), opts)
    })
  })
})
