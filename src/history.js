'use strict';

/**
 * modKey(event) determines if the modifier key was pressed during
 * an event. Assumes Cmd for Mac, Ctrl for others.
 *
 * @param {Event} e
 * @return Boolean
 */
function modKey (e) {
  if (/^Mac/i.test(navigator.platform))
    return e.metaKey

  return e.ctrlKey
}

// Used to intercept Cmd/Ctrl-z.
function onKeydown (e) {
  /* jshint validthis:true */
  if (e.keyCode === 90 && modKey(e)) {
    e.preventDefault()
    if (e.shiftKey) this.redo()
    else this.undo()
  }
}

function onChange (ignore) {
  /* jshint validthis:true */

  // See @History.undo()
  if (ignore === 'ignore') return

  this.selection.save()
  this.history.push(this.elem.innerHTML)
  this.selection.removeMarkers()
}

// Used to push the initial state once focus has been achieved.
function onFocus () {
  /* jshint validthis:true */

  // Wait until the caret has been placed to save state.
  setTimeout(function () {
    this.selection.save()
    this.history.push(this.elem.innerHTML)
    this.selection.removeMarkers()
  }.bind(this), 0)

  this.elem.removeEventListener('focus', this.history.onFocus)
}

function History (Quill) {
  this.elem = Quill.elem
  this.Quill = Quill
  this._debug = Quill._debug
  this.max = 100

  this.stack = []
  this.length = 0

  // Bound functions are being used as event listeners; they are
  // kept here so we can remove them upon destroying.
  this.onFocus = onFocus.bind(Quill)
  this.onKeydown = onKeydown.bind(this)
  this.onChange = onChange.bind(Quill)

  this.elem.addEventListener('focus', this.onFocus)
  this.elem.addEventListener('keydown', this.onKeydown)
  this.Quill.on('change', this.onChange)
}

History.prototype.push = function (item) {
  this.stack[this.length] = item
  this.length += 1

  if (this.stack.length > this.max) {
    this.stack.shift()
    this.length -= 1
  }

  if (this._debug) console.log('History: pushed %s', item)
}

History.prototype.undo = function () {
  if (this.length <= 1) return

  this.elem.innerHTML = this.stack[this.length - 2]
  this.Quill.selection.restore()

  this.length -= 1

  // We pass 'ignore' as a parameter to prevent ourselves
  // from pushing the changes we just undid.
  this.Quill.emit('change', 'ignore')
}

History.prototype.redo = function () {
  if (!this.stack.length || this.stack.length === this.length) return

  this.elem.innerHTML = this.stack[this.length]
  this.Quill.selection.restore()

  this.length += 1

  this.Quill.emit('change', 'ignore')
}

History.prototype.destroy = function () {
  this.Quill.off('change', this.onChange)
  this.elem.removeEventListener('keydown', this.onKeydown)

  // Try removing onFocus; maybe we are getting destroyed before
  // focus was ever achieved.
  this.elem.removeEventListener('focus', this.onFocus)

  delete this.onFocus
  delete this.onKeydown
  delete this.onFocus
  delete this.elem
  delete this.Quill

  return
}

// Plugin name:
History.plugin = 'history'

module.exports = History
