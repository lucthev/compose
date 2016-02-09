/* eslint-env mocha */
'use strict'

const tests = [
  {
    desc: 'multiple paragraphs',
    html: '<p>0</p><p>1</p><p>2</p><p>3</p>',
    sel: [[1, 0], [2, 1]],
    action: 'copyHTML',
    result: '<p>1</p><p>2</p>'
  },
  {
    desc: 'empty selection',
    html: '<p>123</p>',
    sel: [[0, 1]],
    action: 'copyHTML',
    result: ''
  },
  {
    desc: 'partially selected paragraph',
    html: '<p>1</p><p>12345</p><p>3</p>',
    sel: [[1, 1], [1, 4]],
    action: 'copyHTML',
    result: '<p>234</p>'
  },
  {
    desc: 'trailing BR',
    html: '<p>1<br></p><p>2</p>',
    sel: [[0, 0], [1, 1]],
    action: 'copyHTML',
    result: '<p>1</p><p>2</p>'
  },
  {
    desc: 'empty paragraph',
    html: '<p>1</p><p>2</p>',
    sel: [[0, 0], [1, 0]],
    action: 'copyHTML',
    result: '<p>1</p><p><br></p>'
  },
  {
    desc: 'multiple paragraphs',
    html: '<p>0</p><p>1</p><p>2</p><p>3</p>',
    sel: [[1, 0], [2, 1]],
    action: 'copyText',
    result: '1\n\n2'
  },
  {
    desc: 'empty selection',
    html: '<p>123</p>',
    sel: [[0, 1]],
    action: 'copyText',
    result: ''
  },
  {
    desc: 'partially selected paragraph',
    html: '<p>1</p><p>12345</p><p>3</p>',
    sel: [[1, 1], [1, 4]],
    action: 'copyText',
    result: '234'
  },
  {
    desc: 'trailing BR',
    html: '<p>1<br></p><p>2</p>',
    sel: [[0, 0], [1, 1]],
    action: 'copyText',
    result: '1\n\n2'
  },
  {
    desc: 'empty paragraph',
    html: '<p>1</p><p>2</p>',
    sel: [[0, 0], [1, 0]],
    action: 'copyText',
    result: '1\n\n'
  }
]

describe('Copy', function () {
  const TIMEOUT = 10

  tests.forEach(function ({desc, html, sel, action, result}) {
    // Skip incomplete tests
    if (!desc) return

    it(`${action} ${desc}`, function (done) {
      let el = document.createElement('div')
      el.innerHTML = html
      document.body.appendChild(el)

      let editor = new window.Compose(el).init()
      let view = editor.require('view')
      let Selection = editor.require('selection')
      let copy = editor.require('copy')

      view.setSelection(new Selection(...sel))
      let copied = copy[action]()

      expect(copied).to.equal(result)

      setTimeout(function () {
        document.body.removeChild(editor.root)
        done()
      }, TIMEOUT)
    })
  })
})
