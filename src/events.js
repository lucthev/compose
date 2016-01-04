'use strict'

const events = [
  'keydown',
  'keyup',
  'keypress',
  'focus',
  'blur',
  'cut',
  'copy',
  'paste',
  'mousedown',
  'mouseup',
  'click',
  'compositionstart',
  'compositionupdate',
  'compositionend'
]

/**
 * setupEvents(editor) propagates DOM events through the editor's event
 * system.
 *
 * @param {Compose} editor
 */
export function setupEvents (editor) {
  events.forEach(function (event) {
    editor.root.addEventListener(event, (e) => editor.emit(event, e))
  })
}

export const selectionKeys = {
  8: 1,   // Backspace
  9: 1,   // Tab
  13: 1,  // Enter
  33: 1,  // Page up
  34: 1,  // Page down
  35: 1,  // End
  36: 1,  // Home
  37: 1,  // Left
  38: 1,  // Up
  39: 1,  // Right
  40: 1,  // Down
  46: 1   // Forward delete
}
