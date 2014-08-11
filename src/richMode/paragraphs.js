'use strict';

/**
 * getParents(elem, arr) gets parents of elem, up until the first
 * <section>, and adds them to the array 'arr' in reverse order.
 *
 * @param {Element} elem
 * @param {Array} arr
 */
function getParents (elem, arr) {
  var parent = elem.parentNode

  while (parent && parent.nodeName !== 'SECTION') {
    arr.unshift(parent)
    elem = parent
    parent = elem.parentNode
  }
}

/**
 * parentBeforeSection(elem) gets the ancestor of the given element
 * that is an immediate child of a <section>. If elem is falsy, returns
 * null.
 *
 * @param {Element} elem
 * @return {Element}
 */
function parentBeforeSection (elem) {
  var parent

  if (!elem) return null

  parent = elem.parentNode
  while (parent.nodeName !== 'SECTION') {
    elem = parent
    parent = elem.parentNode
  }

  return elem
}

/**
 * This module implements the various operations that can be performed
 * on paragraphs.
 *
 * NOTE: don’t worry about the use of 'this'; these functions are meant
 * to be used in the context of the View.
 */
function ParagraphOperations (Compose) {
  var getChildren = Compose.require('getChildren'),
      Converter = Compose.require('converter'),
      classes = Compose.require('classes'),
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
        index = delta.index,
        otherParents = [],
        elemParents = [],
        before,
        after,
        len,
        i

    if (index <= 0 || index > children.length)
      throw new RangeError('Cannot insert a paragraph at index ' + index)

    before = children[index - 1]
    after = !this.isSectionStart(index) ? children[index] : null

    if (!after) {
      before.classList.remove(classes.lastParagraph)
      elem.classList.add(classes.lastParagraph)
    }

    elemParents.push(elem)
    getParents(elem, elemParents)

    otherParents.push(before)
    getParents(before, otherParents)

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

    getParents(elem, elemParents)
    if (after) {
      otherParents.push(after)
      getParents(after, otherParents)
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

    this.paragraphs.splice(index, 0, delta.paragraph)
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
        index = delta.index,
        otherParents = [],
        elemParents = [],
        oldElem,
        before,
        after,
        len,
        i

    if (index < 0 || index >= children.length)
      throw new RangeError('Cannot update a paragraph at index ' + index)

    oldElem = children[index]
    before = !this.isSectionStart(index) ?
      children[index - 1] : null
    after = !this.isSectionStart(index + 1) ?
      children[index + 1] : null

    if (!before) elem.classList.add(classes.firstParagraph)
    if (!after) elem.classList.add(classes.lastParagraph)

    elemParents.unshift(elem)
    getParents(elem, elemParents)

    otherParents.unshift(oldElem)
    getParents(oldElem, otherParents)

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
    getParents(elem, elemParents)

    otherParents = []
    if (before) {
      otherParents.push(before)
      getParents(before, otherParents)
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
    elemParents = elemParents.slice(i)
    getParents(elem, elemParents)

    otherParents = []
    if (after) {
      otherParents.push(after)
      getParents(after, otherParents)
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

    this.paragraphs[index] = delta.paragraph
  }

  /**
   * remove(delta) removes a paragraph from the View and the DOM.
   * Assumes it is impossible to remove the only element in a section,
   * so don’t do that.
   *
   * @param {Delta} delta
   */
  function remove (delta) {
    var children = getChildren(),
        index = delta.index,
        isStart = this.isSectionStart(index),
        isNextStart = this.isSectionStart(index + 1) ||
          index === children.length - 1,
        before,
        after,
        last,
        first,
        parent,
        child,
        i

    if (index < 0 || index >= children.length)
      throw new RangeError('Cannot remove paragraph at index ' + index)

    if (isStart && isNextStart) {
      throw new Error('Cannot remove the only paragraph in a section.')
    }

    if (!isStart)
      before = children[index - 1]
    if (!isNextStart)
      after = children[index + 1]

    if (!before) after.classList.add(classes.firstParagraph)
    if (!after) before.classList.add(classes.lastParagraph)

    before = parentBeforeSection(before)
    after = parentBeforeSection(after)

    child = children[index]
    parent = child.parentNode

    while (child && child.nodeName !== 'SECTION') {
      parent = child.parentNode
      dom.remove(child)
      child = !parent.firstChild ? parent : null
    }

    while (before && after) {
      if (!Converter.canMerge(before, after)) break

      last = before.lastChild
      first = after.firstChild

      while (after.firstChild)
        before.appendChild(dom.remove(after.firstChild))

      dom.remove(after)

      before = last
      after = first
    }

    this.paragraphs.splice(index, 1)
    for (i = 0; i < this.sections.length; i += 1) {
      if (this.sections[i].start > index)
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
