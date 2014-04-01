/* global define, document */

define(function () {

  function HeadingPlugin (Quill) {

    function heading (level) {
      if (!level)
        document.execCommand('formatBlock', false, '<p>')
      else
        document.execCommand('formatBlock', false, '<h' + level + '>')
    }

    heading.getState = function (level) {
      return !!Quill.selection.childOf(new RegExp('^(?:H' + level + ')$', 'i'))
    }

    // Headers disabled in lists.
    heading.isEnabled = function () {
      return !Quill.selection.childOf(/^(?:[O|U]L)$/i)
    }

    return heading
  }
  HeadingPlugin.plugin = 'heading'

  return HeadingPlugin
})