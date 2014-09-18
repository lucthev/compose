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

describe('Rich text', function () {

  if (!/chrome/i.test(utils.browserName))
    describe('with a collapsed selection should', inlineTests)
  else
    describe.skip('with a collapsed selection should', inlineTests)

  function inlineTests () {
    beforeEach(function () {
      return browser.get(utils.url())
    })

    it('apply markup to the next character', function () {
      return utils
        .init('<section><p><br></p></section>', {
          start: [0, 0]
        })
        .bold()
        .keys('1')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: '<strong>1</strong>'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 1],
            end: [0, 1]
          })
        })
    })

    it('apply multiple markups to the next character', function () {
      return utils
        .init('<section><p><br></p></section>', {
          start: [0, 0]
        })
        .bold()
        .italics()
        .keys('1')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: '<strong><em>1</em></strong>'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 1],
            end: [0, 1]
          })
        })
    })

    it('do nothing when the action is repeated twice', function () {
      return utils
        .init('<section><p><br></p></section>', {
          start: [0, 0]
        })
        .bold()
        .bold()
        .keys('1')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: /1(<br>)?/
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 1],
            end: [0, 1]
          })
        })
    })

    it('not be cancelled by modifier keys', function () {
      return utils
        .init('<section><p><br></p></section>', {
          start: [0, 0]
        })
        .bold()
        .keys(keys.SHIFT, keys.ALT)
        .keys('1')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: '<strong>1</strong>'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 1],
            end: [0, 1]
          })
        })
    })

    it('be cancelled by selection changes', function () {
      return utils
        .init('<section><p><br></p></section>', {
          start: [0, 0]
        })
        .bold()
        .keys(keys.ARROW_LEFT)
        .keys('1')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: /1(<br>)?/
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 1],
            end: [0, 1]
          })
        })
    })

    it('remove formatting from the next character if already formatted', function () {
      return utils
        .init('<section><p><strong>1</strong></p></section>', {
          start: [0, 1]
        })
        .bold()
        .keys('2')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: '<strong>1</strong>2'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 2],
            end: [0, 2]
          })
        })
    })

    it('not preserve formatting when pressing enter', function () {
      return utils
        .init('<section><p>1</p></section>', {
          start: [0, 1]
        })
        .bold()
        .keys(keys.RETURN)
        .keys('2')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: '1'
            }, {
              name: 'p',
              html: /2(<br>)?/
            }]
          }])

          expect(sel).to.deep.equal({
            start: [1, 1],
            end: [1, 1]
          })
        })
    })

    it('add some markups while removing others', function () {
      return utils
        .init('<section><p><strong>1</strong></p></section>', {
          start: [0, 1]
        })
        .bold()
        .italics()
        .keys('2')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: '<strong>1</strong><em>2</em>'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 2],
            end: [0, 2]
          })
        })
    })

    it('apply to smart text', function () {
      return utils
        .init('<section><p><br></p></section>', {
          start: [0, 0]
        })
        .italics()
        .keys('\'')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: '<em>‘</em>'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 1],
            end: [0, 1]
          })
        })
    })

    it('not go into effect partway through ellipses', function () {
      return utils
        .init('<section><p>1</p></section>', {
          start: [0, 1]
        })
        .keys('.')
        .keys('.')
        .italics()
        .keys('.')
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: '1…'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 2],
            end: [0, 2]
          })
        })
    })

    it.skip('not prevent IME composition', function () {
      // I’m not sure how to test this.
    })
  }

  describe('with a non-collapsed selection should', function () {

    beforeEach(function () {
      return browser.get(utils.url())
    })

    it('apply markups to the selected text', function () {
      return utils
        .init('<section><p>Banana bread</p></section>', {
          start: [0, 0],
          end: [0, 6]
        })
        .bold()
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: '<strong>Banana</strong> bread'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 0],
            end: [0, 6]
          })
        })
    })

    it('preserve the directionality of the selection', function () {
      return utils
        .init('<section><p>K-OS</p></section>', {
          start: [0, 3],
          end: [0, 1]
        })
        .italics()
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'K<em>-O</em>S'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 3],
            end: [0, 1]
          })
        })
    })

    it('apply over multiple paragraphs', function () {
      return utils
        .init(
          '<section>' +
            '<p>Easy</p>' +
            '<p>Easy</p>' +
          '</section>', {
          start: [1, 2],
          end: [0, 2]
        })
        .italics()
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'Ea<em>sy</em>'
            }, {
              name: 'p',
              html: '<em>Ea</em>sy'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [1, 2],
            end: [0, 2]
          })
        })
    })

    it('apply over multiple sections', function () {
      return utils
        .init(
          '<section><p>Great</p></section>' +
          '<section><p>Gatsby</p></section>', {
          start: [0, 3],
          end: [1, 3]
        })
        .bold()
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'Gre<strong>at</strong>'
            }]
          }, {
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: '<strong>Gat</strong>sby'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 3],
            end: [1, 3]
          })
        })
    })

    it('apply the markup if not fully applied (1)', function () {
      return utils
        .init('<section><p><strong>Ha</strong>lf</p></section>', {
          start: [0, 1],
          end: [0, 3]
        })
        .bold()
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: '<strong>Hal</strong>f'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 1],
            end: [0, 3]
          })
        })
    })

    it('apply the markup if not fully applied (2)', function () {
      return utils
        .init('<section><p>Ha<strong>lf</strong></p></section>', {
          start: [0, 1],
          end: [0, 3]
        })
        .bold()
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'H<strong>alf</strong>'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 1],
            end: [0, 3]
          })
        })
    })

    it('apply the markup if not fully applied (3)', function () {
      return utils
        .init('<section><p><strong>H</strong>al<strong>f</strong></p></section>', {
          start: [0, 0],
          end: [0, 4]
        })
        .bold()
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: '<strong>Half</strong>'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 0],
            end: [0, 4]
          })
        })
    })

    it('join adjacent markups of the same type', function () {
      return utils
        .init('<section><p><em>Old</em> <em>Hat</em></p></section>', {
          start: [0, 3],
          end: [0, 4]
        })
        .italics()
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: '<em>Old Hat</em>'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 3],
            end: [0, 4]
          })
        })
    })

    it('remove the markup when covering it', function () {
      return utils
        .init('<section><p><em>Papaoutai</em></p></section>', {
          start: [0, 0],
          end: [0, 9]
        })
        .italics()
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'Papaoutai'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 0],
            end: [0, 9]
          })
        })
    })

    it('remove part of a markup when within it', function () {
      return utils
        .init('<section><p><strong>Major Tom</strong></p></section>', {
          start: [0, 6],
          end: [0, 5]
        })
        .bold()
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: '<strong>Major</strong> <strong>Tom</strong>'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 6],
            end: [0, 5]
          })
        })
    })

    it('remove markups over multiple paragraphs', function () {
      return utils
        .init(
          '<section>' +
            '<p>I am <strong>the</strong></p>' +
            '<p><strong>Walrus</strong></p>' +
          '</section>', {
          start: [0, 5],
          end: [1, 3]
        })
        .bold()
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              html: 'I am the'
            }, {
              name: 'p',
              html: 'Wal<strong>rus</strong>'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 5],
            end: [1, 3]
          })
        })
    })

    it('not get confused by font-weights', function () {
      return utils
        .init('<section><h2>A heading</h2></section>', {
          start: [0, 3],
          end: [0, 5]
        })
        .bold()
        .result(function (tree, sel) {
          expect(tree).to.resemble([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'h2',
              html: 'A h<strong>ea</strong>ding'
            }]
          }])

          expect(sel).to.deep.equal({
            start: [0, 3],
            end: [0, 5]
          })
        })
    })

    /*it('', function () {
      return utils
        .init('<section></section>', {
          start: [],
          end: []
        })
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
})
