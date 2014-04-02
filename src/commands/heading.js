define(function () {

  function HeadingPlugin (Quill) {

    function heading (level) {
      var multi = Quill.selection.hasMultiParagraphs(),
          start,
          end

      level = level ? '<h' + level + '>' : '<p>'

      if (multi) {
        console.log(multi)
        Quill.selection.placeMarkers()

        start = Quill.selection.getContaining()
        end = Quill.selection.getContaining(true)

        // We'll cycle through all affected nodes and format them
        // one by one.
        while (1) {
          Quill.selection.placeCaret(start)
          document.execCommand('formatBlock', false, level)

          if (start === end) break

          start = Quill.selection.getContaining()
          start = multi > 0 ? start.nextSibling : start.previousSibling
        }

        Quill.selection.selectMarkers()
      } else
        document.execCommand('formatBlock', false, level)
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