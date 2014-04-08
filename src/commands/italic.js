define(function () {

  function ItalicPlugin (Quill) {

    /**
     * toItalic() converts <em> tags in the selection to <i> tags.
     */
    function toItalic () {
      Quill.selection.forEachBlock(function (block) {
        var ems = block.getElementsByTagName('em')
        ems = Array.prototype.slice.call(ems)

        ems.forEach(function (em) {
          var i = document.createElement('i')

          i.innerHTML = em.innerHTML

          em.parentNode.replaceChild(i, em)
        })
      })
    }

    /**
     * toEm() converts <i> tags in the selection to <em> tags.
     */
    function toEm () {
      Quill.selection.forEachBlock(function (block) {
        var is = block.getElementsByTagName('i')
        is = Array.prototype.slice.call(is)

        is.forEach(function (i) {
          var em = document.createElement('em')

          em.innerHTML = i.innerHTML

          i.parentNode.replaceChild(em, i)
        })
      })
    }

    function Italic () {
      toItalic()
      document.execCommand('italic', false, null)
      toEm()
    }

    Italic.getState = function () {
      return document.queryCommandState('italic')
    }

    Italic.isEnabled = function () {
      return document.queryCommandState('italic')
    }

    Quill.sanitizer
      .addElements('em')
      .addFilter(function (params) {
        var node = params.node,
            name = params.node_name,
            em

        if (name === 'b') {
          em = document.createElement('em')
          em.innerHTML = node.innerHTML

          return { node: em }
        } else return null
      })

    return Italic
  }

  ItalicPlugin.plugin  = 'italic'

  return ItalicPlugin
})