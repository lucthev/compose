'use strict';

/**
 * allMatches(str, regexp) gets all matches of a regular expression
 * in a string. This is so that when using multiple-character regexes,
 * adjacent matches will all get picked up.
 * Adapted from http://stackoverflow.com/a/18029592
 *
 * @param {String}
 * @param {RegExp}
 * @return {Array}
 */
function allMatches (str, regexp) {
  var matches = [],
      match

  while (match = regexp.exec(str)) { // jshint ignore:line
    matches.push(match)
    regexp.lastIndex = match.index + 1
  }

  return matches
}

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

function replaceQuotes (root, textNode, open, close) {
  return function (match, prev, next) {
    var before,
        after

    prev = prev || ''
    next = next || ''

    before = prev || getAdjacentChar(root, textNode)
    after = next || getAdjacentChar(root, textNode, after)

    if (isWordChar(before)) return prev + close + next

    return prev + open + next
  }
}

/**
 * primes() replaces digits followed by quotation marks with primes
 * (e.g. 4'11" -> 4′11″)
 */
function replacePrimes (root, textNode) {
  return function (match, digit, quotmark, offset) {
    var prime = /['‘’]/.test(quotmark) ? '′' : '″',
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
function formatter (node) {

  // Only “smarten” quotes when not in a code block. We don’t, however,
  // transform curly quotes in code blocks into dumb ones.
  if (!this.childOf(node, 'pre') && !this.childOf(node, 'code')) {

    node.data = node.data
      .replace(/([\s\S])?['‘’]([\s\S])?/g, replaceQuotes(this.elem, node, '‘', '’'))
      .replace(/([\s\S])?["“”]([\s\S])?/g, replaceQuotes(this.elem, node, '“', '”'))
      .replace(/(\d)?(['‘’"“”])/g, replacePrimes(this.elem, node))
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
