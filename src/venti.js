/* global console, document, define */

<<<<<<< HEAD
define(['vendor/eventEmitter/EventEmitter', 'history'], function (EventEmitter, History) {
  'use strict';

  var defaultPlugins = [History],
      unnamedCounter = 0
=======
define([
  'vendor/eventEmitter/EventEmitter',
  'selection',
  'history',
  'throttle'],
  function (EventEmitter, Selection, History, Throttle) {

  var defaultPlugins = [Selection, History, Throttle]
>>>>>>> plugins

  function Venti (elem, opts) {
    if (!(this instanceof Venti))
      return new Venti(elem, opts)

    var p

    if (typeof elem === 'string')
      elem = document.querySelector(elem)

    if (!elem) return

    elem.contentEditable = true
    elem.setAttribute('data-mode', opts.inline ? 'inline' : 'rich')

    if (!opts.inline && !elem.firstElementChild) {
      p = document.createElement('p')
      p.appendChild(document.createElement('br'))
      elem.appendChild(p)
    }

    this.elem = elem
    this.inline = !!opts.inline
    this._debug = opts.debug

    defaultPlugins.forEach(function (Plugin) {
      this.use(Plugin)
    }.bind(this))
  }

  Venti.prototype = Object.create(EventEmitter.prototype)

  Venti.prototype.plugins = []
  Venti.prototype.use = function (Plugin) {
    if (!Plugin) return

<<<<<<< HEAD
    var name = Plugin.name || 'x' + unnamedCounter

=======
    var name = Plugin.plugin

    if (!name)
      throw new Error('Plugin should be named via a plugin property.')

>>>>>>> plugins
    if (!(name in this)) {
      try {
        this[name] = new Plugin(this)
        this.plugins.push(name)
      } catch (e) {
        if (this._debug) console.log(e)
      }
    } else if (this._debug) {
      console.log('Venti already has a property %s', name)
    }
  }

  /**
   * Venti.destroy() removes event listeners and deletes references
   * to elements etc.
   *
   * @return null
   */
  Venti.prototype.destroy = function () {
    if (this._destroyed) return

    this.plugins.forEach(function (name) {
      if (this[name].destroy)
        this[name].destroy()

      delete this[name]
    })
    delete this.plugins

    delete this.elem

    this._destroyed = true
    return null
  }

  Venti.addDefault = function (Plugin) {
    if (!Plugin) return false

    if (!defaultPlugins)
      defaultPlugins = [Plugin]
    else defaultPlugins.push(Plugin)

    return true
  }

  return Venti
})
