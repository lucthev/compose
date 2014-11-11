'use strict';

var collapseWhitespace = require('collapse-whitespace')

function nextSibling (node) {
  while (node) {
    if (node.nextSibling)
      return node.nextSibling

    node = node.parentNode
  }

  return node
}

function firstChild (node) {
  return node.firstChild ? node.firstChild : nextSibling(node)
}

function Sanitize (Compose) {
  var debug = Compose.require('debug')('compose:sanitizer'),
      types = Compose.require('serialize').types,
      Converter = Compose.require('converter'),
      dom = Compose.require('dom'),
      nbsp = '\u00A0',
      simpleText

  // Smart text things.
  simpleText = /(?:\.\.\.|<3|:\)|:\(|[\-–—]>|'|")/g
  function replacer (paragraph) {
    return function (match, index, string) {
      var before = string[index - 1],
          end = index + match.length,
          markup,
          i

      for (i = 0; i < paragraph.markups.length; i += 1) {
        markup = paragraph.markups[i]

        if (markup.type < types.code) continue
        if (markup.type > types.code) break

        // If the matched simple text overlaps a <code> markup, do nothing.
        if (index >= markup.start && index < markup.end ||
            end > markup.start && end <= markup.end)
          return match
      }

      switch (match) {
        case '...':
          return '…'
        case '<3':
          return '❤'
        case ':)':
          return '☺'
        case ':(':
          return '☹'
        case '->': // Regular dash
        case '\u2013>': // En dash
        case '\u2014>': // Em dash
          return '→'
        case '\'':
          if (!before || /[\s\(\[\{]/.test(before))
            return '‘'
          if (/\d/.test(before))
            return '′'

          return '’'
        case '"':
          if (!before || /[\s\(\[\{]/.test(before))
            return '“'
          if (/\d/.test(before))
            return '″'

          return '”'
        default:
          return match
      }
    }
  }

  /**
   * Sanitize(html) takes a string of html as its only parameter and
   * returns an object with two properties, paragraphs and sections,
   * arrays representing the paragraphs and sections, respectively,
   * that could be extracted from the html.
   *
   * @param {String} html
   * @return {Object}
   */
  function sanitize (html) {
    var container = dom.create('div'),
        forEach = Array.prototype.forEach,
        paragraphs = [],
        sections = [],
        paragraph,
        section,
        elem,
        next,
        name,
        node,
        obj,
        i

    debug('Sanitizing %s', html)
    container.innerHTML = html

    forEach.call(container.querySelectorAll('script'), dom.remove)
    forEach.call(container.querySelectorAll('style'), dom.remove)

    collapseWhitespace(container)

    node = firstChild(container)
    while (node) {
      if (!dom.isText(node) && !dom.isElem(node)) {
        next = nextSibling(node)
        dom.remove(node)
        node = next
        continue
      }

      // Wrap stray inline nodes in <p> elements.
      if (!dom.isBlock(node)) {
        elem = dom.create('p')
        dom.replace(node, elem)
        elem.appendChild(node)

        while (node = elem.nextSibling) {
          if (!dom.isText(node) && !dom.isElem(node)) {
            dom.remove(node)
            continue
          }

          if (dom.isBlock(node))
            break

          elem.appendChild(dom.remove(node))
        }

        node = elem
      }

      // 'node' should now be pointing to a block element.
      name = node.nodeName
      if (!Converter.allows(name) && !/^[OU]L$/.test(name)) {

        // We’ll assume <section>s and <hr>s represent visual sections.
        if (name === 'SECTION' || name === 'HR') {
          section = Converter.toSectionObj(name !== 'HR' ? node : null)
          section.start = paragraphs.length
          sections.push(section)
        }

        while (node.lastChild)
          dom.after(node, dom.remove(node.lastChild))

        next = nextSibling(node)
        dom.remove(node)
        node = next
        continue
      }

      if (/^[OU]L$/.test(name)) {
        node = firstChild(node)
        continue
      }

      // <blockquote>s and <li>s can contain other block children.
      // We change the types of those children to match their parent.
      if (name === 'BLOCKQUOTE' || name === 'LI') {
        obj = sanitize(node.innerHTML)
        paragraph = Converter.toParagraph(node)

        for (i = 0; i < obj.paragraphs.length; i += 1)
          obj.paragraphs[i].type = paragraph.type
        for (i = 0; i < obj.sections.length; i += 1)
          section.start += paragraphs.length

        paragraphs = paragraphs.concat(obj.paragraphs)
        sections = sections.concat(obj.sections)

        node = nextSibling(node)
        continue
      }

      // At this point, 'node' should be pointing to a Compose-approved
      // block element. We’ll assume that these block elements do not
      // contain other block elements.
      paragraph = Converter.toParagraph(node)
      if (paragraph.type !== 'pre') {

        // Remove consecutive spaces
        paragraph = paragraph
          .replace(/[^\S\n]{2,}/g, ' ')
          .replace(/^[^\S\n\u00A0]/, nbsp)
          .replace(/[^\S\n\u00A0]$/, nbsp)

          // Smart text things
          .replace(simpleText, replacer(paragraph))
      }

      if (paragraph.text)
        paragraphs.push(paragraph)

      node = nextSibling(node)
    }

    // Remove sections starting at the same index, or starting at an
    // invalid index.
    for (i = 0; i < sections.length; i += 1) {
      if (sections[i].start >= paragraphs.length) {
        sections = sections.slice(0, i - 1)
        break
      }

      if (sections[i - 1] && sections[i].start === sections[i - 1].start)
        sections.splice(i - 1, 1)
    }

    debug('Extracted paragraphs: ', paragraphs)
    debug('Extracted sections: ', sections)

    return {
      paragraphs: paragraphs,
      sections: sections
    }
  }

  Compose.provide('sanitize', sanitize)
}

module.exports = Sanitize
