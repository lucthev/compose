define(function () {

  function BlockquotePlugin (Quill) {

    /**
     * blockquote(quote) creates a blockquote if quote is truthy, or
     * otherwise turns blocks into paragraphs. If quote is a string,
     * gives the blockquote taht string as className.
     *
     * @param {Boolean || String} quote
     */
    function blockquote (quote) {
      var pullQuote = typeof quote === 'string'

      Quill.selection.forEachBlock(function (elem) {
        var block = quote ? document.createElement('blockquote') :
                            document.createElement('p'),
            attributes = Array.prototype.slice.call(elem.attributes)

        attributes.forEach(function (attr) {
          block.setAttribute(attr.name, attr.value)
        })

        if (pullQuote) {

          // Remove previous class added.
          if (block.hasAttribute('data-class'))
            block.classList.remove(block.getAttribute('data-class'))

          block.classList.add(quote)
          block.setAttribute('data-class', quote)
        } else if (block.hasAttribute('data-class')) {
          block.classList.remove(block.getAttribute('data-class'))
          block.removeAttribute('data-class')

          // If there is no class leftover, we can remove the class
          // attribute as well.
          if (!block.className)
            block.removeAttribute('class')
        }

        block.innerHTML = elem.innerHTML

        elem.parentNode.replaceChild(block, elem)
      })

      if (!Quill.throttle.isTyping())
        Quill.emit('change')

      Quill.sanitizer.addElements('blockquote')
    }

    /**
     * blockquote.getState() state of the current selection with respect
     * to blockquotes. If the selection is not contained within a
     * blockquote, returns false. If the blockquote is a 'pullquote'
     * (i.e. has a class), returns the class; otherwise, returns true.
     *
     * @return String || Boolean
     */
    blockquote.getState = function () {
      var block = Quill.selection.childOf(/^blockquote$/i)

      if (!block) return false

      if (block.hasAttribute('data-class'))
        return blockquote.getAttribute('data-class')
      else return true
    }

    blockquote.isEnabled = function () {
      return !Quill.isInline()
    }

    return blockquote
  }
  BlockquotePlugin.plugin = 'blockquote'

  return BlockquotePlugin
})