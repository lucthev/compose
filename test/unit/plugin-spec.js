/* global describe, it, expect, beforeEach, afterEach, Compose */

'use strict';

describe('Compose\'s plugin system', function () {

  var compose

  beforeEach(function () {
    this.elem = document.createElement('article')
    document.body.appendChild(this.elem)

    compose = new Compose(this.elem)
  })

  afterEach(function () {
    document.body.removeChild(this.elem)

    try {
      compose.destroy()
    } catch (e) {}
  })

  it('should isolate plugins.', function () {
    function plugin (Compose) {
      Compose.some = 'thing'
    }

    compose.use(plugin)

    expect(compose.some).toBeUndefined()
  })

  it('should isolate plugins (2).', function () {
    var checked = false

    compose.some = 'thing'

    function plugin (Compose) {
      checked = true

      expect(Compose.some).toBeUndefined()
    }

    compose.use(plugin)

    expect(checked).toBe(true)
  })

  it('should isolate plugins (3).', function () {
    var checked = false

    compose.use(function (Compose) {
      var x = Compose.use(function () { checked = true })

      if (x) x.some = 'thing'
    })

    expect(checked).toBe(true)
    expect(compose.some).toBeUndefined()
  })

  it('should allow plugins to export functionality via a "provide" method.', function () {
    var checked = false

    function plugin (Compose) {
      checked = true

      Compose.provide('some', 'thing')
    }

    compose.use(plugin)

    expect(checked).toBe(true)
    expect(compose.plugins.some).toEqual('thing')
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

    expect(checked).toBe(true)
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

    expect(checked).toBe(true)
    expect(compose.require('some')).toEqual('thing')
  })

  it('should throw an error when requiring a module that doesn\'t exist.', function () {
    function plugin (Compose) {
      Compose.require('non-existant')
    }

    function willThrow () {
      compose.use(plugin)
    }

    expect(willThrow).toThrow()
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

    expect(willThrow).toThrow()
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

    expect(disabled).toBe(true)
    expect(willThrow).toThrow()
  })

  it('hasOwnProperty edge case.', function () {
    var checked = false

    function silly (Compose) {
      Compose.provide('hasOwnProperty', 'Mwahaha.')
    }

    function other (Compose) {
      var prop = Compose.require('hasOwnProperty')

      checked = true

      expect(prop).toEqual('Mwahaha.')
    }

    compose.use(silly)
    compose.use(other)

    expect(checked).toBe(true)
  })
})
