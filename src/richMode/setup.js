'use strict';

/**
 * This module sets up the editor when in rich mode. Adds the paragraphs
 * to the view, etc.
 *
 * @require {getChildren, converter, classes, view, dom}
 */
function setup (Compose) {
  var getChildren = Compose.require('getChildren'),
      Converter = Compose.require('converter'),
      classes = Compose.require('classes'),
      View = Compose.require('view'),
      dom = Compose.require('dom'),
      listRegex = /^[OU]L$/,
      numChildren = 0,
      sectionObj,
      paragraph,
      section,
      next,
      li,
      hr

  section = Compose.elem.firstChild
  while (section) {
    if (section.nodeName !== 'SECTION') {
      next = section.nextSibling
      dom.remove(section)
      section = next
      continue
    }

    hr = section.firstChild
    if (!hr || hr.nodeName !== 'HR')
      hr = section.insertBefore(document.createElement('hr'), hr)

    paragraph = hr.nextSibling
    while (paragraph) {
      if (!Converter.allows(paragraph.nodeName) &&
          !listRegex.test(paragraph.nodeName)) {
        next = paragraph.nextSibling
        dom.remove(paragraph)
        paragraph = next
        continue
      }

      if (listRegex.test(paragraph.nodeName)) {
        li = paragraph.firstChild

        while (li) {
          if (li.nodeName !== 'LI') {
            next = li.nextSibling
            dom.remove(li)
            li = next
            continue
          }

          View.paragraphs.push(Converter.toParagraph(li))

          li = li.nextSibling
        }

        if (!paragraph.firstChild) {
          next = paragraph.nextSibling
          dom.remove(paragraph)
          paragraph = next
          continue
        }
      } else {
        View.paragraphs.push(Converter.toParagraph(paragraph))
      }

      paragraph = paragraph.nextSibling
    }

    if (section.childNodes.length === 1) {
      // We’ve removed all paragraphs.

      next = section.nextSibling
      dom.remove(section)
      section = next
      continue
    }

    paragraph = section.childNodes[1]
    if (listRegex.test(paragraph.nodeName))
      paragraph = paragraph.firstChild

    paragraph.classList.add(classes.firstParagraph)

    paragraph = section.lastChild
    if (listRegex.test(paragraph.nodeName))
      paragraph = paragraph.lastChild

    paragraph.classList.add(classes.lastParagraph)

    sectionObj = Converter.toSectionObj(section)
    sectionObj.start = numChildren
    View.sections.push(sectionObj)
    numChildren += section.childNodes.length - 1

    section = section.nextSibling
  }

  if (!Compose.elem.firstChild) {
    section = Converter.toSectionElem()
    paragraph = document.createElement('p')
    paragraph.appendChild(document.createElement('br'))
    section.appendChild(paragraph)
    Compose.elem.appendChild(section)

    paragraph.classList.add(classes.firstParagraph)
    paragraph.classList.add(classes.lastParagraph)

    sectionObj = Converter.toSectionObj(section)
    sectionObj.start = 0
    View.sections.push(sectionObj)
    View.paragraphs.push(Converter.toParagraph(paragraph))
  }

  Compose.elem.firstChild.classList.add(classes.firstSection)
  Compose.elem.lastChild.classList.add(classes.lastSection)

  if (Compose.elem.childNodes.length !== View.sections.length ||
      getChildren().length !== View.paragraphs.length)
    throw new Error('Failed to properly initialize Compose.')
}

module.exports = setup
