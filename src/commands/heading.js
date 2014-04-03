define(function () {

  function HeadingPlugin (Quill) {

    function heading (level) {
      level = level ? 'h' + level + '' : 'p'

      // We manually convert each paragraph into a heading; formatBlock
      // introduces weird issues.
      // (see https://github.com/lucthev/quill/issues/7)
      Quill.selection.forEachBlock(function (block) {
        var elem = document.createElement(level),
            attributes = Array.prototype.slice.call(block.attributes)

        elem.innerHTML = block.innerHTML

        // Conserve attributes.
        attributes.forEach(function (item) {
          elem.setAttribute(item.name, item.value)
        })

        block.parentNode.replaceChild(elem, block)
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