'use strict';

/**
 * This module implements the various operations that can be preformed
 * on paragraphs.
 *
 * TODO: there’s a lot of repetition. Keep it DRY.
 * TODO: paragraph-(first|last) classes.
 *
 * NOTE: don’t worry about the use of 'this'; these functions are meant
 * to be used in the context of the View.
 */
function ParagraphOperations (Compose) {
  var getChildren = Compose.require('getChildren'),
      Converter = Compose.require('converter'),
      dom = Compose.require('dom')

  /**
   * insert(delta) inserts a paragraph. Note that when the delta’s
   * index is the start of a section, the paragraph will be inserted,
   * visually, before the section start. As a consequence, it is
   * impossible to insert a paragraph at index 0.
   *
   * @param {Delta} delta
   */
  function insert (delta) {
    var elem = Converter.toElement(delta.paragraph),
        children = getChildren(),
        otherParents = [],
        elemParents = [],
        before,
        after,
        len,
        i

    // Working under the assumption that it is impossible to insert
    // a paragraph at the beginning of a section.
    before = children[delta.index - 1]
    after = !this.isSectionStart(delta.index) ? children[delta.index] : null

    elemParents.unshift(elem)
    while (elem.parentNode) {
      elemParents.unshift(elem.parentNode)
      elem = elem.parentNode
    }

    otherParents.unshift(before)
    while (before.parentNode.nodeName !== 'SECTION') {
      otherParents.unshift(before.parentNode)
      before = before.parentNode
    }

    len = Math.min(elemParents.length, otherParents.length)
    for (i = 0; i < len; i += 1) {
      if (!Converter.canMerge(elemParents[i], otherParents[i]))
        break
    }

    elem = elemParents[i]
    before = otherParents[i]

    // In the case, for example, that the previous paragraph is a list
    // item and we are inserting a <p>, 'before' would be the <o/ul>
    // which could contain other list items (the next paragraphs);
    // without this step, the paragraph would be inserted after the
    // <o/ul>, after all those other paragraphs.
    if (i < otherParents.length - 1)
      dom.split(otherParents[i + 1])

    dom.after(before, dom.remove(elem))

    elemParents = elemParents.slice(elemParents.indexOf(elem))
    otherParents = []

    while (elem.parentNode.nodeName !== 'SECTION') {
      elemParents.unshift(elem.parentNode)
      elem = elem.parentNode
    }

    if (after) otherParents.push(after)
    while (after && after.parentNode.nodeName !== 'SECTION') {
      otherParents.unshift(after.parentNode)
      after = after.parentNode
    }

    len = Math.min(elemParents.length, otherParents.length)
    for (i = 0; i < len; i += 1) {
      if (!Converter.canMerge(elemParents[i], otherParents[i]))
        break

      after = otherParents[i]
      while (after.lastChild)
        dom.after(elemParents[i + 1], dom.remove(after.lastChild))

      dom.remove(after)
    }

    this.paragraphs.splice(delta.index, 0, delta.paragraph)
    for (i = 0; i < this.sections.length; i += 1) {
      if (this.sections[i].start >= delta.index)
        this.sections[i].start += 1
    }
  }

  /**
   * update(delta) updates a paragraph. Obviously, the delta’s index
   * should be a valid child index. Bad things will happen otherwise.
   *
   * @param {Delta} delta
   */
  function update (delta) {
    var elem = Converter.toElement(delta.paragraph),
        children = getChildren(),
        otherParents = [],
        elemParents = [],
        oldElem,
        before,
        after,
        len,
        i

    oldElem = children[delta.index]
    before = !this.isSectionStart(delta.index) ?
      children[delta.index - 1] : null
    after = !this.isSectionStart(delta.index + 1) ?
      children[delta.index + 1] : null

    elemParents.unshift(elem)
    while (elem.parentNode) {
      elemParents.unshift(elem.parentNode)
      elem = elem.parentNode
    }

    otherParents.unshift(oldElem)
    while (oldElem.parentNode.nodeName !== 'SECTION') {
      otherParents.unshift(oldElem.parentNode)
      oldElem = oldElem.parentNode
    }

    len = Math.min(elemParents.length, otherParents.length)
    for (i = 0; i < len; i += 1) {
      if (!Converter.canMerge(elemParents[i], otherParents[i]))
        break
    }

    elem = elemParents[i]

    len = otherParents.length - 1
    oldElem = otherParents[len]
    for (len; len > i; len -= 1) {
      if (oldElem.previousSibling)
        dom.split(oldElem.previousSibling)

      dom.split(oldElem)
      oldElem = oldElem.parentNode
    }

    dom.replace(oldElem, dom.remove(elem))

    elemParents = elemParents.slice(elemParents.indexOf(elem))
    otherParents = []

    while (elem.parentNode.nodeName !== 'SECTION') {
      elemParents.unshift(elem.parentNode)
      elem = elem.parentNode
    }

    if (before) otherParents.push(before)
    while (before && before.parentNode.nodeName !== 'SECTION') {
      otherParents.unshift(before.parentNode)
      before = before.parentNode
    }

    len = Math.min(elemParents.length, otherParents.length)
    for (i = 0; i < len; i += 1) {
      if (!Converter.canMerge(elemParents[i], otherParents[i]))
        break

      elem = elemParents[i]
      while (elem.lastChild)
        dom.after(otherParents[i + 1], dom.remove(elem.lastChild))

      dom.remove(elem)
    }

    elem = elemParents[i]
    elemParents = elemParents.slice(elemParents.indexOf(elem))
    otherParents = []

    while (elem.parentNode.nodeName !== 'SECTION') {
      elemParents.unshift(elem.parentNode)
      elem = elem.parentNode
    }

    if (after) otherParents.push(after)
    while (after && after.parentNode.nodeName !== 'SECTION') {
      otherParents.unshift(after.parentNode)
      after = after.parentNode
    }

    len = Math.min(elemParents.length, otherParents.length)
    for (i = 0; i < len; i += 1) {
      if (!Converter.canMerge(elemParents[i], otherParents[i]))
        break

      after = otherParents[i]
      while (after.lastChild)
        dom.after(elemParents[i + 1], dom.remove(after.lastChild))

      dom.remove(after)
    }

    this.paragraphs[delta.index] = delta.paragraph
  }

  /**
   * remove(delta) removes a paragraph from the View and the DOM.
   * Assumes it is impossible to remove the last element of a section,
   * so don’t do that.
   *
   * @param {Delta} delta
   */
  function remove (delta) {
    var children = getChildren(),
        child = children[delta.index],
        parent = children.parentNode,
        i

    while (child && child.nodeName !== 'SECTION') {
      parent = child.parentNode
      dom.remove(child)
      child = !parent.firstChild ? parent : null
    }

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
