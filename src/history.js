<<<<<<< HEAD
/* global define, console, navigator, clearTimeout, setTimeout */
=======
/* global define, console, navigator */
>>>>>>> plugins

define(function () {

  function modKey (e) {
    if (/^Mac/i.test(navigator.platform))
      return e.metaKey

    return e.ctrlKey
  }

<<<<<<< HEAD
  function scheduleSave () {
    var history = this

    if (history.scheduled)
      clearTimeout(history.scheduled)

    // Force a state save every so often.
    if (!history.forced)
      history.forced = setTimeout(function () {

        // Don't save twice.
        clearTimeout(history.scheduled)
        history.forced = null
        history.push(history.elem.innerHTML)
      }, 320)

    // Schedule a state save once the user finishes typing.
    history.scheduled = setTimeout(function () {

      history.forced = clearTimeout(history.forced)
      history.push(history.elem.innerHTML)
    }, 150)
  }

  function onKeyUp (e) {
=======
  // Used to intercept Cmd/Ctrl-z.
  function onKeyDown (e) {
>>>>>>> plugins
    if (e.keyCode === 90 && modKey(e)) {
      e.preventDefault()
      if (e.shiftKey) this.redo()
      else this.undo()
    }
  }

<<<<<<< HEAD
  function History (Venti) {
    this.elem = Venti.elem
=======
  function onChange () {
    this.Venti.selection.placeMarkers()
    this.push(this.elem.innerHTML)
    this.Venti.selection.removeMarkers()
  }

  function History (Venti) {
    this.elem = Venti.elem
    this.Venti = Venti
>>>>>>> plugins
    this._debug = Venti._debug
    this.max = 100

    // Add initial state.
    this.stack.push(this.elem.innerHTML)
    this.length += 1

<<<<<<< HEAD
    this.elem.addEventListener('input', scheduleSave.bind(this))
    this.elem.addEventListener('keydown', onKeyUp.bind(this))
=======
    this.elem.addEventListener('keydown', onKeyDown.bind(this))
    this.Venti.on('change', onChange.bind(this))
>>>>>>> plugins
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
<<<<<<< HEAD
=======
    this.Venti.selection.selectMarkers()
>>>>>>> plugins

    this.length -= 1
  }

  History.prototype.redo = function () {
    if (!this.stack.length || this.stack.length === this.length) return

    var content = this.stack[this.length]
    this.elem.innerHTML = content
<<<<<<< HEAD
=======
    this.Venti.selection.selectMarkers()
>>>>>>> plugins

    this.length += 1
  }

  History.prototype.destroy = function () {
<<<<<<< HEAD
    this.elem.removeEventListener('input', scheduleSave)
    this.elem.removeEventListener('keydown', onKeyUp)

    delete this.elem
=======
    this.Venti.off('change', onChange)
    this.elem.removeEventListener('keydown', onKeyDown)

    delete this.elem
    delete this.Venti
>>>>>>> plugins

    return
  }

  // Plugin name:
<<<<<<< HEAD
  History.name = 'history'
=======
  History.plugin = 'history'
>>>>>>> plugins

  return History
})