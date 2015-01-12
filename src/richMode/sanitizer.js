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
      Serialize = Compose.require('serialize'),
      Converter = Compose.require('converter'),
      dom = Compose.require('dom'),
      nbsp = '\u00A0'

  /**
   * sanitize(html) takes a string of html as its only parameter and
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

    // Certain copied text (e.g. from MS word) is in the form of an
    // entire document; DOCTYPE, head, title, body and all. Browsers
    // remove the head/body, but leave the title, which we don’t really
    // want. Also remove <script>s and <style>s.
    forEach.call(
      container.querySelectorAll('script, style, title'),
      dom.remove
    )

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
    // invalid index. This can happen when, for example, there is a
    // <section> with an <hr> as its first child.
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

  /**
   * text(data) “sanitizes” a string of text. It mainly just formats
   * the text in a Compose-compatible way, by removing adjacent spaces
   * and splitting paragraph at double newlines.
   *
   * @param {String} text
   * @return {Object}
   */
  function text (data) {
    var paragraphs

    debug('Sanitizing text “%s”', data)

    data = data
      .replace(/[^\S\n]{2,}/, ' ')
      .replace(/^[^\S\n\u00A0]/, nbsp)
      .replace(/[^\S\n\u00A0]$/, nbsp)

    paragraphs = data.split(/\n{2,}/).map(function (paragraph) {
      return Serialize.fromText(paragraph)
    })

    debug('Extracted paragraphs %o', paragraphs)

    return {
      paragraphs: paragraphs,
      sections: []
    }
  }

  sanitize.text = text
  Compose.provide('sanitize', sanitize)
}

module.exports = Sanitize
