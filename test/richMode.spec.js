/* jshint ignore:start */

describe('Rich mode', function () {

  describe('basic functionality', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('should append a paragraph to empty elements.', function () {
      var quill = new Quill(this.elem)

      // Don't get too specific; FF, for example, might add <br type='moz'>,
      // so explicitly checking for <p><br></p> might not work.
      expect(this.elem.firstChild.nodeName).toEqual('P')
    })

    it('should not append paragraphs to non-empty elements.', function () {
      this.elem.innerHTML = '<p>Stuff</p>'

      var quill = new Quill(this.elem)

      expect(this.elem.children.length).toEqual(1)
    })

    it('should properly convert multiple paragraphs to headings.', function () {
      this.elem.innerHTML = '<p>Stuff</p><p>Things</p>'

      var quill = new Quill(this.elem),
          sel = window.getSelection(),
          range = document.createRange()

      range.setStart(this.elem.firstChild.firstChild, 1)
      range.setEnd(this.elem.firstChild.nextSibling.firstChild, 4)
      sel.removeAllRanges()
      sel.addRange(range)

      quill.heading(2)

      expect(this.elem.innerHTML)
        .toEqual('<h2>Stuff</h2><h2>Things</h2>')
    })

    it('and headings to paragraphs.', function () {
      var quill = new Quill(this.elem),
          sel = window.getSelection(),
          range = document.createRange()

      this.elem.innerHTML = '<h2>Stuff</h2><h2>Things</h2>'

      range.setStart(this.elem.firstChild.firstChild, 1)
      range.setEnd(this.elem.firstChild.nextSibling.firstChild, 4)
      sel.removeAllRanges()
      sel.addRange(range)

      quill.heading(0)

      expect(this.elem.innerHTML).toEqual('<p>Stuff</p><p>Things</p>')
    })

    it('should insert paragraphs after headings.', function () {
      var quill = new Quill(this.elem),
          sel = window.getSelection(),
          range = document.createRange()

      this.elem.innerHTML = '<h2>Stuff</h2><p>Things</p>'

      range.selectNodeContents(this.elem.firstChild)
      range.collapse()
      sel.removeAllRanges()
      sel.addRange(range)

      // We expect it to be intercepted.
      expect(fireEvent(this.elem, 'keydown', 13)).toBe(true)
      expect(this.elem.innerHTML)
        .toEqual('<h2>Stuff</h2><p><br></p><p>Things</p>')
      expect(quill.selection.getContaining())
        .toEqual(this.elem.firstChild.nextSibling)
    })

    it('should place the caret in the correct place when focusing.', function () {
      var quill = new Quill(this.elem)

      this.elem.focus()

      expect(this.elem.firstChild.nodeName.toLowerCase()).toEqual('p')
      expect(quill.selection.getContaining()).toEqual(this.elem.firstChild)
    })
  })

  describe('headings', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('should not fail when converting paragraphs to headings (1).', function () {
      var quill = new Quill(this.elem),
          sel = window.getSelection(),
          range = document.createRange()

      this.elem.innerHTML = '<p>Stuff</p>'

      range.selectNodeContents(this.elem.firstChild)
      range.collapse()
      sel.removeAllRanges()
      sel.addRange(range)

      quill.heading(2)

      expect(this.elem.innerHTML)
        .toEqual('<h2>Stuff</h2>')
    })

    it('should not fail when converting paragraphs to headings (2).', function () {
      var quill = new Quill(this.elem),
          sel = window.getSelection(),
          range = document.createRange()

      this.elem.innerHTML = '<p>Stuff</p>'

      range.selectNodeContents(this.elem.firstChild)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)

      quill.heading(2)

      expect(this.elem.innerHTML)
        .toEqual('<h2>Stuff</h2>')
    })

    it('should not fail when converting paragraphs to headings (3).', function () {
      var quill = new Quill(this.elem),
          sel = window.getSelection(),
          range = document.createRange()

      this.elem.innerHTML = '<p>Stuff</p>'

      range.setStart(this.elem.firstChild.firstChild, 2)
      range.setEnd(this.elem.firstChild.firstChild, 4)
      sel.removeAllRanges()
      sel.addRange(range)

      quill.heading(2)

      expect(this.elem.innerHTML)
        .toEqual('<h2>Stuff</h2>')
    })

    it('should not fail when converting paragraphs to headings (4).', function () {
      var quill = new Quill(this.elem),
          sel = window.getSelection(),
          range = document.createRange()

      this.elem.innerHTML = '<p>Stuff</p><p>Things</p>'

      range.setStart(this.elem.firstChild.firstChild, 0)
      range.setEnd(this.elem.firstChild.nextSibling.firstChild, 5)
      sel.removeAllRanges()
      sel.addRange(range)

      quill.heading(2)

      expect(this.elem.innerHTML)
        .toEqual('<h2>Stuff</h2><h2>Things</h2>')
    })

    it('should conserve attributes when converting.', function () {
      var quill = new Quill(this.elem),
          sel = window.getSelection(),
          range = document.createRange()

      this.elem.innerHTML =
        '<p id="word">Stuff</p><p name="blue">Things</p>'

      range.setStart(this.elem.firstChild.firstChild, 0)
      range.setEnd(this.elem.firstChild.nextSibling.firstChild, 5)
      sel.removeAllRanges()
      sel.addRange(range)

      quill.heading(2)

      expect(this.elem.innerHTML)
        .toEqual('<h2 id="word">Stuff</h2><h2 name="blue">Things</h2>')
    })
  })

  describe('horizontal rules', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)

      this.quill = new Quill(this.elem)
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('should be inserted when pressing enter on a new line.', function () {
      this.elem.innerHTML = '<p>Stuff</p><p><br></p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.lastChild)
      range.collapse()
      sel.removeAllRanges()
      sel.addRange(range)

      expect(fireEvent(this.elem, 'keydown', 13)).toBe(true)
      expect(this.elem.children.length).toEqual(3)
      expect(this.elem.firstChild.nextSibling.nodeName)
        .toEqual('HR')
    })

    it('should not be inserted if the newline is the first paragraph.', function () {
      this.elem.innerHTML = '<p><br></p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      fireEvent(this.elem, 'keydown', 13)
      expect(this.elem.children.length).toEqual(1)
      expect(this.elem.firstChild.nodeName).not.toEqual('HR')
    })

    it('should not be inserted if the newline is preceded by an HR.', function () {
      this.elem.innerHTML = '<p>Stuff</p><hr><p><br></p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.lastChild)
      sel.removeAllRanges()
      sel.addRange(range)

      fireEvent(this.elem, 'keydown', 13)
      expect(this.elem.children.length).toEqual(3)
      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff</p><hr><p><br></p>')
    })

    it('should be deleted as appropriate (1).', function () {
      this.elem.innerHTML = '<p>Stuff</p><hr><p>Words</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.lastChild)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)

      // Simulate backspace.
      fireEvent(this.elem, 'keydown', 8)
      expect(this.elem.children.length).toEqual(2)
      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff</p><p>Words</p>')
    })

    it('should be deleted as appropriate (2).', function () {
      this.elem.innerHTML = '<p>Stuff</p><hr><p>Words</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      range.collapse()
      sel.removeAllRanges()
      sel.addRange(range)

      // Simulate forward delete.
      fireEvent(this.elem, 'keydown', 46)
      expect(this.elem.children.length).toEqual(2)
      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff</p><p>Words</p>')
    })

    it('should be ignored when keying around (1).', function () {
      this.elem.innerHTML = '<p>Stuff</p><hr><p>Words</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      range.collapse()
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.quill.selection.getContaining())
        .toEqual(this.elem.firstChild)

      // Simulate right arrow key.
      fireEvent(this.elem, 'keydown', 39)
      expect(this.quill.selection.getContaining())
        .toEqual(this.elem.lastChild)
    })

    it('should be ignored when keying around (2).', function () {
      this.elem.innerHTML = '<p>Stuff</p><hr><p>Words</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.lastChild)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.quill.selection.getContaining())
        .toEqual(this.elem.lastChild)

      // Simulate left arrow key.
      fireEvent(this.elem, 'keydown', 37)
      expect(this.quill.selection.getContaining())
        .toEqual(this.elem.firstChild)
    })
  })

  describe('blockquotes', function () {
    beforeEach(function () {
      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)

      this.quill = new Quill(this.elem)
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('can be inserted normally.', function () {
      this.elem.innerHTML = '<p>Stuff</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      range.collapse()
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.blockquote(true)

      expect(this.elem.innerHTML)
        .toEqual('<blockquote>Stuff</blockquote>')

      this.quill.blockquote(false)

      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff</p>')
    })

    it('can be inserted with an optional class.', function () {
      this.elem.innerHTML = '<p>Stuff</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      range.collapse()
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.blockquote('test')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('test')
    })

    it('should not overwrite other classes.', function () {
      this.elem.innerHTML = '<p class="one">Stuff</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.blockquote('test')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('one test')
    })

    it('should remove the class when converting back to paragraphs (1).', function () {
      this.elem.innerHTML = '<p class="one">Stuff</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.blockquote('test')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('one test')

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.blockquote(false)

      expect(this.elem.innerHTML).toEqual('<p class="one">Stuff</p>')
    })

    it('should remove the class when converting back to paragraphs (2).', function () {
      this.elem.innerHTML = '<p>Stuff</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.blockquote('test')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('test')

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.blockquote(false)

      expect(this.elem.innerHTML).toEqual('<p>Stuff</p>')
      expect(this.elem.firstChild.hasAttribute('class')).toBe(false)
    })

    it('should remove the class when converting to a normal blockquote.', function () {
      this.elem.innerHTML = '<p>Stuff</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.blockquote('test')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('test')

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.blockquote(true)

      expect(this.elem.innerHTML).toEqual('<blockquote>Stuff</blockquote>')
      expect(this.elem.firstChild.hasAttribute('class')).toBe(false)
    })

    it('should change the class when appropriate.', function () {
      this.elem.innerHTML = '<p class="one">Stuff</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.blockquote('test')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('one test')

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.blockquote('word')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('one word')
    })

    it('should work over multiple blocks.', function () {
      this.elem.innerHTML = '<p>Stuff</p><p>Things</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.setStart(this.elem.firstChild.firstChild, 2)
      range.setEnd(this.elem.lastChild.firstChild, 5)
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.blockquote(true)

      expect(this.elem.innerHTML)
        .toEqual('<blockquote>Stuff</blockquote><blockquote>Things</blockquote>')

      this.quill.blockquote(false)

      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff</p><p>Things</p>')
    })

    it('should preserve other attributes.', function () {
      this.elem.innerHTML = '<p name="word">Stuff</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.blockquote(true)

      expect(this.elem.innerHTML)
        .toEqual('<blockquote name="word">Stuff</blockquote>')

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.blockquote(false)

      expect(this.elem.innerHTML)
        .toEqual('<p name="word">Stuff</p>')
    })
  })

  describe('insertHTML', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)

      this.quill = new Quill(this.elem)
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('should insert HTML.', function () {
      this.elem.innerHTML = '<p>One</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      range.collapse()
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.insertHTML('rous')

      expect(this.elem.innerHTML).toEqual('<p>Onerous</p>')
    })

    it('should not merge block elements with different tags.', function () {
      this.elem.innerHTML = '<h1>Stuff</h1>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      range.collapse()
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.insertHTML('<p> and things</p>')

      expect(this.elem.innerHTML.replace(/&nbsp;/g, ' '))
        .toEqual('<h1>Stuff</h1><p> and things</p>')
    })

    it('should merge block elements with the same tag.', function () {
      this.elem.innerHTML = '<h1>Stuff</h1>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      range.collapse()
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.insertHTML('<h1> and things</h1>')

      expect(this.elem.innerHTML.replace(/&nbsp;/g, ' '))
        .toEqual('<h1>Stuff and things</h1>')
    })

    it('should add attributes where appropriate.', function () {
      this.elem.innerHTML = '<p>Stuff</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      range.collapse()
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.insertHTML('<hr><p>Word</p>')

      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff</p><hr contenteditable="false"><p>Word</p>')
    })

    it('should append inline elements.', function () {
      this.elem.innerHTML = '<p>Stuff</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      range.collapse()
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.insertHTML(' and <i>things</i>')

      expect(this.elem.innerHTML.replace(/&nbsp;/g, ' '))
        .toEqual('<p>Stuff and <em>things</em></p>')
    })

    it('should merge multiple inline elements into a paragraph.', function () {
      this.elem.innerHTML = '<h2>Stuff</h2>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      range.collapse()
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.insertHTML('<p>word</p> and <i>things</i>')

      expect(this.elem.innerHTML.replace(/&nbsp;/g, ' '))
        .toEqual('<h2>Stuff</h2><p>word</p><p> and <em>things</em></p>')
    })

    it('should ignore newlines (1).', function () {
      this.elem.innerHTML = '<p><br></p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      range.collapse()
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.insertHTML('<p>Stuff</p><p>Things</p>')

      expect(this.elem.innerHTML).toEqual('<p>Stuff</p><p>Things</p>')
    })

    it('should ignore newlines (2).', function () {
      this.elem.innerHTML = '<p><br></p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      range.collapse()
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.insertHTML('<h2>Stuff</h2><h2>Things</h2>')

      expect(this.elem.innerHTML).toEqual('<h2>Stuff</h2><h2>Things</h2>')
    })

    it('should work across multiple blocks (1).', function () {
      this.elem.innerHTML = '<h2>Stuff</h2><p>X</p><p>Word</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.setStart(this.elem.firstChild.firstChild, 3)
      range.setEnd(this.elem.lastChild.firstChild, 2)
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.insertHTML('<b>ng</b><p>Absu</p>')

      expect(this.elem.innerHTML)
        .toEqual('<h2>Stu<strong>ng</strong></h2><p>Absurd</p>')
    })

    it('should work across multiple blocks (2).', function () {
      this.elem.innerHTML =
        '<h2>Stuff</h2><p>Things</p><p>Word</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.setStart(this.elem.firstChild.firstChild, 3)
      range.setEnd(this.elem.lastChild.firstChild, 2)
      sel.removeAllRanges()
      sel.addRange(range)

      this.quill.insertHTML('<h2>ng</h2><p>Absu</p>')

      expect(this.elem.innerHTML)
        .toEqual('<h2>Stung</h2><p>Absurd</p>')
    })
  })
})