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

    } else if (sel.rangeCount && (e.keyCode === 8 || e.keyCode === 46 ||
        e.keyCode === 37 || e.keyCode === 39)) {
      // We manually check if a horizontal rule is about to get deleted;
      // Firefox doesn't handle this very well.
      // We also check for keyboard navigation; Chrome doesn't handle
      // that very well.

      range = sel.getRangeAt(0).cloneRange()
      range.setEndAfter(container)
      content = range.cloneContents()

      if ((e.keyCode === 46 || e.keyCode === 39) &&
          !content.firstChild.textContent && container.nextSibling &&
          container.nextSibling.nodeName === 'HR') {

        e.preventDefault()

        if (e.keyCode === 39) {

          // We place the caret at the beginning of the next block element.
          this.selection.placeCaret(container.nextSibling.nextSibling)
        } else {
          container.parentNode.removeChild(container.nextSibling)

          if (!this.throttle.isTyping())
            this.trigger('change')
        }

        return
      }

      range = sel.getRangeAt(0).cloneRange()
      range.setStartBefore(container)
      content = range.cloneContents()

      if ((e.keyCode === 8 || e.keyCode === 37) &&
          !content.firstChild.textContent && container.previousSibling &&
          container.previousSibling.nodeName === 'HR') {

        e.preventDefault()

        if (e.keyCode === 37) {

          // Place caret at end of previous block.
          this.selection
            .placeCaret(container.previousSibling.previousSibling, true)
        } else {
          container.parentNode.removeChild(container.previousSibling)

          if (!this.throttle.isTyping())
            this.trigger('change')
        }
      }
    }
  }

  function autoHR (Quill) {
    this.onKeydown = onKeydown.bind(Quill)

    this.elem = Quill.elem
    this.Quill = Quill
    this.elem.addEventListener('keydown', this.onKeydown)

    Quill.sanitizer
      .addElements('hr')
      .addAttributes({
        hr: ['contenteditable']
      })
      .addFilter(function (params) {
        var node = params.node,
            name = params.node_name,
            hr

        if (name === 'hr') {
          hr = node.cloneNode()
          hr.contentEditable = false

          return { node: hr }
        } else return null
      })
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