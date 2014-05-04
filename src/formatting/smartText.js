'use strict';

/**
 * isWordChar(char) determines if the given character is a word
 * character. For our purposes, that's anything that's not whitespace
 * or a bracket of any sort.
 *
 * @param {String} char
 * @return {Boolean}
 */
function isWordChar (char) {
  return /[^\s()\{\}\[\]]/.test(char)
}

/**
 * getAdjacentChar(node) gets the character adjacent to the given node.
 * If after is true, returns the character after the node; otherwise, the
 * character before (e.g. <em>One</em>Two : getAdjacentChar(Two) would
 * return 'e'). Uses a TreeWalker with 'elem' as the root.
 *
 * @param {Element} elem
 * @param {Text} node
 * @param {Boolean} after
 * @return {String}
 */
function getAdjacentChar (elem, node, after) {
  var walker = document.createTreeWalker(elem, NodeFilter.SHOW_TEXT),
      text = walker.firstChild()

  while (text && text !== node)
    text = walker.nextSibling()

  if (after) {
    text = walker.nextSibling()
    return text && text.data ? text.data[0] : ''
  }

  text = walker.previousSibling()
  return text && text.data ? text.data[text.data.length - 1] : ''
}

function getPrevious (root, node, index) {
  if (!index) return getAdjacentChar(root, node)

  return node.data[index - 1]
}

function getNext (root, node, index) {
  if (index === node.data.length - 1)
    return getAdjacentChar(root, node, true)

  return node.data[index + 1]
}

function replaceQuotes (root, textNode, open, close) {
  return function (match, index) {
    var before,
        after

    before = getPrevious(root, textNode, index) || ''
    after = getNext(root, textNode, index) || ''

    // The second condition allows closing in the following:
    // "(Stuff)" -> “(Stuff)”
    if (isWordChar(before) ||
        (before && !/\s/.test(before) && (/\s/.test(after) || !after))) {
      return close
    }

    return open
  }
}

/**
 * primes() replaces digits followed by quotation marks with primes
 * (e.g. 4'11" -> 4′11″)
 */
function replacePrimes (root, textNode) {
  return function (match, digit, quotmark, offset) {
    var prime = quotmark === '\'' ? '′' : '″',
        digitBefore

    digit = digit || ''
    if (!digit && !offset) {
      digitBefore = getAdjacentChar(root, textNode)
      digitBefore = /\d/.test(digitBefore)
    }

    if (digit || digitBefore) return digit + prime
    else return match
  }
}

/**
 * The Sanitizer text formatter which applies the various transformations
 * to the text.
 *
 * @param {Text} node
 */
function formatter (textNode) {
  var container = this.getContaining(textNode)

  if (/^[OU]L$/.test(container.nodeName))
    container = this.childOf(textNode, 'li')

  // Only “smarten” quotes and whatnot when not in a code block. We
  // don’t, however, transform curly quotes in code blocks into dumb ones.
  if (!this.childOf(textNode, 'pre') && !this.childOf(textNode, 'code')) {

    textNode.data = textNode.data
      .replace(/(\d)?(['"])/g, replacePrimes(container, textNode))
      .replace(/'/g, replaceQuotes(container, textNode, '‘', '’'))
      .replace(/"/g, replaceQuotes(container, textNode, '“', '”'))
  }
}

function SmartText (Quill) {
  this.sanitizer = Quill.sanitizer

  this.formatter = formatter.bind(Quill.node)

  this.sanitizer.addTextFormatter(this.formatter)
}

SmartText.prototype.destroy = function () {
  this.sanitizer.removeTextFormatter(this.formatter)

  delete this.formatter
  delete this.sanitizer
}

// The mandatory plugin name.
SmartText.plugin = 'smartText'

module.exports = SmartText
