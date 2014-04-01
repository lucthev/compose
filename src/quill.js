define([
  'vendor/eventEmitter/EventEmitter',
  'inlineMode',
  'richMode',
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

    if (this.isInline())
      this.use(Inline)
    else this.use(Rich)

    defaultPlugins.forEach(function (Plugin) {
      this.use(Plugin)
    }.bind(this))
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

  Quill.prototype.use = function (Plugin) {
    if (!Plugin) return

    var name = Plugin.plugin

    if (!name)
      throw new Error('Plugins should be named via a \'plugin\' property.')

    if (!(name in this)) {
      try {
        this[name] = new Plugin(this)
        this.plugins.push(name)
      } catch (e) {
        if (this._debug) console.log(e)
      }
    } else throw new Error('Quill is already using a plugin ' + name)

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

      if (this[name] && this[name].destroy)
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

    // TODO: separate all plugins and defaults?
    for (i = 0; i < defaultPlugins.length; i += 1)
      if (defaultPlugins[i].plugin === name) return defaultPlugins[i]

    return false
  }

  return Quill
})
