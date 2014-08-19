/* global describe, it, Compose, expect, chai, TreeMatcher, ChildMatcher, afterEach */
'use strict';

chai.use(TreeMatcher)
chai.use(ChildMatcher)

describe('Deleting text should', function () {
  var backspace = 8,
      fwdDel = 46,
      Selection,
      editor

  function init (html) {
    var elem = document.createElement('div'),
        editor

    elem.innerHTML = html
    document.body.appendChild(elem)
    editor = new Compose(elem)
    editor.use(function (Compose) {
      Selection = Compose.require('selection')
    })

    return editor
  }

  function emit (key, meta) {
    var evt = document.createEvent('HTMLEvents')

    evt.initEvent('keydown', true, true)
    evt.keyCode = key || 8

    if (meta)
      evt[/Mac/.test(navigator.platform) ? 'metaKey' : 'ctrlKey'] = true

    editor.elem.dispatchEvent(evt)
  }

  afterEach(function () {
    var elem = editor.elem

    try {
      editor.destroy()
    } catch (e) {}

    elem.parentNode.removeChild(elem)
  })

  it('do nothing when backspacing in an empty first section.', function (done) {
    editor = init('<section><p><br></p></section>')

    Selection.set(new Selection([0, 0]))

    emit(backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '<br>'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 0]))

      done()
    }, 0)
  })

  it('do nothing when deleting in an empty first section.', function (done) {
    editor = init('<section><p><br></p></section>')

    Selection.set(new Selection([0, 0]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: '<br>'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 0]))

      done()
    }, 0)
  })

  it('insert a <br> when backspacing the only character.', function (done) {
    editor = init('<section><p>1</p></section>')

    Selection.set(new Selection([0, 1]))

    emit(backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: '<br>'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 0]))

      done()
    }, 0)
  })

  it('insert a <br> when deleting the only character', function (done) {
    editor = init('<section><p>1</p></section>')

    Selection.set(new Selection([0, 0]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: '<br>'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 0]))

      done()
    }, 0)
  })

  it('it convert a trailing space to an &nbsp;', function (done) {
    editor = init('<section><p>One 1</p></section>')

    Selection.set(new Selection([0, 5]))

    emit(backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One&nbsp;'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 4]))

      done()
    }, 0)
  })

  it('convert a leading space to an &nbsp;', function (done) {
    editor = init('<section><p>1 One</p></section>')

    Selection.set(new Selection([0, 0]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: '&nbsp;One'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 0]))

      done()
    }, 0)
  })

  it('remove adjacent spaces when backspacing.', function (done) {
    editor = init('<section><p>One 1 Two</p></section>')

    Selection.set(new Selection([0, 5]))

    emit(backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One Two'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 4]))

      done()
    }, 0)
  })

  it('remove adjacent spaces when deleting.', function (done) {
    editor = init('<section><p>One 1 Two</p></section>')

    Selection.set(new Selection([0, 4]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One Two'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 4]))

      done()
    }, 0)
  })

  it('remove selected text when backspacing.', function (done) {
    editor = init('<section><p>One two three</p></section>')

    Selection.set(new Selection([0, 12], [0, 2]))

    emit(backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 2]))

      done()
    }, 0)
  })

  it('remove selected text when deleting.', function (done) {
    editor = init('<section><p>One two three</p></section>')

    Selection.set(new Selection([0, 12], [0, 2]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 2]))

      done()
    }, 0)
  })

  it('remove paragraphs when backspacing over multiple.', function (done) {
    editor = init('<section><h2>One</h2><p>Two</p><p>Three</p></section>')

    Selection.set(new Selection([0, 1], [2, 2]))

    emit(backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'Oree'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 1]))

      done()
    }, 0)
  })

  it('remove paragraphs when deleting over multiple.', function (done) {
    editor = init('<section><h2>One</h2><p>Two</p><p>Three</p></section>')

    Selection.set(new Selection([0, 1], [2, 2]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'Oree'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 1]))

      done()
    }, 0)
  })

  it('remove sections when backspacing over multiple.', function (done) {
    editor = init(
      '<section><p>One</p></section>' +
      '<section><p>Two</p></section>' +
      '<section><h2>Three</h2><pre>Four</pre></section>'
    )

    Selection.set(new Selection([3, 2], [0, 1]))

    emit(backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Our'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 1]))

      done()
    }, 0)
  })

  it('remove sections when deleting over multiple.', function (done) {
    editor = init(
      '<section><p>One</p></section>' +
      '<section><p>Two</p></section>' +
      '<section><h2>Three</h2><pre>Four</pre></section>'
    )

    Selection.set(new Selection([3, 2], [0, 1]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Our'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 1]))

      done()
    }, 0)
  })

  it('insert a <br> when backspacing after the only character on a line.', function (done) {
    editor = init('<section><p>One<br>2</p></section>')

    Selection.set(new Selection([0, 5]))

    emit(backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br><br>'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 4]))

      done()
    }, 0)
  })

  it('insert a <br> when deleting the only character on a line.', function (done) {
    editor = init('<section><p>One<br>2</p></section>')

    Selection.set(new Selection([0, 4]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br><br>'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 4]))

      done()
    }, 0)
  })

  it('insert a <br> when backspacing over all text on a line.', function (done) {
    editor = init('<section><p>One<br>Two</p></section>')

    Selection.set(new Selection([0, 4], [0, 7]))

    emit(backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br><br>'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 4]))

      done()
    }, 0)
  })

  it('insert a <br> when deleting all text on a line.', function (done) {
    editor = init('<section><p>One<br>Two</p></section>')

    Selection.set(new Selection([0, 4], [0, 7]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br><br>'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 4]))

      done()
    }, 0)
  })

  it('convert a <li> to a <p> when backspacing at the start.', function (done) {
    editor = init('<section><ol><li>One</li></ol></section>')

    Selection.set(new Selection([0, 0]))

    emit(backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 0]))

      done()
    }, 0)
  })

  it('split lists if necessary.', function (done) {
    editor = init('<section><ol><li>1</li><li>2</li><li>3</li></ol></section>')

    Selection.set(new Selection([1, 0]))

    emit(backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('merge lists when deleting at the end of one.', function (done) {
    editor = init('<section><ol><li>One</li><li>Two</li></ol></section>')

    Selection.set(new Selection([0, 3]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([0, 3]))

      done()
    }, 0)
  })

  it('merge paragraphs when backspacing at the start of one.', function (done) {
    editor = init('<section><p>One</p><h2>Two</h2></section>')

    Selection.set(new Selection([1, 0]))

    emit(backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'OneTwo'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 3]))

      done()
    }, 0)
  })

  it('merge paragraphs when deleting at the end of one.', function (done) {
    editor = init('<section><pre>One</pre><p>Two</p></section>')

    Selection.set(new Selection([0, 3]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'pre',
          html: 'OneTwo'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 3]))

      done()
    }, 0)
  })

  it('ignore trailing <br>s when deleting at the end of a paragraph.', function (done) {
    editor = init('<section><p>One<br></p><p>Two</p></section>')

    Selection.set(new Selection([0, 3]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'OneTwo'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 3]))

      done()
    }, 0)
  })

  it('ignore trailing <br>s when backspacing at the start of a paragraph.', function (done) {
    editor = init('<section><p>One<br></p><p>Two</p></section>')

    Selection.set(new Selection([1, 0]))

    emit(backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'OneTwo'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 3]))

      done()
    }, 0)
  })

  it('respect newlines when backspacing at the start of a paragraph.', function (done) {
    editor = init('<section><p>One<br><br></p><p>Two</p></section>')

    Selection.set(new Selection([1, 0]))

    emit(backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br>Two'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 4]))

      done()
    }, 0)
  })

  it('preserve <br>s if necessary when backspacing.', function (done) {
    editor = init('<section><p>One<br><br></p><p><br></p></section>')

    Selection.set(new Selection([1, 0]))

    emit(backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br><br>'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 4]))

      done()
    }, 0)
  })

  it('respect newlines when deleting at the end of a paragraph.', function (done) {
    editor = init('<section><p>One<br><br></p><p>Two</p></section>')

    Selection.set(new Selection([0, 4]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br>Two'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 4]))

      done()
    }, 0)
  })

  it('preserve <br>s if necessary when deleting.', function (done) {
    editor = init('<section><p>One<br><br></p><p><br></p></section>')

    Selection.set(new Selection([0, 4]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children:[{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br><br>'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 4]))

      done()
    }, 0)
  })

  it('remove sections when backspacing collapsed at the start of one.', function (done) {
    editor = init(
      '<section><p>One</p></section>' +
      '<section><p>Two</p></section>'
    )

    Selection.set(new Selection([1, 0]))

    emit(backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('remove sections when deleting collapsed at the end of one.', function (done) {
    editor = init(
      '<section><p>One</p></section>' +
      '<section><p>Two</p></section>'
    )

    Selection.set(new Selection([0, 3]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([0, 3]))

      done()
    }, 0)
  })

  it('ignore trailing <br>s when deleting collapsed at the end of a section.', function (done) {
    editor = init(
      '<section><p>One<br></p></section>' +
      '<section><p>Two</p></section>'
    )

    Selection.set(new Selection([0, 3]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([0, 3]))

      done()
    }, 0)
  })

  it('be able to delete sections after newlines.', function (done) {
    editor = init(
      '<section><p>One<br><br></p></section>' +
      '<section><p>Two</p></section>'
    )

    Selection.set(new Selection([0, 4]))

    emit(fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([0, 4]))

      done()
    }, 0)
  })
})
