/* global define, console, navigator */

define(function () {

  function modKey (e) {
    if (/^Mac/i.test(navigator.platform))
      return e.metaKey

    return e.ctrlKey
  }

  // Used to intercept Cmd/Ctrl-z.
  function onKeyDown (e) {
    if (e.keyCode === 90 && modKey(e)) {
      e.preventDefault()
      if (e.shiftKey) this.redo()
      else this.undo()
    }
  }

  function onChange () {
    this.Quill.selection.placeMarkers()
    this.push(this.elem.innerHTML)
    this.Quill.selection.removeMarkers()
  }

  function History (Quill) {
    this.elem = Quill.elem
    this.Quill = Quill
    this._debug = Quill._debug
    this.max = 100

    // Add initial state.
    this.stack.push(this.elem.innerHTML)
    this.length += 1

    this.elem.addEventListener('keydown', onKeyDown.bind(this))
    this.Quill.on('change', onChange.bind(this))
  }

  History.prototype.stack = []
  History.prototype.length = 0

  History.prototype.push = function (item) {
    this.stack.push(item)
    this.length += 1

    if (this.stack.length > this.max) {
      this.stack.shift()
      this.length -= 1
    }

    if (this._debug) console.log('History: pushed %s', item)
  }

  History.prototype.undo = function () {
    if (this.length <= 1) return

    var content = this.stack[this.length - 2]
    this.elem.innerHTML = content
    this.Quill.selection.selectMarkers()

    this.length -= 1
  }

  History.prototype.redo = function () {
    if (!this.stack.length || this.stack.length === this.length) return

    var content = this.stack[this.length]
    this.elem.innerHTML = content
    this.Quill.selection.selectMarkers()

    this.length += 1
  }

  History.prototype.destroy = function () {
    this.Quill.off('change', onChange)
    this.elem.removeEventListener('keydown', onKeyDown)

    delete this.elem
    delete this.Quill

    return
  }

  // Plugin name:
  History.plugin = 'history'

  return History
})