'use strict'

import EventEmitter from 'component-emitter'
import hasOwnProp from 'has-own-prop'
import {setupEvents} from './events'
import View from './view'
import enterPlugin from './enter'

// Shim setImmediate/clearImmediate
require('setimmediate')

class Compose extends EventEmitter {
  /**
   * new Compose(elem) creates a new editor with the given element as
   * the "root" of the document. If `elem` is a string, it is used to
   * query an element using `document.querySelector`.
   *
   * @param {Element || String} elem
   */
  constructor (elem) {
    super()

    if (typeof elem === 'string') {
      this.root = document.querySelector(elem)
    } else {
      this.root = elem
    }

    if (!this.root) {
      throw Error('Invalid element or query selector.')
    }

    this.root.setAttribute('contenteditable', true)

    this.plugins = {}
    this.use(View)
    this.use(enterPlugin)

    setupEvents(this)

    // Don’t silently swallow errors:
    this.on('error', (err) => {
      if (this.listeners('error').length === 1) {
        throw err
      }
    })
  }

  /**
   * init() sets up the editor for use.
   */
  init () {
    this.emit('init')
    return this
  }

  /**
   * provide(name, provided) provides something (whatever `provided` is)
   * for use in plugins, under the name `name`.
   *
   * @param {String} name
   * @param {*} provided
   */
  provide (name, provided) {
    this.plugins[name] = provided
  }

  /**
   * require(thing) returns the exports of the plugin `thing`.
   *
   * @param {String} thing
   * @return {*}
   */
  require (thing) {
    if (!hasOwnProp(this.plugins, thing)) {
      this.emit('error', Error(`Could not find ${thing}.`))
    }

    return this.plugins[thing]
  }

  /**
   * use(plugin [, ...args]) sets up the given plugin for use with this
   * editor.
   *
   * @param {Function} plugin
   * @param {...} args
   */
  use (plugin, ...args) {
    if (typeof plugin !== 'function') {
      this.emit('error', TypeError('Plugins must be functions.'))
    }

    plugin(this, ...args)
  }
}

// FIXME: ES modules + Babel doesn't seem to play nice with Browserify?
// export default Compose
module.exports = Compose
