/* global describe, it, Compose, expect, chai, afterEach, TreeMatcher, ChildMatcher */
'use strict';

chai.use(TreeMatcher)
chai.use(ChildMatcher)

describe('Pressing the spacebar should', function () {
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

  function emit (elem) {
    var evt = document.createEvent('HTMLEvents')

    evt.initEvent('keypress', true, true)
    evt.which = 32

    elem.dispatchEvent(evt)
  }

  afterEach(function () {
    var elem = editor.elem

    try {
      editor.destroy()
    } catch (e) {}

    elem.parentNode.removeChild(elem)
  })

  it('insert an &nbsp; at the end of a paragraph.', function (done) {
    editor = init('<section><p>One</p></section>')

    Selection.set(new Selection([0, 3]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One&nbsp;'
        }]
      }])

      done()
    }, 0)
  })

  it('insert a regular space in the middle of other characters.', function (done) {
    editor = init('<section><p>EverlastingLight</p></section>')

    Selection.set(new Selection([0, 11]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Everlasting Light'
        }]
      }])

      done()
    }, 0)
  })

  it('insert an &nbsp at the start of a paragraph.', function (done) {
    editor = init('<section><p>El Camino</p></section>')

    Selection.set(new Selection([0, 0]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '&nbsp;El Camino'
        }]
      }])

      done()
    }, 0)
  })

  it('insert an nbsp; before a newline.', function (done) {
    editor = init('<section><p>One<br>Two</p></section>')

    Selection.set(new Selection([0, 3]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One&nbsp;<br>Two'
        }]
      }])

      done()
    }, 0)
  })

  it('insert an &nbsp; after a newline.', function (done) {
    editor = init('<section><p>One<br>Two</p></section>')

    Selection.set(new Selection([0, 4]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br>&nbsp;Two'
        }]
      }])

      done()
    }, 0)
  })

  it('move the cursor forward when the next character is a space.', function (done) {
    editor = init('<section><p>One Two</p></section>')

    Selection.set(new Selection([0, 3]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
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

  it('do nothing when the previous char is a space.', function (done) {
    editor = init('<section><p>A sly fox.</p></section>')

    Selection.set(new Selection([0, 2]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'A sly fox.'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 2]))

      done()
    }, 0)
  })

  it('should remove highlighted text.', function (done) {
    editor = init('<section><p>OneABCTwo</p></section>')

    Selection.set(new Selection([0, 6], [0, 3]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One Two'
        }]
      }])

      done()
    }, 0)
  })

  it('insert an &nbsp; when the text is selected to the end of a paragraph.', function (done) {
    editor = init('<section><p>OneABC</p></section>')

    Selection.set(new Selection([0, 3], [0, 6]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One&nbsp;'
        }]
      }])

      done()
    }, 0)
  })

  it('insert an &nbsp; when selected tet starts at the beginning of a pragraph.', function (done) {
    editor = init('<section><p>ABCOne</p></section>')

    Selection.set(new Selection([0, 0], [0, 3]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '&nbsp;One'
        }]
      }])

      done()
    }, 0)
  })

  it('remove paragraphs when the selection spans multiple.', function (done) {
    editor = init(
      '<section>' +
        '<p>One</p>' +
        '<h2>Two</h2>' +
        '<p>Three</p>' +
        '<p>Four</p>' +
      '</section>'
    )

    Selection.set(new Selection([3, 1], [0, 2]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'On our'
        }]
      }])

      done()
    }, 0)
  })

  it('remove sections when the selection spans multiple.', function (done) {
    editor = init(
      '<section><p>One</p></section>' +
      '<section><h2>Two</h2><p>Three</p></section>' +
      '<section><p>Four</p></section>'
    )

    Selection.set(new Selection([0, 2], [3, 1]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'On our'
        }]
      }])

      done()
    }, 0)
  })

  it('convert a paragraph to an ordered list under special circumstances.', function (done) {
    editor = init('<section><p>1.</p></section>')

    Selection.set(new Selection([0, 2]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([0, 0]))

      done()
    }, 0)
  })

  it('not convert a <p> to an <ol> when the caret is not after the "1."', function (done) {
    editor = init('<section><p>1.OneTwo</p></section>')

    Selection.set(new Selection([0, 5]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '1.One Two'
        }]
      }])

      done()
    }, 0)
  })

  it('not convert anything but a <p> to an <ol>.', function (done) {
    editor = init('<section><h2>1.</h2></section>')

    Selection.set(new Selection([0, 2]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'h2',
          html: '1.&nbsp;'
        }]
      }])

      done()
    }, 0)
  })

  it('it should convert a <p> to an <ul> when the paragraph starts with -.', function (done) {
    editor = init('<section><p>-</p></section>')

    Selection.set(new Selection([0, 1]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([0, 0]))

      done()
    }, 0)
  })

  it('it should convert a <p> to an <ul> when the paragraph starts with *.', function (done) {
    editor = init('<section><p>*</p></section>')

    Selection.set(new Selection([0, 1]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
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
      expect(Selection.get()).to.deep.equal(new Selection([0, 0]))

      done()
    }, 0)
  })

  it('not convert a <p> to an <ul> when the caret is not after the */-.', function (done) {
    editor = init('<section><p>*</p></section>')

    Selection.set(new Selection([0, 0]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '&nbsp;*'
        }]
      }])

      done()
    }, 0)
  })

  it('not convert anything but a <p> to an <ul>.', function (done) {
    editor = init('<section><pre>-</pre></section>')

    Selection.set(new Selection([0, 1]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'pre',
          html: '-&nbsp;'
        }]
      }])

      done()
    }, 0)
  })

  it('not create multiple adjacent spaces when one precedes a non-collapsed selection.', function (done) {
    editor = init('<section><p>One ABCTwo</p></section>')

    Selection.set(new Selection([0, 4], [0, 7]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
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

  it('not create multiple adjacent spaces when one follows a non-collapsed selection.', function (done) {
    editor = init('<section><p>OneABC Two</p></section>')

    Selection.set(new Selection([0, 3], [0, 6]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
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

  it('not keep multiple adjacent spaces when a non-collapsed selection in surrounded by spaces.', function (done) {
    editor = init('<section><p>One ABC Two</p></section>')

    Selection.set(new Selection([0, 4], [0, 7]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
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

  it('convert a trailing space to an &nbsp;', function (done) {
    editor = init('<section><p>One ABC</p></section>')

    Selection.set(new Selection([0, 4], [0, 7]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
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

  it('convert a starting space to an &nbsp;', function (done) {
    editor = init('<section><p>ABC One</p></section>')

    Selection.set(new Selection([0, 3], [0, 0]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '&nbsp;One'
        }]
      }])
      expect(Selection.get()).to.deep.equal(new Selection([0, 1]))

      done()
    }, 0)
  })

  it('deal with trailing <br>s, if they exist.', function (done) {
    editor = init('<section><p>One<br></p></section>')

    Selection.set(new Selection([0, 3]))

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One&nbsp;'
        }]
      }])

      done()
    }, 0)
  })
})
