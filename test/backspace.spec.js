/* eslint-env mocha */
'use strict'

const tests = [
  {
    desc: 'do nothing when backspacing in an empty first paragraph',
    html: '<p><br></p>',
    sel: [[0, 0]],
    action: 'backspace',
    resultHTML: '<p><br></p>',
    resultSel: [[0, 0], [0, 0]]
  },
  {
    desc: 'do nothing when deleting in an empty first paragraph',
    html: '<p><br></p>',
    sel: [[0, 0]],
    action: 'forwardDelete',
    resultHTML: '<p><br></p>',
    resultSel: [[0, 0], [0, 0]]
  },
  {
    desc: 'insert a BR when backspacing the only character',
    html: '<p>1</p>',
    sel: [[0, 1]],
    action: 'backspace',
    resultHTML: '<p><br></p>',
    resultSel: [[0, 0], [0, 0]]
  },
  {
    desc: 'insert a BR when deleting the only character',
    html: '<p>1</p>',
    sel: [[0, 0]],
    action: 'forwardDelete',
    resultHTML: '<p><br></p>',
    resultSel: [[0, 0], [0, 0]]
  },
  {
    desc: 'it convert a trailing space to an &nbsp;',
    html: '<p>One 1</p>',
    sel: [[0, 5]],
    action: 'backspace',
    resultHTML: '<p>One&nbsp;</p>',
    resultSel: [[0, 4], [0, 4]]
  },
  {
    desc: 'convert a leading space to an &nbsp;',
    html: '<p>1 One</p>',
    sel: [[0, 0]],
    action: 'forwardDelete',
    resultHTML: '<p>&nbsp;One</p>',
    resultSel: [[0, 0], [0, 0]]
  },
  {
    desc: 'remove adjacent spaces when backspacing',
    html: '<p>One 1 Two</p>',
    sel: [[0, 5]],
    action: 'backspace',
    resultHTML: '<p>One Two</p>',
    resultSel: [[0, 4], [0, 4]]
  },
  {
    desc: 'remove adjacent spaces when deleting',
    html: '<p>One 1 Two</p>',
    sel: [[0, 4]],
    action: 'forwardDelete',
    resultHTML: '<p>One Two</p>',
    resultSel: [[0, 4], [0, 4]]
  },
  {
    desc: 'remove selected text when backspacing',
    html: '<p>One two three</p>',
    sel: [[0, 12], [0, 2]],
    action: 'backspace',
    resultHTML: '<p>One</p>',
    resultSel: [[0, 2], [0, 2]]
  },
  {
    desc: 'remove selected text when deleting',
    html: '<p>One two three</p>',
    sel: [[0, 12], [0, 2]],
    action: 'forwardDelete',
    resultHTML: '<p>One</p>',
    resultSel: [[0, 2], [0, 2]]
  },
  {
    desc: 'remove paragraphs when backspacing over multiple',
    html: '<p>One</p><p>Two</p><p>Three</p>',
    sel: [[0, 1], [2, 2]],
    action: 'backspace',
    resultHTML: '<p>Oree</p>',
    resultSel: [[0, 1], [0, 1]]
  },
  {
    desc: 'remove paragraphs when deleting over multiple',
    html: '<p>One</p><p>Two</p><p>Three</p>',
    sel: [[0, 1], [2, 2]],
    action: 'forwardDelete',
    resultHTML: '<p>Oree</p>',
    resultSel: [[0, 1], [0, 1]]
  },
  {
    desc: 'insert a BR when backspacing after the only character on a line',
    html: '<p>1<br>2</p>',
    sel: [[0, 3]],
    action: 'backspace',
    resultHTML: '<p>1<br><br></p>',
    resultSel: [[0, 2], [0, 2]]
  },
  {
    desc: 'insert a BR when deleting the only character on a line',
    html: '<p>1<br>2</p>',
    sel: [[0, 2]],
    action: 'forwardDelete',
    resultHTML: '<p>1<br><br></p>',
    resultSel: [[0, 2], [0, 2]]
  },
  {
    desc: 'insert a BR when backspacing over all text on a line',
    html: '<p>One<br>Two</p>',
    sel: [[0, 4], [0, 7]],
    action: 'backspace',
    resultHTML: '<p>One<br><br></p>',
    resultSel: [[0, 4], [0, 4]]
  },
  {
    desc: 'insert a BR when deleting all text on a line',
    html: '<p>One<br>Two</p>',
    sel: [[0, 4], [0, 7]],
    action: 'forwardDelete',
    resultHTML: '<p>One<br><br></p>',
    resultSel: [[0, 4], [0, 4]]
  },
  {
    desc: 'merge paragraphs when backspacing at the start of one',
    html: '<p>One</p><p>Two</p>',
    sel: [[1, 0]],
    action: 'backspace',
    resultHTML: '<p>OneTwo</p>',
    resultSel: [[0, 3], [0, 3]]
  },
  {
    desc: 'merge paragraphs when deleting at the end of one',
    html: '<p>One</p><p>Two</p>',
    sel: [[0, 3]],
    action: 'forwardDelete',
    resultHTML: '<p>OneTwo</p>',
    resultSel: [[0, 3], [0, 3]]
  },
  {
    desc: 'ignore trailing BRs when deleting at the end of a paragraph',
    html: '<p>One<br></p><p>Two</p>',
    sel: [[0, 3]],
    action: 'forwardDelete',
    resultHTML: '<p>OneTwo</p>',
    resultSel: [[0, 3], [0, 3]]
  },
  {
    desc: 'ignore trailing BRs when backspacing at the start of a paragraph',
    html: '<p>One<br></p><p>Two</p>',
    sel: [[1, 0]],
    action: 'backspace',
    resultHTML: '<p>OneTwo</p>',
    resultSel: [[0, 3], [0, 3]]
  },
  {
    desc: 'not create trailing BRs',
    html: '<p>1</p><p><br></p>',
    sel: [[1, 0]],
    action: 'backspace',
    resultHTML: '<p>1</p>',
    resultSel: [[0, 1]]
  },
  {
    desc: 'before a leading newline, backspace',
    html: '<p>1</p><p><br>2</p>',
    sel: [[1, 0]],
    action: 'backspace',
    resultHTML: '<p>1<br>2</p>',
    resultSel: [[0, 1]]
  },
  {
    desc: 'respect newlines when backspacing at the start of a paragraph',
    html: '<p>One<br><br></p><p>Two</p>',
    sel: [[1, 0]],
    action: 'backspace',
    resultHTML: '<p>One<br>Two</p>',
    resultSel: [[0, 4], [0, 4]]
  },
  {
    desc: 'preserve BRs if necessary when backspacing',
    html: '<p>One<br><br></p><p><br></p>',
    sel: [[1, 0]],
    action: 'backspace',
    resultHTML: '<p>One<br><br></p>',
    resultSel: [[0, 4], [0, 4]]
  },
  {
    desc: 'respect newlines when deleting at the end of a paragraph',
    html: '<p>One<br><br></p><p>Two</p>',
    sel: [[0, 4]],
    action: 'forwardDelete',
    resultHTML: '<p>One<br>Two</p>',
    resultSel: [[0, 4], [0, 4]]
  },
  {
    desc: 'preserve BRs if necessary when deleting',
    html: '<p>One<br><br></p><p><br></p>',
    sel: [[0, 4]],
    action: 'forwardDelete',
    resultHTML: '<p>One<br><br></p>',
    resultSel: [[0, 4], [0, 4]]
  },
  {
    desc: 'merge markups it brings together when deleting',
    html: '<p><em>1</em>2<em>3</em></p>',
    sel: [[0, 1]],
    action: 'forwardDelete',
    resultHTML: '<p><em>13</em></p>',
    resultSel: [[0, 1], [0, 1]]
  },
  {
    desc: 'merge markups it brings together when backspacing',
    html: '<p><em>1</em>2<em>3</em></p>',
    sel: [[0, 2]],
    action: 'backspace',
    resultHTML: '<p><em>13</em></p>',
    resultSel: [[0, 1], [0, 1]]
  }
]

describe('Backspace/delete', function () {
  tests.forEach(function ({desc, html, sel, action, resultHTML, resultSel}) {
    // Skip incomplete tests
    if (!desc) return

    it(desc, function (done) {
      let el = document.createElement('div')
      el.innerHTML = html
      document.body.appendChild(el)

      let editor = new window.Compose(el).init()
      let view = editor.require('view')
      let Selection = editor.require('selection')
      let backspace = editor.require('backspace')

      view.setSelection(new Selection(...sel))
      backspace[action]()

      setTimeout(function () {
        expect(el.innerHTML).to.equal(resultHTML)
        expect(view.getSelection()).to.eql(new Selection(...resultSel))

        done()
      }, 10)
    })
  })
})
