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
      Converter = Compose.require('converter'),
      dom = Compose.require('dom')

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

        // We’ll assume sections or <hr>s represent visual sections.
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
      if (paragraph.text)
        paragraphs.push(paragraph)

      node = nextSibling(node)
    }

    // Make sure there’s a section starting at index 0.
    if (sections[0])
      sections[0].start = 0

    // Remove sections starting at the same index.
    for (i = 1; i < sections.length; i += 1) {
      if (sections[i].start === sections[i - 1].start)
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
