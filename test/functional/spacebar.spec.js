/* global before, describe, it, beforeEach */
/* jshint node:true */
'use strict';

var chai = require('chai'),
    keys = require('selenium-webdriver').Key,
    utils = require('./utils'),
    expect = chai.expect,
    browser

// For whatever reason, it seems spacebar doesn’t work in Chrome.
if (process.env.TRAVIS && process.env.BROWSER.toLowerCase() === 'chrome')
  return

utils.chai(chai)

before(function () {
  browser = utils.browser
})

describe('Pressing the spacebar should', function () {
  beforeEach(function () {
    return browser.get(utils.url())
  })

  it('insert an &nbsp; at the end of a paragraph.', function () {
    return utils
      .init('<section><p>One</p></section>', {
        start: [0, 3]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
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

  it('insert a regular space in the middle of other characters.', function () {
    return utils
      .init('<section><p>EverlastingLight</p></section>', {
        start: [0, 11]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'Everlasting Light'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 12],
          end: [0, 12]
        })
      })
  })

  it('insert an &nbsp at the start of a paragraph.', function () {
    return utils
      .init('<section><p>El Camino</p></section>', {
        start: [0, 0]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '&nbsp;El Camino'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 1],
          end: [0, 1]
        })
      })
  })

  it('insert an nbsp; before a newline.', function () {
    return utils
      .init('<section><p>One<br>Two</p></section>', {
        start: [0, 3]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One&nbsp;<br>Two'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 4],
          end: [0, 4]
        })
      })
  })

  it('insert an &nbsp; after a newline.', function () {
    return utils
      .init('<section><p>One<br>Two</p></section>', {
        start: [0, 4]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One<br>&nbsp;Two'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 5],
          end: [0, 5]
        })
      })
  })

  it('move the cursor forward when the next character is a space.', function () {
    return utils
      .init('<section><p>One Two</p></section>', {
        start: [0, 3]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
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

  it('do nothing when the previous char is a space.', function () {
    return utils
      .init('<section><p>A sly fox.</p></section>', {
        start: [0, 2]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'A sly fox.'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 2],
          end: [0, 2]
        })
      })
  })

  it('should remove highlighted text.', function () {
    return utils
      .init('<section><p>OneABCTwo</p></section>', {
        start: [0, 6],
        end: [0, 3]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
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

  it('insert an &nbsp; when the text is selected to the end of a paragraph.', function () {
    return utils
      .init('<section><p>OneABC</p></section>', {
        start: [0, 3],
        end: [0, 6]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
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

  it('insert an &nbsp; when selected text starts at the beginning of a paragraph.', function () {
    return utils
      .init('<section><p>ABCOne</p></section>', {
        start: [0, 0],
        end: [0, 3]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '&nbsp;One'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 1],
          end: [0, 1]
        })
      })
  })

  it('remove paragraphs when the selection spans multiple.', function () {
    return utils
      .init(
        '<section>' +
          '<p>One</p>' +
          '<h2>Two</h2>' +
          '<p>Three</p>' +
          '<p>Four</p>' +
        '</section>', {
          start: [3, 1],
          end: [0, 2]
        })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'On our'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 3],
          end: [0, 3]
        })
      })
  })

  it('remove sections when the selection spans multiple.', function () {
    return utils
      .init(
        '<section><p>One</p></section>' +
        '<section><h2>Two</h2><p>Three</p></section>' +
        '<section><p>Four</p></section>', {
          start: [0, 2],
          end: [3, 1]
        })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'On our'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 3],
          end: [0, 3]
        })
      })
  })

  it('convert a paragraph to an ordered list under special circumstances.', function () {
    return utils
      .init('<section><p>1.</p></section>', {
        start: [0, 2]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: '<br>'
            }]
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 0],
          end: [0, 0]
        })
      })
  })

  it('not convert a <p> to an <ol> when the caret is not after the "1."', function () {
    return utils
      .init('<section><p>1.OneTwo</p></section>', {
        start: [0, 5]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1.One Two'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 6],
          end: [0, 6]
        })
      })
  })

  it('not convert anything but a <p> to an <ol>.', function () {
    return utils
      .init('<section><h2>1.</h2></section>', {
        start: [0, 2]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'h2',
            html: '1.&nbsp;'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 3],
          end: [0, 3]
        })
      })
  })

  it('it should convert a <p> to an <ul> when the paragraph starts with -.', function () {
    return utils
      .init('<section><p>-</p></section>', {
        start: [0, 1]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ul',
            children: [{
              name: 'li',
              html: '<br>'
            }]
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 0],
          end: [0, 0]
        })
      })
  })

  it('it should convert a <p> to an <ul> when the paragraph starts with *.', function () {
    return utils
      .init('<section><p>*</p></section>', {
        start: [0, 1]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ul',
            children: [{
              name: 'li',
              html: '<br>'
            }]
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 0],
          end: [0, 0]
        })
      })
  })

  it('not convert a <p> to an <ul> when the caret is not after the */-.', function () {
    return utils
      .init('<section><p>*</p></section>', {
        start: [0, 0]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '&nbsp;*'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 1],
          end: [0, 1]
        })
      })
  })

  it('not convert anything but a <p> to an <ul>.', function () {
    return utils
      .init('<section><pre>-</pre></section>', {
        start: [0, 1]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'pre',
            html: '-&nbsp;'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 2],
          end: [0, 2]
        })
      })
  })

  it('not create multiple adjacent spaces when one precedes a non-collapsed selection.', function () {
    return utils
      .init('<section><p>One ABCTwo</p></section>', {
        start: [0, 4],
        end: [0, 7]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
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

  it('not create multiple adjacent spaces when one follows a non-collapsed selection.', function () {
    return utils
      .init('<section><p>OneABC Two</p></section>', {
        start: [0, 3],
        end: [0, 6]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
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

  it('not keep multiple adjacent spaces when a non-collapsed selection in surrounded by spaces.', function () {
    return utils
      .init('<section><p>One ABC Two</p></section>', {
        start: [0, 4],
        end: [0, 7]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
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

  it('convert a trailing space to an &nbsp;', function () {
    return utils
      .init('<section><p>One ABC</p></section>', {
        start: [0, 4],
        end: [0, 7]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
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

  it('convert a starting space to an &nbsp;', function () {
    return utils
      .init('<section><p>ABC One</p></section>', {
        start: [0, 3],
        end: [0, 0]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '&nbsp;One'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 1],
          end: [0, 1]
        })
      })
  })

  it('deal with trailing <br>s, if they exist.', function () {
    return utils
      .init('<section><p>One<br></p></section>', {
        start: [0, 3]
      })
      .keys(keys.SPACE)
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
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
})
