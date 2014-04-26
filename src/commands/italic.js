'use strict';

function italicFilter (params) {
  var node = params.node,
      name = params.node_name,
      em

  if (name === 'i') {
    em = document.createElement('em')
    em.innerHTML = node.innerHTML

    return { node: em }
  } else return null
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
      .removeFilter(italicFilter)
  }

  Quill.sanitizer
    .addElements('em')
    .addFilter(italicFilter)

  return Italic
}

ItalicPlugin.plugin  = 'italic'

module.exports = ItalicPlugin
