'use strict'

export default function keyBindings (editor) {
  const enter = editor.require('enter')
  const backspace = editor.require('backspace')
  const spacebar = editor.require('spacebar')

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
}
