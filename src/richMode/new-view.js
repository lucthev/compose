'use strict';

module.exports = ViewPlugin

var paragraph = require('./new-paragraph'),
    section = require('./new-section'),
    resolve = require('./resolve'),
    Choice = require('choice')

function ViewPlugin (Compose) {

  function View () {
    var handler

    this._choice = new Choice(Compose.root, this._getParagraphs.bind(this))
    this._handlers = []

    this._selection = null
    this._selectionChanged = false

    this.paragraphs = []
    this.sections = []
    this.elements = []

    this._toRender = []
    this._isRendering = 0
    this._modified = -1

    handler = function (e) {
      var sel = this.selection

      if (sel && e.type === 'keydown')
        this._modified = sel.isBackwards() ? sel.end[0] : sel.start[0]

      // Schedule sync/render:
      this.resolve()
    }.bind(this)

    Compose.on('keydown', handler)
    Compose.on('mouseup', handler)
    Compose.on('focus', handler)
    Compose.on('blur', handler)
  }

  /**
   * Getters and setters for the selection. This may not have been the
   * best idea; explicit getters and setters could have been better,
   * as they could have returned a cloned selection. With the below
   * configuration, it’s plausible someone might do
   *    View.selection.start[1] += 1
   * and expect the selection to change.
   */
  Object.defineProperty(View.prototype, 'selection', {
    configurable: true,
    enumerable: true,
    get: function () {
      return this._selection
    },
    set: function (sel) {
      var Selection = this._choice.Selection

      if (Selection.equals(sel, this._selection))
        return

      this._selection = sel
      this._selectionChanged = true
      this.render()
    }
  })

  /**
   * allow(fns) defines a set of functions which add support for one or
   * elements. Those elements are specified via two properties, “elements”
   * and “paragraphs,” representing the nodeNames and Serialize types of
   * the supported element(s), respectively. The functions, all optional,
   * are:
   *  - serialize(element) converts an element into an instance of
   *    Serialize
   *  - insert(index, abstractElement) takes an instance of Serialize,
   *    converts it back into an element, and inserts it at the given
   *    index in the DOM
   *  - update(index, abstractElement) like above, but for an update
   *    operation
   *  - remove(index) removes the paragraph at the given index from the DOM
   *
   * If any of these functions are not specified, the operations defined
   * for simple <p> elements are used.
   *
   * @param {Object} params
   * @return {Context}
   */
  View.prototype.allow = function (params) {
    var paragraph = this.handlerForElement('P')

    if (!params || !params.elements || !params.paragraphs)
      return this

    params.elements = params.elements.map(function (elem) {
      return elem.toUpperCase()
    })

    params.paragraphs = params.paragraphs.map(function (paragraph) {
      return paragraph.toLowerCase()
    })

    params.serialize = params.serialize || paragraph.serialize
    params.insert = params.insert || paragraph.insert
    params.update = params.update || paragraph.update
    params.remove = params.remove || paragraph.remove

    this._handlers.push(params)

    return this
  }

  /**
   * handlerForElement(name) returns the handler for elements of the
   * given name.
   *
   * @param {String} name
   * @return {Object}
   */
  View.prototype.handlerForElement = function (name) {
    var handlers = this._handlers,
        i

    name = name.toUpperCase()

    for (i = 0; i < handlers.length; i += 1) {
      if (handlers[i].elements.indexOf(name) >= 0)
        return handlers[i]
    }

    return null
  }

  /**
   * handlerForParagraph(type) returns the handler for serializations of the
   * given type.
   *
   * @param {String} name
   * @return {Object}
   */
  View.prototype.handlerForParagraph = function (type) {
    var handlers = this._handlers,
        i

    type = type.toLowerCase()

    for (i = 0; i < handlers.length; i += 1) {
      if (handlers[i].paragraphs.indexOf(type) >= 0)
        return handlers[i]
    }

    return null
  }

  /**
   * _getParagraphs() returns an array containing all “allowed”
   * children of the editor’s root element.
   *
   * @return {Array}
   */
  View.prototype._getParagraphs = function () {
    var all = [],
        i

    for (i = 0; i < this._handlers.length; i += 1)
      all = all.concat(this._handlers[i].elements)

    return [].slice.call(Compose.root.querySelectorAll(all.join(',')))
  }

  /**
   * isSectionStart(index) determines whether or not a section starts
   * at the given index.
   *
   * @param {Int} index
   * @return {Boolean}
   */
  View.prototype.isSectionStart = function (index) {
    var i

    for (i = 0; i < this.sections.length; i += 1) {
      if (this.sections[i].start === index)
        return true
    }

    return false
  }

  /**
   * sync() relefects changes made to the editor or the selection,
   * and updates the View accordingly.
   */
  View.prototype.sync = function () {
    var all = this._getParagraphs(),
        len = this.elements.length,
        index = this._modiked,
        paragraph,
        element,
        sel

    len = this.elements.length
    if (all.length !== len) {
      Compose.emit('error', Error('View and DOM are out of sync'))
      return this
    }

    this.elements = all

    sel = this._choice.getSelection()
    if (!Choice.Selection.equals(sel, this._selection)) {
      this._selection = sel
      Compose.emit('selectionchange')
    }

    if (index >= 0) {
      element = all[index]
      paragraph = this._handlers[element.nodeName].serialize(element)

      if (!paragraph.equals(this.paragraphs[index])) {
        this.paragraphs[index] = paragraph
        Compose.emit('paragraphUpdate', index)
      }
    }

    this._modified = -1

    return this
  }

  /**
   * resolve(deltas) resoves one or more deltas immediately against
   * the View, and adds them to a queue to be resolved against the
   * DOM on next tick.
   *
   * @param {Delta || Array} deltas
   * @return {Context}
   */
  View.prototype.resolve = function (deltas) {
    var i

    if (Array.isArray(deltas)) {
      for (i = 0; i < deltas.length; i += 1) {
        try {
          resolve.inline(this, deltas[i])
        } catch (err) {
          Compose.emit('error', err)
          return this
        }
      }

      this._toRender = this._toRender.concat(deltas)
    } else if (deltas) {
      try {
        resolve.inline(this, deltas)
      } catch (err) {
        Compose.emit('error', err)
        return this
      }

      this._toRender.push(deltas)
    }

    if (!this._isRendering)
      this._isRendering = setImmediate(this._render.bind(this))

    return this
  }

  /**
   * _render() resolves the delta queue against the DOM, and restores
   * the selection afterwards.
   *
   * @return {Context}
   */
  View.prototype._render = function () {
    var i

    this.sync()

    for (i = 0; i < this._toRender[i].length; i += 1) {
      try {
        resolve.DOM(this, this._toRender[i])
      } catch (err) {
        Compose.emit('error', err)
        return this
      }
    }

    try {
      this._choice.restore(this.selection)
      if (this._selectionChanged)
        Compose.emit('selectionchange')
    } catch (err) {
      Compose.emit('error', err)
    }

    this._selectionChanged = false
    this._toRender = []
    this._rendering = 0

    // NOTE: previously, the only real use of a “render” event was to
    // restore the selection afterwards; now that the selection is
    // always restored, let’s see if we can do without it.
    // Compose.emit('render')

    return this
  }

  Compose.provide('view', new View())

  // Initialize the default paragraph and section handlers.
  Compose.use(paragraph)
  Compose.use(section)
}
