'use strict';

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

var blocks = {
  ADDRESS: 1,
  ASIDE: 1,
  BLOCKQUOTE: 1,
  DIV: 1,
  FIGCAPTION: 1,
  FIGURE: 1,
  FOOTER: 1,
  H1: 1,
  H2: 1,
  H3: 1,
  H4: 1,
  H5: 1,
  H6: 1,
  HEADER: 1,
  HR: 1,
  LI: 1,
  OL: 1,
  P: 1,
  PRE: 1,
  SECTION: 1,
  UL: 1
}

/**
 * isBlock(elem) determines if an element is a block element
 * according to the above RegExp. Hardly comprehensive.
 *
 * @param {Node} elem
 * @return {Boolean}
 */
exports.isBlock = function (elem) {
  return !!(exports.isElem(elem) && blocks[elem.nodeName])
}

var inlines = {
  A: 1,
  ABBR: 1,
  B: 1,
  BIG: 1,
  CITE: 1,
  CODE: 1,
  EM: 1,
  I: 1,
  IMG: 1,
  Q: 1,
  SAMP: 1,
  SMALL: 1,
  STRONG: 1,
  SUB: 1,
  SUP: 1
}

/**
 * isInline(elem) determines if an element is an inline element
 * according to the above RegExp. Hardly comprehensive.
 *
 * @param {Node} elem
 * @return {Boolean}
 */
exports.isInline = function (elem) {
  return !!(exports.isElem(elem) && inlines[elem.nodeName])
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
