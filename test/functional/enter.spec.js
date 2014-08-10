/* global describe, before, after, it, getChildren */
/* jshint node:true */
'use strict';

var wd = require('wd'),
    keys = wd.SPECIAL_KEYS,
    enter = keys.Enter,
    left = keys['Left arrow'],
    right = keys['Right arrow'],
    up = keys['Up arrow'],
    utils = require('./utils'),
    chai = require('chai'),
    chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.should()
chaiAsPromised.transferPromiseness = wd.transferPromiseness

describe('Pressing the enter key should', function () {
  var browser,
      server

  // We have to use a ridiculous timeout on Travis.
  if (process.env.TRAVIS)
    this.timeout(1200000)

  before(function (done) {
    utils.addMethods(wd)
    browser = utils.browser(wd)
    server = utils.server()

    server.listen(0, function () {
      browser
        .init(utils.desired())
        .nodeify(done)
    })
  })

  after(function (done) {
    browser
      .quit()
      .fin(function () {
        server.close(done)
      })
      .done()
  })

  function getEditor () {
    return getChildren(document.querySelector('#editor'))
  }

  it('insert a <p> after a <p>.', function () {
    return browser
      .get(utils.url(server,
        '<section><p><br></p></section>'
      ))
      .elementByCssSelector('.section-first .paragraph-first')
        .click()
        .keys(['One', enter, 'Two'])
      .execFn(getEditor).should.become([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One'
        }, {
          name: 'p',
          html: 'Two'
        }]
      }])
  })

  it('insert a <p> after a heading.', function () {
    return browser
      .get(utils.url(server,
        '<section><h2><br></h2></section>'
      ))
      .elementByCssSelector('.section-first .paragraph-first')
        .click()
        .keys(['One', enter, 'Two'])
      .execFn(getEditor).should.become([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'One'
        }, {
          name: 'p',
          html: 'Two'
        }]
      }])
  })

  it('insert a <p> after a <pre>', function () {
    return browser
      .get(utils.url(server,
        '<section><pre><br></pre></section>'
      ))
      .elementByCssSelector('.section-first .paragraph-first')
        .click()
        .keys(['One', enter, 'Two'])
      .execFn(getEditor).should.become([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'pre',
          html: 'One'
        }, {
          name: 'p',
          html: 'Two'
        }]
      }])
  })

  it('insert a <p> after a <blockquote>', function () {
    return browser
      .get(utils.url(server,
        '<section><blockquote><br></blockquote></section>'
      ))
      .elementByCssSelector('.section-first .paragraph-first')
        .click()
        .keys(['One', enter, 'Two'])
      .execFn(getEditor).should.become([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'blockquote',
          html: 'One'
        }, {
          name: 'p',
          html: 'Two'
        }]
      }])
  })

  it('insert a <li> after a <li>', function () {
    return browser
      .get(utils.url(server,
        '<section><ol><li><br></li></ol></section>'
      ))
      .elementByCssSelector('.section-first .paragraph-first')
        .click()
        .keys(['One', enter, 'Two'])
      .execFn(getEditor).should.become([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'ol',
          children: [{
            name: 'li',
            html: 'One'
          }, {
            name: 'li',
            html: 'Two'
          }]
        }]
      }])
  })

  it('do nothing when the first paragraph of a section is empty (1).',
    function () {
      return browser
        .get(utils.url(server,
          '<section><p><br></p></section>'
        ))
        .elementByCssSelector('.section-first .paragraph-first')
          .click()
          .keys([enter])
        .execFn(getEditor).should.become([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])
    })

  it('do nothing when the first paragraph of a section is empty (2).',
    function () {
      return browser
        .get(utils.url(server,
          '<section><p>One</p></section>' +
          '<section><h2><br></h2></section>'
        ))
        .elementByCssSelector('.section-last .paragraph-first')
          .click()
          .keys([enter])
        .execFn(getEditor).should.become([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'h2',
            html: '<br>'
          }]
        }])
    })

  it('make a new section when the not-first paragraph is empty', function () {
    return browser
      .get(utils.url(server,
        '<section><p>One</p><p><br></p></section>'
      ))
      .elementByCssSelector('.section-first .paragraph-last')
        .click()
        .keys([enter, 'Two'])
      .execFn(getEditor).should.become([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One'
        }]
      }, {
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Two'
        }]
      }])
  })

  it('convert a <li> to a <p> when the <li> is empty (1).', function () {
    return browser
      .get(utils.url(server,
        '<section><ol><li><br></li></ol></section>'
      ))
      .elementByCssSelector('.section-first .paragraph-first')
        .click()
        .keys([enter, 'One'])
      .execFn(getEditor).should.become([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One'
        }]
      }])
  })

  it('convert a <li> to a <p> when the <li> is empty (2).', function () {
    return browser
      .get(utils.url(server,
        '<section><ol><li><br></li><li>Three</li></ol></section>'
      ))
      .elementByCssSelector('.section-first .paragraph-first')
        .click()
        .keys(['One', enter, enter, 'Two'])
      .execFn(getEditor).should.become([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'ol',
          children: [{
            name: 'li',
            html: 'One'
          }]
        }, {
          name: 'p',
          html: 'Two'
        }, {
          name: 'ol',
          children: [{
            name: 'li',
            html: 'Three'
          }]
        }]
      }])
  })

  it('delete highlighted text across paragraphs.', function () {
    return browser
      .get(utils.url(server,
        '<section><p><br></p></section>'
      ))
      .elementByCssSelector('.section-first .paragraph-first')
        .click()
        .keys(['One', enter, 'Two'])
        .keys([left, left, keys.Shift, up]) // Select text
        .keys([keys.NULL, enter]) // Clear shift key, enter.
      .execFn(getEditor).should.become([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'O'
        }, {
          name: 'p',
          html: 'wo'
        }]
      }])
  })

  it('delete highlighted text within a paragraph.', function () {
    return browser
      .get(utils.url(server,
        '<section><h2><br></h2></section>'
      ))
      .elementByCssSelector('.section-first .paragraph-first')
        .click()
        .keys(['One', left, left, keys.Shift, right])
        .keys([keys.NULL, enter])
      .execFn(getEditor).should.become([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'O'
        }, {
          name: 'h2',
          html: 'e'
        }]
      }])
  })

  it('split a paragraph when the cursor is in the middle.', function () {
    return browser
      .get(utils.url(server,
        '<section><pre><br></pre></section>'
      ))
      .elementByCssSelector('.section-first .paragraph-first')
        .click()
        .keys(['One', left, enter])
      .execFn(getEditor).should.become([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'pre',
          html: 'On'
        }, {
          name: 'pre',
          html: 'e'
        }]
      }])
  })

  it('insert a <br> when the shift key is down.', function () {
    return browser
      .get(utils.url(server,
        '<section><p><br></p></section>'
      ))
      .elementByCssSelector('.section-first .paragraph-first')
        .click()
        .keys(['One', keys.Shift, enter, keys.NULL, 'Two'])
      .execFn(getEditor).should.become([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br>Two'
        }]
      }])
  })

  it('insert a <br> in the middle of a paragraph.', function () {
    return browser
      .get(utils.url(server,
        '<section><blockquote><br></blockquote></section>'
      ))
      .elementByCssSelector('.section-first .paragraph-first')
        .click()
        .keys(['OneTwo', left, left, left])
        .keys([keys.Shift, enter])
      .execFn(getEditor).should.become([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'blockquote',
          html: 'One<br>Two'
        }]
      }])
  })

  it('create a new paragraph when shift-enter is pressed twice.', function () {
    return browser
      .get(utils.url(server,
        '<section><p><br></p></section>'
      ))
      .elementByCssSelector('.section-first .paragraph-first')
        .click()
        .keys(['One', keys.Shift, enter, enter, keys.NULL, 'Two'])
      .execFn(getEditor).should.become([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One'
        }, {
          name: 'p',
          html: 'Two'
        }]
      }])
  })

  it('create a new paragraph when there are two adjacent <br>s.', function () {
    return browser
      .get(utils.url(server,
        '<section><h2><br></h2></section>'
      ))
      .elementByCssSelector('.section-first .paragraph-first')
        .click()
        .keys(['One', keys.Shift, enter, keys.NULL, 'Two'])
        .keys([left, left, left, keys.Shift, enter])
      .execFn(getEditor).should.become([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'One'
        }, {
          name: 'h2',
          html: 'Two'
        }]
      }])
  })

  it('remove sections when selected text includes an <hr>.', function () {
    // NOTE: assumes <hr>s are somehow being taken care of.

    return browser
      .get(utils.url(server,
        '<section><p><br></p></section>'
      ))
      .elementByCssSelector('.section-first .paragraph-first')
        .click()
        .keys(['One', enter, enter, 'Two'])
        .keys([left, left, keys.Shift, up, keys.NULL, enter])
      .execFn(getEditor).should.become([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'O'
        }, {
          name: 'p',
          html: 'wo'
        }]
      }])
      .execFn(function () {
        return window.editor.plugins.view.sections.length
      }).should.become(1)
  })
})
