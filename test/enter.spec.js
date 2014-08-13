/* global describe, it, Compose, expect, chai, TreeMatcher, ChildMatcher */
'use strict';

chai.use(TreeMatcher)
chai.use(ChildMatcher)

describe('Pressing the enter key should', function () {
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

  function emit (elem, shift) {
    var evt = document.createEvent('HTMLEvents')

    evt.initEvent('keydown', true, true)
    evt.keyCode = 13
    evt.shiftKey = !!shift

    elem.dispatchEvent(evt)
  }

  it('insert a <p> after a <p>.', function (done) {
    var editor = init('<section><p>One</p></section>')

    // Firefox has a really annoying bug (?) where input fields don’t
    // actually get a cursor in them unless the window is focussed —
    // making automated testing impossible. This is a workaround.
    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem, false)

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

      teardown(editor)
      done()
    }, 20)
  })

  it('insert a <p> after a heading.', function (done) {
    var editor = init('<section><h2>One</h2></section>')

    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem, false)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'One'
        }, {
          name: 'p',
          html: '<br>'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('insert a <p> after a <pre>', function (done) {
    var editor = init('<section><pre>One</pre></section>')

    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem, false)

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
          html: '<br>'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('insert a <p> after a <blockquote>', function (done) {
    var editor = init('<section><blockquote>One</blockquote></section>')

    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem, false)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'blockquote',
          html: 'One'
        }, {
          name: 'p',
          html: '<br>'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('insert a <li> after a <li>', function (done) {
    var editor = init('<section><ol><li>One</li></ol></section>')

    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem, false)

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

      teardown(editor)
      done()
    }, 20)
  })

  it('do nothing with an empty first paragraph (1).', function (done) {
    var editor = init('<section><p><br></p></section>')

    Selection.get = function () {
      return new Selection([0, 0])
    }

    emit(editor.elem, false)

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

      teardown(editor)
      done()
    }, 20)
  })

  it('do nothing with an empty first paragraph (2).', function (done) {
    var editor = init(
          '<section><p>One</p></section>' +
          '<section><h2><br></h2></section>'
        )

    Selection.get = function () {
      return new Selection([1, 0])
    }

    emit(editor.elem, false)

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
          name: 'h2',
          html: '<br>'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('make a section when the not-first paragraph is empty', function (done) {
    var editor = init('<section><p>One</p><p><br></p></section>')

    Selection.get = function () {
      return new Selection([1, 0])
    }

    emit(editor.elem)

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

      teardown(editor)
      done()
    }, 20)
  })

  it('convert a <li> to a <p> when the <li> is empty (1).', function (done) {
    var editor = init('<section><ol><li><br></li></ol></section>')

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
          html: '<br>'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('convert a <li> to a <p> when the <li> is empty (2).', function (done) {
    var editor = init(
          '<section><ol>' +
            '<li>One</li>' +
            '<li><br></li>' +
            '<li>Three</li>' +
          '</ol></section>'
        )

    Selection.get = function () {
      return new Selection([1, 0])
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

      teardown(editor)
      done()
    }, 20)
  })

  it('delete highlighted text across paragraphs.', function (done) {
    var editor = init('<section><p>One</p><p>Two</p></section>')

    Selection.get = function () {
      return new Selection([1, 1], [0, 1])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'O'
        }, {
          name: 'p',
          html: 'wo'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('delete highlighted text within a paragraph.', function (done) {
    var editor = init('<section><h2>Once upon a time</h2></section>')

    Selection.get = function () {
      return new Selection([0, 4], [0, 12])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'Once'
        }, {
          name: 'h2',
          html: 'time'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('split a paragraph when the cursor is in the middle.', function (done) {
    var editor = init('<section><pre>OneTwo</pre></section>')

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
          name: 'pre',
          html: 'One'
        }, {
          name: 'pre',
          html: 'Two'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('insert a <br> when the shift key is down.', function (done) {
    var editor = init('<section><p>One</p></section>')

    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem, true)

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

      teardown(editor)
      done()
    }, 20)
  })

  it('insert a <br> in the middle of a paragraph.', function (done) {
    var editor = init('<section><blockquote>OneTwo</blockquote></section>')

    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem, true)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'blockquote',
          html: 'One<br>Two'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('create a new paragraph when shift-enter is pressed twice.', function (done) {
    var editor = init('<section><p>OneTwo</p></section>')

    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem, true)

    setTimeout(function () {
      Selection.get = function () {
        return new Selection([0, 4])
      }

      emit(editor.elem, true)
    }, 10)

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

      teardown(editor)
      done()
    }, 20)
  })

  it('make a new paragraph when two <br>s are adjacent (1).', function (done) {
    var editor = init('<section><h2>One<br>Two</h2></section>')

    Selection.get = function () {
      return new Selection([0, 4])
    }

    emit(editor.elem, true)

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

      teardown(editor)
      done()
    }, 20)
  })

  it('make a new paragraph when two <br>s are adjacent (2).', function (done) {
    var editor = init('<section><pre>One<br>Two</pre></section>')

    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem, true)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'pre',
          html: 'One'
        }, {
          name: 'pre',
          html: 'Two'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('should act normally when a <br> after the caret is at the end.', function (done) {
    var editor = init('<section><p>One<br></p></section>')

    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem, true)

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

      teardown(editor)
      done()
    }, 20)
  })

  it('remove sections when selected text includes an <hr> (1).', function (done) {
    var editor = init(
      '<section><p>One</p></section>' +
      '<section><p>Two</p></section>'
    )

    Selection.get = function () {
      return new Selection([0, 1], [1, 1])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'O'
        }, {
          name: 'p',
          html: 'wo'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove sections when selected text includes an <hr> (2).', function (done) {
    var editor = init(
      '<section><p>One</p></section>' +
      '<section><p>Two</p></section>' +
      '<section><h2>Three</h2></section>'
    )

    Selection.get = function () {
      return new Selection([2, 1], [0, 1])
    }

    emit(editor.elem)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'O'
        }, {
          name: 'h2',
          html: 'hree'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('turn a <p> into a <li> when both are selected.', function (done) {
    var editor = init(
      '<section>' +
      '<ol>' +
        '<li>One</li>' +
        '<li>Two</li>' +
      '</ol>' +
      '<p>Three</p>' +
      '</section>'
    )

    Selection.get = function () {
      return new Selection([1, 1], [2, 1])
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
            html: 'One'
          }, {
            name: 'li',
            html: 'T'
          }, {
            name: 'li',
            html: 'hree'
          }]
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })
})
