'use strict';

function BlockquotePlugin (Compose) {

  /**
   * blockquote(quote) creates a blockquote if quote is truthy, or
   * otherwise turns blocks into paragraphs. If quote is a string,
   * gives the blockquote that string as a class.
   *
   * @param {Boolean || String} quote
   */
  function blockquote (quote) {
    var pullQuote = typeof quote === 'string'

    Compose.selection.save()

    // Convert <li>s to <p>s.
    Compose.selection.forEachBlock(function (block) {
      if (block.nodeName === 'LI')
        Compose.list.splitList(block)
    })

    // We have to restore the selection in between, otherwise the
    // selection gets weird and the second forEachBlock does nothing.
    Compose.selection.restore(true)

    Compose.selection.forEachBlock(function (elem) {
      var block = quote ? document.createElement('blockquote') :
                          document.createElement('p'),
          attributes = Array.prototype.slice.call(elem.attributes)

      // Conserve attributes.
      attributes.forEach(function (attr) {
        block.setAttribute(attr.name, attr.value)
      })

      if (pullQuote)
        block.className = quote
      else
        block.removeAttribute('class')

      while (elem.firstChild)
        block.appendChild(elem.removeChild(elem.firstChild))

      elem.parentNode.replaceChild(block, elem)
    })

    Compose.selection.restore()

    Compose.emit('input')
  }

  /**
   * blockquote.getState() state of the current selection with respect
   * to blockquotes. Possibilities:
   * (1) The selection is the child of a blockquote. Returns the class
   *     of that blockquote, if it has one, or true.
   * (2) All element in the selection are pullquotes (blockquotes with
   *     classes). Returns the class
   * (3) All elements in the selection are normal blockquotes (i.e.) no
   *     class. Returns true.
   * (4) None of the above. Return false.
   *
   * @return String || Boolean
   */
  blockquote.getState = function () {
    var block = Compose.selection.childOf(/^blockquote$/i),
        allBlock = true,
        allPull = true

    // Check for condition (1).
    if (block)
      return block.className ? block.className : true

    // Check for other conditions.
    Compose.selection.forEachBlock(function (block) {

      if (block.nodeName !== 'BLOCKQUOTE') {
        allBlock = allPull = false
      } else if (!block.className) allPull = false

    })

    // If all element were pullquotes, return the class.
    if (allPull) return Compose.selection.getContaining().className

    return allBlock
  }

  // FIXME: what are actually the conditions that allow blockquotes?
  blockquote.isEnabled = function () {
    return true
  }

  blockquote.destroy = function () {
    Compose.sanitizer
      .removeElements('blockquote')
      .removeAttributes({
        blockquote: ['class']
      })
  }

  Compose.sanitizer
    .addElements('blockquote')
    .addAttributes({
      blockquote: ['class']
    })

  return blockquote
}
BlockquotePlugin.plugin = 'blockquote'

module.exports = BlockquotePlugin
