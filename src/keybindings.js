'use strict'

export default function keyBindings (editor) {
  const enter = editor.require('enter')
  const backspace = editor.require('backspace')
  const spacebar = editor.require('spacebar')
  const copy = editor.require('copy')

  editor.on('keydown', function (e) {
    if (e.keyCode === 13) {
      e.preventDefault()

      if (e.shiftKey) {
        enter.newline()
      } else {
        enter.newParagraph()
      }
    } else if (e.keyCode === 8) {
      e.preventDefault()
      backspace.backspace()
    } else if (e.keyCode === 46) {
      e.preventDefault()
      backspace.forwardDelete()
    } else if (e.keyCode === 32) {
      e.preventDefault()
      spacebar.auto()
    }
  })

  function copyHandler (e) {
    e.preventDefault()

    let html = copy.copyHTML()
    let text = copy.copyText()

    e.clipboardData.clearData()
    e.clipboardData.setData('text/html', html)
    e.clipboardData.setData('text/plain', text)

    if (e.type === 'cut') {
      backspace.removeSelectedText()
    }
  }

  editor.on('copy', copyHandler)
  editor.on('cut', copyHandler)
}
