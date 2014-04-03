define([
  'commands/bold',
  'commands/italic',
  'commands/underline',
  'commands/heading',
  'commands/link',
  'commands/unlink',
  'plugins/hr'],
  function () {

  var formattingPlugins = Array.prototype.slice.call(arguments)

  /**
   * appendParagraph(elem) appends an empty paragraph to elem. If no
   * element is given, returns the paragraph.
   *
   * @param {Element} elem
   * @return Element
   */
  function appendParagraph (elem) {
    var p = document.createElement('p')

    p.appendChild(document.createElement('br'))

    if (elem)
      elem.appendChild(p)
    else return p
  }

  function onKeydown (e) {
    var container = this.selection.getContaining(),
        newLine = this.selection.isNewLine(),
        sel = window.getSelection(),
        paragraph,
        content,
        range

    // Prevent deletion of the first paragraph.
    if ((e.keyCode === 8 || e.keyCode === 46) && newLine &&
        container === this.elem.firstElementChild)
      return e.preventDefault()

    // Prevent newline creation when already on a new line.
    if (e.keyCode === 13 && newLine)
      return e.preventDefault()

    // Pressing enter after a heading creates divs, not paragraphs. We
    // override this behaviour.
    if (e.keyCode === 13 && sel.isCollapsed &&
        /^H[1-6]$/i.test(container.nodeName)) {
      range = sel.getRangeAt(0).cloneRange()
      range.setEndAfter(container, 0)

      content = range.cloneContents()

      if (content.firstChild.textContent === '') {
        e.preventDefault()

        paragraph = appendParagraph()
        container.parentNode
          .insertBefore(paragraph, container.nextElementSibling)

        this.selection.placeCaret(paragraph)

        if (!this.throttle.isTyping())
          this.trigger('change')
      }
    }
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