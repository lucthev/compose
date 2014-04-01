define(function () {

  function Underline () {
    document.execCommand('underline', false, null)
  }

  Underline.getState = function () {
    return document.queryCommandState('underline')
  }

  Underline.isEnabled = function () {
    return document.queryCommandEnabled('underline')
  }

  function UnderlinePlugin () {
    return Underline
  }
  UnderlinePlugin.plugin = 'underline'

  return UnderlinePlugin
})