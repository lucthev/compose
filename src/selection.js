'use strict';

/**
 * isBackwards(selection) determines if the given selection is
 * backwards (i.e. the focus node comes before the anchor node)
 *
 * @param {Selection} selection
 * @return {Boolean}
 */
function isBackwards (sel) {
  var backwards,
      range

  if (!sel.rangeCount || sel.isCollapsed) return false
  range = sel.getRangeAt(0)

  if (sel.anchorNode === sel.focusNode)
    backwards = sel.anchorOffset > sel.focusOffset
  else backwards = sel.focusNode === range.startContainer

  return backwards
}

/**
 * Range.insertNode() insert a bogus text node after the inserted node
 * in some browsers (Chrome). This is used to remove it.
 *
 * @param {Node} node
 */
function removeBogusText (node) {
  var next = node.nextSibling
  if (next && next.nodeType === Node.TEXT_NODE && !next.data)
    node.parentNode.removeChild(next)
}

// Whitelist marker elements.
function markerFilter (span) {
  return {
    whitelist: span.classList.contains('Compose-marker')
  }
}

function Selection (Compose) {
  this.elem = Compose.elem
  this._debug = Compose._debug
  this.sanitizer = Compose.sanitizer
  this.node = Compose.node

  Compose.sanitizer.addFilter('span', markerFilter)
}

/**
 * Selection.createMarker() creates a markers that can be used to track
 * the selection.
 *
 * @param {Boolean} end
 * @return {Element}
 */
Selection.prototype.createMarker = function (end) {
  var span = document.createElement('span')

  span.classList.add('Compose-marker')
  span.classList.add(end ? 'end' : 'start')

  return span
}

/**
 * Selection.isMarker(node) determines if the given node is a marker.
 *
 * @param {Node} node
 * @return {Boolean}
 */
Selection.prototype.isMarker = function (node) {
  return this.node.isElem(node) && node.nodeName === 'SPAN' &&
    node.classList.contains('Compose-marker')
}

/**
 * Selection.getMarkers() gets all markers in the editable element.
 *
 * @return {NodeList}
 */
Selection.prototype.getMarkers = function () {
  return this.elem.querySelectorAll('.Compose-marker')
}

/**
 * Selection.removeMarkers() removes all moarkers in the editable
 * element, joining any text nodes that may have been split by
 * marker insertion.
 */
Selection.prototype.removeMarkers = function () {
  var markers = this.getMarkers(),
      parent,
      i

  for (i = 0; i < markers.length; i += 1) {
    parent = markers[i].parentNode

    parent.removeChild(markers[i])

    // Join any text nodes that may have split by marker insertion.
    parent.normalize()
  }
}

/**
 * Selection.selectRange(range) selects the given range. If backwards
 * is true, it will select the range 'backwards'.
 *
 * @param {Range} range
 * @param {Boolean} backwards
 */
Selection.prototype.selectRange = function (range, backwards) {
  var sel = window.getSelection(),
      endRange

  sel.removeAllRanges()

  // Directional selections are only possible in browsers that implement
  // the Selection.extend() method.
  // NOTE: We'll only make a directional selection when not in debug mode;
  // otherwise, this can mask how often we are calling this method.
  if (typeof sel.extend === 'function' && !this._debug) {
    endRange = range.cloneRange()
    endRange.collapse(!backwards)
    sel.addRange(endRange)

    if (backwards)
      sel.extend(range.startContainer, range.startOffset)
    else
      sel.extend(range.endContainer, range.endOffset)
  } else sel.addRange(range)
}

/**
 * Selection.save() 'saves' the user's selection by placing markers
 * in the document. The saved selection can later be restored by
 * calling Selection.restore()
 */
