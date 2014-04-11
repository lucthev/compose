/* jshint ignore:start */

describe('The Selection plugin:', function () {

  var Selection = Quill.getPlugin('selection'),
      quill

  describe('Selection#getContaining', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      this.elem.innerHTML = '<p><br></p>'
      document.body.appendChild(this.elem)

      // Make our fake quill.
      var isInline = jasmine.createSpy('isInline').and.returnValue(false)
      quill = {
        isInline: isInline,
        elem: this.elem
      }

      this.selection = new Selection(quill)
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('gets the direct child in which the caret is in.', function () {
      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.getContaining()).toEqual(this.elem.firstChild)
    })

    it('uses anchorNode by default, but can use any other node.', function () {
      var sel = window.getSelection(),
          range = document.createRange()

      this.elem.innerHTML =
       '<p>Stuff</p><p>Things</p>'

      range.setStart(this.elem.firstChild.firstChild, 3)
      range.setEnd(this.elem.lastChild.firstChild, 3)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.getContaining()).toEqual(this.elem.firstChild)
      expect(this.selection.getContaining(range.endContainer)).toEqual(this.elem.lastChild)
    })

    it('should work even with deeply nested elements.', function () {
      var sel = window.getSelection(),
          range = document.createRange(),
          targetElem

      this.elem.innerHTML =
        '<p>A paragraph</p><ol><li>Stuff <b id="target">and things</b>.</li></ol>'
      targetElem = this.elem.querySelector('#target')

      range.selectNodeContents(targetElem)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.getContaining()).toEqual(this.elem.firstChild.nextSibling)
    })

    it('returns undefined if the caret is not in the element.', function () {
      expect(this.selection.getContaining()).toBe(false)
    })

    it('returns undefined if in inline mode.', function () {
      var sel = window.getSelection(),
          range = document.createRange()

      quill.isInline = jasmine.createSpy('isInline').and.returnValue(true)
      this.selection = new Selection(quill)

      this.elem.innerHTML = 'Stuff and things.'
      range.setStart(this.elem.firstChild, 0)
      range.setEnd(this.elem.firstChild, 0)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.getContaining()).toBe(false)
      expect(quill.isInline).toHaveBeenCalled()
    })
  })

  describe('Selection#childOf', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      this.elem.innerHTML = '<p><br></p>'
      document.body.appendChild(this.elem)

      // Make our fake quill.
      var isInline = jasmine.createSpy('isInline').and.returnValue(false)
      quill = {
        isInline: isInline,
        elem: this.elem
      }

      this.selection = new Selection(quill)
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('determines if the selection is contained within a node.', function () {
      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.childOf(/^(?:P)$/i)).toBeTruthy()
      expect(this.selection.childOf(/^(?:article)$/i)).toBe(false)
    })

    it('should return the matched element, if found.', function () {
      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.childOf(/^(?:P)$/i)).toEqual(this.elem.firstChild)
    })

    it('should not account for the editable element.', function () {
      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.childOf(/^(?:DIV)$/i)).toBe(false)
    })

    it('should return false in inline mode.', function () {
      var sel = window.getSelection(),
          range = document.createRange()

      quill.isInline = jasmine.createSpy('isInline').and.returnValue(true)
      this.selection = new Selection(quill)

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.childOf(/^(?:DIV)$/i)).toBe(false)
    })

    it('should work with deeply nested elements.', function () {
      var sel = window.getSelection(),
          range = document.createRange(),
          targetElem

      this.elem.innerHTML =
        '<p>Stuff</p><ol><li>X <b>and <i id="target">Y</i></b></li></ol>'
      targetElem = this.elem.querySelector('#target')

      range.selectNodeContents(targetElem)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.childOf(/^I$/i)).toEqual(targetElem)
      expect(this.selection.childOf(/^(?:LI)$/i))
        .toEqual(this.elem.querySelector('li'))
      expect(this.selection.childOf(/^(?:[O|U]L)$/))
        .toEqual(this.elem.querySelector('ol'))
      expect(this.selection.childOf(/^SECTION$/i)).toBe(false)
    })

    it('should work with strings (but less accurately).', function () {
      var sel = window.getSelection(),
          range = document.createRange()

      this.elem.innerHTML = '<section><p id="target">Stuff</p></section>'
      targetElem = this.elem.querySelector('#target')

      range.selectNodeContents(targetElem)
      range.collapse()
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.childOf('SECTION')).toEqual(this.elem.firstChild)
    })
  })

  describe('Selection#contains', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      this.elem.innerHTML = '<p><br></p>'

      document.body.appendChild(this.elem)

      // Make our fake quill.
      var isInline = jasmine.createSpy('isInline').and.returnValue(false)
      quill = {
        isInline: isInline,
        elem: this.elem
      }

      this.selection = new Selection(quill)
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('determines if elements are in the selection.', function () {
      this.elem.innerHTML = '<p>Stuff <b>and things.</b></p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.contains('b')).toBe(true)
    })

    it('works even if only part of the elements are selected.', function () {
      this.elem.innerHTML = 'Stuff and <b>things.</b>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.setStart(this.elem.firstChild, 3)
      range.setEnd(this.elem.firstElementChild.firstChild, 2)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.contains('b')).toBe(true)

      this.elem.innerHTML = '<b>Stuff</b> and things'

      range.setStart(this.elem.firstChild.firstChild, 3)
      range.setEnd(this.elem.firstChild.nextSibling, 5)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.contains('b')).toBe(true)
    })

    it('should works with deeply nested elements.', function () {
      this.elem.innerHTML = '<ol><li>Stuff and <b>th<i>ings</i></b></li></ol>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.contains('i')).toBe(true)
    })

    it('should ignore adjacent endpoints.', function () {
      this.elem.innerHTML = '<i>Thin</i>gs'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild.nextSibling)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.contains('i')).toBe(false)
    })

    it('should not care about the parent.', function () {
      this.elem.innerHTML = '<i>Things</i>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.contains('i')).toBe(false)
    })
  })

  describe('Selection#isNewLine', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      this.elem.innerHTML = '<p><br></p>'

      document.body.appendChild(this.elem)

      // Make our fake quill.
      var isInline = jasmine.createSpy('isInline').and.returnValue(false)
      quill = {
        isInline: isInline,
        elem: this.elem
      }

      this.selection = new Selection(quill)
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('determines if the caret is on a new line.', function () {
      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.isNewLine()).toBe(true)
    })

    it('should not care about the containing element\'s tag.', function () {
      this.elem.innerHTML = '<h1><br></h1>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.isNewLine()).toBe(true)
    })

    it('should return false when there is no selection.', function () {
      expect(this.selection.isNewLine()).toBe(false)
    })

    it('should return false if the containing element has text.', function () {
      this.elem.innerHTML = '<p>Stuff</p>'

      var sel = window.getSelection(),
          range = document.createRange()

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.isNewLine()).toBe(false)

      this.elem.innerHTML = '<h2>Stuff</h2>'

      range.selectNodeContents(this.elem.firstChild)
      sel.removeAllRanges()
      sel.addRange(range)

      expect(this.selection.isNewLine()).toBe(false)
    })
  })
})