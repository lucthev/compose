/* jshint ignore:start */

describe.skip('Compose\'s plugin system', function () {

  var compose

  beforeEach(function () {
    this.elem = document.createElement('article')
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

  it('should allow plugins to export functionality via a "provide" method.', function () {
    var checked = false

    function plugin (Compose) {
      checked = true

      Compose.provide('some', 'thing')
    }

    compose.use(plugin)

    expect(checked).to.be.true
    expect(compose.plugins.some).to.equal('thing')
  })

  it('should allow plugins to access each other\'s exports via a "require" method.', function () {
    var checked = false

    function plugin (Compose) {
      Compose.provide('checker', function () {
        checked = true
      })
    }

    function otherPlugin (Compose) {
      var checker = Compose.require('checker')

      checker()
    }

    compose.use(plugin)
    compose.use(otherPlugin)

    expect(checked).to.be.true
  })

  it('should allow plugins to use other plugins.', function () {
    var checked = false

    function plugin (Compose) {
      Compose.use(other)
    }

    function other (Compose) {
      checked = true

      Compose.provide('some', 'thing')
    }

    compose.use(plugin)

    expect(checked).to.be.true
    expect(compose.require('some')).to.equal('thing')
  })

  it('should throw an error when requiring a module that doesn\'t exist.', function () {
    function plugin (Compose) {
      Compose.require('non-existant')
    }

    function willThrow () {
      compose.use(plugin)
    }

    expect(willThrow).to.throw(Error)
  })

  it('should throw an error when plugins exports things with the same name.', function () {
    function plugin (Compose) {
      Compose.provide('some', 'thing')
    }

    function other (Compose) {
      Compose.provide('some', 'other thing')
    }

    compose.use(plugin)

    function willThrow () {
      compose.use(other)
    }

    expect(willThrow).to.throw(Error)
  })

  it('can optionally disable plugins if they provide a "disable" method.', function () {
    var disabled = false

    function plugin (Compose) {
      Compose.provide('thing', {
        disable: function () {
          disabled = true
        }
      })
    }

    compose.use(plugin)
    compose.disable('thing')

    function checker (Compose) {
      Compose.require('thing')
    }

    function willThrow () {
      compose.use(checker)
    }

    expect(disabled).to.be.true
    expect(willThrow).to.throw(Error)
  })

  it('hasOwnProperty edge case.', function () {
    var checked = false

    function silly (Compose) {
      Compose.provide('hasOwnProperty', 'Mwahaha.')
    }

    function other (Compose) {
      var prop = Compose.require('hasOwnProperty')

      checked = true

      expect(prop).to.equal('Mwahaha.')
    }

    compose.use(silly)
    compose.use(other)

    expect(checked).to.be.true
  })
})
