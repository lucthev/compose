'use strict';

/**
 * italicFilter() is a filter for Quill's sanitizer that turns <i>
 * tags into <em> tags.
 */
function italicFilter (elem) {
  var em = document.createElement('em')

  while (elem.firstChild)
    em.appendChild(elem.removeChild(elem.firstChild))

  elem.parentNode.replaceChild(em, elem)
}

function ItalicPlugin (Quill) {

  function Italic () {
    document.execCommand('italic', false, null)
  }

  Italic.getState = function () {
    return !!Quill.selection.childOf(/^EM$/i)
  }

  Italic.isEnabled = function () {
    return document.queryCommandState('italic')
  }

  Italic.destroy = function () {
    Quill.sanitizer
      .removeElements('em')
      .removeFilter('i', italicFilter)
  }

  Quill.sanitizer
    .addElements('em')
    .addFilter('i', italicFilter)

  return Italic
}

ItalicPlugin.plugin  = 'italic'

module.exports = ItalicPlugin
