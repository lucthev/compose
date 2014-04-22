define(function () {

  function onKeydown (e) {
    if (e.keyCode === 13)
      e.preventDefault()
  }

  function Inline (Quill) {
    var children,
        i

    this.elem = Quill.elem
    this.elem.addEventListener('keydown', onKeydown)

    // Remove all (presumably) unwanted elements.
    if (this.elem.children.length) {
      children = this.elem.children
      for (i = 0; i < children.length; i += 1)
        this.elem.removeChild(children[i])
    }

    // Insert initial <br>
    if (!this.textContent)
      this.elem.appendChild(document.createElement('br'))
  }

  Inline.prototype.destroy = function () {
    this.elem.removeEventListener('keydown', onKeydown)

    delete this.elem

    return null
  }

  Inline.plugin = 'inline'

  return Inline
})