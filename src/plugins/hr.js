'use strict';

function onKeydown (e) {
  /* jshint validthis:true */
  var container = this.selection.getContaining(),
      sel = window.getSelection(),
      key = e.keyCode

  if (key === 13 && this.selection.isNewLine()) {

    if (container.previousElementSibling &&
        container.previousElementSibling.nodeName === 'P')
      this.hr.insertBefore(container)

  } else if (sel.rangeCount && (key === 8 || key === 46)) {

    if (key === 8 && this.selection.atStartOf(container) &&
      container.previousSibling && container.previousSibling.nodeName === 'HR') {

      e.preventDefault()

      container.parentNode.removeChild(container.previousSibling)

      this.emit('input')
    } else if (key === 46 && this.selection.atEndOf(container) &&
      container.nextSibling && container.nextSibling.nodeName === 'HR') {

      e.preventDefault()

      container.parentNode.removeChild(container.nextSibling)

      this.emit('input')
    }
  } else if (key >= 37 && key <= 40) {
    // Arrow key.

    setTimeout(function () {
      var container = this.selection.getContaining()

      if (container.nodeName === 'HR') {

        if (key === 37 || key === 38) {
          this.selection.placeCaret(container.previousSibling, true)
        } else {
          this.selection.placeCaret(container.nextSibling)
        }
      }
    }.bind(this), 0)
  }
}

// This handles the case where clicking on an <hr> place the caret
// on the <hr> (see https://github.com/lucthev/quill/issues/24).
function onClick () {
  /* jshint validthis:true */
  var container = this.selection.getContaining()

  // We just place the caret in whatever element comes after.
  if (container.nodeName === 'HR')
    this.selection.placeCaret(container.nextSibling)
}

function AutoHR (Quill) {

  // Store bound event handlers for later removal.
  this.onKeydown = onKeydown.bind(Quill)
  this.onClick = onClick.bind(Quill)

  this.elem = Quill.elem
  this.Quill = Quill
  this.elem.addEventListener('keydown', this.onKeydown)
  this.elem.addEventListener('click', this.onClick)

  Quill.sanitizer.addElements('hr')
}

AutoHR.prototype.insertBefore = function (elem) {
  var hr = document.createElement('hr')

  elem.parentNode.insertBefore(hr, elem)

  this.Quill.emit('input')
}

AutoHR.prototype.destroy = function () {
  this.elem.removeEventListener('keydown', this.onKeydown)
  this.elem.removeEventListener('click', this.onClick)

  this.Quill.sanitizer.removeElements('hr')

  delete this.Quill
  delete this.elem
}

AutoHR.plugin = 'hr'

module.exports = AutoHR
