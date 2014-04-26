function boldFilter (params) {
  var node = params.node,
      name = params.node_name,
      strong

  if (name === 'b') {
    strong = document.createElement('strong')
    strong.innerHTML = node.innerHTML

    return { node: strong }
  } else return null
}

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

  Bold.destroy = function () {
    Quill.sanitizer
      .removeElements('strong')
      .removeFilter(boldFilter)
  }

  Quill.sanitizer
    .addElements('strong')
    .addFilter(boldFilter)

  return Bold
}
BoldPlugin.plugin = 'bold'

module.exports = BoldPlugin
