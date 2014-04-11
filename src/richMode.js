define([
  'commands/bold',
  'commands/italic',
  'commands/underline',
  'commands/heading',
  'commands/link',
  'commands/blockquote',
  'commands/insertHTML',
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

  /**
   * fixSelection() fixes Firefox's select all behaviour by placing
   * the caret within block elements, not outside.
   * It is a variable so that we can do a one-time bind to Quill upon
   * initialization, and not have to re-bind for every check.
   */
  var fixSelection = function () {
    var sel = window.getSelection(),
        marker,
        last

    // Dont place markers and whatnot if we dont have to; otherwise,
    // it can cause issues (https://github.com/lucthev/quill/issues/12)
    if (!sel.rangeCount || this.selection.getContaining()) return

    this.selection.placeMarkers()

    marker = this.elem.firstChild
    if (marker.classList.contains('Quill-marker')) {
      this.elem.removeChild(marker)

      this.elem.firstChild
        .insertBefore(marker, this.elem.firstChild.firstChild)
    }

    marker = this.elem.lastChild
    if (marker.classList.contains('Quill-marker')) {
      this.elem.removeChild(marker)

      last = this.elem.lastChild
      if (last.lastChild && last.lastChild.nodeName === 'BR')
        last.insertBefore(marker, last.lastChild)
      else last.appendChild(marker)
    }

    this.selection.selectMarkers()
  }

  function onKeyup () {

    // Check for FF selectAll behaviour:
    fixSelection()
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

    fixSelection = fixSelection.bind(Quill)
    // Store bound handlers for later removal.
    this.onKeydown = onKeydown.bind(Quill)
    this.onKeyup = onKeyup.bind(Quill)

    this.elem.addEventListener('keydown', this.onKeydown)
    this.elem.addEventListener('keyup', this.onKeyup)

    if (!this.elem.firstElementChild)
      appendParagraph(this.elem)

    Quill.sanitizer
      .addElements('p')
      .addFilter(function (params) {
        var node = params.node,
            i

        for (i = 0; i < node.childNodes.length; i += 1) {
          if (node.childNodes[i].nodeType === Node.TEXT_NODE)
            node.childNodes[i].nodeValue =
              node.childNodes[i].data.replace(/ /g, '\u00A0')
        }
      })
  }

  Rich.prototype.destroy = function() {
    this.elem.removeEventListener('keydown', this.onKeydown)
    this.elem.removeEventListener('keyup', this.onKeyup)

    delete this.elem

    return null
  }

  // Plugin name.
  Rich.plugin = 'rich'

  return Rich
})