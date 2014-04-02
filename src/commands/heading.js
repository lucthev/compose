define(function () {

  function HeadingPlugin (Quill) {

    function heading (level) {
      level = level ? '<h' + level + '>' : '<p>'

      Quill.selection.forEachBlock(function (block) {
        Quill.selection.placeCaret(block)
        document.execCommand('formatBlock', false, level)
      })
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