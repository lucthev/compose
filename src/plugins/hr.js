define(function () {

  function onKeydown (e) {
    var container = this.selection.getContaining(),
        sel = window.getSelection(),
        key = e.keyCode

    if (key === 13 && this.selection.isNewLine()) {

      if (container.previousElementSibling &&
          container.previousElementSibling.nodeName === 'P')
        this.hr.insertBefore(container)

    } else if (sel.rangeCount && (key === 8 || key === 46)) {

      if (key === 8 && this.selection.atStartOf(container) &&
        container.previousSibling && container.previousSibling.nodeName === 'HR') {

        e.preventDefault()

        container.parentNode.removeChild(container.previousSibling)

        if (!this.throttle.isTyping())
          this.emit('change')
      } else if (key === 46 && this.selection.atEndOf(container) &&
        container.nextSibling && container.nextSibling.nodeName === 'HR') {

        e.preventDefault()

        container.parentNode.removeChild(container.nextSibling)

        if (!this.throttle.isTyping())
          this.emit('change')
      }
    } else if (key >= 37 && key <= 40) {
      // Arrow key.

      setTimeout(function () {
        var container = this.selection.getContaining()

        if (container.nodeName === 'HR') {

          if (key === 37 || key === 38) {
            this.selection.placeCaret(container.previousSibling, true)
          } else {
            this.selection.placeCaret(container.nextSibling)
          }
        }
      }.bind(this), 0)
    }
  }

  // This handles the case where clicking on an <hr> place the caret
  // on the <hr> (see https://github.com/lucthev/quill/issues/24).
  function onClick () {
    var container = this.selection.getContaining()

    // We just place the caret in whatever element comes after.
    if (container.nodeName === 'HR')
      this.selection.placeCaret(container.nextSibling)
  }

  function autoHR (Quill) {

    // Store bound event handlers for later removal.
    this.onKeydown = onKeydown.bind(Quill)
    this.onClick = onClick.bind(Quill)

    this.elem = Quill.elem
    this.Quill = Quill
    this.elem.addEventListener('keydown', this.onKeydown)
    this.elem.addEventListener('click', this.onClick)

    Quill.sanitizer.addElements('hr')
  }

  autoHR.prototype.insertBefore = function (elem) {
    var hr = document.createElement('hr')

    elem.parentNode.insertBefore(hr, elem)

    if (!this.Quill.throttle.isTyping())
      this.Quill.emit('change')
  }

  autoHR.prototype.destroy = function () {
    this.elem.removeEventListener('keydown', this.onKeydown)
    this.elem.removeEventListener('click', this.onClick)

    delete this.Quill
    delete this.elem
  }

  autoHR.plugin = 'hr'

  return autoHR
})