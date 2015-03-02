'use strict';

module.exports = ViewPlugin

var resolve = require('./resolve'),
    Choice = require('choice'),
    Selection = Choice.Selection

function ViewPlugin (Compose) {
  var Serialize = Compose.require('serialize'),
      events = Compose.require('events'),
      Delta = Compose.require('delta'),
      dom = Compose.require('dom')

  function View () {
    var handler

    this._choice = new Choice(Compose.root, this._getElements.bind(this))

    // Handlers for various element types. Not much is done with sections
    // at the moment; if it ever gets more complex, these handlers should
    // probably be split out into separate files.
    this._handlers = [{
      elements: ['P'],
      paragraphs: ['p'],
      serialize: function (element) {
        return new Serialize(element)
      },
      deserialize: function (paragraph) {
        return [paragraph.toElement()]
      }
    }, {
      elements: ['SECTION', 'HR'],
      paragraphs: [],
      serialize: function (/*section*/) {
        return {}
      },
      deserialize: function (/*obj*/) {
        var section = dom.create('section')

        section.appendChild(dom.create('hr'))
        return section
      }
    }]

    this._selection = null
    this._selectionChanged = false

    this.paragraphs = []
    this.elements = []
    this.sections = []

    this._toRender = []
    this._isRendering = 0
    this._isSyncing = 0
    this._modified = -1

    handler = function (e) {
      var sel = this.selection

      if (sel && e.type === 'keydown')
        this._modified = sel.isBackwards() ? sel.end[0] : sel.start[0]

      this._isSyncing = setImmediate(function scheduleSync () {

        // The selection should always be normalized after a “selection”
        // key is pressed, to avoid ambiguity with respect to multiple
        // nested inline markups.
        if (events.selectKey(e))
          this.selection = this._choice.getSelection()

        this.sync()
      }.bind(this))

      this._isRendering = setImmediate(this._render.bind(this))
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
      if (Selection.equals(sel, this._selection))
        return

      this._selection = sel
      this._selectionChanged = true

      if (!this._isRendering)
        this._isRendering = setImmediate(this._render.bind(this))
    }
  })

  /**
   * addHandler(handler) defines a set of functions which add support
   * for one or elements. Those elements are specified via two properties,
   * “elements” and “paragraphs,” representing the nodeNames and Serialize
   * types of the supported element(s), respectively. The functions,
   * all optional, are:
   *  - serialize(element) converts an element into an instance of
   *    Serialize
   *  - deserialize(paragraph) performs the opposite of serialize; takes
   *    an instance of Serialize and turns it into an element.
   *
   * If any of these functions are not specified, the operations defined
   * for simple P elements are used.
   *
   * @param {Object} handler
   * @return {Context}
   */
  View.prototype.addHandler =
  View.prototype.allow = function (handler) {
    var basic = this.handlerForElement('P')

    if (!handler || !handler.elements || !handler.paragraphs)
      return this

    handler.elements = handler.elements.map(function (elem) {
      return elem.toUpperCase()
    })

    handler.serialize = handler.serialize || basic.serialize
    handler.deserialize = handler.deserialize || basic.deserialize

    this._handlers.push(handler)

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
   * _getElements() returns an array containing all “allowed”
   * children of the editor’s root element.
   *
   * @return {Array}
   */
  View.prototype._getElements = function () {
    var sectionHandler = this.handlerForElement('SECTION'),
        all = [],
        i

    for (i = 0; i < this._handlers.length; i += 1) {
      if (this._handlers[i] === sectionHandler)
        continue

      all = all.concat(this._handlers[i].elements)
    }

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
    return this.sections.some(function (section) {
      return section.start === index
    })
  }

  /**
   * sync() reflects changes made to the editor or the selection,
   * and updates the View accordingly.
   */
  View.prototype.sync = function () {
    var all = this._getElements(),
        len = this.elements.length,
        index = this._modified,
        paragraph,
        element,
        sel

    this._modified = -1
    this._isSyncing = 0

    len = this.elements.length
    if (all.length !== len) {
      Compose.emit('error', Error('View and DOM are out of sync'))
      return this
    }

    this.elements = all

    sel = this._choice.getSelection()
    if (!this._selectionChanged && !Selection.equals(sel, this._selection)) {
      this._selection = sel
      Compose.emit('selectionchange')
    }

    if (index >= 0) {
      element = all[index]
      paragraph = this.handlerForElement(element.nodeName).serialize(element)
      this.resolve(new Delta('paragraphUpdate', index, paragraph), {
        render: false
      })
    }

    return this
  }

  /**
   * resolve(deltas [, skipRender]) resolves one or more deltas immediately
   * against the View, and against the DOM on next tick. One may optionally
   * pass in an options object with the “render” property set to false to
   * not resolve changes against the DOM.
   *
   * @param {Delta || Array} deltas
   * @param {Object} opts
   * @return {Context}
   */
  View.prototype.resolve = function (deltas, opts) {
    var i

    opts = opts || {}
    if (!Array.isArray(deltas))
      deltas = [deltas]

    for (i = 0; i < deltas.length; i += 1) {
      try {
        resolve.validate(this, deltas[i])
      } catch (err) {
        Compose.emit('error', err)
        return this
      }

      // If a paragraphUpdate delta would result in an identical paragraph,
      // skip the work.
      if (deltas[i].type === Delta.types.paragraphUpdate &&
          deltas[i].paragraph.equals(this.paragraphs[deltas[i].index]))
        continue

      Compose.emit('delta', deltas[i])
      resolve.inline(this, deltas[i])

      if (opts.render !== false)
        this._toRender.push(deltas[i])
    }

    if (!this._isRendering && this._toRender.length)
      this._isRendering = setImmediate(this._render.bind(this))

    // Cancel a sync, if one is scheduled. Otherwise, the sync can
    // overwrite changes made via inline resolves.
    if (this._isSyncing) {
      clearImmediate(this._isSyncing)
      this._isSyncing = 0
    }

    return this
  }

  /**
   * _render() resolves the delta queue against the DOM, and restores
   * the selection afterwards.
   *
   * @return {Context}
   */
  View.prototype._render = function () {
    var queue = this._toRender,
        i

    this._toRender = []
    this._isRendering = 0

    // Don’t render (in particular, don’t restore the selection) unless we
    // have to; amongst other things, doing so interrupts IME composition.
    if (!queue.length && !this._selectionChanged)
      return this

    for (i = 0; i < queue.length; i += 1) {
      try {
        resolve.DOM(this, queue[i])
      } catch (err) {
        Compose.emit('error', err)
        return this
      }
    }

    if (this.selection) {
      try {
        this._choice.restore(this.selection)
        if (this._selectionChanged) {
          this._selectionChanged = false
          Compose.emit('selectionchange')
        }
      } catch (err) {
        Compose.emit('error', err)
      }
    }

    return this
  }

  // Expose the Selection constructor.
  Compose.provide('selection', Selection)
  Compose.provide('view', new View())
}
