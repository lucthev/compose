'use strict';

function PrePlugin (Compose) {

  /**
   * pre() formats a block-level element as a <pre> element if 'toPre'
   * is true; otherwise, formats it as a <p>.
   *
   * @param {Boolean} toPre
   */
  function pre (toPre) {
    var elem = toPre ? 'pre' : 'p'

    Compose.selection.save()

    // Turn all list items into <p>s before changing them into <pre>s.
    // TODO: conserve attributes?
    Compose.selection.forEachBlock(function (block) {
      if (block.nodeName === 'LI')
        Compose.list.splitList(block)
    })

    // We have to restore the selection in between, otherwise the
    // selection gets weird and the second forEachBlock does nothing.
    Compose.selection.restore(true)

    // Convert block elements to <pre>s.
    Compose.selection.forEachBlock(function (block) {
      var pre = document.createElement(elem),
          attributes = Array.prototype.slice.call(block.attributes)

      while (block.firstChild)
        pre.appendChild(block.removeChild(block.firstChild))

      attributes.forEach(function (item) {
        pre.setAttribute(item.name, item.value)
      })

      block.parentNode.replaceChild(pre, block)
    })

    Compose.selection.restore()

    Compose.emit('input')
  }

  /**
   * pre.getState( ) can be true in two cases:
   * (1) The selection is the child of a <pre>
   * (2) Every block item in the selection is a <pre>.
   */
  pre.getState = function () {
    var allPre = true

    // Check condition (1).
    if (Compose.selection.childOf('pre'))
      return true

    // Check condition (2).
    Compose.selection.forEachBlock(function (block) {
      allPre = allPre && block.nodeName === 'PRE'
    })

    return allPre
  }

  /**
   * pre.isEnabled( ) determines if the pre command can be successfully
   * executed under the current conditions.
   */
  // FIXME: what are the conditions that allow <pre>s?
  pre.isEnabled = function () {
    return true
  }

  pre.destroy = function () {
    Compose.sanitizer.removeElements('pre')
  }

  Compose.sanitizer.addElements('pre')

  return pre
}

PrePlugin.plugin = 'pre'

module.exports = PrePlugin
