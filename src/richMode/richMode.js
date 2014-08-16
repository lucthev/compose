'use strict';

var getChildren = require('./getChildren'),
    Converter = require('./converter'),
    SelectionPlugin = require('../selection'),
    Shortcuts = require('./shortcuts'),
    Backspace = require('./backspace'),
    formatInline = require('./formatInline'),
    formatBlock = require('./formatBlock'),
    SmartText = require('./smartText'),
    Spacebar = require('./spacebar'),
    ViewPlugin = require('./view'),
    Setup = require('./setup'),
    Enter = require('./enterKey')

function RichMode (Compose) {
  Compose.provide('classes', {
    firstParagraph: 'paragraph-first',
    lastParagraph: 'paragraph-last',
    firstSection: 'section-first',
    lastSection: 'section-last'
  })

  /**
   * This is a kind of advance declaration of the 'formatter' module;
   * it is not used by any plugins until user events occer, but must
   * be present when they are initialized.
   */
  Compose.provide('formatter', {})

  Compose.use(Converter)
  Compose.use(getChildren)
  Compose.use(SelectionPlugin)
  Compose.use(ViewPlugin)
  Compose.use(Setup)

  Compose.use(Enter)
  Compose.use(Backspace)
  Compose.use(Spacebar)
  Compose.use(SmartText)

  // Populate formatter exports.
  formatInline(Compose)
  formatBlock(Compose)

  Compose.use(Shortcuts)
}

module.exports = RichMode
