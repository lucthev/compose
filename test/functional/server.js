/* jshint node:true */

'use strict';

var http = require('http'),
    st = require('st')

var server = http.createServer(st(__dirname))
server.listen(8080, function () {
  console.log('Server listening on port 8080.')
})
