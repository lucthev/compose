/* jshint ignore:start */

var webdriver = require('webdriverjs'),
    utils = require('./utils'),
    expect = require('chai').expect

describe('This is a sample', function () {
  var server,
      client

  // We have to use a ridiculous timeout, unfortunately.
  this.timeout(1200000)

  before(function (done) {
    client = webdriver.remote(utils.opts())
    server = utils.server()

    server.listen(0, function () {
      client.init(done)
    })
  })

  it('test.', function (done) {
    client
      .url(utils.url(server))
      .getTitle(function (err, title) {
        expect(err).to.be.null;
        expect(title).to.equal('Compose Tests')
      })
      .call(done)
  })

  after(function (done) {
    client.end(function () {
      server.close(done)
    })
  })
})
