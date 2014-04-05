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
  })

  describe('heading conversion bugs', function () {

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
})