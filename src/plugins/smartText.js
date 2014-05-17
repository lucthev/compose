'use strict';

/**
 * isWordChar(char) determines if the given character is a word
 * character. For our purposes, anything that’s not whitespace or an
 * open bracket of any sort.
 *
 * @param {String} char
 * @return {Boolean}
 */
function isWordChar (char) {
  return /[^\s(\{\[]/.test(char)
}

/**
 * getAdjacentChar(node) gets the character before the given node.
 * Uses a TreeWalker with 'elem' as the root.
 *
 * @param {Element} elem
 * @param {Text} node
 * @return {String}
 */
function getAdjacentChar (elem, node) {
  var walker = document.createTreeWalker(elem, NodeFilter.SHOW_TEXT),
      text = walker.firstChild()

  while (text && text !== node)
    text = walker.nextSibling()

  text = walker.previousSibling()
  return text && text.data ? text.data[text.data.length - 1] : ''
}

/**
 * getPrevious(root, node, index) gets the character before the given
 * index in the given text node. If that's not possible, uses the given
 * element as a frame of reference for determining the character that
 * comes before the given text node.
 *
 * @param {Element} root
 * @param {Text} node
 * @param {Number >= 0} index
 * @return {String}
 */
function getPrevious (root, node, index) {
  if (!index) return getAdjacentChar(root, node)

  return node.data[index - 1]
}

/**
 * replaceQuotes(...) replaces straight quotes wiht curly ones.
 *
 * @return {Function}
 */
function replaceQuotes (root, textNode, open, close) {
  return function (match, index) {
    var before

    before = getPrevious(root, textNode, index) || ''

    if (isWordChar(before)) return close

    return open
  }
}

/**
 * replacePrimes(...) replaces digits followed by straight quotes with
 * primes (e.g. 4'11" -> 4′11″)
 *
 * @return {Function}
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

      // We don’t bother with complicated look-behinds with ellipses.
      .replace(/\.\.\./g, '…')
  }
}

function SmartText (Compose) {
  this.sanitizer = Compose.sanitizer

  this.formatter = formatter.bind(Compose.node)

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
