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

        // Conserve attributes.
        attributes.forEach(function (attr) {
          block.setAttribute(attr.name, attr.value)
        })

        if (pullQuote)
          block.className = quote
        else
          block.removeAttribute('class')

        block.innerHTML = elem.innerHTML

        elem.parentNode.replaceChild(block, elem)
      })

      Quill.emit('input')
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

      return block.className ? block.className : true
    }

    blockquote.isEnabled = function () {
      return !Quill.isInline()
    }

    Quill.sanitizer.addElements('blockquote')
    Quill.sanitizer.addAttributes({
      blockquote: ['class']
    })

    return blockquote
  }
  BlockquotePlugin.plugin = 'blockquote'

  return BlockquotePlugin
})