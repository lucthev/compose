'use strict';

var blocks = require('block-elements')

blocks = blocks.map(function (name) {
  return name.toUpperCase()
})

// For out purposes, <li>s should be considered block elements;
// otherwise, the sanitizer will wrap them in a <p>.
if (blocks.indexOf('LI') < 0)
  blocks.push('LI')

/**
 * isElem(node) determines if a object is an element.
 *
 * @param {Node} node
 * @return {Boolean}
 */
exports.isElem = function (node) {
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
  return !!(exports.isElem(elem) && blocks.indexOf(elem.nodeName) >= 0)
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
 * split(child) splits a node’s parent in two at child (child stays
 * in the first one). Returns the original parent. Example:
 *
 * <ul><li>…</li><li id="second">…</li><li>…</li></ul>
 *
 * ul.split(second) results in:
 *
 * <ul><li>…</li><li id="second">…</li></ul>
 * <ul><li>…</li></ul>
 *
 * @param {Node} child
 * @return {Node}
 */
exports.split = function (node) {
  var parent = node.parentNode,
      nextParent

  if (node === parent.lastChild)
    return parent

  nextParent = parent.cloneNode(false)
  while (node.nextSibling)
    nextParent.appendChild(exports.remove(node.nextSibling))

  exports.after(parent, nextParent)

  return parent
}
