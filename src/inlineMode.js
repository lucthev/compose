'use strict';

// Creates a <br>.
function br () {
  return document.createElement('br')
}

function onKeydown (e) {
  if (e.keyCode === 13)
    e.preventDefault()
}

function onInput () {
  var first

  this.selection.save()

  this.sanitizer.clean(this.elem)

  // Remove all whitespace at the beginning of the element.
  first = this.elem.firstChild
  while (this.node.isText(first) && !first.data) {
    this.elem.removeChild(first)

    first = this.elem.firstChild
  }

  // Append a <br> if need be.
  if (!this.elem.textContent)
    this.elem.appendChild(br())

  this.selection.restore()
}

/**
 * insertSpaces() is a Sanitizer filter which inserts spaces between
 * elements; this is so that, when pasting, "<p>One</p><p>Two</p>"" gets
 * turned into "One Two", not "OneTwo".
 *
 * @param {Element} elem
 */
function insertSpaces (elem) {
  var text

  if (!this.selection.isMarker(elem) && elem.parentNode === this.elem &&
      elem.previousSibling) {
    text = document.createTextNode(' ')
    this.elem.insertBefore(text, elem)
  }
}

function InlineMode (Quill) {

  this.elem = Quill.elem
  this.off = Quill.off.bind(Quill)

  // Store bound event handlers for later removal.
  this.onInput = onInput.bind(Quill)
  this.insertSpaces = insertSpaces.bind(Quill)

  this.elem.addEventListener('keydown', onKeydown)
  Quill.on('input', this.onInput)

  Quill.sanitizer.addFilter(this.insertSpaces)

  // Remove all (presumably) unwanted elements present on initialization
  // by simulating input.
  this.onInput()
}

InlineMode.prototype.destroy = function () {
  this.elem.removeEventListener('keydown', onKeydown)
  this.off('input', this.onInput)

  delete this.off
  delete this.elem

  return null
}

InlineMode.plugin = 'inline'

module.exports = InlineMode
