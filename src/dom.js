'use strict'

var dom = exports
var blocks = require('block-elements').map(function (name) {
  return name.toUpperCase()
})

// This list of block elements represent visual blocks, not actual
// block elements; as such, it should include LIs and IMGs.
;['LI', 'IMG'].forEach(function (name) {
  if (blocks.indexOf(name) < 0) {
    blocks.push(name)
  }
})

exports._blockElements = blocks

/**
 * isElement(node) determines if a object is an element.
 *
 * @param {Node} node
 * @return {Boolean}
 */
exports.isElement = function (node) {
  return node && node.nodeType === window.Node.ELEMENT_NODE
}

/**
 * isText(node) determines if an object is a text node.
 *
 * @param {Node} node
 * @return {Boolean}
 */
exports.isText = function (node) {
  return node && node.nodeType === window.Node.TEXT_NODE
}

/**
 * isBlock(elem) determines if an element is a block element.
 *
 * @param {Node} elem
 * @return {Boolean}
 */
exports.isBlock = function (elem) {
  return !!(dom.isElement(elem) && blocks.indexOf(elem.nodeName) >= 0)
}

/**
 * remove(node) removes an element from its parent. Returns the same
 * node.
 *
 * @param {Node} node
 * @return {Node}
 */
exports.remove = function (node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node)
  }

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
 * create(tag) is a thin wrapper around document.createElement().
 *
 * @param {String} tag
 * @return {Element}
 */
exports.create = function (tag) {
  return document.createElement(tag)
}

/**
 * ancestor(child [, name]) returns the ancestor of the given child
 * whose nodeName matches ‘name.’ If no name is given, returns the
 * immediate ancestor of the child. In either case, returns null if
 * an appropriate ancestor cannot be found.
 *
 * @param {Node} child
 * @param {String} name
 * @return {Element}
 */
exports.ancestor = function (child, name) {
  var parent = child.parentNode

  if (!name) {
    return parent
  }

  while (parent && parent.nodeName !== name) {
    parent = parent.parentNode
  }

  return parent
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
  var parent = node.parentNode
  var nextParent

  until = until || 'SECTION'
  if (typeof until === 'string') {
    until = until.toUpperCase()
  }

  while (parent && parent !== until && parent.nodeName !== until) {
    if (node === parent.lastChild) {
      node = parent
      parent = node.parentNode
      continue
    }

    nextParent = parent.cloneNode(false)
    while (node.nextSibling) {
      nextParent.appendChild(dom.remove(node.nextSibling))
    }

    dom.after(parent, nextParent)

    node = parent
    parent = node.parentNode
  }

  return node
}

/**
 * ancestorsAsArray(element) gets the ancestors of the given array,
 * up to the first SECTION, and returns them as an array in descending
 * (“highest” ancestor first) order.
 *
 * @param {Element} element
 * @return {Array}
 */
var ancestorsAsArray =
exports._ancestorsAsArray = function (element) {
  var ancestors = [element]

  while (element.parentNode && element.parentNode.nodeName !== 'SECTION') {
    element = element.parentNode
    ancestors.unshift(element)
  }

  return ancestors
}

/**
 * _joinElements(elements) takes an array of DOM elements and returns
 * those elements appended to each other, with the first element as
 * topmost parent and last element as “lowest” child.
 *
 * @param {Array} elements
 * @return {Element}
 */
exports._joinElements = function (elements) {
  var root = elements[0]
  var i = 1

  while (elements[i]) {
    elements[i - 1].appendChild(elements[i])
    i += 1
  }

  return root
}

/**
 * _merge(before, after) combines the similar ancestors of two
 * adjacent paragraphs.
 *
 * @param {Element} before
 * @param {Element} after
 */
exports._merge = function (before, after) {
  before = ancestorsAsArray(before)
  after = ancestorsAsArray(after)

  if (before[0] === after[0]) {
    return
  }

  var len = Math.min(before.length, after.length) - 1
  for (var i = 0; i < len; i += 1) {
    if (before[i].nodeName !== after[i].nodeName) {
      break
    }

    while (after[i].lastChild) {
      dom.after(before[i + 1], dom.remove(after[i].lastChild))
    }

    dom.remove(after[i])
  }
}
