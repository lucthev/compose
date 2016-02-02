/* eslint-env mocha */
'use strict'

const tests = [
  {
    desc: 'end of paragraph, nbsp',
    html: '<p>1</p>',
    sel: [[0, 1]],
    action: 'auto',
    resultHTML: '<p>1&nbsp;</p>',
    resultSel: [[0, 2]]
  },
  {
    desc: 'end of paragraph with trailing BR, nbsp',
    html: '<p>1<br></p>',
    sel: [[0, 1]],
    action: 'auto',
    resultHTML: '<p>1&nbsp;<br></p>',
    resultSel: [[0, 2]]
  },
  {
    desc: 'middle of paragraph, regular',
    html: '<p>EverlastingLight</p>',
    sel: [[0, 11]],
    action: 'auto',
    resultHTML: '<p>Everlasting Light</p>',
    resultSel: [[0, 12]]
  },
  {
    desc: 'start of paragraph, nbsp',
    html: '<p>El Camino</p>',
    sel: [[0, 0]],
    action: 'auto',
    resultHTML: '<p>&nbsp;El Camino</p>',
    resultSel: [[0, 1]]
  },
  {
    desc: 'before BR, nbsp',
    html: '<p>One<br>Two</p>',
    sel: [[0, 3]],
    action: 'auto',
    resultHTML: '<p>One&nbsp;<br>Two</p>',
    resultSel: [[0, 4]]
  },
  {
    desc: 'after BR, nbsp',
    html: '<p>One<br>Two</p>',
    sel: [[0, 4]],
    action: 'auto',
    resultHTML: '<p>One<br>&nbsp;Two</p>',
    resultSel: [[0, 5]]
  },
  {
    desc: 'before space, move caret',
    html: '<p>One Two</p>',
    sel: [[0, 3]],
    action: 'auto',
    resultHTML: '<p>One Two</p>',
    resultSel: [[0, 4]]
  },
  {
    desc: 'after space, nothing',
    html: '<p>A sly fox.</p>',
    sel: [[0, 2]],
    action: 'auto',
    resultHTML: '<p>A sly fox.</p>',
    resultSel: [[0, 2]]
  },
  {
    desc: 'over text',
    html: '<p>OneABCTwo</p>',
    sel: [[0, 6], [0, 3]],
    action: 'auto',
    resultHTML: '<p>One Two</p>',
    resultSel: [[0, 4]]
  },
  {
    desc: 'selected text at end of paragraph, nbsp',
    html: '<p>OneABC</p>',
    sel: [[0, 3], [0, 6]],
    action: 'auto',
    resultHTML: '<p>One&nbsp;</p>',
    resultSel: [[0, 4]]
  },
  {
    desc: 'selected text at start of paragraph, nbsp',
    html: '<p>ABCOne</p>',
    sel: [[0, 0], [0, 3]],
    action: 'auto',
    resultHTML: '<p>&nbsp;One</p>',
    resultSel: [[0, 1]]
  },
  {
    desc: 'over multiple paragraphs',
    html: '<p>One</p><p>Two</p><p>Three</p><p>Four</p>',
    sel: [[3, 1], [0, 2]],
    action: 'auto',
    resultHTML: '<p>On our</p>',
    resultSel: [[0, 3]]
  },
  {
    desc: 'after space, text selected',
    html: '<p>One ABCTwo</p>',
    sel: [[0, 4], [0, 7]],
    action: 'auto',
    resultHTML: '<p>One Two</p>',
    resultSel: [[0, 4]]
  },
  {
    desc: 'before space, text selected',
    html: '<p>OneABC Two</p>',
    sel: [[0, 3], [0, 6]],
    action: 'auto',
    resultHTML: '<p>One Two</p>',
    resultSel: [[0, 4]]
  },
  {
    desc: 'in between spaces, text selected',
    html: '<p>One ABC Two</p>',
    sel: [[0, 4], [0, 7]],
    action: 'auto',
    resultHTML: '<p>One Two</p>',
    resultSel: [[0, 4]]
  },
  {
    desc: 'after space, text selected at end',
    html: '<p>One ABC</p>',
    sel: [[0, 4], [0, 7]],
    action: 'auto',
    resultHTML: '<p>One&nbsp;</p>',
    resultSel: [[0, 4]]
  },
  {
    desc: 'before space, text selected at start',
    html: '<p>ABC One</p>',
    sel: [[0, 3], [0, 0]],
    action: 'auto',
    resultHTML: '<p>&nbsp;One</p>',
    resultSel: [[0, 1]]
  },
  {
    desc: 'extend non-link markups',
    html: '<p><strong><em>1</em></strong></p>',
    sel: [[0, 1]],
    action: 'auto',
    resultHTML: '<p><strong><em>1&nbsp;</em></strong></p>',
    resultSel: [[0, 2]]
  },
  {
    desc: 'not extend links',
    html: '<p><a href="/x">1</a></p>',
    sel: [[0, 1]],
    action: 'auto',
    resultHTML: '<p><a href="/x">1</a>&nbsp;</p>',
    resultSel: [[0, 2]]
  }
]

describe('Spacebar', function () {
  const TIMEOUT = 10

  tests.forEach(function ({ desc, html, sel, action, resultHTML, resultSel }) {
    // Skip incomplete tests
    if (!desc) return

    it(`${action} ${desc}`, function (done) {
      let el = document.createElement('div')
      el.innerHTML = html
      document.body.appendChild(el)

      let editor = new window.Compose(el).init()
      let Selection = editor.require('selection')
      let view = editor.require('view')
      let spacebar = editor.require('spacebar')

      view.setSelection(new Selection(...sel))
      spacebar[action]()

      setTimeout(function () {
        expect(editor.root.innerHTML).to.equal(resultHTML)
        expect(view.getSelection()).to.eql(new Selection(...resultSel))
        document.body.removeChild(editor.root)
        done()
      }, TIMEOUT)
    })
  })
})
