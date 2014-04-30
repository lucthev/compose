'use strict';

/**
 * A collection of node and element-related utilities.
 */
function NodePlugin (Quill) {
  this.elem = Quill.elem
}

/**
 * Node.elem(node) determines if a node is an element.
 *
 * @param {Node} node
 * @return {Boolean}
 */
NodePlugin.prototype.isElem = function (node) {
  return node && node.nodeType === Node.ELEMENT_NODE
}

/**
 * Node.text(node) determines if a node is a text node.
 *
 * @param {Node} node
 * @return {Boolean}
 */
NodePlugin.prototype.isText = function (node) {
  return node && node.nodeType === Node.TEXT_NODE
}

var blocks = ['address', 'article', 'aside', 'blockquote', 'figure',
  'figcaption', 'footer', 'h[1-6]', 'header', 'hr', 'ol', 'ul', 'p',
  'pre', 'section'],
    blockRegex = new RegExp('^(' + blocks.join('|') + ')$', 'i')

/**
 * Node.isBlock(elem) determines if an element is a block element
 * according to the above RegExp.
 *
 * @param {Node} elem
 * @return {Boolean}
 */
NodePlugin.prototype.isBlock = function (elem) {
  return this.isElem(elem) && blockRegex.test(elem.nodeName)
}

var inlines = ['b', 'i', 'em', 'strong', 'a', 'sub', 'sup'],
    inlineRegex = new RegExp('^(' + inlines.join('|') + ')$', 'i')

/**
 * Node.isInline(elem) determines if an element is a block element
 * according to the above RegExp.
 *
 * @param {Node} elem
 * @return {Boolean}
 */
NodePlugin.prototype.isInline = function (elem) {
  return this.isElem(elem) && inlineRegex.test(elem.nodeName)
}

/**
 * Node.getContaining() gets the immediate child of the editor element
 * that contains the given node.
 *
 * @param {Node} node
 * @return {Element || false}
 */
NodePlugin.prototype.getContaining = function (node) {

  while (node && node !== this.elem) {
    if (node.parentNode === this.elem)
      return node
    else node = node.parentNode
  }

  return false
}

/**
 * Node.childOf(matcher) tests if the selection is a child of
 * a node with name matching the provided regular expression. If
 * so, returns the matched node; else, returns false.
 *
 * @param {RegExp} matcher
 * @param {Node} elem
 * @return {Node || false}
 */
NodePlugin.prototype.childOf = function (node, tagName) {

  // If tagName is a string, we'll assume they want to match only
  // that tag name.
  if (typeof tagName === 'string')
    tagName = new RegExp('^' + tagName + '$', 'i')

  while (node && node !== this.elem) {
    if (node.nodeName.match(tagName))
      return node
    else node = node.parentNode
  }

  return false
}

/**
 * Node.areSimilar(elem1, elem2) determines if two elements are similar.
 * Two elements are said to be similar if they have the same tagName and
 * the same attributes.
 *
 * @param {Element} elem1
 * @param {Element} elem2
 * @return Boolean
 */
NodePlugin.prototype.areSimilar = function (elem1, elem2) {
  var similar = true

  if (!(this.isElem(elem1) && this.isElem(elem2) &&
      elem1.nodeName === elem2.nodeName))
    return false

  Array.prototype.forEach.call(elem1.attributes, function (attr) {
    similar = similar && elem2.hasAttribute(attr.name) &&
      elem1.getAttribute(attr.name) === elem2.getAttribute(attr.name)
  })

  return similar
}

NodePlugin.prototype.destroy = function () {
  delete this.elem
}

NodePlugin.plugin = 'node'

module.exports = NodePlugin
