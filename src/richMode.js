define([
  'observer',
  'formatting/wrapInline',
  'commands/bold',
  'commands/italic',
  'commands/underline',
  'commands/heading',
  'commands/link',
  'commands/blockquote',
  'plugins/list',
  'plugins/hr'],
  function (makeObserver, wrapInline) {

  var formattingPlugins = Array.prototype.slice.call(arguments, 2)

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
   */
  function fixSelection () {
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

  /**
   * onFocus() fixes an issue where the caret is placed outside all
   * block element in Firefox when focusing the element.
   */
  function onFocus () {
    var sel = window.getSelection(),
        outside,
        node

    if (!sel.rangeCount) return

    this.selection.placeMarkers()
    outside = this.elem.firstChild.classList.contains('Quill-marker')
    this.selection.removeMarkers()

    if (!outside) return

    node = this.elem.firstChild
    if (this.elem.textContent.trim()) {
      while (node.firstChild)
        node = node.firstChild
    }

    this.selection.placeCaret(node)
  }

  function onKeydown (e) {
    var container = this.selection.getContaining(),
        newLine = this.selection.isNewLine(),
        sel = window.getSelection(),
        paragraph

    // Prevent deletion of the first paragraph.
    if ((e.keyCode === 8 || e.keyCode === 46) && newLine &&
        container === this.elem.firstElementChild)
      return e.preventDefault()

    // Prevent newline creation when already on a new line.
    if (e.keyCode === 13 && newLine)
      return e.preventDefault()

    // Pressing enter after an <h*> or <blockquote> creates divs or
    // blockquotes, not paragraphs. We override this behaviour.
    // TODO: Ideally, this would be in the plugins themselves.
    if (e.keyCode === 13 && sel.isCollapsed &&
        /^H[1-6]|BLOCKQUOTE$/i.test(container.nodeName)) {

      if (this.selection.atEndOf(container)) {
        e.preventDefault()

        paragraph = appendParagraph()
        container.parentNode
          .insertBefore(paragraph, container.nextElementSibling)

        this.selection.placeCaret(paragraph)

        this.emit('input')
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
    this.onFocus = onFocus.bind(Quill)
    this.onKeydown = onKeydown.bind(Quill)
    this.onKeyup = fixSelection.bind(Quill)

    this.elem.addEventListener('keydown', this.onKeydown)
    this.elem.addEventListener('keyup', this.onKeyup)
    this.elem.addEventListener('focus', this.onFocus)

    if (!this.elem.firstElementChild)
      appendParagraph(this.elem)

    Quill.sanitizer.addElements(['p', 'br'])

    this.observer = makeObserver(Quill)

    Quill.on('domChange', function () {
      var cleaned

      Quill.selection.placeMarkers()

      cleaned = Quill.sanitizer.clean(Quill.elem)
      wrapInline(cleaned)

      while (Quill.elem.firstChild)
        Quill.elem.removeChild(Quill.elem.firstChild)

      Quill.elem.appendChild(cleaned)

      Quill.selection.selectMarkers()
    })
  }

  Rich.prototype.destroy = function () {
    this.elem.removeEventListener('keydown', this.onKeydown)
    this.elem.removeEventListener('keyup', this.onKeyup)
    this.elem.removeEventListener('focus', this.onFocus)

    this.observer.disconnect()

    delete this.elem

    return null
  }

  // Plugin name.
  Rich.plugin = 'rich'

  return Rich
})