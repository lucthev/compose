/*eslint-env mocha */
'use strict'

var expect = window.expect

describe('Deleting text should', function () {
  var editor
  var Selection
  var View
  var rm

  afterEach(teardown)

  it('do nothing when backspacing in an empty first section', function (done) {
    setup('<section><hr><p><br></p></section>')
    View.selection = new Selection([0, 0])

    rm.backspace()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '<br>'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 0], [0, 0]))
      done()
    })
  })

  it('do nothing when deleting in an empty first section', function (done) {
    setup('<section><hr><p><br></p></section>')
    View.selection = new Selection([0, 0])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '<br>'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 0], [0, 0]))
      done()
    })
  })

  it('insert a <br> when backspacing the only character', function (done) {
    setup('<section><hr><p>1</p></section>')
    View.selection = new Selection([0, 1])

    rm.backspace()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '<br>'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 0], [0, 0]))
      done()
    })
  })

  it('insert a <br> when deleting the only character', function (done) {
    setup('<section><hr><p>1</p></section>')
    View.selection = new Selection([0, 0])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '<br>'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 0], [0, 0]))
      done()
    })
  })

  it('it convert a trailing space to an &nbsp;', function (done) {
    setup('<section><hr><p>One 1</p></section>')
    View.selection = new Selection([0, 5])

    rm.backspace()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One&nbsp;'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 4], [0, 4]))
      done()
    })
  })

  it('convert a leading space to an &nbsp;', function (done) {
    setup('<section><hr><p>1 One</p></section>')
    View.selection = new Selection([0, 0])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '&nbsp;One'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 0], [0, 0]))
      done()
    })
  })

  it('remove adjacent spaces when backspacing', function (done) {
    setup('<section><hr><p>One 1 Two</p></section>')
    View.selection = new Selection([0, 5])

    rm.backspace()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One Two'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 4], [0, 4]))
      done()
    })
  })

  it('remove adjacent spaces when deleting', function (done) {
    setup('<section><hr><p>One 1 Two</p></section>')
    View.selection = new Selection([0, 4])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One Two'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 4], [0, 4]))
      done()
    })
  })

  it('remove selected text when backspacing', function (done) {
    setup('<section><hr><p>One two three</p></section>')
    View.selection = new Selection([0, 12], [0, 2])

    rm.backspace()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 2], [0, 2]))
      done()
    })
  })

  it('remove selected text when deleting', function (done) {
    setup('<section><hr><p>One two three</p></section>')
    View.selection = new Selection([0, 12], [0, 2])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 2], [0, 2]))
      done()
    })
  })

  it('remove paragraphs when backspacing over multiple', function (done) {
    setup('<section><hr><h2>One</h2><p>Two</p><p>Three</p></section>')
    View.selection = new Selection([0, 1], [2, 2])

    rm.backspace()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'Oree'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 1], [0, 1]))
      done()
    })
  })

  it('remove paragraphs when deleting over multiple', function (done) {
    setup('<section><hr><h2>One</h2><p>Two</p><p>Three</p></section>')
    View.selection = new Selection([0, 1], [2, 2])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'h2',
          html: 'Oree'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 1], [0, 1]))
      done()
    })
  })

  it('remove sections when backspacing over multiple', function (done) {
    setup(
      '<section><hr><p>One</p></section>' +
      '<section><hr><p>Two</p></section>' +
      '<section><hr><h2>Three</h2><p>Four</p></section>'
    )
    View.selection = new Selection([3, 2], [0, 1])

    rm.backspace()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Our'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 1], [0, 1]))
      done()
    })
  })

  it('remove sections when deleting over multiple', function (done) {
    setup(
      '<section><hr><p>One</p></section>' +
      '<section><hr><p>Two</p></section>' +
      '<section><hr><h2>Three</h2><p>Four</p></section>')
    View.selection = new Selection([3, 2], [0, 1])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Our'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 1], [0, 1]))
      done()
    })
  })

  it('insert a <br> when backspacing after the only character on a line', function (done) {
    setup('<section><hr><p>One<br>2</p></section>')
    View.selection = new Selection([0, 5])

    rm.backspace()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br><br>'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 4], [0, 4]))
      done()
    })
  })

  it('insert a <br> when deleting the only character on a line', function (done) {
    setup('<section><hr><p>One<br>2</p></section>')
    View.selection = new Selection([0, 4])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br><br>'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 4], [0, 4]))
      done()
    })
  })

  it('insert a <br> when backspacing over all text on a line', function (done) {
    setup('<section><hr><p>One<br>Two</p></section>')
    View.selection = new Selection([0, 4], [0, 7])

    rm.backspace()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br><br>'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 4], [0, 4]))
      done()
    })
  })

  it('insert a <br> when deleting all text on a line', function (done) {
    setup('<section><hr><p>One<br>Two</p></section>')
    View.selection = new Selection([0, 4], [0, 7])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br><br>'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 4], [0, 4]))
      done()
    })
  })

  it('merge lists when deleting at the end of one', function (done) {
    setup('<section><hr><ol><li>One</li><li>Two</li></ol></section>')
    View.selection = new Selection([0, 3])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
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

      expect(View.selection).to.eql(new Selection([0, 3], [0, 3]))
      done()
    })
  })

  it('merge paragraphs when backspacing at the start of one', function (done) {
    setup('<section><hr><p>One</p><h2>Two</h2></section>')
    View.selection = new Selection([1, 0])

    rm.backspace()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'OneTwo'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 3], [0, 3]))
      done()
    })
  })

  it('merge paragraphs when deleting at the end of one', function (done) {
    setup('<section><hr><p>One</p><p>Two</p></section>')
    View.selection = new Selection([0, 3])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'OneTwo'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 3], [0, 3]))
      done()
    })
  })

  it('ignore trailing <br>s when deleting at the end of a paragraph', function (done) {
    setup('<section><hr><p>One<br></p><p>Two</p></section>')
    View.selection = new Selection([0, 3])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'OneTwo'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 3], [0, 3]))
      done()
    })
  })

  it('ignore trailing <br>s when backspacing at the start of a paragraph', function (done) {
    setup('<section><hr><p>One<br></p><p>Two</p></section>')
    View.selection = new Selection([1, 0])

    rm.backspace()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'OneTwo'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 3], [0, 3]))
      done()
    })
  })

  it('respect newlines when backspacing at the start of a paragraph', function (done) {
    setup('<section><hr><p>One<br><br></p><p>Two</p></section>')
    View.selection = new Selection([1, 0])

    rm.backspace()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br>Two'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 4], [0, 4]))
      done()
    })
  })

  it('preserve <br>s if necessary when backspacing', function (done) {
    setup('<section><hr><p>One<br><br></p><p><br></p></section>')
    View.selection = new Selection([1, 0])

    rm.backspace()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br><br>'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 4], [0, 4]))
      done()
    })
  })

  it('respect newlines when deleting at the end of a paragraph', function (done) {
    setup('<section><hr><p>One<br><br></p><p>Two</p></section>')
    View.selection = new Selection([0, 4])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br>Two'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 4], [0, 4]))
      done()
    })
  })

  it('preserve <br>s if necessary when deleting', function (done) {
    setup('<section><hr><p>One<br><br></p><p><br></p></section>')
    View.selection = new Selection([0, 4])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br><br>'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 4], [0, 4]))
      done()
    })
  })

  it('remove sections when backspacing collapsed at the start of one', function (done) {
    setup(
      '<section><hr><p>One</p></section>' +
      '<section><hr><p>Two</p></section>')
    View.selection = new Selection([1, 0])

    rm.backspace()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
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

      expect(View.selection).to.eql(new Selection([1, 0], [1, 0]))
      done()
    })
  })

  it('remove sections when deleting collapsed at the end of one', function (done) {
    setup(
      '<section><hr><p>One</p></section>' +
      '<section><hr><p>Two</p></section>')
    View.selection = new Selection([0, 3])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
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

      expect(View.selection).to.eql(new Selection([0, 3], [0, 3]))
      done()
    })
  })

  it('ignore trailing <br>s when deleting collapsed at the end of a section', function (done) {
    setup(
      '<section><hr><p>One<br></p></section>' +
      '<section><hr><p>Two</p></section>')
    View.selection = new Selection([0, 3])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
            html: 'One<br>' // FIXME: should the <br> be removed?
          }, {
            name: 'p',
            html: 'Two'
          }]
        }])

      expect(View.selection).to.eql(new Selection([0, 3], [0, 3]))
      done()
    })
  })

  it('be able to delete sections after newlines', function (done) {
    setup(
      '<section><hr><p>One<br><br></p></section>' +
      '<section><hr><p>Two</p></section>')
    View.selection = new Selection([0, 4])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
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

      expect(View.selection).to.eql(new Selection([0, 4], [0, 4]))
      done()
    })
  })

  it('merge markups it brings together when deleting', function (done) {
    setup('<section><hr><p><em>1</em>2<em>3</em></p></section>')
    View.selection = new Selection([0, 1])

    rm.forwardDelete()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '<em>13</em>'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 1], [0, 1]))
      done()
    })
  })

  it('merge markups it brings together when backspacing', function (done) {
    setup('<section><hr><p><em>1</em>2<em>3</em></p></section>')
    View.selection = new Selection([0, 2])

    rm.backspace()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '<em>13</em>'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 1], [0, 1]))
      done()
    })
  })

  function setup (html) {
    var elem = document.createElement('div')
    elem.innerHTML = html
    document.body.appendChild(elem)

    editor = new window.Compose(elem)
    editor.use(window.listPlugin)
    editor.use(window.formatBlock)
    View = editor.require('view')
    Selection = editor.require('selection')
    rm = editor.require('backspace')

    // Perform some setup.
    var all = [].slice.call(elem.querySelectorAll('section,p,h2,li'))

    all.forEach(function (el) {
      var section
      var p

      if (el.nodeName === 'SECTION') {
        section = View.handlerForElement(el).serialize(el)
        section.start = View.elements.length
        View.sections.push(section)
      } else {
        View.elements.push(el)
        p = View.handlerForElement(el).serialize(el)
        View.paragraphs.push(el.nodeName === 'LI' ? p[0] : p)
      }
    })
  }

  function teardown () {
    document.body.removeChild(editor.root)
    editor = Selection = View = rm = null
  }
})
