'use strict'

export default function keyBindings (editor) {
  const enter = editor.require('enter')

  editor.on('keydown', function (e) {
    if (e.keyCode === 13) {
      e.preventDefault()

      if (e.shiftKey) {
        enter.newline()
      } else {
        enter.newParagraph()
      }
    }
  })
}
