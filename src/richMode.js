/* global define, document */

define(function () {

  function onKeydown () {

  }

  function Rich (Quill) {
    if (Quill.isInline())
      throw new Error('Rich mode plugin should only be used in rich mode.')

    this.elem = Quill.elem
    this.elem.addEventListener('keydown', onKeydown)

    if (!this.elem.firstElementChild) {
      var p = document.createElement('p')
      p.appendChild(document.createElement('br'))
      this.elem.appendChild(p)
    }
  }

  Rich.prototype.destroy = function() {
    this.elem.removeEventListener('keydown', onKeydown)

    delete this.elem

    return null
  }

  Rich.plugin = 'rich'

  return Rich
})