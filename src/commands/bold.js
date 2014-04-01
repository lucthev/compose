define(function () {

  // The actual plugin 'adapter'.
  function BoldPlugin (Quill) {

    function Bold () {
      document.execCommand('bold', false, null)
    }

    Bold.getState = function() {
      return document.queryCommandState('bold')
    }

    Bold.isEnabled = function () {
      return document.queryCommandEnabled('bold') && !Quill.selection.childOf(/^(?:H[1-6])$/)
    }

    return Bold
  }
  BoldPlugin.plugin = 'bold'

  return BoldPlugin
})