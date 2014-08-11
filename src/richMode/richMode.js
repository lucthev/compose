'use strict';

var getChildren = require('./getChildren'),
    Converter = require('./converter'),
    Selection = require('../selection'),
    View = require('./view'),
    Setup = require('./setup')

function RichMode (Compose) {
  var selection,
      view

  Compose.provide('classes', {
    firstParagraph: 'paragraph-first',
    lastParagraph: 'paragraph-last',
    firstSection: 'section-first',
    lastSection: 'section-last'
  })

  Compose.use(Converter)
  Compose.use(getChildren)
  Compose.use(Selection)
  Compose.use(View)
  Compose.use(Setup)

  view = Compose.require('view')
  selection = Compose.require('selection')

  Compose.on('keydown', function () {
    var sel = selection.get()

    view.markModified(sel.isBackwards() ? sel.end[0] : sel.start[0])
  })
}

module.exports = RichMode
