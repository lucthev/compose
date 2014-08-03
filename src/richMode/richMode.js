'use strict';

var GetChildren = require('./getChildren'),
    Converter = require('./converter'),
    Selection = require('../selection'),
    View = require('./view'),
    Setup = require('./setup')

function RichMode (Compose) {
  Compose.use(Converter)
  Compose.use(GetChildren)
  Compose.use(Selection)
  Compose.use(View)
  Compose.use(Setup)
}

module.exports = RichMode
