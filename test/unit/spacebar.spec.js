/*eslint-env mocha */
'use strict'

var expect = window.expect

describe('Spacebar.auto()', function () {
  var editor
  var Selection
  var View
  var spacebar

  afterEach(teardown)

  it('end of paragraph, nbsp', function (done) {
    setup('<section><hr><p>1</p></section>')
    View.selection = new Selection([0, 1])

    spacebar.auto()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '1&nbsp;'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 2]))
      done()
    })
  })

  it('end of paragraph with trailing BR, nbsp', function (done) {
    setup('<section><hr><p>1<br></p></section>')
    View.selection = new Selection([0, 1])

    spacebar.auto()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '1&nbsp;<br>'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 2]))
      done()
    })
  })

  it('middle of paragraph, regular', function (done) {
    setup('<section><hr><p>EverlastingLight</p></section>')
    View.selection = new Selection([0, 11])

    spacebar.auto()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'Everlasting Light'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 12]))
      done()
    })
  })

  it('start of paragraph, nbsp', function (done) {
    setup('<section><hr><p>El Camino</p></section>')
    View.selection = new Selection([0, 0])

    spacebar.auto()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '&nbsp;El Camino'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 1]))
      done()
    })
  })

  it('before BR, nbsp', function (done) {
    setup('<section><hr><p>One<br>Two</p></section>')
    View.selection = new Selection([0, 3])

    spacebar.auto()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One&nbsp;<br>Two'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 4]))
      done()
    })
  })

  it('after BR, nbsp', function (done) {
    setup('<section><hr><p>One<br>Two</p></section>')
    View.selection = new Selection([0, 4])

    spacebar.auto()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One<br>&nbsp;Two'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 5]))
      done()
    })
  })

  it('before space, move caret', function (done) {
    setup('<section><hr><p>One Two</p></section>')
    View.selection = new Selection([0, 3])

    spacebar.auto()

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

      expect(View.selection).to.eql(new Selection([0, 4]))
      done()
    })
  })

  it('after space, nothing', function (done) {
    setup('<section><hr><p>A sly fox.</p></section>')
    View.selection = new Selection([0, 2])

    spacebar.auto()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'A sly fox.'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 2]))
      done()
    })
  })

  it('over text', function (done) {
    setup('<section><hr><p>OneABCTwo</p></section>')
    View.selection = new Selection([0, 6], [0, 3])

    spacebar.auto()

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

      expect(View.selection).to.eql(new Selection([0, 4]))
      done()
    })
  })

  it('selected text at end of paragraph, nbsp', function (done) {
    setup('<section><hr><p>OneABC</p></section>')
    View.selection = new Selection([0, 3], [0, 6])

    spacebar.auto()

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

      expect(View.selection).to.eql(new Selection([0, 4]))
      done()
    })
  })

  it('selected text at start of paragraph, nbsp', function (done) {
    setup('<section><hr><p>ABCOne</p></section>')
    View.selection = new Selection([0, 0], [0, 3])

    spacebar.auto()

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

      expect(View.selection).to.eql(new Selection([0, 1]))
      done()
    })
  })

  it('over multiple paragraphs', function (done) {
    setup(
      '<section>' +
        '<hr>' +
        '<p>One</p>' +
        '<h2>Two</h2>' +
        '<p>Three</p>' +
        '<p>Four</p>' +
      '</section>'
    )
    View.selection = new Selection([3, 1], [0, 2])

    spacebar.auto()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'On our'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 3]))
      done()
    })
  })

  it('over multiple sections', function (done) {
    setup(
      '<section><hr><p>One</p></section>' +
      '<section><hr><h2>Two</h2><p>Three</p></section>' +
      '<section><hr><p>Four</p></section>'
    )
    View.selection = new Selection([0, 2], [3, 1])

    spacebar.auto()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'On our'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 3]))
      done()
    })
  })

  it('after space, text selected', function (done) {
    setup('<section><hr><p>One ABCTwo</p></section>')
    View.selection = new Selection([0, 4], [0, 7])

    spacebar.auto()

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

      expect(View.selection).to.eql(new Selection([0, 4]))
      done()
    })
  })

  it('before space, text selected', function (done) {
    setup('<section><hr><p>OneABC Two</p></section>')
    View.selection = new Selection([0, 3], [0, 6])

    spacebar.auto()

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

      expect(View.selection).to.eql(new Selection([0, 4]))
      done()
    })
  })

  it('in between spaces, text selected', function (done) {
    setup('<section><hr><p>One ABC Two</p></section>')
    View.selection = new Selection([0, 4], [0, 7])

    spacebar.auto()

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

      expect(View.selection).to.eql(new Selection([0, 4]))
      done()
    })
  })

  it('after space, text selected at end', function (done) {
    setup('<section><hr><p>One ABC</p></section>')
    View.selection = new Selection([0, 4], [0, 7])

    spacebar.auto()

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

      expect(View.selection).to.eql(new Selection([0, 4]))
      done()
    })
  })

  it('before space, text selected at start', function (done) {
    setup('<section><hr><p>ABC One</p></section>')
    View.selection = new Selection([0, 3], [0, 0])

    spacebar.auto()

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

      expect(View.selection).to.eql(new Selection([0, 1]))
      done()
    })
  })

  it('extend non-link markups', function (done) {
    setup('<section><hr><p><strong><em>1</em></strong></p></section>')
    View.selection = new Selection([0, 1])

    spacebar.auto()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '<strong><em>1&nbsp;</em></strong>'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 2]))
      done()
    })
  })

  it('not extend links', function (done) {
    setup('<section><hr><p><a href="/x">1</a></p></section>')
    View.selection = new Selection([0, 1])

    spacebar.auto()

    setTimeout(function () {
      expect(editor.root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: '<a href="/x">1</a>&nbsp;'
        }]
      }])

      expect(View.selection).to.eql(new Selection([0, 2]))
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
    spacebar = editor.require('spacebar')

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
    editor = Selection = View = spacebar = null
  }})
