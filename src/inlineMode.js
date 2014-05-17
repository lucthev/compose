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

  this.selection.save()

  this.sanitizer.clean(this.elem)

  this.selection.restore()
}

function afterClean () {
  var first

  // Remove all whitespace at the beginning of the element.
  // FIXME: doesn't really work.
  first = this.elem.firstChild
  while (this.node.isText(first) && !first.data.trim()) {
    this.elem.removeChild(first)

    first = this.elem.firstChild
  }

  // Append a <br> if need be.
  if (!this.elem.textContent)
    this.elem.appendChild(br())
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

function InlineMode (Compose) {

  this.elem = Compose.elem
  this.off = Compose.off.bind(Compose)

  // Store bound event handlers for later removal.
  this.onInput = onInput.bind(Compose)
  this.afterClean = afterClean.bind(Compose)
  this.insertSpaces = insertSpaces.bind(Compose)

  this.elem.addEventListener('keydown', onKeydown)
  Compose.on('input', this.onInput)
  Compose.on('afterclean', this.afterClean)

  Compose.sanitizer.addFilter(this.insertSpaces)

  // Remove all (presumably) unwanted elements present on initialization
  // by simulating input.
  this.onInput()
}

InlineMode.prototype.destroy = function () {
  this.elem.removeEventListener('keydown', onKeydown)
  this.off('input', this.onInput)
  this.off('afterclean', this.afterClean)

  delete this.off
  delete this.elem

  return null
}

InlineMode.plugin = 'inline'

module.exports = InlineMode
