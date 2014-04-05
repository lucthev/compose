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

define(function () {

  function Selection (Quill) {
    this.elem = Quill.elem
    this.inline = Quill.isInline()
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
    var sel = window.getSelection()
    node = node || sel.anchorNode

    if (!sel.rangeCount || this.inline) return false

    while (node) {
      if (node.parentNode === this.elem)
        return node
      else node = node.parentNode
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

    // Don't search if not given a matcher, inline, or nothing selected.
    if (!matcher || this.inline || !sel.rangeCount) return false

    node = sel.getRangeAt(0).commonAncestorContainer

    while (node && node !== this.elem) {
      if (node.nodeName.match(matcher))
        return node
      else node = node.parentNode
    }

    return false
  }

  /**
   * Selection.forEachBlock(action) perform an action on each top-
   * level block element in the selection.
   *
   * @param {Function} action
   */
  Selection.prototype.forEachBlock = function (action) {
    var sel = window.getSelection(),
        started,
        ended,
        range,
        start,
        end,
        i

    if (!sel.rangeCount || this.inline) return

    range = sel.getRangeAt(0)
    start = this.getContaining(range.startContainer)
    end = this.getContaining(range.endContainer)

    // Save the selection.
    this.placeMarkers()

    for (i = 0; i < this.elem.children.length; i += 1) {

      if (!started && this.elem.children[i] === start)
        started = true

      if (this.elem.children[i] === end)
        ended = true

      if (started && this.elem.children[i].isContentEditable)
        action(this.elem.children[i])

      if (ended) break
    }

    // Restore selection.
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
        start = document.createElement('em'),
        end = document.createElement('em'),
        startRange,
        endRange,
        range

    if (!sel.rangeCount) return

    range = sel.getRangeAt(0)

    start.classList.add('Quill-marker')
    end.classList.add('Quill-marker')

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
      marker.parentNode.removeChild(marker)
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

  return Selection
})