'use strict';

var getChildren = require('./getChildren'),
    Converter = require('./converter'),
    Selection = require('../selection'),
    View = require('./view'),
    Setup = require('./setup')

function RichMode (Compose) {
  Compose.provide('classes', {
    firstParagraph: 'paragraph-first',
    lastParagraph: 'paragraph-last'
  })

  Compose.use(Converter)
  Compose.use(getChildren)
  Compose.use(Selection)
  Compose.use(View)
  Compose.use(Setup)
}

module.exports = RichMode