Selection.prototype.save = function () {
  var sel = window.getSelection(),
      start = this.createMarker(),
      end = this.createMarker(true),
      toEnd = isBackwards(sel),
      startRange,
      endRange,
      range

  if (!sel.rangeCount || document.activeElement !== this.elem) return
  range = sel.getRangeAt(0)

  startRange = range.cloneRange()
  startRange.collapse(!toEnd)
  startRange.insertNode(start)

  // Remove bogus text nodes that may have been created.
  removeBogusText(start)

  if (!sel.isCollapsed) {
    endRange = range.cloneRange()
    endRange.collapse(toEnd)
    endRange.insertNode(end)

    removeBogusText(end)
  }

  sel.removeAllRanges()
  sel.addRange(range)
}

/**
 * Selection.restore() restore the selection from previously placed
 * markers. By default removes the markers; they will be kept if
 * keepMarkers is true.
 *
 * @param {Boolean} keepMarkers
 */
Selection.prototype.restore = function (keepMarkers) {
  var markers = this.getMarkers(),
      range = document.createRange(),
      backwards

  if (!markers.length) return

  range.setStartBefore(markers[0])

  if (markers.length === 1)
    range.setEndAfter(markers[0])
  else range.setEndAfter(markers[1])

  // The markers will be in document order.
  backwards = markers[0].classList.contains('end')

  if (!keepMarkers)
    this.removeMarkers()

  this.selectRange(range, backwards)
}

/**
 * Selection.getContaining() gets the immediate child of the editor
 * element that contains the selection anchor.
 *
 * @return Element || false
 */
Selection.prototype.getContaining = function () {
  var sel = window.getSelection(),
      node = sel.anchorNode,
      range,
      elem

  if (!sel.rangeCount) return false

  elem = this.node.getContaining(node)
  if (elem) return elem

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
 * @param {RegExp} matcher
 * @return Node || false
 */
Selection.prototype.childOf = function (matcher) {
  var sel = window.getSelection(),
      node

  // Don't search if not given a matcher or nothing selected.
  if (!matcher || !sel.rangeCount) return false

  node = sel.getRangeAt(0).commonAncestorContainer

  return this.node.childOf(node, matcher)
}

/**
 * Selection.forEachBlock(action) perform an action on each top-
 * level block element in the selection. In lists, it instead
 * performs the action on each <li>.
 *
 * @param {Function} action
 */
Selection.prototype.forEachBlock = function (action) {
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
  start = this.node.getContaining(range.startContainer)
  end = this.node.getContaining(range.endContainer)

  // If either the start or end are lists, we instead get the list
  // item in which the start/end is.
  if (listRegex.test(start.nodeName))
    start = this.node.childOf(range.startContainer, liRegex)
  if (listRegex.test(end.nodeName))
    end = this.node.childOf(range.endContainer, liRegex)

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

/**
 * Selection.isNewLine() determines if the containing element is a
 * new line (only applies in rich mode).
 *
 * @return Boolean
 */
Selection.prototype.isNewLine = function () {
  var sel = window.getSelection(),
      elem = this.getContaining()

  return elem && sel.isCollapsed &&
    (!elem.textContent || !!elem.querySelector('.Compose-placeholder'))
}

/**
 * Selection.at(pos, elem) determines if the caret is at the start or
 * the end of an element.
 *
 * @param {String} pos
 * @param {Node} elem
 * @return Boolean
 */
Selection.prototype.at = function (pos, elem) {
  var sel = window.getSelection(),
      range,
      text

  if (!sel.rangeCount || !sel.isCollapsed) return false

  range = sel.getRangeAt(0).cloneRange()

  if (pos === 'end')
    range.setEndAfter(elem)
  else
    range.setStartBefore(elem)

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
  var range = document.createRange()

  range.selectNodeContents(node)
  range.collapse(!atEnd)
  this.selectRange(range)
}

Selection.prototype.destroy = function () {
  this.sanitizer.removeFilter('span', markerFilter)

  delete this.elem
  delete this.node
  delete this.sanitizer

  return null
}

Selection.plugin = 'selection'

module.exports = Selection
