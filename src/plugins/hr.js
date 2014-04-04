define(function () {

  function onKeydown (e) {
    var container = this.selection.getContaining(),
        sel = window.getSelection(),
        content,
        range

    if (e.keyCode === 13 && this.selection.isNewLine()) {

      if (container.previousElementSibling &&
          container.previousElementSibling.nodeName !== 'HR')
        this.hr.insertBefore(container)

    } else if (sel.rangeCount && (e.keyCode === 8 || e.keyCode === 46)) {
      // We manually check if a horizontal rule is about to get deleted;
      // Firefox doesn't handle this very well.

      range = sel.getRangeAt(0).cloneRange()
      range.setEndAfter(container)
      content = range.cloneContents()

      if (e.keyCode === 46 && !content.firstChild.textContent &&
          container.nextSibling && container.nextSibling.nodeName === 'HR') {
        e.preventDefault()
        container.parentNode.removeChild(container.nextSibling)

        if (!this.throttle.isTyping())
          this.trigger('change')

        return
      }

      range = sel.getRangeAt(0).cloneRange()
      range.setStartBefore(container)
      content = range.cloneContents()

      if (e.keyCode === 8 && !content.firstChild.textContent &&
          container.previousSibling && container.previousSibling.nodeName === 'HR') {
        e.preventDefault()
        container.parentNode.removeChild(container.previousSibling)

        if (!this.throttle.isTyping())
          this.trigger('change')
      }
    }
  }

  function autoHR (Quill) {
    this.onKeydown = onKeydown.bind(Quill)

    this.elem = Quill.elem
    this.Quill = Quill
    this.elem.addEventListener('keydown', this.onKeydown)
  }

  autoHR.prototype.insertBefore = function (elem) {
    var hr = document.createElement('hr')

    hr.contentEditable = false
    elem.parentNode.insertBefore(hr, elem)

    if (!this.Quill.throttle.isTyping())
      this.Quill.trigger('change')
  }

  autoHR.prototype.destroy = function () {
    this.elem.removeEventListener('keydown', this.onKeydown)

    delete this.Quill
    delete this.elem
  }

  autoHR.plugin = 'hr'

  return autoHR
})