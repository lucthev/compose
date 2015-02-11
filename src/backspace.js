'use strict';

module.exports = Backspace

/**
 * The Backspace modules provides a set of functions that might map to
 * backspace or forward delete keys.
 *
 * @param {Compose} Compose
 */
function Backspace (Compose) {
  var Selection = Compose.require('selection'),
      Delta = Compose.require('delta'),
      View = Compose.require('view'),
      startSpace = /^[^\S\r\n\v\f]/,
      endSpace = /[^\S\r\n\v\f]$/,
      nbsp = '\u00A0'

  /**
   * forwardDelete() performs the equivalent of a forward delete on
   * the editor.
   */
  function forwardDelete () {
    var sel = View.selection.clone(),
        startPair,
        endPair,
        end

    if (!sel.isCollapsed())
      return usingSelection(sel)

    startPair = sel.isBackwards() ? sel.end : sel.start
    endPair = sel.isBackwards() ? sel.start : sel.end
    end = View.paragraphs[endPair[0]]

    if (endPair[1] === end.length && endPair[0] < View.paragraphs.length - 1) {
      endPair[0] += 1
      endPair[1] = 0
    } else if (endPair[1] < end.length) {
      endPair[1] += 1
    }

    usingSelection(new Selection(startPair, endPair))
  }

  /**
   * backspace() performs the equivalent of a backspace on the editor.
   */
  function backspace () {
    var sel = View.selection.clone(),
        startPair,
        endPair,
        start

    if (!sel.isCollapsed())
      return usingSelection(sel)

    startPair = sel.isBackwards() ? sel.end : sel.start
    endPair = sel.isBackwards() ? sel.start : sel.end

    if (endPair[1] === 0 && endPair[0] > 0) {
      startPair[0] -= 1
      start = View.paragraphs[startPair[0]]

      // Place the cursor behind a potential trailing newline; this also
      // accounts for the case that the previous paragraph ends in a double
      // newline.
      if (start.text[start.length - 1] === '\n')
        startPair[1] = start.length - 1
      else
        startPair[1] = start.length
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
    var startPair,
        endPair,
        start,
        end,
        i

    sel = sel || View.selection.clone()
    if (sel.isCollapsed())
      return

    startPair = sel.isBackwards() ? sel.end : sel.start
    endPair = sel.isBackwards() ? sel.start : sel.end

    start = View.paragraphs[startPair[0]].substr(0, startPair[1])
    end = View.paragraphs[endPair[0]].substr(endPair[1])

    // If appending start and end would result in two adjacent spaces,
    // remove one of them. If one of the spaces is “exotic” (not a
    // regular space, not a non-breaking space), keep that one.
    if (endSpace.test(start.text) && startSpace.test(end.text)) {
      if (/[ \u00A0]$/.test(start.text))
        start = start.substr(0, start.length - 1)
      else
        end = end.substr(1)
    }

    start = start
      .append(end)
      .replace(startSpace, nbsp)
      .replace(endSpace, nbsp)

    if (!start.text)
      start.text = '\n'

    View.resolve(new Delta('paragraphUpdate', startPair[0], start))
    for (i = startPair[0] + 1; i <= endPair[0]; i += 1) {
      if (View.isSectionStart(i))
        View.resolve(new Delta('sectionDelete', startPair[0] + 1))

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
