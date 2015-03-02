'use strict';

module.exports = Sanitizer

var collapseWhitespace = require('collapse-whitespace')

/**
 * The Sanitizer plugin provides a function to turn arbitrary HTML into
 * paragraph and section objects that Compose can consume.
 *
 * @param {Compose} Compose
 */
function Sanitizer (Compose) {
  var View = Compose.require('view'),
      dom = Compose.require('dom')

  /**
   * sanitize(html) sanitizes a string of HTML according to the currently
   * supported elements. Returns an object containing the extracted
   * paragraph and section objects.
   *
   * @param {String} html
   * @return {Object}
   */
  function sanitize (html) {
    var container = dom.create('div'),
        paragraphs = [],
        sections = [],
        handler,
        result,
        name,
        node,
        i

    container.innerHTML = html
    Array.prototype.forEach.call(
      container.querySelectorAll('script,style'),
      dom.remove
    )

    collapseWhitespace(container)

    node = firstChild(container)
    while (node) {
      if (!dom.isText(node) && !dom.isElement(node)) {
        node = nextSibling(node)
        continue
      }

      if (!dom.isBlock(node))
        wrapInParagraph(node, dom)

      name = node.nodeName
      handler = View.handlerForElement(node.nodeName)

      if (!handler) {
        node = unwrap(node, dom)
        continue
      }

      result = handler.serialize(node)

      if (name === 'SECTION' || name === 'HR') {
        result.start = paragraphs.length
        sections.push(result)
      } else if (Array.isArray(result)) {

        for (i = 0; i < result.length; i += 1)
          paragraphs = paragraphs.concat(splitAtNewlines(result[i]))

      } else if (result) {
        paragraphs = paragraphs.concat(splitAtNewlines(result))
      }

      node = nextSibling(node)
    }

    // Remove sections starting at the same index, or an invalid index.
    // The former can happen when, for example, the first child of a
    // SECTION is an HR; the latter can happen when an HR is the very
    // last element in the sanitized HTML.
    for (i = 0; i < sections.length; i += 1) {
      if (sections[i].start >= paragraphs.length) {
        sections = sections.slice(0, i - 1)
        break
      }

      if (sections[i - 1] && sections[i - 1].start === sections[i].start)
        sections.splice(i - 1, 1)
    }

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
 * unwrap(node, dom) replaces an element with its children. Returns the
 * ex-first child of the node, or, if none exist, the next node in document
 * order.
 *
 * @param {Node} node
 * @param {Object} dom
 * @return {Node}
 */
function unwrap (node, dom) {
  var next

  while (node.lastChild)
    dom.after(node, dom.remove(node.lastChild))

  next = nextSibling(node)
  dom.remove(node)
  return next
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
