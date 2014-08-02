'use strict';

var EventEmitter = require('wolfy87-eventemitter'),
    EventDispatcher = require('./event-dispatcher'),
    RichMode = require('./richMode/richMode'),
    UndoManager = require('./undo-manager'),
    utils = require('./utils'),
    timers = require('./timers')

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
    events: require('./events'),
    delta: require('./delta'),
    serialize: require('serialize-elem'),
    setImmediate: timers.setImmediate,
    clearImmediate: timers.clearImmediate,
    dom: require('./dom'),
    utils: utils
  }

  this.use(EventDispatcher)
  this.use(UndoManager)

  if (typeof mode === 'function')
    this.use(mode)
  // else if (mode === 'inline')
  //   this.use(InlineMode)
  else
    this.use(RichMode)
}

utils.inherits(Compose, EventEmitter)

/**
 * require(module) 'loads' the module with the given name, if it exists.
 * An error is thrown otherwise.
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
