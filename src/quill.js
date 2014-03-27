/* global console, document, define */

define([
  'vendor/eventEmitter/EventEmitter',
  'selection',
  'history',
  'throttle'],
  function (EventEmitter, Selection, History, Throttle) {

  var defaultPlugins = [Selection, History, Throttle]

  function Quill (elem, opts) {
    if (!(this instanceof Quill))
      return new Quill(elem, opts)

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

  Quill.prototype = Object.create(EventEmitter.prototype)

  Quill.prototype.plugins = []
  Quill.prototype.use = function (Plugin) {
    if (!Plugin) return

    var name = Plugin.plugin

    if (!name)
      throw new Error('Plugin should be named via a plugin property.')

    if (!(name in this)) {
      try {
        this[name] = new Plugin(this)
        this.plugins.push(name)
      } catch (e) {
        if (this._debug) console.log(e)
      }
    } else if (this._debug) {
      console.log('Quill already has a plugin %s', name)
    }
  }

  /**
   * Quill.destroy() removes event listeners and deletes references
   * to elements etc.
   *
   * @return null
   */
  Quill.prototype.destroy = function () {
    if (this._destroyed) return

    this.plugins.forEach(function (name) {

      if (this[name].destroy)
        this[name].destroy()

      delete this[name]
    }.bind(this))
    delete this.plugins

    this.elem.contentEditable = false
    delete this.elem

    this._destroyed = true
    return null
  }

  Quill.addDefault = function (Plugin) {
    if (!Plugin) return false

    if (!defaultPlugins)
      defaultPlugins = [Plugin]
    else defaultPlugins.push(Plugin)

    return true
  }

  return Quill
})
