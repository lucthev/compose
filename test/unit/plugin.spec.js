/*eslint-env mocha */
'use strict'

var expect = window.expect

describe('Compose\'s plugin system', function () {
  var editor

  beforeEach(function () {
    this.elem = document.createElement('article')
    this.elem.innerHTML = '<section><hr><p><br></p></section>'
    document.body.appendChild(this.elem)

    editor = new window.Compose(this.elem)
  })

  afterEach(function () {
    document.body.removeChild(this.elem)

    try {
      editor.destroy()
    } catch (e) {}
  })

  it('should allow plugins to export functionality via a "provide" method', function () {
    var checked = false

    function plugin (Compose) {
      checked = true

      Compose.provide('some', 'thing')
    }

    editor.use(plugin)

    expect(checked).to.be.true
    expect(editor.plugins.some).to.equal('thing')
  })

  it('should allow plugins to access each other\'s exports via a "require" method', function () {
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

    editor.use(plugin)
    editor.use(otherPlugin)

    expect(checked).to.be.true
  })

  it('should allow plugins to use other plugins', function () {
    var checked = false

    function plugin (Compose) {
      Compose.use(other)
    }

    function other (Compose) {
      checked = true

      Compose.provide('some', 'thing')
    }

    editor.use(plugin)

    expect(checked).to.be.true
    expect(editor.require('some')).to.equal('thing')
  })

  it('should throw an error when requiring a module that doesn\'t exist', function () {
    function plugin (Compose) {
      Compose.require('non-existant')
    }

    function willThrow () {
      editor.use(plugin)
    }

    expect(willThrow).to.throw(Error)
  })

  it('should throw an error when plugins exports things with the same name', function () {
    function plugin (Compose) {
      Compose.provide('some', 'thing')
    }

    function other (Compose) {
      Compose.provide('some', 'other thing')
    }

    editor.use(plugin)

    function willThrow () {
      editor.use(other)
    }

    expect(willThrow).to.throw(Error)
  })

  it('can optionally disable plugins if they provide a "disable" method', function () {
    var disabled = false

    function plugin (Compose) {
      Compose.provide('thing', {
        disable: function () {
          disabled = true
        }
      })
    }

    editor.use(plugin)
    editor.disable('thing')

    function checker (Compose) {
      Compose.require('thing')
    }

    function willThrow () {
      editor.use(checker)
    }

    expect(disabled).to.be.true
    expect(willThrow).to.throw(Error)
  })

  it('hasOwnProperty edge case', function () {
    var checked = false

    function silly (Compose) {
      Compose.provide('hasOwnProperty', 'Mwahaha.')
    }

    function other (Compose) {
      var prop = Compose.require('hasOwnProperty')

      checked = true

      expect(prop).to.equal('Mwahaha.')
    }

    editor.use(silly)
    editor.use(other)

    expect(checked).to.be.true
  })

  it('should pass along extra arguments to plugins', function () {
    var checked = false

    function plugin (Compose, thing) {
      checked = true
      expect(thing).to.equal('thing')
    }

    editor.use(plugin, 'thing')
    expect(checked).to.be.true
  })
})
