/* global describe, it, Compose, expect, chai, TreeMatcher, ChildMatcher */
'use strict';

chai.use(TreeMatcher)
chai.use(ChildMatcher)

describe('Deleting text should', function () {
  var backspace = 8,
      fwdDel = 46,
      Selection

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

  function emit (elem, key, meta) {
    var evt = document.createEvent('HTMLEvents')

    evt.initEvent('keydown', true, true)
    evt.keyCode = key || 8

    if (meta)
      evt[/Mac/.test(navigator.platform) ? 'metaKey' : 'ctrlKey'] = true

    elem.dispatchEvent(evt)
  }

  it('do nothing at the start of the first paragraph (backspace)', function (done) {
    var editor = init('<section><p><br></p></section>')

    Selection.get = function () {
      return new Selection([0, 0])
    }

    emit(editor.elem, backspace)

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

  it('do nothing at the end of the last paragraph (delete)', function (done) {
    var editor = init('<section><p><br></p></section>')

    Selection.get = function () {
      return new Selection([0, 0])
    }

    emit(editor.elem, fwdDel)

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

  it('merge when backspacing at the start of a paragraph.', function (done) {
    var editor = init('<section><h2>One</h2><p>Two</p></section>')

    Selection.get = function () {
      return new Selection([1, 0])
    }

    emit(editor.elem, backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'OneTwo'
        }]
      }])

      teardown(editor)
      done()
    }, 0)
  })

  it('merge when deleting at the end of a paragraph.', function (done) {
    var editor = init('<section><h2>One</h2><p>Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem, fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'OneTwo'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove a character before when backspacing, collapsed (1).', function (done) {
    var editor = init('<section><p>Stuff</p></section>')

    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem, backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Stff'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove a character before when backspacing, collapsed (2).', function (done) {
    var editor = init('<section><p>Stuff</p></section>')

    Selection.get = function () {
      return new Selection([0, 5])
    }

    emit(editor.elem, backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Stuf'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove a character after when deleting, collapsed (1)', function (done) {
    var editor = init('<section><p>Stuff</p></section>')

    Selection.get = function () {
      return new Selection([0, 2])
    }

    emit(editor.elem, fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Stff'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove a character after when deleting, collapsed (2)', function (done) {
    var editor = init('<section><p>Stuff</p></section>')

    Selection.get = function () {
      return new Selection([0, 0])
    }

    emit(editor.elem, fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'tuff'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove selected text (backspace).', function (done) {
    var editor = init('<section><p>Stuff</p></section>')

    Selection.get = function () {
      return new Selection([0, 4], [0, 1])
    }

    emit(editor.elem, backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Sf'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove selected text (delete).', function (done) {
    var editor = init('<section><p>Stuff</p></section>')

    Selection.get = function () {
      return new Selection([0, 4], [0, 1])
    }

    emit(editor.elem, fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Sf'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove text across paragraphs (backspace).', function (done) {
    var editor = init('<section><h2>One</h2><pre>Two</pre></section>')

    Selection.get = function () {
      return new Selection([1, 2], [0, 1])
    }

    emit(editor.elem, backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'Oo'
        }]
      }])

      expect(editor.plugins.view.paragraphs.length).to.equal(1)

      teardown(editor)
      done()
    }, 20)
  })

  it('remove text across paragraphs (delete).', function (done) {
    var editor = init('<section><ol><li>One</li></ol><p>Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 1], [1, 2])
    }

    emit(editor.elem, fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'ol',
          children: [{
            name: 'li',
            html: 'Oo'
          }]
        }]
      }])

      expect(editor.plugins.view.paragraphs.length).to.equal(1)

      teardown(editor)
      done()
    }, 20)
  })

  it('turn a <li> into a <p> when backspacing at the start.', function (done) {
    var editor = init(
      '<section><ul>' +
        '<li>One</li>' +
        '<li>Two</li>' +
        '<li>Three</li>' +
      '</ul></section>'
    )

    Selection.get = function () {
      return new Selection([1, 0])
    }

    emit(editor.elem, backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'ul',
          children: [{
            name: 'li',
            html: 'One'
          }]
        }, {
          name: 'p',
          html: 'Two'
        }, {
          name: 'ul',
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

  it('merge <li>s when deleting at the end of one.', function (done) {
    var editor = init('<section><ol><li>One</li><li>Two</li></ol></section>')

    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem, fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'ol',
          children: [{
            name: 'li',
            html: 'OneTwo'
          }]
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove sections when the selections spans <hr>s (backspace)', function (done) {
    var editor = init(
      '<section><h2>One</h2><p>Two</p></section>' +
      '<section><pre>Three</pre><p>Four</p></section>' +
      '<section><p>Five</p></section>'
    )

    Selection.get = function () {
      return new Selection([4, 2], [1, 1])
    }

    emit(editor.elem, backspace)

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
          html: 'Tve'
        }]
      }])

      expect(editor.plugins.view.sections.length).to.equal(1)
      expect(editor.plugins.view.paragraphs.length).to.equal(2)

      teardown(editor)
      done()
    }, 20)
  })

  it('remove sections when the selection spans <hr>s (delete).', function (done) {
    var editor = init(
      '<section><h2>One</h2><p>Two</p></section>' +
      '<section><pre>Three</pre><p>Four</p></section>' +
      '<section><p>Five</p></section>'
    )

    Selection.get = function () {
      return new Selection([0, 3], [2, 5])
    }

    emit(editor.elem, fwdDel)

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
          html: 'Four'
        }]
      }, {
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Five'
        }]
      }])

      expect(editor.plugins.view.sections.length).to.equal(2)
      expect(editor.plugins.view.paragraphs.length).to.equal(3)

      teardown(editor)
      done()
    }, 20)
  })

  it('remove sections when backspacing collapsed after one.', function (done) {
    var editor = init(
      '<section><h2>One</h2></section>' +
      '<section><blockquote>Two</blockquote></section>'
    )

    Selection.get = function () {
      return new Selection([1, 0])
    }

    emit(editor.elem, backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'One'
        }, {
          name: 'blockquote',
          html: 'Two'
        }]
      }])

      expect(editor.plugins.view.sections.length).to.equal(1)
      expect(editor.plugins.view.paragraphs.length).to.equal(2)

      teardown(editor)
      done()
    }, 20)
  })

  it('remove sections when deleting collapsed before one.', function (done) {
    var editor = init(
      '<section><h2>One</h2></section>' +
      '<section><blockquote>Two</blockquote></section>'
    )

    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem, fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'One'
        }, {
          name: 'blockquote',
          html: 'Two'
        }]
      }])

      expect(editor.plugins.view.sections.length).to.equal(1)
      expect(editor.plugins.view.paragraphs.length).to.equal(2)

      teardown(editor)
      done()
    }, 20)
  })

  it('convert spaces to &nbsp;s where appropriate (1).', function (done) {
    var editor = init('<section><p>One t</p></section>')

    Selection.get = function () {
      return new Selection([0, 5])
    }

    emit(editor.elem, backspace)

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

      teardown(editor)
      done()
    }, 20)
  })

  it('convert spaces to &nbsp;s where appropriate (2).', function (done) {
    var editor = init('<section><p>A cat</p></section>')

    Selection.get = function () {
      return new Selection([0, 0])
    }

    emit(editor.elem, fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '&nbsp;cat'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('convert spaces to &nbsp;s where appropriate (3).', function (done) {
    var editor = init('<section><p>A cat</p></section>')

    Selection.get = function () {
      return new Selection([0, 2], [0, 5])
    }

    emit(editor.elem, fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'A&nbsp;'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('convert spaces to &nbsp;s where appropriate (2).', function (done) {
    var editor = init('<section><p>One cat</p></section>')

    Selection.get = function () {
      return new Selection([0, 3], [0, 0])
    }

    emit(editor.elem, backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '&nbsp;cat'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove spaces where appropriate (1).', function (done) {
    var editor = init('<section><p>One two&nbsp;</p></section>')

    Selection.get = function () {
      return new Selection([0, 4], [0, 7])
    }

    emit(editor.elem, backspace)

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

      teardown(editor)
      done()
    }, 20)
  })

  it('remove spaces where appropriate (2).', function (done) {
    var editor = init(
      '<section><p>One two</p></section>' +
      '<section><h2>Three four</h2></section>'
    )

    Selection.get = function () {
      return new Selection([1, 5], [0, 4])
    }

    emit(editor.elem, fwdDel)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One four'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove spaces where appropriate (3).', function (done) {
    var editor = init('<section><p>&nbsp;One&nbsp;</p></section>')

    Selection.get = function () {
      return new Selection([0, 1], [0, 4])
    }

    emit(editor.elem, backspace)

    setTimeout(function () {
      expect(editor.elem).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '&nbsp;'
        }]
      }])

      teardown(editor)
      done()
    }, 20)
  })

  it('remove spaces where appropriate (4).', function (done) {
    var editor = init('<section><p>One&nbsp;<br>&nbsp;Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 5])
    }

    emit(editor.elem, backspace)

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

  it('remove spaces where appropriate (5).', function (done) {
    var editor = init('<section><p>One&nbsp;</p><p>&nbsp;Two</p></section>')

    Selection.get = function () {
      return new Selection([1, 0])
    }

    emit(editor.elem, backspace)

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

  it('remove spaces where appropriate (6).', function (done) {
    var editor = init('<section><p>One&nbsp;</p><p>&nbsp;Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 4])
    }

    emit(editor.elem, fwdDel)

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

  it('remove spaces where appropriate (7).', function (done) {
    var editor = init('<section><p>One&nbsp;</p><p>&nbsp;Two</p></section>')

    Selection.get = function () {
      return new Selection([1, 0], [0, 4])
    }

    emit(editor.elem, backspace)

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

  it('remove spaces where appropriate (8).', function (done) {
    var editor = init('<section><p>One&nbsp;</p><p>&nbsp;Two</p></section>')

    Selection.get = function () {
      return new Selection([1, 0], [0, 4])
    }

    emit(editor.elem, fwdDel)

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

  it('convert &nbsp;s to regular spaces where appropriate (1).', function (done) {
    var editor = init('<section><p>One&nbsp;</p><p>Two</p></section>')

    Selection.get = function () {
      return new Selection([1, 0])
    }

    emit(editor.elem, backspace)

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

  it('convert &nbsp;s to regular spaces where appropriate (2).', function (done) {
    var editor = init('<section><p>One&nbsp;</p><p>Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 4])
    }

    emit(editor.elem, fwdDel)

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

  it('convert &nbsp;s to regular spaces where appropriate (3).', function (done) {
    var editor = init('<section><p>One&nbsp;</p><p>Two</p></section>')

    Selection.get = function () {
      return new Selection([1, 0], [0, 4])
    }

    emit(editor.elem, backspace)

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

  it('convert &nbsp;s to regular spaces where appropriate (4).', function (done) {
    var editor = init('<section><p>One&nbsp;</p><p>Two</p></section>')

    Selection.get = function () {
      return new Selection([1, 0], [0, 4])
    }

    emit(editor.elem, fwdDel)

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

  it('convert &nbsp;s to regular spaces where appropriate (5).', function (done) {
    var editor = init('<section><p>One</p><p>&nbsp;Two</p></section>')

    Selection.get = function () {
      return new Selection([1, 0])
    }

    emit(editor.elem, backspace)

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

  it('convert &nbsp;s to regular spaces where appropriate (6).', function (done) {
    var editor = init('<section><p>One</p><p>&nbsp;Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem, fwdDel)

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

  it('convert &nbsp;s to regular spaces where appropriate (7).', function (done) {
    var editor = init('<section><p>One</p><p>&nbsp;Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 3], [1, 0])
    }

    emit(editor.elem, backspace)

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

  it('convert &nbsp;s to regular spaces where appropriate (8).', function (done) {
    var editor = init('<section><p>One</p><p>&nbsp;Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 3], [1, 0])
    }

    emit(editor.elem, fwdDel)

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

  it('convert &nbsp;s to regular spaces where appropriate (9).', function (done) {
    var editor = init('<section><p>One<br>&nbsp;Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 3])
    }

    emit(editor.elem, fwdDel)

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

  it('convert &nbsp;s to regular spaces where appropriate (10).', function (done) {
    var editor = init('<section><p>One<br>&nbsp;Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 4])
    }

    emit(editor.elem, backspace)

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

  it('convert &nbsp;s to regular spaces where appropriate (11).', function (done) {
    var editor = init('<section><p>One&nbsp;<br>Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 4])
    }

    emit(editor.elem, fwdDel)

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

  it('convert &nbsp;s to regular spaces where appropriate (12).', function (done) {
    var editor = init('<section><p>One&nbsp;<br>Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 5])
    }

    emit(editor.elem, backspace)

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

  it('convert &nbsp;s to regular spaces where appropriate (13).', function (done) {
    var editor = init('<section><p>One<br>&nbsp;Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 3], [0, 4])
    }

    emit(editor.elem, fwdDel)

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

  it('convert &nbsp;s to regular spaces where appropriate (14).', function (done) {
    var editor = init('<section><p>One<br>&nbsp;Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 4], [0, 3])
    }

    emit(editor.elem, backspace)

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

  it('convert &nbsp;s to regular spaces where appropriate (15).', function (done) {
    var editor = init('<section><p>One&nbsp;<br>Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 4], [0, 5])
    }

    emit(editor.elem, fwdDel)

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

  it('convert &nbsp;s to regular spaces where appropriate (16).', function (done) {
    var editor = init('<section><p>One&nbsp;<br>Two</p></section>')

    Selection.get = function () {
      return new Selection([0, 5], [0, 4])
    }

    emit(editor.elem, backspace)

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
})
