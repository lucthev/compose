define([
  'commands/bold',
  'commands/italic',
  'commands/underline',
  'commands/heading',
  'commands/link',
  'commands/unlink'],
  function () {

  var formattingPlugins = Array.prototype.slice.call(arguments)

  /**
   * appendParagraph(elem) appends an empty paragraph to elem.
   *
   * @param {Element} elem
   */
  function appendParagraph (elem) {
    var p = document.createElement('p')

    p.appendChild(document.createElement('br'))
    elem.appendChild(p)
  }

  /**
   * toHTML(range) converts the contents of a range to HTML.
   *
   * @param {Range} range
   * @return String
   */
  function toHTML (range) {
    var div = document.createElement('div')
    div.appendChild(range.cloneContents())
    return div.innerHTML
  }

  /**
   * isAllSelected(elem, range) determines if the given ranges contains
   * all of elem.
   *
   * @param {Node} elem
   * @param {Range} range
   * @return Boolean
   */
  function isAllSelected (elem, range) {
    var allContent = document.createRange()
    allContent.selectNodeContents(elem)

    return toHTML(allContent) === toHTML(range)
  }

  function onKeydown (e) {
    var container = this.selection.getContaining(),
        newLine = this.selection.isNewLine(),
        sel = window.getSelection()

    // Prevent deletion of the first paragraph.
    if ((e.keyCode === 8 || e.keyCode === 46) && newLine &&
        container === this.elem.firstElementChild)
      return e.preventDefault()

    // Prevents FF bug where select all + delete escapes paragraph mode.
    if ((e.keyCode === 8 || e.keyCode === 46) && sel.rangeCount &&
        isAllSelected(this.elem, sel.getRangeAt(0))) {
      e.preventDefault()

      this.elem.innerHTML = '<p><em class="Quill-marker"></em><br></p>'
      this.selection.selectMarkers()

      // Make sure to save state.
      return this.trigger('change')
    }

    // Prevent newline creation when already on a new line.
    if (e.keyCode === 13 && newLine)
      return e.preventDefault()
  }

  function Rich (Quill) {
    if (Quill.isInline())
      throw new Error('Rich mode plugin should only be used in rich mode.')

    formattingPlugins.forEach(function (Plugin) {
      Quill.use(Plugin)
    })

    this.elem = Quill.elem

    // Store bound handlers for later removal.
    this.onKeydown = onKeydown.bind(Quill)

    this.elem.addEventListener('keydown', this.onKeydown)

    if (!this.elem.firstElementChild)
      appendParagraph(this.elem)
  }

  Rich.prototype.destroy = function() {
    this.elem.removeEventListener('keydown', this.onKeydown)

    delete this.elem

    return null
  }

  // Plugin name.
  Rich.plugin = 'rich'

  return Rich
})