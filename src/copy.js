'use strict'

module.exports = Copy

var dom = require('./dom')

function Copy (Compose) {
  var View = Compose.require('view')

  /**
   * html(sel) gets the currently selected text as a string of HTML.
   * Sections are not included.
   *
   * @param {Selection} sel
   * @return {String}
   */
  function html (sel) {
    var container = dom.create('section')
    var selected
    var previous
    var current
    var handler
    var i

    if (sel.isCollapsed()) {
      return ''
    }

    selected = getParagraphs(View, sel)

    for (i = 0; i < selected.length; i += 1) {
      if (/.\n$/.test(selected[i].text)) {
        selected[i] = selected[i].substr(0, selected[i].length - 1)
      }

      handler = View.handlerForParagraph(selected[i])
      current = handler.deserialize(selected[i].substr(0))

      container.appendChild(dom._joinElements(current))

      if (!previous) {
        previous = current[current.length - 1]
        continue
      }

      current = current[current.length - 1]
      dom._merge(previous, current)
      previous = current
    }

    return container.innerHTML
  }

  /**
   * text(sel) gets the currently selected text as a string of plain
   * text.
   *
   * @param {Selection} sel
   * @return {String}
   */
  function text (sel) {
    if (sel.isCollapsed()) {
      return ''
    }

    var selected = getParagraphs(View, sel)

    // TODO(luc): should Windows get \r\n\r\n?
    return selected.map(function (paragraph) {
      if (/.\n$/.test(paragraph.text)) {
        paragraph = paragraph.substr(0, paragraph.length - 1)
      }

      return paragraph.text || '\n'
    }).join('\n\n')
  }

  Compose.provide('copy', {
    html: html,
    text: text
  })
}

/**
 * getParagraphs(View, sel) returns an array of paragraphs partially or
 * fully selected by the given selection.
 *
 * @param {View} View
 * @param {Selection} sel
 * @return {Array}
 */
function getParagraphs (View, sel) {
  var startPair = sel.isBackwards() ? sel.end : sel.start
  var endPair = sel.isBackwards() ? sel.start : sel.end
  var selected
  var last

  selected = View.paragraphs.slice(startPair[0], endPair[0] + 1)
  last = selected.length - 1

  if (selected.length === 1) {
    selected[0] = selected[0].substring(startPair[1], endPair[1])
  } else if (selected.length) {
    selected[0] = selected[0].substr(startPair[1])
    selected[last] = selected[last].substr(0, endPair[1])
  }

  return selected
}
