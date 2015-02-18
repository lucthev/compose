'use strict';

var dom = require('./dom')

/**
 * insert(View, delta) inserts a paragraph. Note that when the delta’s
 * index is the start of a section, the paragraph will be inserted,
 * visually, before the section start. As a consequence, it is
 * impossible to insert a paragraph at index 0.
 *
 * @param {View} View
 * @param {Delta} delta
 */
exports.insert = function (View, delta) {
  var inserted = delta.paragraph,
      index = delta.index,
      adjacent,
      handler,
      len,
      i

  handler = View.handlerForParagraph(inserted.type)
  inserted = handler.deserialize(inserted)
  adjacent = ancestorsAsArray(View.elements[index - 1])

  len = Math.min(adjacent.length, inserted.length) - 1
  for (i = 0; i < len; i += 1) {
    if (adjacent[i].nodeName !== inserted[i].nodeName)
      break
  }

  // If, for example, a P is being inserted between two LIs, we have
  // to split the containing OL/UL.
  if (adjacent[i + 1])
    dom.splitAt(adjacent[i + 1], adjacent[i - 1])

  dom.after(adjacent[i], joinElements(inserted.slice(i)))
  View.elements.splice(index, 0, inserted[inserted.length - 1])

  if (View.isSectionStart(index) || index === View.elements.length - 1)
    return

  adjacent = ancestorsAsArray(View.elements[index + 1])

  // TODO(luc): factor out into a separate function?
  len = Math.min(adjacent.length, inserted.length - 1)
  for (i = 0; i < len; i += 1) {
    if (adjacent[i].nodeName !== inserted[i].nodeName)
      break

    while (adjacent[i].lastChild)
      dom.after(inserted[i + 1], dom.remove(adjacent[i].lastChild))

    dom.remove(adjacent[i])
  }
}

/**
 * update(View, delta) updates a paragraph. Any valid paragraph can be
 * updated.
 *
 * @param {View} View
 * @param {Delta} delta
 */
exports.update = function (View, delta) {
  var updated = delta.paragraph,
      index = delta.index,
      adjacent,
      current,
      handler,
      len,
      i

  handler = View.handlerForParagraph(updated.type)
  updated = handler.deserialize(updated)
  current = ancestorsAsArray(View.elements[index])

  len = Math.min(updated.length, current.length) - 1
  for (i = 0; i < len; i += 1) {
    if (current[i].nodeName !== updated[i].nodeName)
      break
  }

  if (current[i + 1]) {
    dom.splitAt(current[i + 1], current[i - 1])

    if (current[i + 1].previousSibling)
      dom.splitAt(current[i + 1].previousSibling, current[i - 1])
  }

  dom.replace(current[i], updated[i])
  View.elements[index] = updated[updated.length - 1]

  if (!View.isSectionStart(index)) {
    adjacent = ancestorsAsArray(View.elements[index - 1])
    current = ancestorsAsArray(View.elements[index])

    len = Math.min(adjacent.length, current.length) - 1
    for (i = 0; i < len; i += 1) {
      if (current[i].nodeName !== adjacent[i].nodeName)
        break

      while (current[i].lastChild)
        dom.after(adjacent[i + 1], dom.remove(current[i].lastChild))

      dom.remove(current[i])
    }
  }

  if (!View.isSectionStart(index + 1) && View.elements[index + 1]) {
    current = ancestorsAsArray(View.elements[index])
    adjacent = ancestorsAsArray(View.elements[index + 1])

    len = Math.min(adjacent.length, current.length) - 1
    for (i = 0; i < len; i += 1) {
      if (current[i].nodeName !== adjacent[i].nodeName)
        break

      while (adjacent[i].lastChild)
        dom.after(current[i + 1], dom.remove(adjacent[i].lastChild))

      dom.remove(adjacent[i])
    }
  }
}

/**
 * remove(View, delta) removes a paragraph from the DOM.
 *
 * @param {View} View,
 * @param {Delta} delta
 */
exports.remove = function (View, delta) {
  var index = delta.index,
      adjacent,
      current,
      len,
      i

  current = View.elements[index]

  // If a hierarchy of nodes contains only the paragraph to be removed,
  // remove the entire hierarchy (e.g. removing the only LI in an OL
  // also removes the OL). Note that this will never apply to SECTIONs,
  // as they always have an HR in addition to any paragraphs.
  while (!current.previousSibling && !current.nextSibling)
    current = current.parentNode

  dom.remove(current)
  View.elements.splice(index, 1)

  // FIXME(luc): isSectionStart(...) checks the View’s representation
  // of sections and paragraphs, which, when it comes time to update
  // the DOM, is “ahead”. As such, isSectionStart may return incorrect,
  // or at least misleading, results. Does this matter?
  if (View.isSectionStart(index) || !View.elements[index])
    return

  adjacent = ancestorsAsArray(View.elements[index - 1])
  current = ancestorsAsArray(View.elements[index])

  len = Math.min(current.length, adjacent.length) - 1
  for (i = 0; i < len; i += 1) {
    if (current[i].nodeName !== adjacent[i].nodeName)
      break

    while (current[i].lastChild)
      dom.after(adjacent[i + 1], dom.remove(current[i].lastChild))

    dom.remove(current[i])
  }
}

/**
 * ancestorsAsArray(element) gets the ancestors of the given array,
 * up to the first SECTION, and returns them as an array in descending
 * (“highest” ancestor first) order.
 *
 * @param {Element} element
 * @return {Array}
 */
function ancestorsAsArray (element) {
  var ancestors = [element]

  while (element.parentNode && element.parentNode.nodeName !== 'SECTION') {
    element = element.parentNode
    ancestors.unshift(element)
  }

  return ancestors
}

/**
 * joinElements(elements) takes an array of DOM elements and returns
 * those elements appended to each other, with the first element as
 * topmost parent and last element as “lowest” child.
 *
 * @param {Array} elements
 * @return {Element}
 */
function joinElements (elements) {
  var root = elements[0],
      i = 1

  while (elements[i])
    elements[i - 1].appendChild(elements[i])

  return root
}
