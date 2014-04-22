define([
  'vendor/eventEmitter/EventEmitter',
  'inlineMode',
  'richMode',
  'formatting/sanitizer',
  'selection',
  'history',
  'throttle'],
  function (EventEmitter, Inline, Rich) {

  // Note: put default plugins last so they are included in the slice.
  var defaultPlugins = Array.prototype.slice.call(arguments, 3)

  function Quill (elem, opts) {
    if (!(this instanceof Quill))
      return new Quill(elem, opts)

    opts = opts || {}
    if (typeof elem === 'string')
      elem = document.querySelector(elem)

    if (!elem) return

    this.elem = elem
    this.mode = opts.mode || 'rich'
    this._debug = opts.debug

    // Plugin names are kept in here:
    this.plugins = []

    elem.contentEditable = true
    elem.setAttribute('data-mode', this.mode)

    defaultPlugins.forEach(function (Plugin) {
      this.use(Plugin)
    }.bind(this))

    if (this.isInline())
      this.use(Inline)
    else this.use(Rich)
  }

  Quill.prototype = Object.create(EventEmitter.prototype)

  /**
   * Quill.isInline() determines if the editor is in inline mode.
   * This might seem silly, as one could just check Quill.mode,
   * but this ensures backwards compatibility if that ever changes.
   *
   * @return Boolean
   */
  Quill.prototype.isInline = function () {
    return this.mode === 'inline'
  }

  /**
   * Quill.use(Plugin, opts) adds a plugin to the Quill instance. Plugins
   * will be passed the Quill instance as a first parameter and opts as the
   * second.
   *
   * @param {Function} Plugin
   * @param {Any} opts
   * @return Context
   */
  Quill.prototype.use = function (Plugin, opts) {
    if (!Plugin) return

    // Plugins should be named via a 'plugin' property.
    var name = Plugin.plugin

    if (!name)
      throw new Error('Plugins should be named via a \'plugin\' property.')

    if (!(name in this)) {
      try {
        this[name] = new Plugin(this, opts)
        this.plugins.push(name)
      } catch (e) {
        if (this._debug) console.log(e)
      }
    } else throw new Error('Quill is already using a plugin ' + name)

    return this
  }

  /**
   * Quill.disable(name) disables the plugin with name 'name'.
   *
   * @param {String} name
   * @return Context
   */
  Quill.prototype.disable = function (name) {
    var i

    if (!name) return

    i = this.plugins.indexOf(name)
    if (i < 0)
      throw new Error('Quill is not using a plugin ' + name)

    if (typeof this[name].destroy === 'function')
      this[name].destroy()

    delete this[name]

    this.plugins.splice(i, 1)

    return this
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

      if (this[name] && typeof this[name].destroy === 'function')
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

  /**
   * Quill.getPlugin(name) gets the plugin with name 'name' from the
   * array of default plugins. Useful mainly for testing.
   *
   * @param {String} name
   * @return Function || false
   */
  Quill.getPlugin = function (name) {
    var i

    for (i = 0; i < defaultPlugins.length; i += 1)
      if (defaultPlugins[i].plugin === name) return defaultPlugins[i]

    return false
  }

  return Quill
})
