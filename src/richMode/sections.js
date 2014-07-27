'use strict';

/**
 * This module defines operations that can be performed on sections.
 *
 * NOTE: do not worry about the use of 'this'; it is only meant to
 * be used in the context of the View.
 */
function SectionOperations (Compose) {
  var getChildren = Compose.require('getChildren'),
      dom = Compose.require('dom')

  function insert (delta) {
    var section = document.createElement('section'),
        children = getChildren(),
        start = children[delta.index],
        parent,
        i

    if (start.nodeName === 'LI' && start.parentNode.lastChild !== start) {
      parent = dom.split(start).nextSibling
      dom.remove(start)

      parent.insertBefore(start, parent.firstChild)
      start = parent
    }

    parent = start.parentNode
    while (start.nextSibling)
      section.appendChild(dom.remove(start.nextSibling))

    section.insertBefore(dom.remove(start), section.firstChild)

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
        sectionBefore,
        section,
        last,
        i

    if (node.nodeName === 'LI')
      node = node.parentNode

    section = node.parentNode
    sectionBefore = section.previousSibling
    last = sectionBefore.lastChild

    while (node.nextSibling)
      sectionBefore.appendChild(dom.remove(node.nextSibling))

    if (/^[OU]L$/.test(last.nodeName) && last.nodeName === node.nodeName) {
      // Merge lists of the same type.

      while (node.firstChild)
        last.appendChild(dom.remove(node.firstChild))
    } else {
      dom.after(last, dom.remove(node))
    }

    dom.remove(section)
    for (i = 0; i < this.sections.length; i += 1) {
      if (this.sections[i].start === delta.index) {
        this.sections.splice(i, 1)
        break
      }
    }
  }

  Compose.provide(SectionOperations.provided, {
    insert: insert,
    update: update,
    remove: remove
  })
}

SectionOperations.provided = 'temp-sections'

module.exports = SectionOperations
