/* global describe, before, beforeEach, after, it */
'use strict';

var wd = require('wd'),
    utils = require('./utils'),
    chai = require('chai'),
    chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.should()
chaiAsPromised.transferPromiseness = wd.transferPromiseness

describe('Sample', function () {
  var browser,
      server

  // We have to use a ridiculous timeout, unfortunately.
  this.timeout(1200000)

  before(function (done) {
    browser = utils.browser()
    server = utils.server()

    server.listen(0, function () {
      browser
        .init(utils.desired())
        .nodeify(done)
    })
  })

  beforeEach(function () {
    return browser.get(utils.url(server))
  })

  after(function (done) {
    browser
      .quit()
      .fin(done)
      .done()
  })

  it('test', function () {
    return browser
      .title().should.become('Compose Tests')
  })
})
