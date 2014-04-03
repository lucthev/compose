define(function () {

  function onKeydown (e) {
    var container = this.selection.getContaining()

    if (e.keyCode === 13 && this.selection.isNewLine()) {

      if (container.previousElementSibling &&
          container.previousElementSibling.nodeName !== 'HR')
        this.hr.insertBefore(container)
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