/* global document, define, window, Node */

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
   * Selection.getContaining() gets the direct child of the editor
   * element which the caret is in, or undefined if none exist.
   *
   * @return Element || Undefined
   */
  Selection.prototype.getContaining = function () {
    var sel = window.getSelection(),
        node = sel.anchorNode,
        parent

    // If we're in inline mode, there should be no block elements
    // in the element.
    if (this.inline) return

    while (node) {
      parent = node.parentNode
      if (parent && parent.hasAttribute && parent.hasAttribute('data-mode'))
        break

      node = parent
    }

    return node
  }

  Selection.prototype.placeMarkers = function () {
    var sel = window.getSelection(),
        start = document.createElement('em'),
        end = document.createElement('em'),
        startRange,
        endRange,
        range

    if (sel.rangeCount) {
      range = sel.getRangeAt(0)
    } else return

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

    sel.removeAllRanges()
    sel.addRange(range)
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
   * new line (blank paragraph, in rich mode, or no text content in
   * inline).
   *
   * @return Boolean
   */
  Selection.prototype.isNewLine = function () {
    var elem = this.getContaining()

    if (elem)
      return elem.nodeName === 'P' && !elem.textContent
    else return !elem.textContent
  }

  Selection.prototype.destroy = function () {
    delete this.elem

    return null
  }

  Selection.plugin = 'selection'

  return Selection
})