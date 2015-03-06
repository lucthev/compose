/* jshint mocha:true */
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

describe.skip('Enter key', function () {
  beforeEach(function () {
    return browser.get(utils.url())
  })

  it('insert a <p> after a <p>.', function () {
    return utils
      .init('<section><p>One</p></section>', {
        start: [0, 3]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])


        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('insert an <li> after an <li>.', function () {
    return utils
      .init('<section><ol><li>One</li></ol></section>', {
        start: [0, 3]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
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
              html: '<br>'
            }]
          }]
        }])


        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('insert a <p> after anything else.', function () {
    return utils
      .init('<section><h2>1</h2></section>', {
        start: [0, 1]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'h2',
            html: '1'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])


        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('do nothing with an empty first section.', function () {
    return utils
      .init('<section><p><br></p></section>', {
        start: [0, 0]
      })
      .keys(keys.RETURN)
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

  it('do nothing with an empty first paragraph.', function () {
    return utils
      .init(
      '<section><p>One</p></section>' +
      '<section><p><br></p></section>', {
        start: [1, 0]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
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
            html: '<br>'
          }]
        }])


        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('convert a trailing space to an &nbsp;', function () {
    return utils
      .init('<section><p>One Two</p></section>', {
        start: [0, 4]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One&nbsp;'
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

  it('convert a leading space to an &nbsp;', function () {
    return utils
      .init('<section><p>One Two</p></section>', {
        start: [0, 3]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: '&nbsp;Two'
          }]
        }])


        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('handle both leading and trailing spaces.', function () {
    return utils
      .init('<section><p>One ABC Two</p></section>', {
        start: [0, 7],
        end: [0, 4]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One&nbsp;'
          }, {
            name: 'p',
            html: '&nbsp;Two'
          }]
        }])


        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('leave a <br> when at the start of a paragraph.', function () {
    return utils
      .init('<section><p>One</p></section>', {
        start: [0, 0]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>'
          }, {
            name: 'p',
            html: 'One'
          }]
        }])


        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('remove selected text.', function () {
    return utils
      .init('<section><p>One ABC Two</p></section>', {
        start: [0, 3],
        end: [0, 8]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
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


        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('remove paragraphs when the selection spans multiple.', function () {
    return utils
      .init(
        '<section>' +
          '<p>One ABC</p>' +
          '<p>Filler</p>' +
          '<h2>More filler</h2>' +
          '<p>ABC Two</p>' +
        '</section>', {
        start: [3, 4],
        end: [0, 3]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
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


        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('remove sections when the selection spans multiple.', function () {
    return utils
      .init(
        '<section><pre>One ABC</pre></section>' +
        '<section><h2>Filler</h2></section>' +
        '<section><p>ABC Two</p></section>', {
        start: [0, 3],
        end: [2, 4]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
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


        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('ignore trailing <br>s when at the end of a paragraph.', function () {
    return utils
      .init('<section><p>One<br></p></section>', {
        start: [0, 3]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])


        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('conserve <br>s when after a newline.', function () {
    return utils
      .init('<section><p>One<br><br></p></section>', {
        start: [0, 4]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One<br><br>'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])


        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('insert a <br> when after a <br>.', function () {
    return utils
      .init('<section><p>One<br>Two</p></section>', {
        start: [0, 4]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
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
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('insert a newline when pressing Shift+Enter', function () {
    return utils
      .init('<section><p>One</p></section>', {
        start: [0, 3]
      })
      .keys(keys.SHIFT, keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
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

  it('not insert a newline when the paragraph is empty.', function () {
    return utils
      .init('<section><p>One</p><p><br></p></section>', {
        start: [1, 0]
      })
      .keys(keys.SHIFT, keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])


        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('insert a newline between other characters.', function () {
    return utils
      .init('<section><p>OneTwo</p></section>', {
        start: [0, 3]
      })
      .keys(keys.SHIFT, keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
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

  it('create a new paragraph when shift+entering after a <br>.', function () {
    return utils
      .init('<section><p>One<br>Two</p></section>', {
        start: [0, 4]
      })
      .keys(keys.SHIFT, keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
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

        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('create a new paragraph when shift+entering after a newline.', function () {
    return utils
      .init('<section><p>One<br><br></p></section>', {
        start: [0, 4]
      })
      .keys(keys.SHIFT, keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('create a new paragraph when shift+entering before a <br>', function () {
    return utils
      .init('<section><p>One<br>Two</p></section>', {
        start: [0, 3]
      })
      .keys(keys.SHIFT, keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
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

        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('create a new paragraph when shift+entering before a newline.', function () {
    return utils
      .init('<section><p>One<br><br></p></section>', {
        start: [0, 3]
      })
      .keys(keys.SHIFT, keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('strip leading <br>s.', function () {
    return utils
      .init('<section><p>One<br>Two</p></section>', {
        start: [0, 3]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
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

        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('create a section when a not-first paragraph is empty.', function () {
    return utils
      .init('<section><p>One</p><p><br></p></section>', {
        start: [1, 0]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
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
            html: '<br>'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('convert a <li> to a <p> when the <li> is empty.', function () {
    return utils
      .init('<section><ol><li><br></li></ol></section>', {
        start: [0, 0]
      })
      .keys(keys.RETURN)
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

  it('split lists where necessary.', function () {
    return utils
      .init(
        '<section><ol>' +
          '<li>One</li>' +
          '<li><br></li>' +
          '<li>Three</li>' +
        '</ol></section>', {
        start: [1, 0]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
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
            html: '<br>'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'Three'
            }]
          }]
        }])

        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('turn a <p> into a <li> when both are selected.', function () {
    return utils
      .init(
        '<section>' +
        '<ol>' +
          '<li>One ABC</li>' +
        '</ol>' +
        '<p>ABC Two</p>' +
        '</section>', {
        start: [1, 4],
        end: [0, 3]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
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

        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('appear to do nothing under special circumstances.', function () {
    return utils
      .init('<section><p>One<br></p><p>Two</p></section>', {
        start: [0, 3],
        end: [1, 0]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
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

        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('not create a new paragraph when there is a trailing <br>.', function () {
    return utils
      .init('<section><p>One<br></p></section>', {
        start: [0, 3]
      })
      .keys(keys.SHIFT, keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
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

  it('remove adjacent <br>s where aprropriate.', function () {
    return utils
      .init('<section><p>One<br>Two</p><p>Three<br>Four</p></section>', {
        start: [0, 4],
        end: [1, 5]
      })
      .keys(keys.SHIFT, keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: 'Four'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })

  it('convert spaces to &nbsp;s when shift+entering.', function () {
    return utils
      .init('<section><p>One ABC Two</p></section>', {
        start: [0, 4],
        end: [0, 7]
      })
      .keys(keys.SHIFT, keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One&nbsp;<br>&nbsp;Two'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 5],
          end: [0, 5]
        })
      })
  })

  it('should conserve block types when splitting parapgraphs.', function () {
    return utils
      .init('<section><h2>OneTwo</h2></section>', {
        start: [0, 3]
      })
      .keys(keys.RETURN)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
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

        expect(sel).to.deep.equal({
          start: [1, 0],
          end: [1, 0]
        })
      })
  })
})
