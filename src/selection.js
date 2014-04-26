/**
 * Much of this file was inspired by the Guardian's Scribe
 * (https://github.com/guardian/scribe), so here's the license for that:
 *
 * Copyright 2014 Guardian News & Media Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function Selection (Quill) {
  this.elem = Quill.elem

  Quill.sanitizer.addFilter(function (params) {
    var node = params.node,
        name = params.node_name

    if (name === 'span' && node.className === 'Quill-marker')
      return { whitelist: true, attr_whitelist: ['class'] }
    else return null
  })
}

/**
 * Selection.getContaining() gets the immediate child of the editor
 * element that contains the node node. If no node is given, uses the
 * selection anchor.
 *
 * @param {Node} node
 * @return Element || false
 */
Selection.prototype.getContaining = function (node) {
  var sel = window.getSelection(),
      range

  node = node || sel.anchorNode

  if (!sel.rangeCount) return false

  while (node && node !== this.elem) {
    if (node.parentNode === this.elem)
      return node
    else node = node.parentNode
  }

  // We check for the caret being on an HR, in which case the
  // anchorNode is reported as being the editable element.
  range = sel.getRangeAt(0)
  if (range.startContainer === this.elem &&
      range.endContainer === this.elem &&
      range.startOffset === range.endOffset) {

    node = this.elem.childNodes[range.endOffset - 1]
    if (node && node.nodeName === 'HR') return node

    // The endOffset varies; it seems that it may depend one the
    // direction of navigation. We check both.
    node = this.elem.childNodes[range.endOffset]
    if (node && node.nodeName === 'HR') return node
  }

  return false
}

/**
 * Selection.childOf(matcher) tests if the selection is a child of
 * a node with name matching the provided regular expression. If
 * so, returns the matched node; else, returns false.
 *
 * Optionally takes an element as the second parameter; in that case,
 * it determines if the element has a parent matching the RegExp.
 *
 * @param {RegExp} matcher
 * @param {Node} elem
 * @return Node || false
 */
Selection.prototype.childOf = function (matcher, elem) {
  var sel = window.getSelection(),
      node

  // Don't search if not given a matcher or nothing selected.
  if (!matcher || !sel.rangeCount) return false

  node = elem || sel.getRangeAt(0).commonAncestorContainer

  while (node && node !== this.elem) {
    if (node.nodeName.match(matcher))
      return node
    else node = node.parentNode
  }

  return false
}

/**
 * Selection.forEachBlock(action) perform an action on each top-
 * level block element in the selection. In lists, it instead
 * performs the action on each <li>.
 *
 * If rmSelection is true, forEachBlock will desregard the current
 * selection - that is, it will not place the markers.
 *
 * @param {Function} action
 * @param {Boolean} rmSelection
 */
Selection.prototype.forEachBlock = function (action, rmSelection) {
  var sel = window.getSelection(),
      listRegex = /^[OU]L$/,
      liRegex = /^LI$/,
      range,
      current,
      next,
      start,
      end

  if (!sel.rangeCount) return

  range = sel.getRangeAt(0)
  start = this.getContaining(range.startContainer)
  end = this.getContaining(range.endContainer)

  // If either the start or end are lists, we instead get the list
  // item in which the start/end is.
  if (listRegex.test(start.nodeName))
    start = this.childOf(liRegex, range.startContainer)
  if (listRegex.test(end.nodeName))
    end = this.childOf(liRegex, range.endContainer)

  // Save the selection, if necessary.
  if (!rmSelection)
    this.placeMarkers()

  next = start
  while (next !== end) {
    current = next
    next = next.nextSibling

    // Make sure we're iterating over list item nodes, if applicable.
    if (!next && liRegex.test(current.nodeName))
      next = current.parentNode.nextSibling

    // Order matters: next could not be a new list.
    if (next && listRegex.test(next.nodeName))
      next = next.firstChild

    if (current.isContentEditable)
      action(current)
  }

  // Perform action on last block.
  action(end)

  // Restore selection, if necessary.
  if (!rmSelection)
    this.selectMarkers()
}

/*
 * Selection.contains(query) tests if the selection contains elements
 * with the given query.
 *
 * @param {String} query
 * @return Boolean
 */
