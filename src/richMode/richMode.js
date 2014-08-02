'use strict';

var GetChildren = require('./getChildren'),
    Converter = require('./converter'),
    Selection = require('../selection'),
    View = require('./view')

function RichMode (Compose) {
  Compose.use(GetChildren)
  Compose.use(Selection)
  Compose.use(Converter)
  Compose.use(View)
}

module.exports = RichMode
