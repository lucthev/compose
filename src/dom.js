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

var blocks = ['ADDRESS', 'ASIDE', 'BLOCKQUOTE', 'FIGURE', 'FIGCAPTION',
      'FOOTER', 'H[1-6]', 'HEADER', 'OL', 'UL', 'LI', 'P', 'PRE'],
    blockRegex = new RegExp('^(' + blocks.join('|') + ')$')

/**
 * isBlock(elem) determines if an element is a block element
 * according to the above RegExp. Hardly comprehensive.
 *
 * @param {Node} elem
 * @return {Boolean}
 */
exports.isBlock = function (elem) {
  return exports.isElem(elem) && blockRegex.test(elem.nodeName)
}

var inlines = ['B', 'I', 'EM', 'STRONG', 'A', 'SUB', 'SUP', 'CODE', 'IMG'],
    inlineRegex = new RegExp('^(' + inlines.join('|') + ')$')

/**
 * isInline(elem) determines if an element is a block element
 * according to the above RegExp. Hardly comprehensive.
 *
 * @param {Node} elem
 * @return {Boolean}
 */
exports.isInline = function (elem) {
  return exports.isElem(elem) && inlineRegex.test(elem.nodeName)
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
 * @param {Node}
 * @return {Node}
 */
exports.after = function (node, after) {
  return node.parentNode.insertBefore(after, node.nextSibling)
}

/**
 * replace(node, other) replaces the node 'node' with the node 'other'.
 * Returns the replaced node ('node', in this case).
 *
 * @param {Node} node
 * @param {Node} after
 * @return {Node}
 */
exports.replace = function (node, other) {
  return node.parentNode.replaceChild(other, node)
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
