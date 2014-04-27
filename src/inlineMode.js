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
  /* jshint validthis:true */
  this.selection.save()

  this.sanitizer.clean(this.elem)

  // Append a <br> if need be.
  if (!this.elem.textContent)
    this.elem.appendChild(br())

  this.selection.restore()
}

function InlineMode (Quill) {

  this.elem = Quill.elem
  this.Quill = Quill

  // Store bound event handlers for later removal.
  this.onInput = onInput.bind(Quill)

  this.elem.addEventListener('keydown', onKeydown)
  Quill.on('input', this.onInput)

  // Remove all (presumably) unwanted elements by simulating input.
  this.onInput()
}

InlineMode.prototype.destroy = function () {
  this.elem.removeEventListener('keydown', onKeydown)
  this.Quill.off('input', this.onInput)

  delete this.Quill
  delete this.elem

  return null
}

InlineMode.plugin = 'inline'

module.exports = InlineMode
