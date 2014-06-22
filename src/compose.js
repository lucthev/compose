'use strict';

var EventEmitter = require('wolfy87-eventemitter'),
    EventDispatcher = require('./event-dispatcher'),
    utils = require('./utils')

function Compose (elem, opts) {
  if (!(this instanceof Compose))
    return new Compose(elem, opts)

  if (typeof elem === 'string')
    elem = document.querySelector(elem)

  if (!elem)
    throw new Error('Invalid element or query string provided to Compose.')

  this.elem = elem
  elem.setAttribute('contenteditable', true)

  // Plugins. Some are bundled.
  this.plugins = {
    events: require('./events'),
    serialize: require('serialize-elem'),
    'error-handler': require('./error-handler')
  }

  this.use(EventDispatcher)
}

utils.inherits(Compose, EventEmitter)

/**
 * require(module) 'loads' the module with the given name, if it exists.
 * An error is throw otherwise.
 *
 * @param {String} module
 * @return {*}
 */
Compose.prototype.require = function (module) {
  if (!utils.hasOwnProp(this.plugins, module))
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
  if (utils.hasOwnProp(this.plugins, name))
    throw new Error('The module ' + name + 'already exists.')

  this.plugins[name] = exports
}

/**
 * use(plugin) sets up the given plugin.
 *
 * @param {Function} plugin
 * @return {Context}
 */
Compose.prototype.use = function (plugin) {
  if (typeof plugin !== 'function')
    throw new Error('Plugins must be functions.')

  plugin({
    elem: this.elem,
    require: this.require.bind(this),
    disable: this.disable.bind(this),
    provide: this.provide.bind(this),
    use: this.use.bind(this),
    on: this.on.bind(this),
    once: this.once.bind(this),
    off: this.off.bind(this),
    emit: this.emit.bind(this)
  })
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

  if (!utils.hasOwnProp(this.plugins, module))
    throw new Error('Cannot disable non-existant module: ' + module)

  plugin = this.plugins[module]
  if (plugin && typeof plugin.disable === 'function')
    plugin.disable()

  delete this.plugins[module]
}

module.exports = Compose
