'use strict';

// Event listener. Decides when to insert <hr>s.
function onKeydown (e) {
  var container = this.selection.getContaining(),
      sel = window.getSelection(),
      key = e.keyCode

  if (key === 13 && this.selection.isNewLine()) {

    if (container.previousElementSibling &&
        container.previousElementSibling.nodeName === 'P')
      this.hr.insertBefore(container)

  } else if (sel.rangeCount && (key === 8 || key === 46)) {

    if (key === 8 && this.selection.at('start', container) &&
      container.previousSibling && container.previousSibling.nodeName === 'HR') {

      e.preventDefault()

      container.parentNode.removeChild(container.previousSibling)

      this.emit('input')
    } else if (key === 46 && this.selection.at('end', container) &&
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
// on the <hr> (see https://github.com/lucthev/compose/issues/24).
function onClick () {
  var container = this.selection.getContaining()

  // We just place the caret in whatever element comes after.
  if (container.nodeName === 'HR')
    this.selection.placeCaret(container.nextSibling)
}

function AutoHR (Compose) {

  this.elem = Compose.elem
  this.sanitizer = Compose.sanitizer
  this.emit = Compose.emit.bind(Compose)

  // Store bound event handlers for later removal.
  this.onKeydown = onKeydown.bind(Compose)
  this.onClick = onClick.bind(Compose)

  Compose.elem.addEventListener('keydown', this.onKeydown)
  Compose.elem.addEventListener('click', this.onClick)

  Compose.sanitizer.addElements('hr')
}

/**
 * hr.insertBefore(elem) inserts an <hr> before the given element.
 * Will only insert <hr>s if 'elem' is a direct child of the
 * editable element.
 *
 * @param {Element}
 */
AutoHR.prototype.insertBefore = function (elem) {
  var hr = document.createElement('hr'),
      parent = elem.parentNode

  if (parent !== this.elem)
    throw new Error('HRs should only be inserted before top-level elements.')

  parent.insertBefore(hr, elem)

  this.emit('input')
}

AutoHR.prototype.destroy = function () {
  this.elem.removeEventListener('keydown', this.onKeydown)
  this.elem.removeEventListener('click', this.onClick)

  this.sanitizer.removeElements('hr')

  delete this.sanitizer
  delete this.elem
}

AutoHR.plugin = 'hr'

module.exports = AutoHR
