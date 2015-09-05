'use strict'

module.exports = Enter

/**
 * The Enter plugin provides a set of useful functions that might map
 * to the return key. They aren’t actually mapped to the return key by
 * default; this gives consumers more flexibility in defining behaviour.
 *
 * @param {Compose} Compose
 */
function Enter (Compose) {
  var Selection = Compose.require('selection')
  var Delta = Compose.require('delta')
  var View = Compose.require('view')
  var startSpace = /^[^\S\r\n\v\f]/
  var endSpace = /[^\S\r\n\v\f]$/
  var nbsp = '\u00A0'

  /**
   * newline() inserts a newline. If inserting a newline would result
   * in two adjacent newlines, those newlines are replace by a more
   * semantic paragraph break.
   */
  function newline () {
    var sel = View.selection.clone()
    var startPair
    var endPair
    var start
    var end

    startPair = sel.absoluteStart
    endPair = sel.absoluteEnd

    start = View.paragraphs[startPair[0]]
    end = View.paragraphs[endPair[0]]

    // Replace double newlines with a new paragraph. In most cases,
    // double newlines is probably not what people want; a new paragraph
    // looks the same and is more semantic.
    if (start.text[startPair[1] - 1] === '\n') {
      startPair[1] -= 1
      View.selection = sel
      return newParagraph()
    } else if (endPair[1] < end.length - 1 && end.text[endPair[1]] === '\n') {
      endPair[1] += 1
      View.selection = sel
      return newParagraph()
    }

    start = start
      .substr(0, startPair[1])
      .replace(endSpace, nbsp)

    end = end
      .substr(endPair[1])
      .replace(startSpace, nbsp)

    if (!end.text) {
      end.text = '\n'
    }

    // += is used to add the newline rather than append, because markups
    // probably shouldn’t be extended across newlines.
    start.text += '\n'
    start = start.append(end)

    View.resolve(new Delta('paragraphUpdate', startPair[0], start))
    for (var i = startPair[0] + 1; i <= endPair[0]; i += 1) {
      if (View.isSectionStart(startPair[0] + 1)) {
        View.resolve(new Delta('sectionDelete', startPair[0] + 1))
      }

      View.resolve(new Delta('paragraphDelete', startPair[0] + 1))
    }

    View.selection = new Selection([startPair[0], startPair[1] + 1])
  }

  /**
   * newParagraph() creates a new paragraph.
   */
  function newParagraph () {
    var sel = View.selection.clone()
    var startPair
    var endPair
    var start
    var end

    startPair = sel.absoluteStart
    endPair = sel.absoluteEnd

    start = View.paragraphs[startPair[0]]
    start = start
      .substr(0, startPair[1])
      .replace(endSpace, nbsp)

    if (!start.text || start.text[start.length - 1] === '\n') {
      start.text += '\n'
    }

    end = View.paragraphs[endPair[0]]
    end = end
      .substr(endPair[1])
      .replace(startSpace, nbsp)

    if (!end.text || end.text === '\n') {
      end.type = start.type
      end.text = '\n'
    }

    View.resolve(new Delta('paragraphUpdate', startPair[0], start))

    for (var i = startPair[0] + 1; i <= endPair[0]; i += 1) {
      if (View.isSectionStart(startPair[0] + 1)) {
        View.resolve(new Delta('sectionDelete', startPair[0] + 1))
      }

      View.resolve(new Delta('paragraphDelete', startPair[0] + 1))
    }

    View.resolve(new Delta('paragraphInsert', startPair[0] + 1, end))
    View.selection = new Selection([startPair[0] + 1, 0])
  }

  /**
   * newSection() creates a new section by first creating a new
   * paragraph, then creating a section starting at the inserted
   * paragraph.
   */
  function newSection () {
    newParagraph()

    var sel = View.selection
    View.resolve(new Delta('sectionInsert', sel.start[0], {
      start: sel.start[0]
    }))
  }

  Compose.provide('enter', {
    newline: newline,
    newParagraph: newParagraph,
    newSection: newSection
  })
}
