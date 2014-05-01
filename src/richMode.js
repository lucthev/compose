'use strict';

var wrapInline = require('./formatting/wrapInline')

var formattingPlugins = [
  require('./commands/bold'),
  require('./commands/italic'),
  require('./commands/underline'),
  require('./commands/heading'),
  require('./commands/link'),
  require('./commands/blockquote'),
  require('./plugins/list'),
  require('./plugins/hr')
]

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
 * the caret within block elements, not outside. Although this does
 * not prevent escaping of paragraph mode, it does allow for the
 * formatting of multiple blocks (e.g. <p> -> <h2>).
 */
function fixSelection () {
  var sel = window.getSelection(),
      marker,
      last

  // Dont place markers and whatnot if we dont have to; otherwise,
  // it can cause issues (https://github.com/lucthev/quill/issues/12)
  if (!sel.rangeCount || this.selection.getContaining()) return

  this.selection.save()

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

  this.selection.restore()
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

  this.selection.save()
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

  // Prevent newline creation when already on a new line.
  if (e.keyCode === 13 && newLine)
    return e.preventDefault()

  // Pressing enter after an <h[1-6]> or <blockquote> creates divs or
  // blockquotes, not paragraphs. We override this behaviour.
  // TODO: Ideally, this would be in the plugins themselves.
  if (e.keyCode === 13 && sel.isCollapsed &&
      /^H[1-6]|BLOCKQUOTE$/i.test(container.nodeName)) {

    if (this.selection.at('end', container)) {
      e.preventDefault()

      paragraph = appendParagraph()
      container.parentNode
        .insertBefore(paragraph, container.nextElementSibling)

      this.selection.placeCaret(paragraph)

      this.emit('input')
    }
  }
}

function onInput () {

  // Give other event listeners a chance to finish before sanitizing.
  setTimeout(function () {
    this.selection.save()

    this.sanitizer.clean(this.elem)

    this.selection.restore()
  }.bind(this), 0)
}

/**
 * mergeSimilar() is a Sanitizer filter that merges similar elements
 * (e.g. two adjacent <em>s).
 *
 * @param {Element} elem
 */
function mergeSimilar (elem) {
  var prev = elem.previousSibling

  // If the previous element is a marker, we ignore it.
  if (this.selection.isMarker(prev))
    prev = prev.previousSibling

  // If they are similar and inline, we merge them.
  if (this.node.isInline(elem) && this.node.isInline(prev) &&
      this.node.areSimilar(prev, elem)) {

    // We do, however, want to keep a potential marker's place.
    if (this.selection.isMarker(elem.previousSibling)) {
      elem.insertBefore(
        elem.parentNode.removeChild(elem.previousSibling),
        elem.firstChild
      )
    }

    while (prev.lastChild) {
      elem.insertBefore(
        prev.removeChild(prev.lastChild),
        elem.firstChild
      )
    }

    elem.parentNode.removeChild(prev)
  }
}

function afterClean (elem) {

  if (elem === this.elem)
    wrapInline.call(this.node, elem)
}

/**
 * The Rich mode constructor.
 *
 * @param {Quill} Quill
 */
function RichMode (Quill) {

  formattingPlugins.forEach(function (Plugin) {
    Quill.use(Plugin)
  })

  this.elem = Quill.elem
  this.Quill = Quill

  // Store bound handlers for later removal.
  this.onFocus = onFocus.bind(Quill)
  this.onKeydown = onKeydown.bind(Quill)
  this.onKeyup = fixSelection.bind(Quill)
  this.mergeSimilar = mergeSimilar.bind(Quill)

  this.elem.addEventListener('keydown', this.onKeydown)
  this.elem.addEventListener('keyup', this.onKeyup)
  this.elem.addEventListener('focus', this.onFocus)

  if (!this.elem.firstElementChild)
    appendParagraph(this.elem)

  Quill.sanitizer
    .addElements(['p', 'br'])
    .addFilter(this.mergeSimilar)

  this.onInput = onInput.bind(Quill)
  this.afterClean = afterClean.bind(Quill)
  Quill.on('input', this.onInput)
  Quill.on('afterclean', this.afterClean)
}

/**
 * RichMode.destroy() removes event listeners, deletes references
 * to elements, etc.
 *
 * @return null
 */
RichMode.prototype.destroy = function () {
  this.elem.removeEventListener('keydown', this.onKeydown)
  this.elem.removeEventListener('keyup', this.onKeyup)
  this.elem.removeEventListener('focus', this.onFocus)

  this.Quill.sanitizer
    .removeElements(['p', 'br'])
    .removeFilter(this.mergeSimilar)

  this.Quill.off('input', this.onInput)
  this.Quill.off('afterclean', this.afterclean)

  delete this.Quill
  delete this.elem

  return null
}

// Plugin name.
RichMode.plugin = 'rich'

module.exports = RichMode
