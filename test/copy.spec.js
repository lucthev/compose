/*eslint-env mocha */
'use strict'

describe('Copy', function () {
  var expect = window.expect // Because linting
  var Selection
  var editor
  var copy
  var elem

  before(setupEditor)
  after(teardownEditor)

  describe('html should', function () {
    it('return the HTML of the given selection', function () {
      var sel = new Selection([0, 0], [1, 3])

      expect(copy.html(sel)).to.equal(
        '<h2><strong>O</strong><a href="http://g.co">n</a><em>e</em></h2>' +
        '<p>Two</p>'
      )
    })

    it('return the empty string for a collapsed selection', function () {
      var sel = new Selection([1, 1])

      expect(copy.html(sel)).to.equal('')
    })

    it('ignore trailing newlines', function () {
      var sel = new Selection([5, 0], [6, 5])

      expect(copy.html(sel)).to.equal(
        '<p>Six</p>' +
        '<h3>Seven</h3>'
      )
    })

    it('work on “nested” elements', function () {
      var sel = new Selection([1, 0], [3, 4])

      expect(copy.html(sel)).to.equal(
        '<p>Two</p>' +
        '<ol>' +
          '<li>Three</li>' +
          '<li>Four</li>' +
        '</ol>'
      )
    })

    it('work on partially selected elements', function () {
      var sel = new Selection([4, 2], [6, 3])

      expect(copy.html(sel)).to.equal(
        '<h2>ve</h2>' +
        '<p>Six</p>' +
        '<h3>Sev</h3>'
      )
    })

    it('work with backwards selections', function () {
      var sel = new Selection([6, 3], [4, 2])

      expect(copy.html(sel)).to.equal(
        '<h2>ve</h2>' +
        '<p>Six</p>' +
        '<h3>Sev</h3>'
      )
    })

    it('ignore section breaks', function () {
      var sel = new Selection([3, 0], [4, 4])

      expect(copy.html(sel)).to.equal(
        '<ol>' +
          '<li>Four</li>' +
        '</ol>' +
        '<h2>Five</h2>'
      )
    })
  })

  describe('text should', function () {
    it('copy the selected text', function () {
      var sel = new Selection([0, 0], [0, 3])

      expect(copy.text(sel)).to.equal('One')
    })

    it('treat paragraph breaks as double newlines', function () {
      var sel = new Selection([0, 0], [1, 3])

      expect(copy.text(sel)).to.equal('One\n\nTwo')
    })

    it('return an empty string when given a collapsed selection', function () {
      var sel = new Selection([1, 1])

      expect(copy.text(sel)).to.equal('')
    })

    it('work with backwards selections', function () {
      var sel = new Selection([1, 3], [0, 0])

      expect(copy.text(sel)).to.equal('One\n\nTwo')
    })

    it('ignore trailing newlines', function () {
      var sel = new Selection([5, 0], [6, 5])

      expect(copy.text(sel)).to.equal('Six\n\nSeven')
    })

    it('ignore section breaks, nested elements, etc', function () {
      var sel = new Selection([0, 0], [6, 5])

      expect(copy.text(sel)).to.equal(
        'One\n\nTwo\n\nThree\n\nFour\n\nFive\n\nSix\n\nSeven'
      )
    })
  })

  function setupEditor () {
    elem = document.createElement('article')
    elem.innerHTML =
      '<section>' +
        '<hr>' +
        '<h2><strong>O</strong><a href="http://g.co">n</a><em>e</em></h2>' +
        '<p>Two</p>' +
        '<ol>' +
          '<li>Three</li>' +
          '<li>Four</li>' +
        '</ol>' +
      '</section>' +
      '<section>' +
        '<hr>' +
        '<h2>Five</h2>' +
        '<p>Six<br></p>' +
        '<h3>Seven</h3>' +
        '<p>Eight</p>' +
      '</section>'

    document.body.appendChild(elem)

    editor = new window.Compose(elem)
    editor.use(window.formatBlock)
    editor.use(window.listPlugin)

    Selection = editor.require('selection')
    copy = editor.require('copy')
    var View = editor.require('view')

    var all = [].slice.call(elem.querySelectorAll('section,p,h2,h3,li'))

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

  function teardownEditor () {
    try {
      editor.destroy()
    } catch (e) {}

    elem.parentNode.removeChild(elem)
  }
})
