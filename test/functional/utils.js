/* jshint node:true */
'use strict';

var http = require('http'),
    st = require('st')

exports.url = function (server) {
  var address = server.address(),
      url = 'http://'

  if (!address) {
    console.log('Server not listening.')
    process.exit(1)
  }

  if (address.address === '0.0.0.0')
    url += 'localhost'
  else
    url += address.address

  url += (':' + address.port + '/test.html')

  return url
}

exports.server = function () {
  var server = http.createServer(st(__dirname))

  return server
}

exports.opts = function () {
  var browser = process.env.BROWSER,
      user = process.env.SAUCE_USERNAME,
      key = process.env.SAUCE_ACCESS_KEY,
      opts

  if (process.env.TRAVIS) {
    if (!browser) {
      console.log('BROWSER environment variable must be set when using Travis.')
      process.exit(1)
    }

    if (!user || !key) {
      console.log('Sauce Labs user and key required when using Travis.')
      process.exit(1)
    }

    opts = {
      desiredCapabilities: {
        browserName: browser.toLowerCase(),
        tags: ['Compose', 'CI'],
        name: 'Compose functional tests.',
        build: 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')',
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER
      },
      host: 'ondemand.saucelabs.com',
      port: 80,
      user: user,
      key: key
    }

    if (process.env.VERSION)
      opts.desiredCapabilities.version = process.env.VERSION
    if (process.env.PLATFORM)
      opts.desiredCapabilities.platform = process.env.PLATFORM

  } else {
    opts = {
      desiredCapabilities: {
        browserName: 'chrome'
      }
    }
  }

  return opts
}

// Selenium 'special keys'.
exports.keys = {
  NULL: '\uE000',
  CANCEL: '\uE001',
  HELP: '\uE002',
  BACKSPACE: '\uE003',
  TAB: '\uE004',
  CLEAR: '\uE005',
  RETURN1: '\uE006',
  ENTER1: '\uE007',
  SHIFT: '\uE008',
  CONTROL: '\uE009',
  ALT: '\uE00A',
  PAUSE: '\uE00B',
  ESCAPE: '\uE00C',
  SPACE: '\uE00D',
  PAGEUP: '\uE00E',
  PAGEDOWN: '\uE00F',
  END: '\uE010',
  HOME: '\uE011',
  LEFT: '\uE012',
  UP: '\uE013',
  RIGHT: '\uE014',
  DOWN: '\uE015',
  INSERT: '\uE016',
  DELETE: '\uE017',
  SEMICOLON: '\uE018',
  EQUALS: '\uE019'
}
