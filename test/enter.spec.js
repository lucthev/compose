/* global describe, it, Compose, expect, chai, TreeMatcher, ChildMatcher, afterEach */
'use strict';

chai.use(TreeMatcher)
chai.use(ChildMatcher)

describe('Pressing the enter key should', function () {
  var Selection,
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

  function emit (shift) {
    var evt = document.createEvent('HTMLEvents')

    evt.initEvent('keydown', true, true)
    evt.keyCode = 13
    evt.shiftKey = !!shift

    editor.elem.dispatchEvent(evt)
  }

  afterEach(function () {
    var elem = editor.elem

    try {
      editor.destroy()
    } catch (e) {}

    elem.parentNode.removeChild(elem)
  })

  it('insert a <p> after a <p>.', function (done) {
    editor = init('<section><p>One</p></section>')

    Selection.set(new Selection([0, 3]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('insert an <li> after an <li>.', function (done) {
    editor = init('<section><ol><li>One</li></ol></section>')

    Selection.set(new Selection([0, 3]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('insert a <p> after anything else.', function (done) {
    editor = init('<section><h2>1</h2></section>')

    Selection.set(new Selection([0, 1]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('do nothing whith an empty first section.', function (done) {
    editor = init('<section><p><br></p></section>')

    Selection.set(new Selection([0, 0]))

    emit()

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

  it('do nothing with an empty first paragraph.', function (done) {
    editor = init(
      '<section><p>One</p></section>' +
      '<section><p><br></p></section>')

    Selection.set(new Selection([1, 0]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('convert a trailing space to an &nbsp;', function (done) {
    editor = init('<section><p>One Two</p></section>')

    Selection.set(new Selection([0, 4]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('convert a leading space to an &nbsp;', function (done) {
    editor = init('<section><p>One Two</p></section>')

    Selection.set(new Selection([0, 3]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('handle both leading an trailing spaces.', function (done) {
    editor = init('<section><p>One ABC Two</p></section>')

    Selection.set(new Selection([0, 7], [0, 4]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('leave a <br> when at the start of a paragraph.', function (done) {
    editor = init('<section><p>One</p></section>')

    Selection.set(new Selection([0, 0]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('remove selected text.', function (done) {
    editor = init('<section><p>One ABC Two</p></section>')

    Selection.set(new Selection([0, 3], [0, 8]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('remove paragraphs when the selection spans multiple.', function (done) {
    editor = init(
      '<section>' +
        '<p>One ABC</p>' +
        '<p>Filler</p>' +
        '<h2>More filler</h2>' +
        '<p>ABC Two</p>' +
      '</section>'
    )

    Selection.set(new Selection([3, 4], [0, 3]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('remove sections when the selection spans multiple.', function (done) {
    editor = init(
      '<section><pre>One ABC</pre></section>' +
      '<section><h2>Filler</h2></section>' +
      '<section><p>ABC Two</p></section>'
    )

    Selection.set(new Selection([0, 3], [2, 4]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('ignore trailing <br>s when at the end of a paragraph.', function (done) {
    editor = init('<section><p>One<br></p></section>')

    Selection.set(new Selection([0, 3]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('conserve <br>s when after a newline.', function (done) {
    editor = init('<section><p>One<br><br></p></section>')

    Selection.set(new Selection([0, 4]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('insert a <br> when after a <br>.', function (done) {
    editor = init('<section><p>One<br>Two</p></section>')

    Selection.set(new Selection([0, 4]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('insert a newline when pressing Shift+Enter', function (done) {
    editor = init('<section><p>One</p></section>')

    Selection.set(new Selection([0, 3]))

    emit(true)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
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

  it('not insert a newline when the paragraph is empty.', function (done) {
    editor = init('<section><p>One</p><p><br></p></section>')

    Selection.set(new Selection([1, 0]))

    emit(true)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('insert a newline between other characters.', function (done) {
    editor = init('<section><p>OneTwo</p></section>')

    Selection.set(new Selection([0, 3]))

    emit(true)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
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

  it('create a new paragraph when shift+entering after a <br>.', function (done) {
    editor = init('<section><p>One<br>Two</p></section>')

    Selection.set(new Selection([0, 4]))

    emit(true)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('create a new paragraph when shift+entering after a newline.', function (done) {
    editor = init('<section><p>One<br><br></p></section>')

    Selection.set(new Selection([0, 4]))

    emit(true)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('create a new paragraph when shift+entering before a <br>', function (done) {
    editor = init('<section><p>One<br>Two</p></section>')

    Selection.set(new Selection([0, 3]))

    emit(true)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('create a new paragraph when shift+entering before a newline.', function (done) {
    editor = init('<section><p>One<br><br></p></section>')

    Selection.set(new Selection([0, 3]))

    emit(true)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('strip leading <br>s.', function (done) {
    editor = init('<section><p>One<br>Two</p></section>')

    Selection.set(new Selection([0, 3]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('create a section when a not-first paragraph is empty.', function (done) {
    editor = init('<section><p>One</p><p><br></p></section>')

    Selection.set(new Selection([1, 0]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('convert a <li> to a <p> when the <li> is empty.', function (done) {
    editor = init('<section><ol><li><br></li></ol></section>')

    Selection.set(new Selection([0, 0]))

    emit()

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

  it('split lists where necessary.', function (done) {
    editor = init(
      '<section><ol>' +
        '<li>One</li>' +
        '<li><br></li>' +
        '<li>Three</li>' +
      '</ol></section>'
    )

    Selection.set(new Selection([1, 0]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('turn a <p> into a <li> when both are selected.', function (done) {
    editor = init(
      '<section>' +
      '<ol>' +
        '<li>One ABC</li>' +
      '</ol>' +
      '<p>ABC Two</p>' +
      '</section>'
    )

    Selection.set(new Selection([1, 4], [0, 3]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('appear to do nothing under special circumstances.', function (done) {
    editor = init('<section><p>One<br></p><p>Two</p></section>')

    Selection.set(new Selection([0, 3], [1, 0]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('not create a new paragraph when there is a trailing <br>.', function (done) {
    editor = init('<section><p>One<br></p></section>')

    Selection.set(new Selection([0, 3]))

    emit(true)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
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

  it('remove adjacent <br>s where aprropriate.', function (done) {
    editor = init('<section><p>One<br>Two</p><p>Three<br>Four</p></section>')

    Selection.set(new Selection([0, 4], [1, 5]))

    emit(true)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })

  it('convert spaces to &nbsp;s when shift+entering.', function (done) {
    editor = init('<section><p>One ABC Two</p></section>')

    Selection.set(new Selection([0, 4], [0, 7]))

    emit(true)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One&nbsp;<br>&nbsp;Two'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 5]))

      done()
    }, 0)
  })

  it('should conserve block types when splitting parapgraphs.', function (done) {
    editor = init('<section><h2>OneTwo</h2></section>')

    Selection.set(new Selection([0, 3]))

    emit()

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([1, 0]))

      done()
    }, 0)
  })
})
