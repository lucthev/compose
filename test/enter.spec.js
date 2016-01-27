/* eslint-env mocha */
'use strict'

const tests = [
  {
    desc: 'in an empty paragraph',
    html: '<p><br></p>',
    sel: [[0, 0]],
    action: 'newline',
    resultHTML: '<p><br><br></p>',
    resultSel: [[0, 1]]
  },
  {
    desc: 'at the end of a paragraph',
    html: '<p>1</p>',
    sel: [[0, 1]],
    action: 'newline',
    resultHTML: '<p>1<br><br></p>',
    resultSel: [[0, 2]]
  },
  {
    desc: 'at the start of a paragraph',
    html: '<p>1</p>',
    sel: [[0, 0]],
    action: 'newline',
    resultHTML: '<p><br>1</p>',
    resultSel: [[0, 1]]
  },
  {
    desc: 'ignoring trailing BRs',
    html: '<p>1<br></p>',
    sel: [[0, 1]],
    action: 'newline',
    resultHTML: '<p>1<br><br></p>',
    resultSel: [[0, 2]]
  },
  {
    desc: 'ignoring trailing BRs, with text selected',
    html: '<p>123<br></p>',
    sel: [[0, 1], [0, 3]],
    action: 'newline',
    resultHTML: '<p>1<br><br></p>',
    resultSel: [[0, 2]]
  },
  {
    desc: 'in the middle of a paragraph',
    html: '<p>12</p>',
    sel: [[0, 1]],
    action: 'newline',
    resultHTML: '<p>1<br>2</p>',
    resultSel: [[0, 2]]
  },
  {
    desc: 'in the middle, with text selected',
    html: '<p>123</p>',
    sel: [[0, 2], [0, 1]],
    action: 'newline',
    resultHTML: '<p>1<br>3</p>',
    resultSel: [[0, 2]]
  },
  {
    desc: 'before a BR',
    html: '<p>1<br>2</p>',
    sel: [[0, 2]],
    action: 'newline',
    resultHTML: '<p>1</p><p>2</p>',
    resultSel: [[1, 0]]
  },
  {
    desc: 'before a BR, with text selected',
    html: '<p>123<br>4</p>',
    sel: [[0, 3], [0, 1]],
    action: 'newline',
    resultHTML: '<p>1</p><p>4</p>',
    resultSel: [[1, 0]]
  },
  {
    desc: 'after a BR',
    html: '<p>1<br>2</p>',
    sel: [[0, 2]],
    action: 'newline',
    resultHTML: '<p>1</p><p>2</p>',
    resultSel: [[1, 0]]
  },
  {
    desc: 'after a BR, with text selected',
    html: '<p>1<br>234</p>',
    sel: [[0, 2], [0, 4]],
    action: 'newline',
    resultHTML: '<p>1</p><p>4</p>',
    resultSel: [[1, 0]]
  },
  {
    desc: 'on a blank line',
    html: '<p>1<br><br></p>',
    sel: [[0, 2]],
    action: 'newline',
    resultHTML: '<p>1</p><p><br></p>',
    resultSel: [[1, 0]]
  },
  {
    desc: 'over multiple paragraphs',
    html: '<p>1</p><p>2</p><p>3</p>',
    sel: [[0, 1], [2, 0]],
    action: 'newline',
    resultHTML: '<p>1<br>3</p>',
    resultSel: [[0, 2]]
  },
  {
    desc: 'in the non-first paragraph',
    html: '<p>12</p><p>34</p><p>5678</p>',
    sel: [[2, 3]],
    action: 'newline',
    resultHTML: '<p>12</p><p>34</p><p>567<br>8</p>',
    resultSel: [[2, 4]]
  },
  {
    desc: 'in an empty paragraph',
    html: '<p><br></p>',
    sel: [[0, 0]],
    action: 'newParagraph',
    resultHTML: '<p><br></p><p><br></p>',
    resultSel: [[1, 0]]
  },
  {
    desc: 'in the middle of a paragraph',
    html: '<p>12</p>',
    sel: [[0, 1]],
    action: 'newParagraph',
    resultHTML: '<p>1</p><p>2</p>',
    resultSel: [[1, 0]]
  },
  {
    desc: 'at the end of a paragraph',
    html: '<p>1</p>',
    sel: [[0, 1]],
    action: 'newParagraph',
    resultHTML: '<p>1</p><p><br></p>',
    resultSel: [[1, 0]]
  },
  {
    desc: 'at the end of a paragraph, trailing BR',
    html: '<p>1<br></p>',
    sel: [[0, 1]],
    action: 'newParagraph',
    resultHTML: '<p>1</p><p><br></p>',
    resultSel: [[1, 0]]
  },
  {
    desc: 'in the middle of a paragraph, text selected',
    html: '<p>123</p>',
    sel: [[0, 1], [0, 2]],
    action: 'newParagraph',
    resultHTML: '<p>1</p><p>3</p>',
    resultSel: [[1, 0]]
  },
  {
    desc: 'at the start of a paragraph',
    html: '<p>1</p>',
    sel: [[0, 0]],
    action: 'newParagraph',
    resultHTML: '<p><br></p><p>1</p>',
    resultSel: [[1, 0]]
  },
  {
    desc: 'at the start of a paragraph, text selected',
    html: '<p>12</p>',
    sel: [[0, 0], [0, 1]],
    action: 'newParagraph',
    resultHTML: '<p><br></p><p>2</p>',
    resultSel: [[1, 0]]
  },
  {
    desc: 'on a blank line',
    html: '<p>1<br><br></p>',
    sel: [[0, 2]],
    action: 'newParagraph',
    resultHTML: '<p>1<br><br></p><p><br></p>',
    resultSel: [[1, 0]]
  },
  {
    desc: 'selecting a whole line',
    html: '<p>1<br>2</p>',
    sel: [[0, 2], [0, 3]],
    action: 'newParagraph',
    resultHTML: '<p>1<br><br></p><p><br></p>',
    resultSel: [[1, 0]]
  },
  {
    desc: 'over multiple paragraphs',
    html: '<p>12</p><p>34</p><p>56</p>',
    sel: [[0, 1], [2, 1]],
    action: 'newParagraph',
    resultHTML: '<p>1</p><p>6</p>',
    resultSel: [[1, 0]]
  },
  {
    desc: 'in the middle of a paragraph',
    html: '<p>12</p><p>34</p><p>5678</p>',
    sel: [[2, 3]],
    action: 'newParagraph',
    resultHTML: '<p>12</p><p>34</p><p>567</p><p>8</p>',
    resultSel: [[3, 0]]
  }
]

describe('Enter', function () {
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
      let enter = editor.require('enter')

      view.setSelection(new Selection(...sel))
      enter[action]()

      setTimeout(function () {
        expect(editor.root.innerHTML).to.equal(resultHTML)
        expect(view.getSelection()).to.eql(new Selection(...resultSel))
        document.body.removeChild(editor.root)
        done()
      }, TIMEOUT)
    })
  })
})
