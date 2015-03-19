/*global before, after */
'use strict'

var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer
var webdriver = require('selenium-webdriver')
var http = require('http')
var path = require('path')
var st = require('st')
var httpServer
var browser
var desired
var address
var server
var local

exports.init = function (html, sel) {
  browser.executeScript(function (html, sel) {
    var elem = document.querySelector('#editor')
    elem.innerHTML = html

    window.editor = new window.Compose(elem)
    var Selection = window.editor.plugins.selection

    elem.focus()
    if (sel) {
      Selection.set(new Selection(sel.start, sel.end))
    }
  }, html, sel)

  return exports
}

exports.keys = function () {
  var keys = Array.prototype.slice.call(arguments)

  browser
    .findElement(webdriver.By.id('editor'))
    .sendKeys(keys.join(''))

  return exports
}

exports.result = function (fn) {
  return browser.executeAsyncScript(function (cb) {
    setTimeout(function () {
      var elem = window.editor.root
      var children = []
      var sel

      Array.prototype.forEach.call(elem.childNodes, function (child) {
        this.push(window.tree(child))
      }, children)

      sel = window.editor.plugins.selection.get()

      cb({
        children: children,
        sel: {
          start: sel.start,
          end: sel.end
        }
      })
    }, 100)
  }).then(function (obj) {
    fn(obj.children, obj.sel)
  })
}

exports.chai = function (chai) {
  chai.use(function (_chai) {
    var Assertion = _chai.Assertion

    Assertion.addMethod('resemble', function (obj) {
      var other = this._obj

      if (Array.isArray(obj)) {
        obj.forEach(function (item, index) {
          new Assertion(other[index]).to.resemble(item)
        }, this)

        return
      }

      if (typeof obj === 'object') {
        Object.keys(obj).forEach(function (key) {
          this.assert(
            key in other,
            'expect #{this} to have property #{exp}',
            'expect #{this} not to have property #{exp}',
            key
          )

          if (key === 'classes') {
            obj[key].forEach(function (className) {
              if (className[0] === '!') {
                className = className.substr(1)

                this.assert(
                  other.classes.indexOf(className) === -1,
                  'expected #{this} not to have class #{exp}',
                  'expected #{this} to have class #{exp}',
                  className
                )
              } else {
                this.assert(
                  other.classes.indexOf(className) >= 0,
                  'expected #{this} to have class #{exp}',
                  'expected #{this} not to have class #{exp}',
                  className
                )
              }
            }, this)

            return
          }

          new Assertion(other[key]).to.resemble(obj[key])
        }, this)

        return
      }

      if (Object.prototype.toString.call(obj) === '[object RegExp]') {
        new Assertion(other).to.match(obj)
        return
      }

      new Assertion(other).to.equal(obj)
    })
  })
}

exports.cut = function (cb) {
  browser.executeScript(function () {
    var evt = {}
    var data = {}
    var elem

    // There doesn’t seem to be a good way to mimick the cut event.
    evt.preventDefault = function () {}
    evt.type = 'cut'
    evt.currentTarget = evt.target = window.editor.root
    evt.clipboardData = {
      clearData: function () {},
      setData: function (type, toCopy) {
        if (/plain/.test(type)) {
          type = 'text'
        } else if (/html/.test(type)) {
          type = 'html'
        }

        data[type] = toCopy
      }
    }

    window.editor.emit('cut', evt)
    if (data.html) {
      elem = document.createElement('div')
      elem.innerHTML = data.html.replace(/<meta charset="UTF-8">/i, '')
      data.children = []
      Array.prototype.forEach.call(elem.childNodes, function (child) {
        this.push(window.tree(child))
      }, data.children)
    }

    return data
  }).then(cb)

  return exports
}

exports.url = function () {
  var address = httpServer.address()
  var url = 'http://'

  if (!address) {
    console.log('Server not listening.')
    process.exit(1)
  }

  if (address.address === '0.0.0.0') {
    url += 'localhost'
  } else {
    url += address.address
  }

  url += (':' + address.port + '/test/functional/test.html')

  return url
}

local = !process.env.RUN_IN_SAUCE_LABS && !process.env.TRAVIS

exports.browserName = (process.env.BROWSER || 'firefox').toLowerCase()

before(function (done) {
  httpServer = http.createServer(st(path.join(__dirname, '../..')))
  httpServer.listen(0, done)
})

if (local) {
  before(function () {
    server = new SeleniumServer(
      path.join(__dirname, '../../vendor/selenium-2.43.1.jar'),
      { port: 4444 }
    )

    return server.start()
  })
}

before(function () {
  if (local) {
    address = server.address()
  } else {
    address = 'http://ondemand.saucelabs.com:80/wd/hub'
  }

  if (local) {
    desired = {
      browserName: exports.browserName
    }
  } else {
    desired = {
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      browserName: exports.browserName,
      version: process.env.VERSION,
      platform: process.env.PLATFORM,
      tags: ['Compose', 'CI'],
      name: 'Compose functional tests.',
      build: 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' +
        process.env.TRAVIS_BUILD_ID + ')',
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      'video-upload-on-pass': false
    }
  }

  browser = new webdriver.Builder()
    .usingServer(address)
    .withCapabilities(desired)
    .build()

  // Set a higher timeout for async WD scripts; the default seems to be 1ms?
  browser.manage().timeouts().setScriptTimeout(2000)

  exports.browser = browser
})

after(function (done) {
  browser.quit().then(function () {
    if (local) {
      server.stop().then(function () {
        httpServer.close(done)
      })
    } else {
      httpServer.close(done)
    }
  })
})
