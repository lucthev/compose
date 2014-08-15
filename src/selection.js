'use strict';

var Choice = require('choice')

/**
 * A module that fires a 'selectionchange' event on Compose. The event
 * this module fires is NOT the same as the native selectionchange event
 * which some browser have implemented. The new selection, an instance
 * of Choice.Selection, is passed to listeners as a first parameter;
 * the old selection is passed as a second parameter. Note that the
 * second parameter is not guaranteed to be an instance of Choice.Selection;
 * in the case the editor was previously blurred, it will be false.
 *
 * NOTE: although this module is not specific to any mode, is does
 * require the 'getChildren' function of those modes. It should not
 * be 'used' by Compose itself but by the modes.
 *
 * Module overview:
 * @require {setImmediate, getChildren}
 * @listen {mouseup, focus, blur, keydown}
 * @emit {selectionchange}
 */
function SelectionPlugin (Compose) {
  var setImmediate = Compose.require('setImmediate'),
      getChildren = Compose.require('getChildren'),
      choice = new Choice(Compose.elem, getChildren),
      events = Compose.require('events'),
      Selection = Choice.Selection,
      current = false

  function compare (sel) {
    sel = sel || choice.getSelection()

    if (!sel || sel.equals(current)) return

    Compose.emit('selectionchange', sel, current)
    current = sel
  }

  function setup () {
    Compose.on('keydown', function (e) {
      setImmediate(function () {
        var sel = choice.getSelection()

        // “Normalize” the selection, if necessary.
        if (sel && events.selectKey(e))
          Selection.set(sel)

        compare(sel)
      })
    })

    Compose.on('mouseup', function () {
      setImmediate(compare)
    })

    Compose.on('focus', function () {
      setImmediate(function () {
        var sel = choice.getSelection()

        Selection.set(sel)
        compare(sel)
      })
    })

    // NOTE: the selectionchange event is not fired on blur.
    Compose.on('blur', function () {
      current = false
    })
  }

  Selection.set = choice.restore.bind(choice)
  Selection.get = function () {
    return current
  }

  Compose.once('ready', setup)
  Compose.provide('selection', Selection)
}

module.exports = SelectionPlugin
