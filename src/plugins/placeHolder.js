'use strict';

// The class given to the placeholder element for internal reasons
// and to allow it to be styled differently (e.g. a different color).
var PlaceHolderClass = 'Quill-placeholder'

function beforeInput (e) {
  var key = e.keyCode,
      holder,
      target

  /**
   * Pressing a key which doesn't produce input causes the placeholder
   * text to flicker; we do a quick check for the more common of those
   * keys. This is pretty ugly.
   * FIXME: use the input event or something similar, to avoid this
   * problem altogether.
   */
  if (key === 9 || (key > 15 && key < 21) || key === 91 || key === 93)
    return

  if (this.placeHolder.isActive()) {
    target = this.placeHolder.target()
    holder = target.querySelector('.' + PlaceHolderClass)
    holder.parentNode.removeChild(holder)
    this.selection.placeCaret(target)
  }

  // Wait for input, sanitization, etc. before putting the placeholder
  // back.
  this.setImmediate(this.placeHolder.set.bind(this.placeHolder))
}

function onMousedown (e) {
  if (this.isActive()) {
    e.preventDefault()
    this.elem.focus()
    this.selection.placeCaret(this.target().querySelector('.' + PlaceHolderClass))
  }
}

/**
 * makePlaceholder(value) creates a placeholder elements (a span, in
 * this case) with the given value.
 *
 * @param {String} value
 * @return {Element}
 */
function makePlaceholder (value) {
  var span = document.createElement('span')

  span.className = PlaceHolderClass
  span.textContent = '' + value

  return span
}

/**
 * The placeholder plugin. Its purpose is fairly self-explanatory.
 * Takes a placeholder value as a second parameter; this can be a string
 * (e.g. 'Write...'), an object ({ value: 'Write...' }), or the value
 * of the placeholder can be specified via a 'data-placeholder' attribute
 * on the editable element.
 *
 * @param {Quill} Quill
 * @param {String || Object} value
 */
function Placeholder (Quill, value) {
  var first

  // Maybe they passed in an options object instead of a string.
  if (typeof value === 'object')
    value = value.value

  // Check for a data-placeholder attribute.
  if (!value)
    value = Quill.elem.getAttribute('data-placeholder')

  // If there's still no value, there's nothing we can do; throw an error.
  if (!value) {
    throw new Error('Quill\'s placeHolder plugin requires a placeholder ' +
      'string as a second parameter.')
  }

  this.value = value + ''
  this.elem = Quill.elem
  this.selection = Quill.selection

  this.beforeInput = beforeInput.bind(Quill)
  this.onMousedown = onMousedown.bind(this)

  Quill.elem.addEventListener('keydown', this.beforeInput)

  // We have to listen to the paste event; right-click pasting, for
  // example, does not trigger key down.
  Quill.elem.addEventListener('paste', this.beforeInput)
  Quill.elem.addEventListener('mousedown', this.onMousedown)

  // We do a quick check to see if the current mode allows block elements.
  // We assume it allows block elements if its first child is an
  // element and that element is not a <br>.
  first = Quill.elem.firstChild
  this.block = Quill.node.isElem(first) && first.nodeName !== 'BR'

  // Add the placeholder immediately, if needed.
  this.set(document.activeElement !== Quill.elem)
}

/**
 * Placeholder.useBlock() determines if the mode Quill is using allows
 * block elements.
 *
 * @return {Boolean}
 */
Placeholder.prototype.useBlock = function () {
  return this.block
}

/**
 * Placeholder.target() returns the element to which the placeholder
 * element get appended to. If the mode allows block elements, this
 * will be the first child; otherwise, the element itself.
 *
 * @return {Element}
 */
Placeholder.prototype.target = function () {
  return this.useBlock() ? this.elem.firstChild : this.elem
}

/**
 * Placeholder.isActive() determines if the placholder is currently
 * visible.
 *
 * @return {Boolean}
 */
Placeholder.prototype.isActive = function () {
  var target = this.target()

  return target && target.querySelector('.' + PlaceHolderClass)
}

/**
 * Placeholder.set() shows the placeholder if need be. If 'dontFocus'
 * is true, does not manipulate the caret.
 *
 * @param {Boolean} dontFocus
 */
Placeholder.prototype.set = function (dontFocus) {
  var target = this.target(),
      required = true,
      holder

  if (this.useBlock())
    required = required && !target.nextSibling && !target.previousSibling

  if (required && !target.textContent) {
    holder = makePlaceholder(this.value)
    target.insertBefore(holder, target.firstChild)

    if (!dontFocus) {

      // We have explicitly give it Focus; otherwise, Firefox doesn't
      // allow us to place the cursor inside the element.
      this.elem.focus()
      this.selection.placeCaret(holder)
    }
  }
}

/**
 * Placeholder.destroy() removes event listners, delete reference to
 * elements, etc.
 */
Placeholder.prototype.destroy = function () {

  this.elem.removeEventListener('keydown', this.beforeInput)
  this.elem.removeEventListener('paste', this.beforeInput)
  this.elem.removeEventListener('mousedown', this.onMousedown)

  delete this.elem
  delete this.selection
}

// Mandatory plugin name.
Placeholder.plugin = 'placeHolder'

module.exports = Placeholder
