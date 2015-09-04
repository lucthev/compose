'use strict'

module.exports = function (config) {
  var browser = process.env.BROWSER

  config.set({
    frameworks: ['mocha', 'chai'],
    reporters: ['dots'],
    files: [
      require.resolve('compose-lists/dist/listPlugin.js'),
      require.resolve('compose-formatblock/dist/formatBlock.js'),
      '../compose.min.js',
      '**/*.spec.js'
    ],
    singleRun: true
  })

  if (process.env.TRAVIS) {
    if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
      console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set when using Travis.')
      process.exit(1)
    }

    if (!browser) {
      console.log('BROWSER environment variable must be set when using Travis.')
      process.exit(1)
    }

    config.set({
      sauceLabs: {
        testName: 'Compose unit tests',
        startConnect: false,
        build: 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')',
        tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
      },
      customLaunchers: {},
      reporters: ['dots', 'saucelabs']
    })

    config.customLaunchers['SL_' + browser] = {
      base: 'SauceLabs',
      browserName: browser.toLowerCase(),
      version: process.env.VERSION,
      platform: process.env.PLATFORM
    }

    config.browsers = Object.keys(config.customLaunchers)
  } else {
    browser = process.env.BROWSER || 'firefox'
    browser = browser[0].toUpperCase() + browser.substr(1).toLowerCase()

    config.browsers = [browser]
  }
}