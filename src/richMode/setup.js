'use strict';

/**
 * This module sets up the editor when in rich mode. Adds the paragraphs
 * to the view, etc.
 *
 * TODO: “strict” version?
 */
function setup (Compose) {
  var Converter = Compose.require('converter'),
      sanitize = Compose.require('sanitize'),
      classes = Compose.require('classes'),
      Delta = Compose.require('delta'),
      View = Compose.require('view'),
      dom = Compose.require('dom'),
      elem = Compose.elem,
      paragraph,
      section,
      result

  result = sanitize(elem.innerHTML)
  if (!result.sections[0] || result.sections[0].start !== 0) {
    section = Converter.toSectionObj()
    section.start = 0
    result.sections.unshift(section)
  }

  while (elem.firstChild)
    dom.remove(elem.firstChild)

  section = Converter.toSectionElem('section')
  section.className = classes.firstSection + ' ' + classes.lastSection

  paragraph = dom.create('p')
  paragraph.appendChild(dom.create('br'))
  paragraph.className = classes.firstParagraph + ' ' + classes.lastParagraph

  section.appendChild(paragraph)
  elem.appendChild(section)

  section = Converter.toSectionObj(section)
  section.start = 0
  View.paragraphs.push(Converter.toParagraph(paragraph))
  View.sections.push(section)

  result.paragraphs = result.paragraphs.map(function (paragraph, index) {
    if (index === 0)
      return new Delta('paragraphUpdate', index, paragraph)

    return new Delta('paragraphInsert', index, paragraph)
  })

  result.sections = result.sections.map(function (section, index) {
    if (index === 0)
      return new Delta('sectionUpdate', section.start, section)

    return new Delta('sectionInsert', section.start, section)
  })

  View
    .render(result.paragraphs)
    .render(result.sections)
    ._render()
}

module.exports = setup
