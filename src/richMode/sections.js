'use strict';

/**
 * This module defines operations that can be performed on sections.
 *
 * TODO: section-(first|last) classes.
 *
 * NOTE: do not worry about the use of 'this'; it is only meant to
 * be used in the context of the View.
 */
function SectionOperations (Compose) {
  var Converter = Compose.require('converter'),
      getChildren = Compose.require('getChildren'),
      dom = Compose.require('dom')

  function insert (delta) {
    var section = Converter.toSectionElem(delta.section),
        children = getChildren(),
        start = children[delta.index],
        parent,
        i

    parent = start.parentNode
    while (parent.nodeName !== 'SECTION') {
      dom.split(start)
      start = parent
      parent = start.parentNode
    }

    while (start.nextSibling)
      section.appendChild(dom.remove(start.nextSibling))

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
        node = children[delta.index],
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

    if (i === this.sections.length)
      throw new Error('No section begins at index ' + delta.index + '.')
    else if (i === 0)
      throw new Error('The first section cannot be deleted.')

    this.section.splice(i, 1)

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
    dom.remove(section)
  }

  Compose.provide(SectionOperations.provided, {
    insert: insert,
    update: update,
    remove: remove
  })
}

SectionOperations.provided = 'temp-sections'

module.exports = SectionOperations
