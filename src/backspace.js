'use strict'

module.exports = Backspace

/**
 * The Backspace module provides a set of functions that might map to
 * backspace or forward delete keys.
 *
 * @param {Compose} Compose
 */
function Backspace (Compose) {
  var Selection = Compose.require('selection')
  var Delta = Compose.require('delta')
  var View = Compose.require('view')
  var startSpace = /^[^\S\r\n\v\f]/
  var endSpace = /[^\S\r\n\v\f]$/
  var nbsp = '\u00A0'

  /**
   * forwardDelete() performs the equivalent of a forward delete on
   * the editor.
   */
  function forwardDelete () {
    var sel = View.selection.clone()
    var startPair
    var endPair
    var end

    if (!sel.isCollapsed()) {
      return usingSelection(sel)
    }

    startPair = sel.absoluteStart()
    endPair = sel.absoluteEnd()
    end = View.paragraphs[endPair[0]]

    var atEnd = isAtEnd(endPair[1], end)
    if (atEnd && View.isSectionStart(endPair[0] + 1)) {
      View.resolve(new Delta('sectionDelete', endPair[0] + 1))
      return
    }

    if (atEnd && endPair[0] < View.paragraphs.length - 1) {
      endPair[0] += 1
      endPair[1] = 0
    } else if (!atEnd) {
      endPair[1] += 1
    }

    usingSelection(new Selection(startPair, endPair))
  }

  function isAtEnd (index, p) {
    return (
      index === p.length ||
      (index === p.length - 1 && /\n$/.test(p.text))
    )
  }

  /**
   * backspace() performs the equivalent of a backspace on the editor.
   */
  function backspace () {
    var sel = View.selection.clone()
    var startPair
    var endPair
    var start

    if (!sel.isCollapsed()) {
      return usingSelection(sel)
    }

    startPair = sel.absoluteStart()
    endPair = sel.absoluteEnd()

    var isAtStart = endPair[1] === 0 && endPair[0] > 0
    if (isAtStart && View.isSectionStart(endPair[0])) {
      View.resolve(new Delta('sectionDelete', endPair[0]))
      return
    }

    if (isAtStart) {
      startPair[0] -= 1
      start = View.paragraphs[startPair[0]]

      // Place the cursor behind a potential trailing newline; this also
      // accounts for the case that the previous paragraph ends in a double
      // newline.
      if (start.text[start.length - 1] === '\n') {
        startPair[1] = start.length - 1
      } else {
        startPair[1] = start.length
      }
    } else if (endPair[1] > 0) {
      startPair[1] -= 1
    }

    usingSelection(new Selection(startPair, endPair))
  }

  /**
   * usingSelection([sel]) removes the text represented by the given selection.
   * If no selection is given, the current selection is used instead. Sets the
   * View’s selection to the start of the given selection.
   *
   * @param {Selection} sel
   */
  function usingSelection (sel) {
    var startPair
    var endPair
    var start
    var end

    sel = sel || View.selection.clone()
    if (sel.isCollapsed()) {
      return
    }

    startPair = sel.absoluteStart()
    endPair = sel.absoluteEnd()

    start = View.paragraphs[startPair[0]].substr(0, startPair[1])
    end = View.paragraphs[endPair[0]].substr(endPair[1])

    // If appending start and end would result in two adjacent spaces,
    // remove one of them. If one of the spaces is “exotic” (not a
    // regular space, not a non-breaking space), keep that one.
    if (endSpace.test(start.text) && startSpace.test(end.text)) {
      if (/[ \u00A0]$/.test(start.text)) {
        start = start.substr(0, start.length - 1)
      } else {
        end = end.substr(1)
      }
    } else if (start.text[start.length - 1] === '\n' && !end.text) {
      end.text = '\n'
    } else if (start.text[start.length - 1] !== '\n' && end.text === '\n') {
      end = end.substr(1)
    }

    start = start
      .append(end)
      .replace(startSpace, nbsp)
      .replace(endSpace, nbsp)

    if (!start.text) {
      start.text = '\n'
    }

    View.resolve(new Delta('paragraphUpdate', startPair[0], start))
    for (var i = startPair[0] + 1; i <= endPair[0]; i += 1) {
      if (View.isSectionStart(startPair[0] + 1)) {
        View.resolve(new Delta('sectionDelete', startPair[0] + 1))
      }

      View.resolve(new Delta('paragraphDelete', startPair[0] + 1))
    }

    View.selection = new Selection(startPair.slice())
  }

  Compose.provide('backspace', {
    forwardDelete: forwardDelete,
    backspace: backspace,
    usingSelection: usingSelection
  })
}
