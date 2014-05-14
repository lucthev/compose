/**
 * A sanitizer filter that turns inline styles to elements. For example,
 * <em style="font-weight: bold;">Word</em> gets turned into
 * <em><strong>Word</strong></em>
 *
 * This is done to ensure psting from other sources renders correctly,
 * and also to fix at least one bug
 * (see https://github.com/lucthev/quill/issues/39)
 *
 * Currently applied transformations:
 *   font-weight: bold -> <strong>
 *   font-style: italic|oblique -> <em>
 */
'use strict';

/**
 * wrapContents(inner, outer) wraps the contents of outer with the
 * element 'inner'.
 *
 * @param {String} inner
 * @param {Element} outer
 */
function wrapContents (inner, outer) {
  var elems = Array.prototype.slice.call(outer.querySelectorAll(inner)),
      tagName = inner.split(',')[0],
      parent

  // Remove all elements of the same type that we're about to wrap with.
  elems.forEach(function (elem) {
    parent = elem.parentNode

    while (elem.firstChild) {
      parent.insertBefore(
        elem.removeChild(elem.firstChild),
        elem
      )
    }

    parent.removeChild(elem)
  })

  inner = document.createElement(tagName)

  while (outer.firstChild)
    inner.appendChild(outer.removeChild(outer.firstChild))

  outer.appendChild(inner)
}

// The Sanitizer filter.
function styleToElement (elem) {

  // NOTE: we're relying on the sanitizer to strip the style attribute.
  // If anyone decides to allow style attributes, this will mess everything
  // up for them.

  if (elem.style.fontWeight === 'bold')
    wrapContents('strong, b', elem)

  if (/(?:italic|oblique)/.test(elem.style.fontStyle))
    wrapContents('em, i', elem)
}

module.exports = styleToElement
