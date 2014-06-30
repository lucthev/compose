/* global describe, it, expect, beforeEach, afterEach, Compose */

'use strict';

// Maximum undo/redo stack size (each).
var MAX_STACK_SIZE = 100

describe('The undo manager', function () {

  var UndoManager

  beforeEach(function () {
    this.elem = document.createElement('div')
    document.body.appendChild(this.elem)

    this.compose = new Compose(this.elem)
    this.compose.use(function (Compose) {
      UndoManager = Compose.require('undo-manager')
    })
  })

  afterEach(function () {
    document.body.removeChild(this.elem)

    try {
      this.compose.destroy()
    } catch (e) {}
  })

  it('stores saved states.', function () {

    expect(UndoManager.undo()).toBe(false)
    expect(UndoManager.redo()).toBe(false)

    UndoManager.push({
      undo: 'u' + 0,
      redo: 'r' + 0
    })

    expect(UndoManager.redo()).toBe(false)
    expect(UndoManager.undo()).toEqual('u0')
    expect(UndoManager.undo()).toBe(false)
    expect(UndoManager.redo()).toEqual('r0')
    expect(UndoManager.redo()).toBe(false)
    expect(UndoManager.undo()).toEqual('u0')
    expect(UndoManager.undo()).toBe(false)
    expect(UndoManager.redo()).toEqual('r0')
  })

  it('only stores a certain number of states.', function () {
    var i

    for (i = 0; i < MAX_STACK_SIZE + 1; i += 1) {
      UndoManager.push({
        undo: 'u' + i,
        redo: 'r' + i
      })
    }

    for (i = 0; i < MAX_STACK_SIZE - 1; i += 1)
      UndoManager.undo()

    expect(UndoManager.undo()).toEqual('u1')
    expect(UndoManager.undo()).toEqual(false)
  })

  it('wipe the redo stack when new changes are pushed.', function () {
    var i

    for (i = 0; i < 5; i += 1) {
      UndoManager.push({
        undo: 'u' + i,
        redo: 'r' + i
      })
    }

    UndoManager.undo()
    UndoManager.undo()

    UndoManager.push({
      undo: 'new-undo',
      redo: 'new-redo'
    })

    expect(UndoManager.redo()).toBe(false)
  })
})
