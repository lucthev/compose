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

      // console.log(this.selection.getContaining())
      expect(this.selection.getContaining()).toEqual(this.elem.firstChild)
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
      expect(this.selection.getContaining()).toBeUndefined()
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

      expect(this.selection.getContaining()).toBeUndefined()
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
})