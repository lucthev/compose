'use strict';

/**
 * This module defines operations that can be performed on sections.
 *
 * NOTE: do not worry about the use of 'this'; it is only meant to
 * be used in the context of the View.
 */
function SectionOperations (Compose) {
  var Converter = Compose.require('converter'),
      getChildren = Compose.require('getChildren'),
      classes = Compose.require('classes'),
      dom = Compose.require('dom')

  function insert (delta) {
    var section = Converter.toSectionElem(delta.section),
        children = getChildren(),
        index = delta.section.start,
        start = children[index],
        parent,
        i

    if (index < 0 || index > children.length - 1)
      throw new RangeError('Cannot create section starting at index ' + index)
    if (this.isSectionStart(index))
      return update(delta)

    children[index - 1].classList.add(classes.lastParagraph)
    children[index].classList.add(classes.firstParagraph)

    parent = start.parentNode
    while (parent.nodeName !== 'SECTION') {
      if (start.previousSibling)
        dom.split(start.previousSibling)

      start = start.parentNode
      parent = start.parentNode
    }

    while (start.nextSibling)
      section.appendChild(dom.remove(start.nextSibling))

    dom.after(section.firstChild, dom.remove(start))

    if (!parent.nextSibling) {
      parent.classList.remove(classes.lastSection)
      section.classList.add(classes.lastSection)
    }
    dom.after(parent, section)

    for (i = 0; i < this.sections.length; i += 1) {
      if (this.sections[i].start > delta.index)
        break
    }

    this.sections.splice(i, 0, delta.section)

    // We can avoid a bunch of duplicate code for styling sections
    // by simply calling the update operation.
    update(delta)
  }

  function update (delta) {
    // TODO: things with sections. Different backgrounds, for example?
  }

  function remove (delta) {
    var children = getChildren(),
        index = delta.index,
        node = children[index],
        section = node.parentNode,
        sectionBefore,
        first,
        last,
        end,
        i

    for (i = 0; i < this.sections.length; i += 1) {
      if (this.sections[i].start === delta.index)
        break
    }

    if (i === this.sections.length) {
      throw new Error('Cannot remove non-existant section beginning ' +
        'at index ' + delta.index)
    } else if (i === 0) {
      throw new Error('The first section cannot be deleted.')
    }

    // Remove section from the View.
    this.sections.splice(i, 1)

    children[index - 1].classList.remove(classes.lastParagraph)
    node.classList.remove(classes.firstParagraph)

    while (section.nodeName !== 'SECTION') {
      node = section
      section = node.parentNode
    }

    sectionBefore = section.previousSibling
    end = sectionBefore.lastChild

    while (node.nextSibling)
      sectionBefore.appendChild(dom.remove(node.nextSibling))

    while (Converter.canMerge(node, end)) {
      last = end.lastChild
      first = node.firstChild

      while (node.firstChild)
        end.appendChild(dom.remove(node.firstChild))

      node = first
      end = last
    }

    dom.after(end, dom.remove(node))

    if (!section.nextSibling)
      sectionBefore.classList.add(classes.lastSection)

    dom.remove(section)
  }

  return {
    insert: insert,
    update: update,
    remove: remove
  }
}

module.exports = SectionOperations
