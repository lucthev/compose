/* global before, describe, it, beforeEach */
'use strict';

var chai = require('chai'),
    keys = require('selenium-webdriver').Key,
    utils = require('./utils'),
    expect = chai.expect,
    browser

utils.chai(chai)

before(function () {
  browser = utils.browser
})

describe('Deleting text should', function () {
  beforeEach(function () {
    return browser.get(utils.url())
  })

  it('do nothing when backspacing in an empty first section', function () {
    return utils
      .init('<section><p><br></p></section>', {
        start: [0, 0]
      })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 0],
          end: [0, 0]
        })
      })
  })

  it('do nothing when deleting in an empty first section', function () {
    return utils
      .init('<section><p><br></p></section>', {
        start: [0, 0]
      })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 0],
          end: [0, 0]
        })
      })
  })

  it('insert a <br> when backspacing the only character', function () {
    return utils
      .init('<section><p>1</p></section>', {
        start: [0, 1]
      })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 0],
          end: [0, 0]
        })
      })
  })

  it('insert a <br> when deleting the only character', function () {
    return utils
      .init('<section><p>1</p></section>', {
        start: [0, 0]
      })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 0],
          end: [0, 0]
        })
      })
  })

  it('it convert a trailing space to an &nbsp;', function () {
    return utils
      .init('<section><p>One 1</p></section>', {
        start: [0, 5]
      })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One&nbsp;'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 4],
          end: [0, 4]
        })
      })
  })

  it('convert a leading space to an &nbsp;', function () {
    return utils
      .init('<section><p>1 One</p></section>', {
        start: [0, 0]
      })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: '&nbsp;One'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 0],
          end: [0, 0]
        })
      })
  })

  it('remove adjacent spaces when backspacing', function () {
    return utils
      .init('<section><p>One 1 Two</p></section>', {
        start: [0, 5]
      })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One Two'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 4],
          end: [0, 4]
        })
      })
  })

  it('remove adjacent spaces when deleting', function () {
    return utils
      .init('<section><p>One 1 Two</p></section>', {
        start: [0, 4]
      })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One Two'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 4],
          end: [0, 4]
        })
      })
  })

  it('remove selected text when backspacing', function () {
    return utils
      .init('<section><p>One two three</p></section>', {
        start: [0, 12],
        end: [0, 2]
      })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 2],
          end: [0, 2]
        })
      })
  })

  it('remove selected text when deleting', function () {
    return utils
      .init('<section><p>One two three</p></section>', {
        start: [0, 12],
        end: [0, 2]
      })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 2],
          end: [0, 2]
        })
      })
  })

  it('remove paragraphs when backspacing over multiple', function () {
    return utils
      .init('<section><h2>One</h2><p>Two</p><p>Three</p></section>', {
        start: [0, 1],
        end: [2, 2]
      })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'h2',
            html: 'Oree'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 1],
          end: [0, 1]
        })
      })
  })

  it('remove paragraphs when deleting over multiple', function () {
    return utils
      .init('<section><h2>One</h2><p>Two</p><p>Three</p></section>', {
        start: [0, 1],
        end: [2, 2]
      })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'h2',
            html: 'Oree'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 1],
          end: [0, 1]
        })
      })
  })

  it('remove sections when backspacing over multiple', function () {
    return utils
      .init(
        '<section><p>One</p></section>' +
        '<section><p>Two</p></section>' +
        '<section><h2>Three</h2><pre>Four</pre></section>', {
          start: [3, 2],
          end: [0, 1]
        })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'Our'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 1],
          end: [0, 1]
        })
      })
  })

  it('remove sections when deleting over multiple', function () {
    return utils
      .init(
        '<section><p>One</p></section>' +
        '<section><p>Two</p></section>' +
        '<section><h2>Three</h2><pre>Four</pre></section>', {
          start: [3, 2],
          end: [0, 1]
        })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'Our'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 1],
          end: [0, 1]
        })
      })
  })

  it('insert a <br> when backspacing after the only character on a line', function () {
    return utils
      .init('<section><p>One<br>2</p></section>', {
        start: [0, 5]
      })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One<br><br>'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 4],
          end: [0, 4]
        })
      })
  })

  it('insert a <br> when deleting the only character on a line', function () {
      return utils
      .init('<section><p>One<br>2</p></section>', {
        start: [0, 4]
      })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One<br><br>'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 4],
          end: [0, 4]
        })
      })
  })

  it('insert a <br> when backspacing over all text on a line', function () {
    return utils
      .init('<section><p>One<br>Two</p></section>', {
        start: [0, 4],
        end: [0, 7]
      })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One<br><br>'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 4],
          end: [0, 4]
        })
      })
  })

  it('insert a <br> when deleting all text on a line', function () {
    return utils
      .init('<section><p>One<br>Two</p></section>', {
        start: [0, 4],
        end: [0, 7]
      })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One<br><br>'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 4],
          end: [0, 4]
        })
      })
  })

  it('convert a <li> to a <p> when backspacing at the start', function () {
    return utils
      .init('<section><ol><li>One</li></ol></section>', {
        start: [0, 0]
      })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 0],
          end: [0, 0]
        })
      })
  })

  it('split lists if necessary', function () {
    return utils
      .init('<section><ol><li>1</li><li>2</li><li>3</li></ol></section>', {
        start: [1, 0]
      })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: '1'
            }]
          }, {
            name: 'p',
            html: '2'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: '3'
            }]
          }]
        }])
        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('merge lists when deleting at the end of one', function () {
    return utils
      .init('<section><ol><li>One</li><li>Two</li></ol></section>', {
        start: [0, 3]
      })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'OneTwo'
            }]
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 3],
          end: [0, 3]
        })
      })
  })

  it('merge paragraphs when backspacing at the start of one', function () {
    return utils
      .init('<section><p>One</p><h2>Two</h2></section>', {
        start: [1, 0]
      })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'OneTwo'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 3],
          end: [0, 3]
        })
      })
  })

  it('merge paragraphs when deleting at the end of one', function () {
    return utils
      .init('<section><pre>One</pre><p>Two</p></section>', {
        start: [0, 3]
      })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'pre',
            html: 'OneTwo'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 3],
          end: [0, 3]
        })
      })
  })

  it('ignore trailing <br>s when deleting at the end of a paragraph', function () {
    return utils
      .init('<section><p>One<br></p><p>Two</p></section>', {
        start: [0, 3]
      })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'OneTwo'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 3],
          end: [0, 3]
        })
      })
  })

  it('ignore trailing <br>s when backspacing at the start of a paragraph', function () {
    return utils
      .init('<section><p>One<br></p><p>Two</p></section>', {
        start: [1, 0]
      })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'OneTwo'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 3],
          end: [0, 3]
        })
      })
  })

  it('respect newlines when backspacing at the start of a paragraph', function () {
    return utils
      .init('<section><p>One<br><br></p><p>Two</p></section>', {
        start: [1, 0]
      })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One<br>Two'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 4],
          end: [0, 4]
        })
      })
  })

  it('preserve <br>s if necessary when backspacing', function () {
    return utils
      .init('<section><p>One<br><br></p><p><br></p></section>', {
        start: [1, 0]
      })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One<br><br>'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 4],
          end: [0, 4]
        })
      })
  })

  it('respect newlines when deleting at the end of a paragraph', function () {
    return utils
      .init('<section><p>One<br><br></p><p>Two</p></section>', {
        start: [0, 4]
      })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One<br>Two'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 4],
          end: [0, 4]
        })
      })
  })

  it('preserve <br>s if necessary when deleting', function () {
    return utils
      .init('<section><p>One<br><br></p><p><br></p></section>', {
        start: [0, 4]
      })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One<br><br>'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 4],
          end: [0, 4]
        })
      })
  })

  it('remove sections when backspacing collapsed at the start of one', function () {
    return utils
      .init(
        '<section><p>One</p></section>' +
        '<section><p>Two</p></section>', {
          start: [1, 0]
        })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: 'Two'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('remove sections when deleting collapsed at the end of one', function () {
    return utils
      .init(
        '<section><p>One</p></section>' +
        '<section><p>Two</p></section>', {
          start: [0, 3]
        })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: 'Two'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 3],
          end: [0, 3]
        })
      })
  })

  it('ignore trailing <br>s when deleting collapsed at the end of a section', function () {
    return utils
      .init(
        '<section><p>One<br></p></section>' +
        '<section><p>Two</p></section>', {
          start: [0, 3]
        })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One<br>' // FIXME: should the <br> be removed?
          }, {
            name: 'p',
            html: 'Two'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 3],
          end: [0, 3]
        })
      })
  })

  it('be able to delete sections after newlines', function () {
    return utils
      .init(
        '<section><p>One<br><br></p></section>' +
        '<section><p>Two</p></section>', {
          start: [0, 4]
        })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children:[{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One<br><br>'
          }, {
            name: 'p',
            html: 'Two'
          }]
        }])
        expect(sel).to.deep.equal({
          start: [0, 4],
          end: [0, 4]
        })
      })
  })

  it('merge markups it brings together when deleting', function () {
    return utils
      .init('<section><p><em>1</em>2<em>3</em></p></section>', {
        start: [0, 1]
      })
      .keys(keys.DELETE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<em>13</em>'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 1],
          end: [0, 1]
        })
      })
  })

  it('merge markups it brings together when backspacing', function () {
    return utils
      .init('<section><p><em>1</em>2<em>3</em></p></section>', {
        start: [0, 2]
      })
      .keys(keys.BACK_SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<em>13</em>'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 1],
          end: [0, 1]
        })
      })
  })
})
