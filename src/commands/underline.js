function UnderlinePlugin (Quill) {

  function Underline () {
    document.execCommand('underline', false, null)
  }

  Underline.getState = function () {
    return document.queryCommandState('underline')
  }

  Underline.isEnabled = function () {
    return document.queryCommandEnabled('underline')
  }

  Underline.destroy = function () {
    Quill.sanitizer.removeElements('u')
  }

  Quill.sanitizer.addElements('u')

  return Underline
}
UnderlinePlugin.plugin = 'underline'

module.exports = UnderlinePlugin
