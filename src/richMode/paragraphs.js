'use strict';

/**
 * This module implements the various operations that can be preformed
 * on paragraphs.
 *
 * NOTE: don’t worry about the use of 'this'; these functions are meant
 * to be used in the context of the View.
 */
function ParagraphOperations (Compose) {
  var getChildren = Compose.require('getChildren'),
      dom = Compose.require('dom'),
      listRegex = /^[ou]l$/

  function insert (delta) {
    var previousChild = this.paragraphs[delta.index - 1],
        nextChild = this.paragraphs[delta.index],
        sectionStart = this.isSectionStart(delta.index),
        paragraph = delta.paragraph,
        children = getChildren(),
        type = paragraph.type,
        list,
        elem,
        i

    // FIXME: optimize (for legibility).

    if (listRegex.test(paragraph.type)) {
      paragraph.type = 'li'
      elem = paragraph.toElement()
      paragraph.type = type

      if (previousChild.type === type) {
        // Both previous and current are the same kind of list.

        previousChild = children[delta.index - 1]
        dom.after(previousChild, elem)
      } else if (listRegex.test(previousChild.type)) {
        // Previous and current are different kinds of lists.

        previousChild = children[delta.index - 1]
        previousChild = dom.split(previousChild)

        list = document.createElement(type)
        list.appendChild(elem)

        dom.after(previousChild, list)
      } else if (nextChild.type === type && !sectionStart) {
        // Current and next are the same type of list. We shouldn't have
        // to worry about splitting that list; otherwise, the previous
        // child would also have been a list.

        nextChild = children[delta.index]
        nextChild.parentNode.insertBefore(elem, nextChild)
      } else {
        // Previous is not a list.

        list = document.createElement(type)
        list.appendChild(elem)

        previousChild = children[delta.index - 1]
        dom.after(previousChild, list)
      }
    } else if (listRegex.test(previousChild.type)) {
      // Paragraph to insert is not a list; previous one is.

      previousChild = children[delta.index - 1]
      previousChild = dom.split(previousChild)
      dom.after(previousChild, paragraph.toElement())
    } else {
      // Neither are lists.

      previousChild = children[delta.index - 1]
      dom.after(previousChild, paragraph.toElement())
    }

    this.paragraphs.splice(delta.index, 0, paragraph)
    for (i = 0; i < this.sections.length; i += 1) {
      if (this.sections[i].start > delta.index)
        this.sections[i].start += 1
    }
  }

  function update (delta) {
    var oldState = this.paragraphs[delta.index],
        newState = delta.paragraph,
        oldList = listRegex.test(oldState.type),
        newList = listRegex.test(newState.type),
        children = getChildren(),
        oldChild = children[delta.index],
        type = newState.type,
        previousChild,
        nextChild,
        elem

    if (newList && oldList && newState.type === oldState.type) {

      newState.type = 'li'
      dom.replace(oldChild, newState.toElement())
      newState.type = type

    } else if (newList && oldList) {

      oldChild = dom.split(oldChild)
      dom.remove(oldChild.lastChild)

      newState = 'li'
      elem = document.createElement(type)
      elem.appendChild(newState.toElement())
      dom.after(oldChild, elem)
      newState = type

    } else if (oldList) {

      oldChild = dom.split(oldChild)
      dom.remove(oldChild.lastChild)
      dom.after(oldChild, newState.toElement())

    } else if (newList) {

      previousChild = this.paragraphs[delta.index - 1]

      if (previousChild && previousChild.type === newState.type &&
          !this.isSectionStart(delta.index)) {
        previousChild = children[delta.index - 1]
        elem = previousChild.parentNode

        elem.appendChild(newState.toElement())
        dom.remove(oldChild)

      } else {
        elem = document.createElement(type)
        newState.type = 'li'
        elem.appendChild(newState.toElement())
        newState.type = type

        dom.replace(oldChild, elem)
      }

      nextChild = elem.nextSibling
      if (nextChild && nextChild.nodeName === elem.nodeName) {
        // The next child is a list; merge it.

        while (nextChild.firstChild)
          elem.appendChild(dom.remove(nextChild.firstChild))

        dom.remove(nextChild)
      }

    } else {
      dom.replace(oldChild, newState.toElement())
    }

    this.paragraphs[delta.index] = newState
  }

  function remove (delta) {
    var children = getChildren(),
        child = children[delta.index],
        parent = children.parentNode,
        i

    dom.remove(child)

    if (child.nodeName === 'LI' && !parent.firstChild)
      dom.remove(parent)

    this.paragraphs.splice(delta.index, 1)
    for (i = 0; i < this.sections.length; i += 1) {
      if (this.sections[i].start > delta.index)
        this.sections[i].start -= 1
    }
  }

  Compose.provide(ParagraphOperations.provided, {
    insert: insert,
    update: update,
    remove: remove
  })
}

ParagraphOperations.provided = 'temp-paragraphs'

module.exports = ParagraphOperations
