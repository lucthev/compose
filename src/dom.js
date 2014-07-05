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
      'FOOTER', 'H[1-6]', 'HEADER', 'LI', 'P', 'PRE'],
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
