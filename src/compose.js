'use strict'

var EventEmitter = require('component-emitter')
var hasOwnProp = require('has-own-prop')

// Shim setImmediate/clearImmediate
require('setimmediate')

/**
 * Compose(elem) is the constructor for Compose. Takes an element or
 * string as it only parameter; if passed a string, it will be used
 * to get an element via document.querySelector().
 *
 * @param {Element || String} elem
 * @return {Compose}
 */
function Compose (elem) {
  if (!(this instanceof Compose)) {
    return new Compose(elem)
  }

  if (typeof elem === 'string') {
    elem = document.querySelector(elem)
  }

  if (!elem) {
    throw new Error('Invalid element or query string provided to Compose.')
  }

  this.root = elem
  elem.setAttribute('contenteditable', true)

  // Plugins. Some are bundled.
  this.plugins = {
    delta: require('./delta'),
    serialize: require('serialize-elem'),
    dom: require('./dom')
  }

  this.use(require('./events'))
  this.use(require('./handlers'))
  this.use(require('./view'))
  this.use(require('./sanitizer'))
  this.use(require('./backspace'))
  this.use(require('./enter'))
  this.use(require('./spacebar'))
  this.use(require('./copy'))

  // Don’t silently swallow errors:
  this.on('error', function onError (err) {
    if (this.listeners('error').length === 1) {
      throw err
    }
  }.bind(this))
}

EventEmitter(Compose.prototype)

/**
 * require(module) 'loads' the module with the given name, if it exists.
 * An error is thrown otherwise.
 *
 * @param {String} module
 * @return {*}
 */
Compose.prototype.require = function (module) {
  if (!hasOwnProp(this.plugins, module)) {
    throw new Error('Could not find module: ' + module)
  }

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
  if (hasOwnProp(this.plugins, name)) {
    throw new Error('The module "' + name + '" already exists.')
  }

  this.plugins[name] = exports

  return this
}

/**
 * use(plugin) sets up the given plugin. Extra arguments are passed to
 * the plugin.
 *
 * @param {Function} plugin
 * @return {Context}
 */
Compose.prototype.use = function (plugin) {
  if (typeof plugin !== 'function') {
    throw new TypeError('Plugins must be functions.')
  }

  var args = [].slice.call(arguments)
  args[0] = this
  plugin.apply(undefined, args)

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
  if (!hasOwnProp(this.plugins, module)) {
    throw new Error('Cannot disable non-existant module "' + module + '"')
  }

  var plugin = this.plugins[module]
  if (plugin && typeof plugin.disable === 'function') {
    plugin.disable()
  }

  delete this.plugins[module]
  return this
}

module.exports = Compose
