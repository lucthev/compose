'use strict';

function HeadingPlugin (Quill) {
  var allHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

  function heading (level) {
    level = level ? 'h' + level + '' : 'p'

    // Turn all list items into <p>s before changing them into
    // headings.
    // TODO: conserve attributes?
    Quill.selection.forEachBlock(function (block) {
      if (block.nodeName === 'LI')
        Quill.list.splitList(block, true)
    })

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

    Quill.emit('input')
  }

  /**
   * heading.getState( ) can be true in two cases:
   * (1) The selection is a child of a heading
   * (2) Every block item in the selection is a heading.
   */
  heading.getState = function (level) {
    var allHeading = true

    level = 'H' + level

    // Check for condition (1); we can stop if true.
    if (Quill.selection.childOf(new RegExp('^' + level + '$')))
      return true

    // Check for condition (2).
    Quill.selection.forEachBlock(function (block) {
      if (block.nodeName !== level) allHeading = false
    }, true)

    return allHeading
  }

  // FIXME: what are the conditions that allow headings?
  heading.isEnabled = function () {
    return true
  }

  heading.destroy = function () {
    Quill.sanitizer.removeElements(allHeadings)
  }

  Quill.sanitizer.addElements(allHeadings)

  return heading
}
HeadingPlugin.plugin = 'heading'

module.exports = HeadingPlugin
