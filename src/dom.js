'use strict';

var blocks = require('block-elements'),
    dom = exports

blocks = blocks.map(function (name) {
  return name.toUpperCase()
})

// For out purposes, <li>s should be considered block elements;
// otherwise, the sanitizer will wrap them in a <p>.
if (blocks.indexOf('LI') < 0)
  blocks.push('LI')

/**
 * isElement(node) determines if a object is an element.
 *
 * @param {Node} node
 * @return {Boolean}
 */
exports.isElement = function (node) {
  return node && node.nodeType === Node.ELEMENT_NODE
}

/**
 * isText(node) determines if an object is a text node.
 *
 * @param {Node} node
 * @return {Boolean}
 */
exports.isText = function (node) {
  return node && node.nodeType === Node.TEXT_NODE
}

/**
 * isBlock(elem) determines if an element is a block element
 * according to the above RegExp. Hardly comprehensive.
 *
 * @param {Node} elem
 * @return {Boolean}
 */
exports.isBlock = function (elem) {
  return !!(exports.isElement(elem) && blocks.indexOf(elem.nodeName) >= 0)
}

/**
 * remove(node) removes an element from its parent. Returns the same
 * node.
 *
 * @param {Node} node
 * @return {Node}
 */
exports.remove = function (node) {
  if (node.parentNode)
    node.parentNode.removeChild(node)

  return node
}

/**
 * after(node, after) inserts the node 'after' after the node 'node'.
 * Returns the inserted node.
 *
 * @param {Node} node
 * @param {Node} after
 * @return {Node}
 */
exports.after = function (node, after) {
  return node.parentNode.insertBefore(after, node.nextSibling)
}

/**
 * before(node, before) inserts the node 'before' before the node 'node'.
 * Returns the inserted node.
 *
 * @param {Node} node
 * @param {Node} before
 * @return {Node}
 */
exports.before = function (node, before) {
  return node.parentNode.insertBefore(before, node)
}

/**
 * replace(node, other) replaces the node 'node' with the node 'other'.
 * Returns the replaced node ('node', in this case).
 *
 * @param {Node} node
 * @param {Node} other
 * @return {Node}
 */
exports.replace = function (node, other) {
  return node.parentNode.replaceChild(other, node)
}

/**
 * prepend(child, parent) is like parent.appendChild(child), but the
 * child will become the parent’s firstChild. Returns the appended
 * child.
 *
 * @param {Node} child
 * @param {Node} parent
 * @return {Node}
 */
exports.prepend = function (child, parent) {
  return parent.insertBefore(child, parent.firstChild)
}

/**
 * create(tag) is a thin wrapper around document.createElement().
 *
 * @param {String} tag
 * @return {Element}
 */
exports.create = function (tag) {
  return document.createElement(tag)
}

/**
 * splitAt(node, until) splits a DOM tree at the given node up until
 * the node matching ‘until.’ ‘until’ can be either a string (nodeName)
 * or an actual element.
 *
 * @param {Node} node
 * @param {String || Element} until
 * @return {Element}
 */
exports.splitAt = function (node, until) {
  var parent = node.parentNode,
      nextParent

  until = until || 'SECTION'
  if (typeof until === 'string')
    until = until.toUpperCase()

  while (parent && parent !== until && parent.nodeName !== until) {
    if (node === parent.lastChild) {
      node = parent
      parent = node.parentNode
      continue
    }

    nextParent = parent.cloneNode(false)
    while (node.nextSibling)
      nextParent.appendChild(dom.remove(node.nextSibling))

    dom.after(parent, nextParent)

    node = parent
    parent = node.parentNode
  }

  return node
}
