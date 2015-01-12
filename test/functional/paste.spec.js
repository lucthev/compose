/* global before, describe, it, beforeEach */
'use strict';

var chai = require('chai'),
    utils = require('./utils'),
    expect = chai.expect,
    browser

utils.chai(chai)

before(function () {
  browser = utils.browser
})

describe('Pasting', function () {

  describe('text should', function () {
    beforeEach(function () {
      return browser.get(utils.url())
    })

    it('insert the pasted text', function () {
      return utils
        .init('<p>OneThree</p>', {
          start: [0, 3]
        })
        .paste('text/plain', 'Two')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'OneTwoThree'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 6],
            end: [0, 6]
          })
        })
    })

    it('remove selected text', function () {
      return utils
        .init('<p>ABC</p>', {
          start: [0, 2],
          end: [0, 1]
        })
        .paste('text/plain', 'X')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'AXC'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 2],
            end: [0, 2]
          })
        })
    })

    it('deal with spaces', function () {
      return utils
        .init('<p>One Two Three</p>', {
          start: [0, 4],
          end: [0, 7]
        })
        .paste('text/plain', '\u00A0X\u00A0') // Non-breaking spaces
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'One X Three'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 6],
            end: [0, 6]
          })
        })
    })

    it('remove trailing newlines', function () {
      return utils
        .init('<p><br></p>', {
          start: [0, 0]
        })
        .paste('text/plain', 'One')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'One'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 3],
            end: [0, 3]
          })
        })
    })

    it('split double newlines into multiple paragraphs', function () {
      return utils
        .init('<p><br></p>', {
          start: [0, 0]
        })
        .paste('text/plain', 'One\n\nTwo')
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
            start: [1, 3],
            end: [1, 3]
          })
        })
    })

    it('remove excessive whitespace', function () {
      return utils
        .init('<p><br></p>', {
          start: [0, 0]
        })
        .paste('text/plain', 'One   Two')
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
            start: [0, 7],
            end: [0, 7]
          })
        })
    })

    it('convert leading and trailing spaces into &nbsp;s', function () {
      return utils
        .init('<p><br></p>', {
          start: [0, 0]
        })
        .paste('text/plain', ' One ')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: '&nbsp;One&nbsp;'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 5],
            end: [0, 5]
          })
        })
    })

    it('convert a trailing double newline into a new paragraph', function () {
      return utils
        .init('<p>AC</p>', {
          start: [0, 1]
        })
        .paste('text/plain', 'B\n\n')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'AB'
            }, {
              name: 'p',
              html: 'C'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [1, 0],
            end: [1, 0]
          })
        })
    })

    /*it('', function () {
      return utils
        .init('', {
          start: []
        })
        .paste('text/plain', '')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: '',
              html: ''
            }]
          }])

          expect(sel).to.deep.equal({
            start: [],
            end: []
          })
        })
    })*/
  })

  describe('html should', function () {
    beforeEach(function () {
      return browser.get(utils.url())
    })

    it('keep the type of the paragraph being pasted into', function () {
      return utils
        .init('<p>One</p>', {
          start: [0, 3]
        })
        .paste('text/html', '<meta charset="UTF-8"><h2>Two</h2>')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'OneTwo'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 6],
            end: [0, 6]
          })
        })
    })

    it('not preserve the type of an empty paragraph', function () {
      return utils
        .init('<p><br></p>', {
          start: [0, 0]
        })
        .paste('text/html', '<meta charset="UTF-8"><pre>One</pre>')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'pre',
              html: 'One'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 3],
            end: [0, 3]
          })
        })
    })

    it('respect new paragraphs', function () {
      return utils
        .init('<p>OneFour</p>', {
          start: [0, 3]
        })
        .paste('text/html', '<meta charset="UTF-8"><p>Two</p><p>Three</p>')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'OneTwo'
            }, {
              name: 'p',
              html: 'ThreeFour'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [1, 5],
            end: [1, 5]
          })
        })
    })

    it('override the end type of the paragraph being pasted into', function () {
      return utils
        .init('<p>AD</p>', {
          start: [0, 1]
        })
        .paste('text/html', '<meta charset="UTF-8"><p>B</p><h2>C</h2>')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'AB'
            }, {
              name: 'h2',
              html: 'CD'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [1, 1],
            end: [1, 1]
          })
        })
    })

    it('remove <script>s and <style>s', function () {
      return utils
        .init('<p><br></p>', {
          start: [0, 0]
        })
        .paste(
          'text/html',
          '<meta charset="UTF-8">' +
          '<script>alert(1)</script>' +
          '<style>* { border: 2px solid lime }</style>' +
          '<p>One</p>'
        )
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'One'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 3],
            end: [0, 3]
          })
        })
    })

    it('handle pasting of whole documents', function () {
      return utils
        .init('<p><br></p>', {
          start: [0, 0]
        })
        .paste(
          'text/html',
          '<!DOCTYPE html>' +
          '<html lang="en">' +
          '<head>' +
            '<meta charset="UTF-8">' +
            '<title>Things</title>' +
          '</head>' +
          '<body>' +
            '<h2>Words</h2>' +
            '<p>Stuff <i>and</i> things</p>' +
          '</body>' +
          '</html>'
        )
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'h2',
              html: 'Words'
            }, {
              name: 'p',
              html: 'Stuff <em>and</em> things'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [1, 16],
            end: [1, 16]
          })
        })
    })

    it('remove selected section breaks', function () {
      return utils
        .init('<section><p>AB</p></section><section><p>CD</p></section>', {
          start: [0, 1],
          end: [1, 1]
        })
        .paste('text/html', '<meta charset="UTF-8"><p>BC</p>')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'ABCD'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 3],
            end: [0, 3]
          })
        })
    })

    it('remove selected paragraphs', function () {
      return utils
        .init('<p>One</p><p>Two</p><p>Three</p><p>Four</p>', {
          start: [0, 1],
          end: [3, 2]
        })
        .paste('text/html', '<meta charset="UTF-8"><p>ne</p><p>Fo</p>')
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
            start: [1, 2],
            end: [1, 2]
          })
        })
    })

    // This is not currently implemented. It should probably be configurable
    // and part of its own module.
    it.skip('remove javascript links and event handlers', function () {
      return utils
        .init('<p><br></p>', {
          start: [0, 0]
        })
        .paste(
          'text/html',
          '<meta charset="UTF-8">' +
          '<p><a href="javascript:alert(1)">Click me</a></p>' +
          '<p><em onclick="alert(1)">Or me</em></p>'
        )
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'Click me'
            }, {
              name: 'p',
              html: 'Or me'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [1, 5],
            end: [1, 5]
          })
        })
    })
  })
})
