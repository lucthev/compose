/* global describe, it, expect, beforeEach, afterEach, jasmine */
/* jshint node:true */

'use strict';

var driver = require('webdriverjs'),
    utils = require('./utils')

beforeEach(function () {
  console.log(process.env.TEST_SERVER_PORT)
})

afterEach(function () {

})

describe('Enter key behaviour', function () {
  var client

  beforeEach(function () {
    client = driver.remote(utils.opts())
    client.init()

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000
  })

  afterEach(function (done) {
    client.end(done)

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000
  })

  it('testing', function (done) {
    client
      .url(utils.testPage())
      .title(function (err, res) {
        expect(err).toBe(null)
        expect(res.value).toEqual('Test')
      })
      .call(done)
  })
})
