/* global describe, it, beforeEach, afterEach, Quill,
   fireEvent, setContent, expect */

describe('Rich mode', function () {

  describe('basic functionality', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)

      this.quill = new Quill(this.elem)
    })

    afterEach(function () {
      document.body.removeChild(this.elem)

      this.quill.destroy()
    })

    it('should append a paragraph to empty elements.', function () {

      // Don't get too specific; FF, for example, might add <br type='moz'>,
      // so explicitly checking for <p><br></p> might not work.
      expect(this.elem.firstChild.nodeName).toEqual('P')
    })

    it('should not append paragraphs to non-empty elements.', function () {
      setContent(this.elem, '<p>Stuff</p>')

      expect(this.elem.innerHTML).toEqual('<p>Stuff</p>')
    })

    it('should properly convert multiple paragraphs to headings.', function () {
      setContent(this.elem, '<p>S|tuff</p><p>Thin|gs</p>')

      this.quill.heading(2)

      expect(this.elem.innerHTML)
        .toEqual('<h2>Stuff</h2><h2>Things</h2>')
    })

    it('and headings to paragraphs.', function () {
      setContent(this.elem, '<h2>S|tuff</h2><h2>Thin|gs</h2>')

      this.quill.heading(0)

      expect(this.elem.innerHTML).toEqual('<p>Stuff</p><p>Things</p>')
    })

    it('should insert paragraphs after headings.', function () {
      setContent(this.elem, '<h2>Stuff|</h2><p>Things</p>')

      fireEvent(this.elem, 'keydown', 13)
      expect(this.elem.innerHTML)
        .toEqual('<h2>Stuff</h2><p><br></p><p>Things</p>')
      expect(this.quill.selection.getContaining())
        .toEqual(this.elem.firstChild.nextSibling)
    })

    // NOTE: doesn't work in PhantomJS, for whatever reason.
    if (!/PhantomJS/i.test(navigator.userAgent)) {
      it('should place the caret in the correct place when focusing (1).', function () {
        this.elem.focus()

        expect(this.elem.firstChild.nodeName.toLowerCase()).toEqual('p')
        expect(this.quill.selection.getContaining()).toEqual(this.elem.firstChild)
      })

      // NOTE: doesn't work in PhantomJS, for whatever reason.
      it('should place the caret in the correct place when focusing (2).', function () {
        setContent(this.elem, '<p><i><b id="x">Stuff</b></i></p>')

        this.elem.focus()

        var sel = window.getSelection(),
            range = sel.getRangeAt(0)

        expect(range.startContainer)
          .toEqual(document.querySelector('#x').firstChild)
      })

      // NOTE: doesn't work in PhantomJS, for whatever reason.
      it('should place the caret in the correct place when focusing (3).', function () {
        setContent(this.elem, '<p>Stuff <i><b>and things</b></i></p>')

        this.elem.focus()

        var sel = window.getSelection(),
            range = sel.getRangeAt(0)

        expect(range.startContainer)
          .toEqual(this.elem.firstChild.firstChild)
      })
    }
  })

  describe('headings', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)

      this.quill = new Quill(this.elem)
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('should not fail when converting paragraphs to headings (1).', function () {
      setContent(this.elem, '<p>Stuff|</p>')

      this.quill.heading(2)

      expect(this.elem.innerHTML).toEqual('<h2>Stuff</h2>')
    })

    it('should not fail when converting paragraphs to headings (2).', function () {
      setContent(this.elem, '<p>|Stuff</p>')

      this.quill.heading(2)

      expect(this.elem.innerHTML).toEqual('<h2>Stuff</h2>')
    })

    it('should not fail when converting paragraphs to headings (3).', function () {
      setContent(this.elem, '<p>St|uf|f</p>')

      this.quill.heading(2)

      expect(this.elem.innerHTML).toEqual('<h2>Stuff</h2>')
    })

    it('should not fail when converting paragraphs to headings (4).', function () {
      setContent(this.elem, '<p>|Stuff</p><p>Things|</p>')

      this.quill.heading(2)

      expect(this.elem.innerHTML).toEqual('<h2>Stuff</h2><h2>Things</h2>')
    })

    it('should conserve attributes when converting.', function () {
      setContent(this.elem, '<p id="word">|Stuff</p><p name="blue">Thing|s</p>')

      this.quill.heading(2)

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
      setContent(this.elem, '<p>Stuff</p><p>|<br></p>')

      fireEvent(this.elem, 'keydown', 13)
      expect(this.elem.children.length).toEqual(3)
      expect(this.elem.children[1].nodeName).toEqual('HR')
    })

    it('should not be inserted if the newline is the first paragraph.', function () {
      setContent(this.elem, '<p>|<br></p>')

      fireEvent(this.elem, 'keydown', 13)
      expect(this.elem.innerHTML).toEqual('<p><br></p>')
    })

    it('should not be inserted if the newline is preceded by an HR.', function () {
      setContent(this.elem, '<p>Stuff</p><hr><p>|<br></p>')

      fireEvent(this.elem, 'keydown', 13)
      expect(this.elem.children.length).toEqual(3)
      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff</p><hr><p><br></p>')
    })

    it('should be deleted as appropriate (1).', function () {
      setContent(this.elem, '<p>Stuff</p><hr><p>|Words</p>')

      // Simulate backspace.
      fireEvent(this.elem, 'keydown', 8)
      expect(this.elem.children.length).toEqual(2)
      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff</p><p>Words</p>')
    })

    it('should be deleted as appropriate (2).', function () {
      setContent(this.elem, '<p>Stuff|</p><hr><p>Words</p>')

      // Simulate forward delete.
      fireEvent(this.elem, 'keydown', 46)
      expect(this.elem.children.length).toEqual(2)
      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff</p><p>Words</p>')
    })

    // NOTE: these don't work.
    xit('should be ignored when keying around (1).', function () {
      setContent(this.elem, '<p>Stuff|</p><hr><p>Words</p>')

      expect(this.quill.selection.getContaining())
        .toEqual(this.elem.firstChild)

      // Simulate right arrow key.
      fireEvent(this.elem, 'keydown', 39)
      expect(this.quill.selection.getContaining())
        .toEqual(this.elem.lastChild)
    })

    xit('should be ignored when keying around (2).', function () {
      setContent(this.elem, '<p>Stuff</p><hr><p>|Words</p>')

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
      setContent(this.elem, '<p>Stuff|</p>')

      this.quill.blockquote(true)

      expect(this.elem.innerHTML)
        .toEqual('<blockquote>Stuff</blockquote>')

      this.quill.blockquote(false)

      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff</p>')
    })

    it('can be inserted with an optional class.', function () {
      setContent(this.elem, '<p>Stuff|</p>')

      this.quill.blockquote('test')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('test')
    })

    it('should remove the class when converting back to paragraphs.', function () {
      setContent(this.elem, '<p>S|tuff|</p>')
      this.elem.focus()

      this.quill.blockquote('test')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('test')

      this.quill.blockquote(false)

      expect(this.elem.innerHTML).toEqual('<p>Stuff</p>')
      expect(this.elem.firstChild.hasAttribute('class')).toBe(false)
    })

    it('should remove the class when converting to a normal blockquote.', function () {
      setContent(this.elem, '<p>St|u|ff</p>')
      this.elem.focus()

      this.quill.blockquote('test')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('test')

      this.quill.blockquote(true)

      expect(this.elem.innerHTML).toEqual('<blockquote>Stuff</blockquote>')
      expect(this.elem.firstChild.hasAttribute('class')).toBe(false)
    })

    it('should change the class when appropriate.', function () {
      setContent(this.elem, '<p>Stu|ff</p>')
      this.elem.focus()

      this.quill.blockquote('test')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('test')

      this.quill.blockquote('word')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('word')
    })

    it('should work over multiple blocks.', function () {
      setContent(this.elem, '<p>St|uff</p><p>Thin|gs</p>')
      this.elem.focus()

      this.quill.blockquote(true)

      expect(this.elem.innerHTML)
        .toEqual('<blockquote>Stuff</blockquote><blockquote>Things</blockquote>')

      this.quill.blockquote(false)

      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff</p><p>Things</p>')
    })

    it('should preserve other attributes.', function () {
      setContent(this.elem, '<p name="word">S|tuff</p>')
      this.elem.focus()

      this.quill.blockquote(true)

      expect(this.elem.innerHTML)
        .toEqual('<blockquote name="word">Stuff</blockquote>')

      this.quill.blockquote(false)

      expect(this.elem.innerHTML)
        .toEqual('<p name="word">Stuff</p>')
    })
  })
})