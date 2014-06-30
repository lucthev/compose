/* jshint node:true */

'use strict';

exports.opts = function () {
  var browser = process.env.BROWSER,
      user = process.env.SAUCE_USERNAME,
      key = process.env.SAUCE_ACCESS_KEY,
      opts

  if (!browser)
    throw new Error('BROWSER environment variable must be set.')

  if (!process.env.TRAVIS)
    throw new Error('You should be running Travis.')

  if (!user || !key)
    throw new Error('Sauce Labs user and key required.')

  opts = {
    desiredCapabilities: {
      browserName: browser,
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER
    },
    host: 'ondemand.saucelabs.com',
    port: 80,
    user: user,
    key: key
  }

  opts.desiredCapabilities.tags = ['Compose', 'CI']
  opts.desiredCapabilities.name = 'Compose tests (' + browser + ').'

  return opts
}

exports.testPage = function () {
  return 'http://localhost:8080/test.html'
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
