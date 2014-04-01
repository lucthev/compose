define(function () {

  function Italic () {
    document.execCommand('italic', false, null)
  }

  Italic.getState = function () {
    return document.queryCommandState('italic')
  }

  Italic.isEnabled = function () {
    return document.queryCommandState('italic')
  }

  function ItalicPlugin () {
    return Italic
  }

  ItalicPlugin.plugin  = 'italic'

  return ItalicPlugin
})