/* global describe, it, Compose, expect, chai, TreeMatcher, ChildMatcher */
'use strict';

chai.use(TreeMatcher)
chai.use(ChildMatcher)

describe('Pressing the spacebar should', function () {
  var Selection

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

  function teardown (editor) {
    var elem = editor.elem

    try {
      editor.destroy()
    } catch (e) {}

    elem.parentNode.removeChild(elem)
  }

  function emit (elem) {
    var evt = document.createEvent('HTMLEvents')

    evt.initEvent('keydown', true, true)
    evt.keyCode = 32

    elem.dispatchEvent(evt)
  }

  it('insert a space.', function (done) {
    var editor = init('<section><p>OneTwo</p></section>')

    Selection.get = function () {
      return new Selection([0, 3])
    }

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

      teardown(editor)
      done()
    }, 20)
  })

  it('insert a non-breaking space at the end of a paragraph.', function (done) {
    var editor = init('<section><p>Words</p></section>')

    Selection.get = function () {
      return new Selection([0, 5])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Words&nbsp;'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('insert a non-breaking space at the start of a paragraph.', function (done) {
    var editor = init('<section><p>Fortune Days</p></section>')

    Selection.get = function () {
      return new Selection([0, 0])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '&nbsp;Fortune Days'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('do nothing when the previous character is a space.', function (done) {
    var editor = init('<section><p>Once upon a time…</p></section>')

    Selection.get = function () {
      return new Selection([0, 5])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Once upon a time…'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('do nothing when the next character is a space.', function (done) {
    var editor = init('<section><p>Where the wild things are.</p></section>')

    Selection.get = function () {
      return new Selection([0, 5])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Where the wild things are.'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('convert a <p> to an ol when the <p>’s start matches /^1\\./', function (done) {
    var editor = init('<section><p>1.</p></section>')

    Selection.get = function () {
      return new Selection([0, 2])
    }

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

      teardown(editor)
      done()
    }, 20)
  })

  it('convert a <p> to a ul when the <p>’s start matches /[*-]/', function (done) {
    var editor = init('<section><p>*Stuff</p></section>')

    Selection.get = function () {
      return new Selection([0, 1])
    }

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
            html: 'Stuff'
          }]
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('not convert anything else to a list.', function (done) {
    var editor = init('<section><pre>1.</pre></section>')

    Selection.get = function () {
      return new Selection([0, 2])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'pre',
          html: '1.&nbsp;'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('not convert to a list when the cursor is not in the right place.', function (done) {
    var editor = init('<section><p>1.Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '1.T wo'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('not convert to a list when the cursor is not collapsed.', function (done) {
    var editor = init('<section><p>1.Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 2], [0, 3])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '1. wo'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('replace selected text with a space.', function (done) {
    var editor = init('<section><p>One</p></section>')

    Selection.get = function () {
      return new Selection([0, 2], [0, 1])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'O e'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove text if a space precedes the selection.', function (done) {
    var editor = init('<section><h2>Ho hum.</h2></section>')

    Selection.get = function () {
      return new Selection([0, 3], [0, 5])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'Ho m.'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove text if a space follows the selection.', function (done) {
    var editor = init('<section><h2>Holy cow</h2></section>')

    Selection.get = function () {
      return new Selection([0, 4], [0, 1])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'H cow'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove a space when they surround the text.', function (done) {
    var editor = init('<section><p>One Two Three</p></section>')

    Selection.get = function () {
      return new Selection([0, 7], [0, 3])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One Three'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove paragraphs when the selection spans multiple.', function (done) {
    var editor = init(
      '<section>' +
        '<h2>One</h2>' +
        '<p>Two</p>' +
        '<pre>Code</pre>' +
        '<blockquote>Four</blockquote>' +
      '</section>'
    )

    Selection.get = function () {
      return new Selection([3, 2], [0, 3])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'One ur'
        }]
      }])

      expect(editor.plugins.view.paragraphs.length).to.equal(1)

      teardown(editor)
      done()
    }, 20)
  })

  it('insert an &nbsp; when the end of a paragraph is selected.', function (done) {
    var editor = init(
      '<section><p>One</p><h3>Two</h3></section>'
    )

    Selection.get = function () {
      return new Selection([0, 2], [1, 3])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'On&nbsp;'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('not get tripped up by <br>s.', function (done) {
    var editor = init('<section><p>One</p><p>Word<br></p></section>')

    Selection.get = function () {
      return new Selection([1, 4], [0, 1])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'O&nbsp;'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('replace a regular space with an &nbsp; if necessary.', function (done) {
    var editor = init('<section><p>Ta fête</p><p>Three</p></section>')

    Selection.get = function () {
      return new Selection([0, 2], [1, 5])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Ta&nbsp;'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove sections if the selection spans <hr>s.', function (done) {
    var editor = init(
      '<section><p>One</p></section>' +
      '<section>' +
        '<h2>Two</h2>' +
        '<p>Three</p>' +
      '</section>' +
      '<section><p>Four</p></section>'
    )

    Selection.get = function () {
      return new Selection([3, 2], [0, 2])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'On ur'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })
})
