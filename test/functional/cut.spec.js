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

describe.skip('Cutting text should', function () {
  beforeEach(function () {
    browser.get(utils.url())
  })

  it('remove selected text', function () {
    return utils
      .init('<section><p>One</p></section>', {
        start: [0, 0],
        end: [0, 3]
      })
      .cut(function (clipboard) {
        expect(clipboard.text).to.equal('One')
        expect(clipboard.children).to.resemble([{
          name: 'p',
          html: 'One'
        }])
      })
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

  it('treat new paragraphs as "\\n\\n"', function () {
    return utils
      .init('<section><p>One</p><p>Two</p></section>', {
        start: [1, 2],
        end: [0, 1]
      })
      .cut(function (clipboard) {
        expect(clipboard.text).to.equal('ne\n\nTw')
        expect(clipboard.children).to.resemble([{
          name: 'p',
          html: 'ne'
        }, {
          name: 'p',
          html: 'Tw'
        }])
      })
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'Oo'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 1],
          end: [0, 1]
        })
      })
  })

  it('work with lists', function () {
    return utils
      .init(
        '<section>' +
          '<ol>' +
            '<li>One</li>' +
            '<li>Two</li>' +
            '<li>Three</li>' +
          '</ol>' +
          '<p>Four</p>' +
        '</section>', {
        start: [3, 3],
        end: [0, 1]
      })
      .cut(function (clipboard) {
        expect(clipboard.text).to.equal('ne\n\nTwo\n\nThree\n\nFou')
        expect(clipboard.children).to.resemble([{
          name: 'ol',
          children: [{
            name: 'li',
            html: 'ne'
          }, {
            name: 'li',
            html: 'Two'
          }, {
            name: 'li',
            html: 'Three'
          }]
        }, {
          name: 'p',
          html: 'Fou'
        }])
      })
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'Or'
            }]
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 1],
          end: [0, 1]
        })
      })
  })

  it('not add sections or HRs to copied HTML', function () {
    return utils
      .init(
        '<section><p>One</p></section>' +
        '<section><h2>Two</h2></section>', {
        start: [0, 2],
        end: [1, 2]
      })
      .cut(function (clipboard) {
        expect(clipboard.text).to.equal('e\n\nTw')
        expect(clipboard.children).to.resemble([{
          name: 'p',
          html: 'e'
        }, {
          name: 'h2',
          html: 'Tw'
        }])
      })
      .result(function (tree, sel) {
        expect(tree).to.resemble([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'Ono'
          }]
        }])

        expect(sel).to.deep.equal({
          start: [0, 2],
          end: [0, 2]
        })
      })
  })

  /*it('', function () {
    return utils
      .init('<section></section>', {
        start: [],
        end: []
      })
      .cut(function (clipboard) {
        expect(clipboard.text).to.equal()
        expect(clipboard.children).to.resemble([{
          name: '',
          html: ''
        }])
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
