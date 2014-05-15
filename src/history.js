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
  if (e.keyCode === 90 && modKey(e)) {
    e.preventDefault()
    if (e.shiftKey) this.redo()
    else this.undo()
  }
}

function onChange (ignore) {

  // See @History.undo()
  if (ignore === 'ignore') return

  this.selection.save()
  this.history.push(this.elem.innerHTML)
  this.selection.restore()
}

// Used to push the initial state once focus has been achieved.
function onFocus () {

  if (!this.history.length) {

    // Wait until the caret has been placed to save state.
    setTimeout(function () {
      this.selection.save()
      this.history.push(this.elem.innerHTML)
      this.selection.restore()
    }.bind(this), 0)
  }
}

function History (Quill) {
  this.elem = Quill.elem
  this.emit = Quill.emit.bind(Quill)
  this.off = Quill.off.bind(Quill)
  this.selection = Quill.selection
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
  Quill.on('change', this.onChange)
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
  this.selection.restore()

  this.length -= 1

  // We pass 'ignore' as a parameter to prevent ourselves
  // from pushing the changes we just undid.
  this.emit('change', 'ignore')
}

History.prototype.redo = function () {
  if (!this.stack.length || this.stack.length === this.length) return

  this.elem.innerHTML = this.stack[this.length]
  this.selection.restore()

  this.length += 1

  this.emit('change', 'ignore')
}

History.prototype.destroy = function () {
  this.off('change', this.onChange)
  this.elem.removeEventListener('keydown', this.onKeydown)
  this.elem.removeEventListener('focus', this.onFocus)

  delete this.elem
  delete this.selection
  delete this.emit
  delete this.off
  delete this.stack

  return
}

// Plugin name:
History.plugin = 'history'

module.exports = History
