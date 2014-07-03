'use strict';

var GetChildren = require('./getChildren'),
    Selection = require('../selection'),
    View = require('./view')

function RichMode (Compose) {
  Compose.use(GetChildren)
  Compose.use(Selection)
  Compose.use(View)
}

module.exports = RichMode
