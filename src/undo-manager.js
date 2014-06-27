'use strict';

function UndoManager (max) {
  this.max = max || 100
  this.undoStack = []
  this.redoStack = []
}

/**
 * push(actions) pushes a set of actions onto the undo stack. actions
 * should be an object containing an array of Deltas to apply to the
 * view to undo/redo an action.
 *
 * @param {
 *   undo: [Delta],
 *   redo: [Delta]
 * }
 */
UndoManager.prototype.push = function (actions) {
  this.undoStack.push(actions)

  while (this.undoStack.length > this.max)
    this.undoStack.shift()

  if (this.redoStack.length)
    this.redoStack = []
}

/**
 * undo() returns the array of Deltas that need to be applied to the
 * view to undo the most recently pushed action.
 *
 * @return {[Delta]}
 */
UndoManager.prototype.undo = function () {
  var action

  if (!this.undoStack.length)
    return false

  action = this.undoStack.pop()
  this.redoStack.push(action)

  return action.undo
}

/**
 * redo() returns the array of Deltas that need to be applied to the
 * view to redo the most recently undone action.
 *
 * @return {[Delta]}
 */
UndoManager.prototype.redo = function () {
  var action

  if (!this.redoStack.length)
    return false

  action = this.redoStack.pop()
  this.undoStack.push(action)

  return action.redo
}

function undoPlugin (Compose) {
  Compose.provide('undo-manager', new UndoManager())
}

module.exports = undoPlugin
