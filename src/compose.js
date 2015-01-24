'use strict';

var eventEmitter = require('component-emitter'),
    RichMode = require('./richMode/richMode'),
    Events = require('./events'),
    timers = require('./timers')

function hasOwnProp (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

/**
 * Compose(elem [, mode]) is the constructor for Compose. Takes an
 * element as a first parameter and optionally a string or function as
 * a second parameter to define the mode. If a string, mode should be
 * one of 'rich', 'inline'. If not specified, defaults to 'rich',
 * meaning the editor will be in “rich” editing mode.
 *
 * @param {Element} elem
 * @param {String || Function} mode
 * @return {Compose}
 */
function Compose (elem, mode) {
  if (!(this instanceof Compose))
    return new Compose(elem, mode)

  if (typeof elem === 'string')
    elem = document.querySelector(elem)

  if (!elem)
    throw new Error('Invalid element or query string provided to Compose.')

  this.elem = elem
  elem.setAttribute('contenteditable', true)

  // Plugins. Some are bundled.
  this.plugins = {
    delta: require('./delta'),
    serialize: require('serialize-elem'),
    setImmediate: timers.setImmediate,
    clearImmediate: timers.clearImmediate,
    dom: require('./dom'),
    debug: require('debug')
  }

  this.use(Events)

  if (typeof mode === 'function')
    this.use(mode)
  // else if (mode === 'inline')
  //   this.use(InlineMode)
  else
    this.use(RichMode)
}

eventEmitter(Compose.prototype)

/**
 * require(module) 'loads' the module with the given name, if it exists.
 * An error is thrown otherwise.
 *
 * @param {String} module
 * @return {*}
 */
Compose.prototype.require = function (module) {
  if (!hasOwnProp(this.plugins, module))
    throw new Error('Could not find module: ' + module)

  return this.plugins[module]
}

/**
 * provide(name, exports) defines a module with the given name to have
 * the value 'exports'. An error is raised if two modules try to share
 * the same name.
 *
 * @param {String} name
 * @param {*} exports
 */
Compose.prototype.provide = function (name, exports) {
  if (hasOwnProp(this.plugins, name))
    throw new Error('The module "' + name + '" already exists.')

  this.plugins[name] = exports

  return this
}

/**
 * use(plugin) sets up the given plugin.
 *
 * @param {Function} plugin
 * @return {Context}
 */
Compose.prototype.use = function (plugin) {
  if (typeof plugin !== 'function')
    throw new TypeError('Plugins must be functions.')

  plugin(this)

  return this
}

/**
 * disable(module) tries to call the 'disable' method of a module,
 * if one exists, and deletes the module regardless.
 *
 * @param {String}
 * @return {Context}
 */
Compose.prototype.disable = function (module) {
  var plugin

  if (!hasOwnProp(this.plugins, module))
    throw new Error('Cannot disable non-existant module "' + module + '"')

  plugin = this.plugins[module]
  if (plugin && typeof plugin.disable === 'function')
    plugin.disable()

  delete this.plugins[module]

  return this
}

module.exports = Compose
