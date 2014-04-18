/* jshint ignore:start */

describe('The Selection plugin:', function () {

  var Selection = Quill.getPlugin('selection'),
      quill

  function setContent (elem, html) {
    var sel = window.getSelection(),
        range = document.createRange(),
        markers

    elem.innerHTML = html.replace(/\|/g, '<span class="Quill-marker"></span>')

    if (/\|/.test(html)) {
      markers = elem.querySelectorAll('.Quill-marker')

      range.setStartBefore(markers[0])

      if (markers.length === 1)
        range.setEndAfter(markers[0])
      else range.setEndAfter(markers[1])

      for (var i = 0; i < markers.length; i += 1) {
        var parent = markers[i].parentNode

        parent.removeChild(markers[i])

        parent.normalize()
      }

      sel.removeAllRanges()
      sel.addRange(range)
    }
  }

  describe('Selection#getContaining', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      this.elem.innerHTML = '<p><br></p>'
      document.body.appendChild(this.elem)

      // Make our fake quill.
      var isInline = jasmine.createSpy('isInline').and.returnValue(false)
      var sanitizer = jasmine.createSpyObj('Sanitizer', ['addFilter'])
      quill = {
        isInline: isInline,
        elem: this.elem,
        sanitizer: sanitizer
      }

      this.selection = new Selection(quill)
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('gets the direct child in which the caret is in.', function () {
      setContent(this.elem, '<p>|<br></p>')

      expect(this.selection.getContaining()).toEqual(this.elem.firstChild)
    })

    it('uses anchorNode by default, but can use any other node.', function () {
      setContent(this.elem, '<p>Stu|ff</p><p>Th<strong>i|n<strong>gs</p>')

      expect(this.selection.getContaining()).toEqual(this.elem.firstChild)
      expect(this.selection.getContaining(this.elem.querySelector('strong')))
        .toEqual(this.elem.lastChild)
    })

    it('should work even with deeply nested elements.', function () {
      setContent(this.elem,
        '<p>A paragraph</p><ol><li>Stuff <b>and| things</b>.</li></ol>')

      expect(this.selection.getContaining()).toEqual(this.elem.firstChild.nextSibling)
    })

    it('returns false if the caret is not in the element.', function () {
      expect(this.selection.getContaining()).toBe(false)
    })

    it('returns false if in inline mode.', function () {
      quill.isInline = jasmine.createSpy('isInline').and.returnValue(true)
      this.selection = new Selection(quill)

      setContent(this.elem, 'St|uff and things.')

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
      var sanitizer = jasmine.createSpyObj('Sanitizer', ['addFilter'])
      quill = {
        isInline: isInline,
        elem: this.elem,
        sanitizer: sanitizer
      }

      this.selection = new Selection(quill)
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('determines if the selection is contained within a node.', function () {
      setContent(this.elem, '<p>|<br></p>')

      expect(this.selection.childOf(/^(?:P)$/i)).toBeTruthy()
      expect(this.selection.childOf(/^(?:article)$/i)).toBe(false)
    })

    it('should return the matched element, if found.', function () {
      setContent(this.elem, '<p>|<br></p>')

      expect(this.selection.childOf(/^(?:P)$/i)).toEqual(this.elem.firstChild)
    })

    it('should not account for the editable element.', function () {
      setContent(this.elem, '<p>|<br></p>')

      expect(this.selection.childOf(/^(?:DIV)$/i)).toBe(false)
    })

    it('should return false in inline mode.', function () {
      setContent(this.elem, 'Stuff |and things')

      quill.isInline = jasmine.createSpy('isInline').and.returnValue(true)
      this.selection = new Selection(quill)

      expect(this.selection.childOf(/^(?:DIV)$/i)).toBe(false)
    })

    it('should work with deeply nested elements.', function () {
      setContent(this.elem,
        '<p>Stuff</p><ol><li>X <strong>and <em>Y|</em></strong></li></ol>')

      expect(this.selection.childOf(/^EM$/i))
        .toEqual(this.elem.querySelector('em'))
      expect(this.selection.childOf(/^(?:LI)$/i))
        .toEqual(this.elem.querySelector('li'))
      expect(this.selection.childOf(/^(?:[O|U]L)$/))
        .toEqual(this.elem.querySelector('ol'))
      expect(this.selection.childOf(/^SECTION$/i)).toBe(false)
    })

    it('should work with strings (but less accurately).', function () {
      setContent(this.elem, '<section><p>St|uff</p></section>')

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
      var sanitizer = jasmine.createSpyObj('Sanitizer', ['addFilter'])
      quill = {
        isInline: isInline,
        elem: this.elem,
        sanitizer: sanitizer
      }

      this.selection = new Selection(quill)
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('determines if elements are in the selection.', function () {
      setContent(this.elem, '<p>|Stuff <b>and things.</b>|</p>')

      expect(this.selection.contains('b')).toBe(true)
    })

    it('works even if only part of the elements are selected.', function () {
      setContent(this.elem, 'Stu|ff and <b>thi|ngs.</b>')

      expect(this.selection.contains('b')).toBe(true)

      setContent(this.elem, '<b>Stu|ff</b> and |things')

      expect(this.selection.contains('b')).toBe(true)
    })

    it('should works with deeply nested elements.', function () {
      setContent(this.elem, '<ol>|<li>Stuff and <b>th<i>ings</i></b></li>|</ol>')

      expect(this.selection.contains('i')).toBe(true)
    })

    it('should ignore adjacent endpoints.', function () {
      setContent(this.elem, '<i>Thin</i>|gs|')

      expect(this.selection.contains('i')).toBe(false)
    })

    it('should not care about the parent.', function () {
      setContent(this.elem, '<i>Th|in|gs</i>')

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
      var sanitizer = jasmine.createSpyObj('Sanitizer', ['addFilter'])
      quill = {
        isInline: isInline,
        elem: this.elem,
        sanitizer: sanitizer
      }

      this.selection = new Selection(quill)
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('determines if the caret is on a new line.', function () {
      setContent(this.elem, '<p>|<br></p>')

      expect(this.selection.isNewLine()).toBe(true)
    })

    it('should not care about the containing element\'s tag.', function () {
      setContent(this.elem, '<h1>|<br></h1>')

      expect(this.selection.isNewLine()).toBe(true)
    })

    it('should return false when there is no selection.', function () {
      expect(this.selection.isNewLine()).toBe(false)
    })

    it('should return false if the containing element has text.', function () {
      setContent(this.elem, '<p>Stuff|</p>')

      expect(this.selection.isNewLine()).toBe(false)

      setContent(this.elem, '<h2>|Stuff|</h2>')

      expect(this.selection.isNewLine()).toBe(false)
    })
  })
})