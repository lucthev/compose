'use strict';

module.exports = Sanitizer

var collapseWhitespace = require('collapse-whitespace'),
    dom = require('./dom')

/**
 * The Sanitizer plugin provides a function to turn arbitrary HTML into
 * paragraph and section objects that Compose can consume.
 *
 * @param {Compose} Compose
 */
function Sanitizer (Compose) {
  var View = Compose.require('view')

  /**
   * sanitize(html) sanitizes a string of HTML according to the currently
   * supported elements. Returns an object containing the extracted
   * paragraph and section objects.
   *
   * @param {String} html
   * @return {Object}
   */
  function sanitize (html) {
    var sandbox = dom.create('div'),
        paragraphs = [],
        sections = [],
        handler,
        result,
        node

    html = html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')

    sandbox.innerHTML = html
    collapseWhitespace(sandbox)

    // Make all block elements “bubble up” to their nearest block parent;
    // this is to fix weird markup like <b><p>...</p>></b>
    toArray(sandbox.querySelectorAll(dom.blockElements.join()))
      .forEach(bubbleUp)

    node = sandbox.firstChild
    while (node) {
      if (!dom.isText(node) && !dom.isElement(node)) {
        node = nextSibling(node)
        continue
      }

      if (!dom.isBlock(node))
        node = wrapInParagraph(node, dom)

      handler = View.handlerForElement(node.nodeName)

      if (!handler) {
        node = firstChild(node)
        continue
      }

      result = handler.serialize(node)

      if (node.nodeName === 'SECTION' || node.nodeName === 'HR') {
        result.start = paragraphs.length
        sections.push(result)
      } else if (Array.isArray(result)) {
        result = result.map(splitAtNewlines)
        paragraphs = [].concat.apply(paragraphs, result)
      } else if (result) {
        paragraphs = paragraphs.concat(splitAtNewlines(result))
      }

      if (node.nodeName === 'SECTION')
        node = firstChild(node)
      else
        node = nextSibling(node)
    }

    paragraphs.forEach(function (p) {
      if (!p.text)
        p.text = '\n'
    })

    // Remove sections starting at the same index, or an invalid index.
    // The former can happen when, for example, the first child of a
    // SECTION is an HR; the latter can happen when an HR is the very
    // last element in the sanitized HTML.
    sections = sections.filter(function (section, index, arr) {
      if (section.start >= paragraphs.length)
        return false

      return !(index > 0 && arr[index - 1].start === section.start)
    })

    return {
      paragraphs: paragraphs,
      sections: sections
    }
  }

  Compose.provide('sanitizer', sanitize)
}

/**
 * nextSibling(node) returns the next sibling of the node in document
 * order.
 *
 * @param {Node} node
 * @return {Node}
 */
function nextSibling (node) {
  while (node) {
    if (node.nextSibling)
      return node.nextSibling

    node = node.parentNode
  }

  return node
}

/**
 * firstChild(node) returns the first child of the given node, or, if
 * the given node has no children, its next sibling in document order.
 *
 * @param {Node} node
 * @return {Node}
 */
function firstChild (node) {
  return node.firstChild ? node.firstChild : nextSibling(node)
}

/**
 * wrapInParagraph(node, dom) wraps the given node, and all subsequent
 * non-block siblings, in a P element. Uses the DOM utilities in 'dom'.
 * Returns the create paragraph.
 *
 * @param {Node} node
 * @param {Object} dom
 * @return {Element}
 */
function wrapInParagraph (node, dom) {
  var p = dom.create('p'),
      next

  dom.replace(node, p)
  p.appendChild(node)

  while (next = p.nextSibling) {
    if (dom.isBlock(next))
      break

    p.appendChild(dom.remove(next))
  }

  return p
}

/**
 * bubbleUp(node) “bubbles up” a block element through the DOM so that
 * it has only block ancestors.
 *
 * @param {Element} node
 */
function bubbleUp (node) {
  var children

  while (node.parentNode) {
    while (!dom.isBlock(node.parentNode)) {
      children = toArray(node.parentNode.childNodes)
      propagateMarkup(children, unwrap(node.parentNode))
    }

    node = node.parentNode
  }
}

/**
 * unwrap(elem) removes a node from the DOM while keeping its children.
 * Returns the element being removed.
 *
 * @param {Element} elem
 * @return {Element}
 */
function unwrap (elem) {
  while (elem.lastChild)
    dom.after(elem, dom.remove(elem.lastChild))

  return dom.remove(elem)
}

function toArray (thing) {
  return [].slice.call(thing)
}

/**
 * propagateMarkup(children, markup) takes the inline element “markup”
 * and applies it recursively to the given child nodes.
 *
 * @param {Array} children
 * @param {Element} markup
 */
function propagateMarkup (children, markup) {
  var clone,
      i

  if (!children.length)
    return

  for (i = 0; i < children.length; i += 1) {
    if (dom.isBlock(children[i])) {
      propagateMarkup(toArray(children[i].childNodes), markup)
      continue
    }

    clone = markup.cloneNode(false)
    dom.before(children[i], clone)

    clone.appendChild(dom.remove(children[i]))
    while (children[i + 1] && !dom.isBlock(children[i + 1])) {
      clone.appendChild(dom.remove(children[i + 1]))
      i += 1
    }
  }
}

/**
 * splitAtNewlines(paragraph) splits the given paragraph at double
 * newlines. Returns an array containing all the split paragraphs.
 *
 * @param {Serialize} paragraph
 * @return {Array}
 */
function splitAtNewlines (paragraph) {
  var split = [],
      substr,
      i

  for (i = 0; i < paragraph.length - 2; i += 1) {
    if (paragraph.text[i] !== '\n' || paragraph.text[i + 1] !== '\n')
      continue

    substr = paragraph.substr(0, i)
    if (!substr.text)
      substr.text = '\n'

    split.push(substr)
    paragraph = paragraph.substr(i + 2)
    i = 0
  }

  split.push(paragraph)
  return split
}
