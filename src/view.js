'use strict'

module.exports = ViewPlugin

var resolve = require('./resolve')
var Choice = require('choice')
var Handlers = require('./handlers')
var Selection = Choice.Selection

function ViewPlugin (Compose) {
  var events = Compose.require('events')
  var Delta = Compose.require('delta')
  var handler = Handlers(Compose)

  function View () {
    this._choice = new Choice(Compose.root, handler.getElements)

    this._selection = null
    this._selectionChanged = false

    this.paragraphs = []
    this.elements = []
    this.sections = []

    this._toRender = []
    this._isRendering = 0
    this._isSyncing = 0
    this._modified = -1

    var listener = function (e) {
      var sel = this.selection

      if (sel && e.type === 'keydown') {
        this._modified = sel.isBackwards() ? sel.end[0] : sel.start[0]
      }

      this._isSyncing = setImmediate(function scheduleSync () {
        // The selection should always be normalized after a “selection”
        // key is pressed, to avoid ambiguity with respect to multiple
        // nested inline markups.
        if (events.selectKey(e)) {
          this.selection = this._choice.getSelection()
        }

        this.sync()
      }.bind(this))

      this._isRendering = setImmediate(this._render.bind(this))
    }.bind(this)

    Compose.on('keydown', listener)
    Compose.on('mouseup', listener)
    Compose.on('focus', listener)
    Compose.on('blur', listener)
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
      if (Selection.equals(sel, this._selection)) {
        return
      }

      this._selection = sel
      this._selectionChanged = true

      if (!this._isRendering) {
        this._isRendering = setImmediate(this._render.bind(this))
      }
    }
  })

  // The following few methods are just thin wrappers around various
  // Handler methods. They’re here because of laziness; it’s convenient
  // to just pass around the View, instead of the View and Handlers.
  View.prototype.handlerForElement = function (elem) {
    return handler.forElement(elem)
  }

  View.prototype.handlerForParagraph = function (p) {
    return handler.forParagraph(p)
  }

  View.prototype.addHandler = function (h) {
    handler.addHandler(h)
    return this
  }

  View.prototype.getElements = function (opts) {
    return handler.getElements(opts)
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
    var all = handler.getElements()
    var len = this.elements.length
    var index = this._modified
    var paragraph
    var element
    var sel

    this._modified = -1
    this._isSyncing = 0

    len = this.elements.length
    if (all.length !== len) {
      Compose.emit('error', Error('View and DOM are out of sync'))
      return this
    }

    this.elements = all

    if (index >= 0) {
      element = all[index]
      paragraph = this.handlerForElement(element).serialize(element)
      this.resolve(new Delta('paragraphUpdate', index, paragraph), {
        render: false
      })
    }

    sel = this._choice.getSelection()
    if (!this._selectionChanged && !Selection.equals(sel, this._selection)) {
      this._selection = sel
      Compose.emit('selectionchange')
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
    opts = opts || {}
    if (!Array.isArray(deltas)) {
      deltas = [deltas]
    }

    for (var i = 0; i < deltas.length; i += 1) {
      try {
        resolve.validate(this, deltas[i])
      } catch (err) {
        Compose.emit('error', err)
        return this
      }

      // If a paragraphUpdate delta would result in an identical paragraph,
      // skip the work.
      if (deltas[i].type === Delta.types.paragraphUpdate &&
          deltas[i].paragraph.equals(this.paragraphs[deltas[i].index])) {
        continue
      }

      Compose.emit('delta', deltas[i])
      resolve.inline(this, deltas[i])

      if (opts.render !== false) {
        this._toRender.push(deltas[i])
      }
    }

    if (!this._isRendering && this._toRender.length) {
      this._isRendering = setImmediate(this._render.bind(this))
    }

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
    var queue = this._toRender

    this._toRender = []
    this._isRendering = 0

    // Don’t render (in particular, don’t restore the selection) unless we
    // have to; amongst other things, doing so interrupts IME composition.
    if (!queue.length && !this._selectionChanged) {
      return this
    }

    for (var i = 0; i < queue.length; i += 1) {
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
