define(function () {

  function onKeydown (e) {
    var container = this.selection.getContaining(),
        sel = window.getSelection()

    if (e.keyCode === 13 && this.selection.isNewLine()) {

      if (container.previousElementSibling &&
          container.previousElementSibling.nodeName === 'P')
        this.hr.insertBefore(container)

    } else if (sel.rangeCount && (e.keyCode === 8 || e.keyCode === 46)) {

      if (e.keyCode === 8 && this.selection.atStartOf(container) &&
        container.previousSibling && container.previousSibling.nodeName === 'HR') {

        e.preventDefault()

        container.parentNode.removeChild(container.previousSibling)

        if (!this.throttle.isTyping())
          this.emit('change')
      } else if (e.keyCode === 46 && this.selection.atEndOf(container) &&
        container.nextSibling && container.nextSibling.nodeName === 'HR') {

        e.preventDefault()

        container.parentNode.removeChild(container.nextSibling)

        if (!this.throttle.isTyping())
          this.emit('change')
      }
    }
  }

  function onKeyup (e) {
    var container = this.selection.getContaining()

    if (container.nodeName === 'HR') {

      if (e.keyCode === 37 || e.keyCode === 38) {
        this.selection.placeCaret(container.previousSibling, true)
      } else {
        this.selection.placeCaret(container.nextSibling)
      }
    }
  }

  function autoHR (Quill) {

    // Store bound event handlers for later removal.
    this.onKeydown = onKeydown.bind(Quill)
    this.onKeyup = onKeyup.bind(Quill)

    this.elem = Quill.elem
    this.Quill = Quill
    this.elem.addEventListener('keydown', this.onKeydown)
    this.elem.addEventListener('keyup', this.onKeyup)

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
    this.elem.removeEventListener('keyup', this.onKeyup)

    delete this.Quill
    delete this.elem
  }

  autoHR.plugin = 'hr'

  return autoHR
})