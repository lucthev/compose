'use strict';

var EventEmitter = require('./vendor/eventEmitter/EventEmitter'),
    SetImmediate = require('./setImmediate'),
    Selection = require('./selection'),
    InlineMode = require('./inlineMode'),
    RichMode = require('./richMode'),
    Sanitizer = require('./formatting/sanitizer'),
    History = require('./history'),
    Throttle = require('./throttle'),
    NodePlugin = require('./node'),
    SmartText = require('./plugins/smartText')

/**
 * setup(elem) sets up the given element. If a string is passed
 * in, tries to query that element using querySelector.
 *
 * @param {Element || String} elem
 * @return Element
 */
function setup (elem) {
  if (typeof elem === 'string')
    elem = document.querySelector(elem)

  if (!elem)
    throw new Error('Invalid element given.')

  elem.setAttribute('contenteditable', true)

  return elem
}

/**
 * new Quill(elem [, opts]) creates an instance of Quill. elem can be
 * an Element or a String; if a string, tries to query an element
 * using querySelector. opts is an options object with the following
 * keys, all optional:
 *   mode: A Function to use as the mode, or the Strings 'inline' or
 *     'rich' to use the built-in inline and rich modes. Defaults
 *     to 'rich'.
 *   debug: a boolean indicating debug mode. In debug mode, things
 *     are logged to the console.
 *
 * @param {Element || String} elem
 * @param {Object} opts
 * @return {Quill}
 */
function Quill (elem, opts) {
  var Mode

  if (!(this instanceof Quill))
    return new Quill(elem, opts)

  opts = opts || {}

  this.elem = setup(elem)
  this._debug = opts.debug

  // Plugin names are kept in here:
  this.plugins = []

  this.use(Sanitizer)
  this.use(NodePlugin)
  this.use(Selection)
  this.use(History)
  this.use(Throttle)

  // We're forcing smart text on people.
  this.use(SmartText)

  // Establish the mode:
  Mode = opts.mode
  if (!Mode || Mode === 'rich') Mode = RichMode
  else if (Mode === 'inline') Mode = InlineMode

  this.use(Mode)
}

// Quill is an EventEmitter.
Quill.prototype = Object.create(EventEmitter.prototype)

// Quill also makes available a setImmediate shim.
Quill.prototype.setImmediate = SetImmediate.setImmediate
Quill.prototype.clearImmediate = SetImmediate.clearImmediate

/**
 * Quill.use(Plugin, opts) adds a plugin to the Quill instance. Plugins
 * will be passed the Quill instance as a first parameter and opts as the
 * second.
 *
 * @param {Function} Plugin
 * @param {*} opts
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
      if (this._debug) throw e
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

  var i = this.plugins.length

  // We disable plugins in the reverse order they were added.
  // (Mainly so the sanitizer gets removed last).
  while (i) {
    this.disable(this.plugins[i - 1])
    i -= 1
  }

  delete this.plugins

  this.elem.contentEditable = false
  delete this.elem

  this._destroyed = true
  return null
}

// We bundle up plugins here.
Quill.plugin = {
  placeHolder: require('./plugins/placeHolder')
}

module.exports = Quill
