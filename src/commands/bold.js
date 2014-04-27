'use strict';

/**
 * boldFilter() is a filter for Quill's sanitizer that turns <b> tags
 * into <strong> tags.
 */
function boldFilter (elem) {
  var strong = document.createElement('strong')

  while (elem.firstChild)
    strong.appendChild(elem.removeChild(elem.firstChild))

  return { node: strong }
}

// The actual plugin 'adapter'.
function BoldPlugin (Quill) {

  function Bold () {
    document.execCommand('bold', false, null)
  }

  Bold.getState = function() {
    return !!Quill.selection.childOf(/^STRONG$/i)
  }

  Bold.isEnabled = function () {
    return document.queryCommandEnabled('bold') && !Quill.selection.childOf(/^(?:H[1-6])$/)
  }

  Bold.destroy = function () {
    Quill.sanitizer
      .removeElements('strong')
      .removeFilter('b', boldFilter)
  }

  Quill.sanitizer
    .addElements('strong')
    .addFilter('b', boldFilter)

  return Bold
}
BoldPlugin.plugin = 'bold'

module.exports = BoldPlugin
