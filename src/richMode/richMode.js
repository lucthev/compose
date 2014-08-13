'use strict';

var getChildren = require('./getChildren'),
    Converter = require('./converter'),
    SelectionPlugin = require('../selection'),
    Backspace = require('./backspace'),
    ViewPlugin = require('./view'),
    Setup = require('./setup'),
    Enter = require('./enterKey')

function RichMode (Compose) {
  var events = Compose.require('events'),
      Selection,
      View

  Compose.provide('classes', {
    firstParagraph: 'paragraph-first',
    lastParagraph: 'paragraph-last',
    firstSection: 'section-first',
    lastSection: 'section-last'
  })

  Compose.use(Converter)
  Compose.use(getChildren)
  Compose.use(SelectionPlugin)
  Compose.use(ViewPlugin)
  Compose.use(Setup)

  Compose.use(Enter)
  Compose.use(Backspace)

  View = Compose.require('view')
  Selection = Compose.require('selection')

  Compose.on('keydown', function (e) {
    var sel = Selection.get(),
        end,
        len

    if (!events.selectall(e)) {
      View.markModified(sel.isBackwards() ? sel.end[0] : sel.start[0])
      return
    }

    e.preventDefault()
    View.sync()

    len = View.paragraphs.length - 1
    end = View.paragraphs[len]

    if (/\n$/.test(end.text))
      sel = new Selection([0, 0], [len, end.length - 1])
    else
      sel = new Selection([0, 0], [len, end.length])

    Selection.restore(sel)
  })
}

module.exports = RichMode