Selection.prototype.contains = function (query) {
  var sel = window.getSelection(),
      fragment

  if (!sel.rangeCount) return false

  fragment = sel.getRangeAt(0).cloneContents()

  return !!fragment.querySelectorAll(query).length
}

Selection.prototype.placeMarkers = function () {
  var sel = window.getSelection(),
      start = document.createElement('span'),
      end = document.createElement('span'),
      startRange,
      endRange,
      range

  if (!sel.rangeCount) return

  range = sel.getRangeAt(0)

  start.className = 'Quill-marker'
  end.className = 'Quill-marker'

  endRange = range.cloneRange()
  endRange.collapse()
  endRange.insertNode(end)

  /**
   * Chrome: `Range.insertNode` inserts a bogus text node after the inserted
   * element. We just remove it.
   * As per: http://jsbin.com/ODapifEb/1/edit?js,console,output
   */
  if (end.nextSibling && end.nextSibling.nodeType === Node.TEXT_NODE &&
     !end.nextSibling.data)
    end.parentNode.removeChild(end.nextSibling)

  if (!range.collapsed) {
    startRange = range.cloneRange()
    startRange.collapse(true)
    startRange.insertNode(start)

    // See above.
    if (start.nextSibling && start.nextSibling.nodeType === Node.TEXT_NODE &&
       !start.nextSibling.data)
      start.parentNode.removeChild(start.nextSibling)
  }
}

Selection.prototype.getMarkers = function () {
  return this.elem.querySelectorAll('.Quill-marker')
}

Selection.prototype.removeMarkers = function () {
  var markers = this.getMarkers()
  Array.prototype.forEach.call(markers, function (marker) {
    var parent = marker.parentNode

    parent.removeChild(marker)

    // Join text nodes that may have been split by marker insertion.
    parent.normalize()
  })
}

Selection.prototype.selectMarkers = function (keepMarkers) {
  var sel = window.getSelection(),
      markers = this.getMarkers(),
      range = document.createRange()

  if (!markers.length) return

  range.setStartBefore(markers[0])

  if (markers.length === 1)
    range.setEndAfter(markers[0])
  else range.setEndAfter(markers[1])

  if (!keepMarkers)
    this.removeMarkers()

  sel.removeAllRanges()
  sel.addRange(range)
}

/**
 * Selection.isNewLine() determines if the containing element is a
 * new line (only applies in rich mode).
 *
 * @return Boolean
 */
Selection.prototype.isNewLine = function () {
  var sel = window.getSelection(),
      elem = this.getContaining()

  return elem && sel.isCollapsed && !elem.textContent
}

/**
 * Selection.atStartOf(elem) determines if the caret is collapsed
 * and at the start of the given element.
 *
 * @param {Node} elem
 * @return Boolean
 */
Selection.prototype.atStartOf = function (elem) {
  var sel = window.getSelection(),
      range,
      text

  if (!sel.rangeCount || !sel.isCollapsed) return false

  range = sel.getRangeAt(0).cloneRange()
  range.setStartBefore(elem)

  text = range.cloneContents()

  return !text.firstChild.textContent
}

/**
 * Selection.atEndOf(elem) determines if the caret is collapsed
 * and at the end of the given element.
 *
 * @param {Node} elem
 * @return Boolean
 */
Selection.prototype.atEndOf = function (elem) {
  var sel = window.getSelection(),
      range,
      text

  if (!sel.rangeCount || !sel.isCollapsed) return false

  range = sel.getRangeAt(0).cloneRange()
  range.setEndAfter(elem)

  text = range.cloneContents()

  return !text.firstChild.textContent
}

/**
 * Selection.placeCaret(node) places the caret at the beginning of
 * the node. If atEnd is truthy, place the caret at the end of the
 * node.
 *
 * @param {Node} node
 * @param {Boolean} atEnd
 */
Selection.prototype.placeCaret = function (node, atEnd) {
  var sel = window.getSelection(),
      range = document.createRange()

  range.selectNodeContents(node)
  range.collapse(!atEnd)
  sel.removeAllRanges()
  sel.addRange(range)
}

Selection.prototype.destroy = function () {
  delete this.elem

  return null
}

Selection.plugin = 'selection'

module.exports = Selection
