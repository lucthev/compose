define(function () {

  // The actual plugin 'adapter'.
  function BoldPlugin (Quill) {

    function Bold () {
      document.execCommand('bold', false, null)
    }

    Bold.getState = function() {
      return !!Quill.selection.childOf(/^STRONG$/i)
    }

    Bold.isEnabled = function () {
      return document.queryCommandEnabled('bold') && !Quill.selection.childOf(/^(?:H[1-6])$/)
    }

    Quill.sanitizer
      .addElements('strong')
      .addFilter(function (params) {
        var node = params.node,
            name = params.node_name,
            strong

        if (name === 'b') {
          strong = document.createElement('strong')
          strong.innerHTML = node.innerHTML

          return { node: strong }
        } else return null
      })

    return Bold
  }
  BoldPlugin.plugin = 'bold'

  return BoldPlugin
})