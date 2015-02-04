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
        split,
        elem,
        next,
        name,
        type,
        node,
        obj,
        evt,
        i

    debug('Sanitizing %s', html)
    container.innerHTML = html

    forEach.call(container.querySelectorAll('script'), dom.remove)
    forEach.call(container.querySelectorAll('style'), dom.remove)

    collapseWhitespace(container)

    node = firstChild(container)
    while (node) {
      if (!dom.isText(node) && !dom.isElement(node)) {
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
          if (!dom.isText(node) && !dom.isElement(node)) {
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

      // <blockquote>s, lists, and <li>s can contain other block children.
      // We change the types of those children to match their parent.
      if (/^[OU]L$/.test(name) || name === 'BLOCKQUOTE' || name === 'LI') {
        obj = sanitize(node.innerHTML)

        if (/^[OU]L$/.test(name)) {
          type = name.toLowerCase()
        } else {
          type = Converter.toParagraph(node).type
        }

        for (i = 0; i < obj.paragraphs.length; i += 1)
          obj.paragraphs[i].type = type
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

      if (/^\n+./.test(paragraph.text))
        paragraph = paragraph.replace(/^\n+/, '')

      paragraph = paragraph.replace(/\n{3,}/g, '\n\n')
      if (paragraph.text === '\n\n')
        paragraph = paragraph.substr(1)

      // Remove unnecessary newlines at the start of a paragraph.
      if (/^\n+./.test(paragraph.text))
        paragraph = paragraph.replace(/^\n+/, '')

      // Split the paragraph at double newlines
      split = []
      for (i = 0; i < paragraph.length - 2; i += 1) {
        if (paragraph.text[i] !== '\n' || paragraph.text[i + 1] !== '\n')
          continue

        split.push(paragraph.substr(0, i))
        paragraph = paragraph.substr(i + 2)
        i = 0
      }

      split.push(paragraph)

      // Give plugins a chance to act during the sanitizing process
      for (i = 0; i < split.length; i += 1) {
        evt = {
          type: 'sanitize',
          paragraph: split[i]
        }

        Compose.emit('sanitize', evt)
        if (evt.paragraph && evt.paragraph.length)
          paragraphs.push(evt.paragraph)
      }

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
