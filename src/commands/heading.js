'use strict';

function HeadingPlugin (Compose) {
  var allHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

  /**
   * heading(level) creates a heading of the given level.
   *
   * @param {Number} level
   */
  function heading (level) {
    level = level ? 'h' + level + '' : 'p'

    Compose.selection.save()

    // Turn all list items into <p>s before changing them into
    // headings.
    // TODO: conserve attributes?
    Compose.selection.forEachBlock(function (block) {
      if (block.nodeName === 'LI')
        Compose.list.splitList(block)
    })

    // We have to restore the selection in between, otherwise the
    // selection gets weird and the second forEachBlock does nothing.
    Compose.selection.restore(true)

    // We manually convert each paragraph into a heading; formatBlock
    // introduces weird issues.
    // (see https://github.com/lucthev/Compose/issues/7)
    Compose.selection.forEachBlock(function (block) {
      var elem = document.createElement(level),
          attributes = Array.prototype.slice.call(block.attributes)

      while (block.firstChild)
        elem.appendChild(block.removeChild(block.firstChild))

      // Conserve attributes.
      attributes.forEach(function (item) {
        elem.setAttribute(item.name, item.value)
      })

      block.parentNode.replaceChild(elem, block)
    })

    Compose.selection.restore()

    Compose.emit('input')
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
    if (Compose.selection.childOf(level))
      return true

    // Check for condition (2).
    Compose.selection.forEachBlock(function (block) {
      if (block.nodeName !== level) allHeading = false
    })

    return allHeading
  }

  /**
   * heading.isEnabled( ) determines if the pre command can be successfully
   * executed under the current conditions.
   *
   * FIXME: what are the conditions that allow headings?
   */
  heading.isEnabled = function () {
    return true
  }

  heading.destroy = function () {
    Compose.sanitizer.removeElements(allHeadings)
  }

  Compose.sanitizer.addElements(allHeadings)

  return heading
}

HeadingPlugin.plugin = 'heading'

module.exports = HeadingPlugin
