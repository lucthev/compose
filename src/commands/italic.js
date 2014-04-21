define(function () {

  function ItalicPlugin (Quill) {

    function Italic () {
      document.execCommand('italic', false, null)
    }

    Italic.getState = function () {

      // The check for <i> tags is necessary when querying immediately
      // after calling italic(), because of tag conversion.
      return !!Quill.selection.childOf(/^EM|I$/i)
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

        if (name === 'i') {
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