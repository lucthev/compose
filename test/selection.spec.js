/* global describe, expect, it, beforeEach, afterEach,
   Quill, setContent, jasmine */

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

  describe('Selection#atStartOf', function () {

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

    it('determines if the caret is at the start of an element.', function () {
      setContent(this.elem, '<p>|<br></p>')
      expect(this.selection.atStartOf(this.elem.firstChild)).toBe(true)

      setContent(this.elem, '<p>|Stuff</p>')
      expect(this.selection.atStartOf(this.elem.firstChild)).toBe(true)

      setContent(this.elem, '<p>|Stu|ff</p>')
      expect(this.selection.atStartOf(this.elem.firstChild)).toBe(false)

      setContent(this.elem, '<h1>|Stuff</h1>')
      expect(this.selection.atStartOf(this.elem.firstChild)).toBe(true)

      setContent(this.elem, '<p>|Stuff</p><h1>Thi|ngs</h1>')
      expect(this.selection.atStartOf(this.elem.firstChild)).toBe(false)
      expect(this.selection.atStartOf(this.elem.lastChild)).toBe(false)

      setContent(this.elem, '<p>St|uff</p><h1>|Things</h1>')
      expect(this.selection.atStartOf(this.elem.firstChild)).toBe(false)
      expect(this.selection.atStartOf(this.elem.lastChild)).toBe(false)
    })
  })

  describe('Selection#atEndOf', function () {

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

    it('determines if the caret is at the end of an element.', function () {
      setContent(this.elem, '<p>|<br></p>')
      expect(this.selection.atEndOf(this.elem.firstChild)).toBe(true)

      setContent(this.elem, '<p>Stuff|</p>')
      expect(this.selection.atEndOf(this.elem.firstChild)).toBe(true)

      setContent(this.elem, '<p>Stu|ff|</p>')
      expect(this.selection.atEndOf(this.elem.firstChild)).toBe(false)

      setContent(this.elem, '<h1>Stuff|</h1>')
      expect(this.selection.atEndOf(this.elem.firstChild)).toBe(true)

      setContent(this.elem, '<p>Stuff|</p><h1>Things|</h1>')
      expect(this.selection.atEndOf(this.elem.firstChild)).toBe(false)
      expect(this.selection.atEndOf(this.elem.lastChild)).toBe(false)

      setContent(this.elem, '<p>|Stuff</p><h1>Things|</h1>')
      expect(this.selection.atEndOf(this.elem.firstChild)).toBe(false)
      expect(this.selection.atEndOf(this.elem.lastChild)).toBe(false)
    })
  })

  describe('Selection#forEachBlock', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)

      quill = new Quill(this.elem)
      quill.disable('selection')

      // Add some attributes used for testing.
      quill.sanitizer.addAttributes({
        p: ['id'],
        h2: ['id'],
        li: ['id']
      })

      this.selection = new Selection(quill)
    })

    afterEach(function () {
      if (quill && !quill._destroyed)
        quill.destroy()

      document.body.removeChild(this.elem)
    })

    it('should iterate over each block element in the selection.', function () {
      var ids = []

      setContent(this.elem,
        '<p id="x">Stu|ff</p><p id="y">Things</p><p id="z">Wor|ds</p>')

      this.selection.forEachBlock(function (block) {
        ids.push(block.id)
      })

      expect(ids).toEqual(['x', 'y', 'z'])
    })

    it('should ignore items not in the selection.', function () {
      var ids = []

      setContent(this.elem,
        '<p id="w">Stuff</p><p id="x">Th|ings</p><p id="y">Wor|ds</p><h2 id="z">Blah</h2>')

      this.selection.forEachBlock(function (block) {
        ids.push(block.id)
      })

      expect(ids).toEqual(['x', 'y'])
    })

    it('should tolerate removal of the current block.', function () {
      var ids = []

      setContent(this.elem,
        '<p id="w">Stu|ff</p><p id="x">Things</p><p id="y">Words</p><h2 id="z">Bl|ah</h2>')

      this.selection.forEachBlock(function (block) {
        ids.push(block.id)
        block.parentNode.removeChild(block)
      })

      expect(ids).toEqual(['w', 'x', 'y', 'z'])
      expect(this.elem.textContent.trim()).toBeFalsy()
    })

    it('should iterate over list items instead of lists (1).', function () {
      var ids = []

      setContent(this.elem,
        '<h2 id="v">Go</h2>' +
        '<ol id="no">' +
          '<li id="w">St|uff</li>' +
          '<li id="x">Things</li>' +
          '<li id="y">Wor|d</li>' +
        '</ol>' +
        '<p id="z">Blue</p>')

      this.selection.forEachBlock(function (block) {
        ids.push(block.id)
      })

      expect(ids).toEqual(['w', 'x', 'y'])
    })

    it('should iterate over list items instead of lists (2).', function () {
      var ids = []

      setContent(this.elem,
       '<h2 id="v">G|o</h2>' +
        '<ul id="no">' +
          '<li id="w">Stuff</li>' +
          '<li id="x">Things</li>' +
          '<li id="y">Word</li>' +
        '</ul>' +
        '<p id="z">Bl|ue</p>')

      this.selection.forEachBlock(function (block) {
        ids.push(block.id)
      })

      expect(ids).toEqual(['v', 'w', 'x', 'y', 'z'])
    })

    it('should iterate over list items instead of lists (3).', function () {
      var ids = []

      setContent(this.elem,
       '<h2 id="v">Go</h2>' +
        '<ol id="no">' +
          '<li id="w">Stuff</li>' +
          '<li id="x">Th|ings</li>' +
          '<li id="y">Word</li>' +
        '</ol>' +
        '<p id="z">Bl|ue</p>')

      this.selection.forEachBlock(function (block) {
        ids.push(block.id)
      })

      expect(ids).toEqual(['x', 'y', 'z'])
    })

    it('should tolerate removal of list items.', function () {
      var ids = []

      setContent(this.elem,
       '<h2 id="v">G|o</h2>' +
        '<ul id="no">' +
          '<li id="w">Stuff</li>' +
          '<li id="x">Things</li>' +
          '<li id="y">Word</li>' +
        '</ul>' +
        '<p id="z">Bl|ue</p>')

      this.selection.forEachBlock(function (block) {
        ids.push(block.id)

        if (block.nodeName === 'LI')
          block.parentNode.removeChild(block)
      })

      expect(ids).toEqual(['v', 'w', 'x', 'y', 'z'])
    })

    it('should tolerate splitting of lists (1).', function () {
      var ids = []

      setContent(this.elem,
       '<h2 id="v">G|o</h2>' +
        '<ul id="no">' +
          '<li id="w">Stuff</li>' +
          '<li id="x">Things</li>' +
          '<li id="y">Word</li>' +
        '</ul>' +
        '<p id="z">Bl|ue</p>')

      this.selection.forEachBlock(function (block) {
        ids.push(block.id)

        if (block.nodeName === 'LI')
          quill.list.splitList(block, true)
      })

      expect(ids).toEqual(['v', 'w', 'x', 'y', 'z'])
    })

    it('should tolerate splitting of lists (2).', function () {
      var ids = []

      setContent(this.elem,
       '<h2 id="v">Go</h2>' +
        '<ol id="no">' +
          '<li id="w">Stuff</li>' +
          '<li id="x">Th|ings</li>' +
          '<li id="y">Word</li>' +
        '</ol>' +
        '<p id="z">Bl|ue</p>')

      this.selection.forEachBlock(function (block) {
        ids.push(block.id)

        if (block.nodeName === 'LI')
          quill.list.splitList(block, true)
      })

      expect(ids).toEqual(['x', 'y', 'z'])
    })

    it('should work with multiple consecutive lists (1).', function () {
      var ids = []

      setContent(this.elem,
        '<h2 id="v">Go</h2>' +
         '<ol id="one">' +
           '<li id="w">Stuff</li>' +
           '<li id="x">Th|ings</li>' +
           '<li id="y">Word</li>' +
         '</ol>' +
         '<ul id="two">' +
           '<li id="w2">Stuff</li>' +
           '<li id="x2">Things</li>' +
           '<li id="y2">Word</li>' +
         '</ul>' +
         '<p id="z">Bl|ue</p>')

      this.selection.forEachBlock(function (block) {
        ids.push(block.id)

        if (block.nodeName === 'LI')
          quill.list.splitList(block, true)
      })

      expect(ids).toEqual(['x', 'y', 'w2', 'x2', 'y2', 'z'])
    })

    it('should work with multiple consecutive lists (2).', function () {
      var ids = []

      setContent(this.elem,
        '<h2 id="v">Go</h2>' +
         '<ol id="one">' +
           '<li id="w">Stuff</li>' +
           '<li id="x">Th|ings</li>' +
           '<li id="y">Word</li>' +
         '</ol>' +
         '<ul id="two">' +
           '<li id="w2">Stuff</li>' +
           '<li id="x2">Th|ings</li>' +
           '<li id="y2">Word</li>' +
         '</ul>' +
         '<p id="z">Blue</p>')

      this.selection.forEachBlock(function (block) {
        ids.push(block.id)

        if (block.nodeName === 'LI')
          quill.list.splitList(block, true)
      })

      expect(ids).toEqual(['x', 'y', 'w2', 'x2'])
    })
  })
})
