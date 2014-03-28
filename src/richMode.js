/* global define, document, window */

define(function () {

  /**
   * appendParagraph(elem, focus) appends an empty paragraph to elem
   * and optionally gives it focus.
   *
   * @param {Element} elem
   * @param {Boolean} focus
   */
  function appendParagraph (elem, focus) {
    var p = document.createElement('p'),
        range,
        sel

    p.appendChild(document.createElement('br'))
    elem.appendChild(p)

    if (focus) {
      sel = window.getSelection()
      range = document.createRange()
      range.setStart(p, 0)
      range.setEnd(p, 0)
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }

  function onKeydown (e) {
    var container = this.selection.getContaining(),
        newLine = this.selection.isNewLine()

    // Prevent deletion of the first paragraph.
    if ((e.keyCode === 8 || e.keyCode === 46) && newLine &&
        container === this.elem.firstElementChild)
      return e.preventDefault()

    // Prevent newline creation when already on a new line.
    if (e.keyCode === 13 && newLine)
      return e.preventDefault()
  }

  function onKeyup () {
    var container = this.selection.getContaining()

    // If we're not within a paragraph for whatever reason, create one.
    if (!container)
      appendParagraph(this.elem, true)
  }

  function Rich (Quill) {
    if (Quill.isInline())
      throw new Error('Rich mode plugin should only be used in rich mode.')

    this.elem = Quill.elem

    // Store bound handlers for later removal.
    this.onKeyup = onKeyup.bind(Quill)
    this.onKeydown = onKeydown.bind(Quill)

    this.elem.addEventListener('keyup', this.onKeyup)
    this.elem.addEventListener('keydown', this.onKeydown)

    if (!this.elem.firstElementChild)
      appendParagraph(this.elem)
  }

  Rich.prototype.destroy = function() {
    this.elem.removeEventListener('keydown', this.onKeyup)
    this.elem.removeEventListener('keydown', this.onKeydown)

    delete this.elem

    return null
  }

  // Plugin name.
  Rich.plugin = 'rich'

  return Rich
})