/* global define, console, navigator, setTimeout */

define(function () {

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

    this.Quill.selection.placeMarkers()
    this.push(this.elem.innerHTML)
    this.Quill.selection.removeMarkers()
  }

  // Used to push the initial state once focus has been achieved.
  function onFocus () {
    var self = this

    // Wait until the caret has been placed.
    setTimeout(function () {
      self.Quill.selection.placeMarkers()
      self.push(self.elem.innerHTML)
      self.Quill.selection.removeMarkers()
    }, 0)

    this.elem.removeEventListener('focus', this.onFocus)
  }

  function History (Quill) {
    this.elem = Quill.elem
    this.Quill = Quill
    this._debug = Quill._debug
    this.max = 100

    // Bound functions are being used as event listeners; they are
    // kept here so we can remove them upon destroying.
    this.onFocus = onFocus.bind(this)
    this.onKeydown = onKeydown.bind(this)
    this.onChange = onChange.bind(this)

    this.elem.addEventListener('focus', this.onFocus)
    this.elem.addEventListener('keydown', this.onKeydown)
    this.Quill.on('change', this.onChange)
  }

  // Previous states are stored here.
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

    // We pass 'ignore' as a parameter to prevent ourselves
    // from pushing the changes we just undid.
    this.Quill.trigger('change', ['ignore'])
  }

  History.prototype.redo = function () {
    if (!this.stack.length || this.stack.length === this.length) return

    var content = this.stack[this.length]
    this.elem.innerHTML = content
    this.Quill.selection.selectMarkers()

    this.length += 1

    this.Quill.trigger('change', ['ignore'])
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

  return History
})