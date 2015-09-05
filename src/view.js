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
    this._needsRestoring = false

    this.paragraphs = []
    this.elements = []
    this.sections = []

    this._toRender = []
    this._isRendering = 0

    this._contentChanged = false

    var listener = this._tick.bind(this)
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
      var equal = Selection.equals(sel, this._selection)

      this._selection = sel
      this._needsRestoring = !equal
      this._selectionChanged = !equal

      this._tick()
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
   * _tick([event]) syncs and renders deltas on next tick.
   *
   * @param {Event} event
   */
  View.prototype._tick = function (event) {
    if (this._isRendering) return

    event = event || {}

    var modified = -1
    if (event.type === 'keydown' && this.selection) {
      modified = this.selection.absoluteStart[0]
    }

    this._isRendering = setImmediate(function syncAndRender () {
      if (!this._toRender.length) {
        // Force restoration of the selection after arrow key presses
        // and other selection-modifying actions.
        if (event.type !== 'keydown' || events.selectKey(event)) {
          this._needsRestoring = true
        }

        this._sync(modified)
      }

      // Clear _isRendering after syncing; deltas resolved as a result
      // of syncing should still be resolved this turn.
      this._isRendering = 0
      this._render()
    }.bind(this))

    return this
  }

  /**
   * _sync(index) ensures that the selection, and the paragraph at the
   * given index, are up-to-date.
   *
   * @param {Int} index
   */
  View.prototype._sync = function (index) {
    var paragraph
    var element

    var all = handler.getElements()
    if (all.length !== this.elements.length) {
      Compose.emit('error', Error('View and DOM are out of sync'))
      return this
    }

    if (index >= 0) {
      element = all[index]
      paragraph = this.handlerForElement(element).serialize(element)
      this.resolve(new Delta('paragraphUpdate', index, paragraph), {
        render: false
      })
    }

    var sel = this._choice.getSelection()
    if (!this._selectionChanged && !Selection.equals(sel, this._selection)) {
      this._selection = sel
      this._selectionChanged = true
    }

    return this
  }

  /**
   * resolve(deltas [, opts]) resolves one or more deltas immediately
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
      var other = this.paragraphs[deltas[i].index]
      if (deltas[i].type === 'paragraphUpdate' &&
          deltas[i].paragraph.equals(other)) {
        continue
      }

      Compose.emit('delta', deltas[i])
      resolve.inline(this, deltas[i])

      if (opts.render !== false) {
        this._toRender.push(deltas[i])
      } else {
        this._contentChanged = true
      }
    }

    this._tick()
    return this
  }

  /**
   * _render() resolves the delta queue against the DOM, and restores
   * the selection afterwards.
   *
   * @return {Context}
   */
  View.prototype._render = function () {
    var queue = Delta.reduce(this._toRender)
    var contentChanged = this._contentChanged || Boolean(queue.length)
    this._toRender = []
    this._contentChanged = false

    for (var i = 0; i < queue.length; i += 1) {
      try {
        resolve.DOM(this, queue[i])
      } catch (err) {
        Compose.emit('error', err)
        return this
      }
    }

    var didChange = this._selectionChanged
    var needsRestoring = this._needsRestoring
    this._selectionChanged = false
    this._needsRestoring = false

    if (needsRestoring && this.selection) {
      try {
        this._choice.restore(this.selection)
      } catch (err) {
        Compose.emit('error', err)
      }
    }

    if (didChange) {
      Compose.emit('selectionchange')
    }

    if (contentChanged) {
      Compose.emit('contentchange')
    }

    return this
  }

  // Expose the Selection constructor.
  Compose.provide('selection', Selection)
  Compose.provide('view', new View())
}
