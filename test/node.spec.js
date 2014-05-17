/* jshint ignore:start */

describe('The Node plugin', function () {

  var Node

  describe('Node#childOf', function () {

    beforeEach(function () {
      var temp

      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)

      if (!Node) {
        temp = new Compose(this.elem)
        Node = temp.node.constructor
        temp.destroy()
      }

      this.Node = new Node({ elem: this.elem })
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('can determine if an element has a parent with a certain tag name.', function () {
      var target

      this.elem.innerHTML = '<p>One</p><p>Two <span><strong id="x">Word</strong></span></p>'
      target = this.elem.querySelector('#x')

      expect(this.Node.childOf(target, 'p')).toBeTruthy()
      expect(this.Node.childOf(target, 'span')).toBeTruthy()
      expect(this.Node.childOf(target, 'article')).toBe(false)
      expect(this.Node.childOf(target, 'div')).toBe(false)
    })

    it('can take a RegExp as an identifier.', function () {
      var target

      this.elem.innerHTML = '<h2>Stuff <em>and <strong id="x">things</strong></em></h2>'
      target = this.elem.querySelector('#x')

      expect(this.Node.childOf(target, /^H[1-6]$/)).toBeTruthy()
    })

    it('should return the element matching the description.', function () {
      var target

      this.elem.innerHTML = '<p>One</p><p>Two <span><strong id="x">Word</strong></span></p>'
      target = this.elem.querySelector('#x')

      expect(this.Node.childOf(target, 'p')).toEqual(this.elem.lastChild)
      expect(this.Node.childOf(target, 'span')).toEqual(this.elem.querySelector('span'))
    })
  })

  describe('Node#getContaining', function () {

    beforeEach(function () {
      var temp

      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)

      if (!Node) {
        temp = new Compose(this.elem)
        Node = temp.node.constructor
        temp.destroy()
      }

      this.Node = new Node({ elem: this.elem })
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('gets the child of the editable element that contains the given node.', function () {
      var target

      this.elem.innerHTML =
        '<p>One</p>' +
        '<p>Stuff and <em><strong id="x">things</strong></em></p>' +
        '<p>Words</p>'
      target = this.elem.querySelector('#x')

      expect(this.Node.getContaining(target))
        .toEqual(this.elem.firstChild.nextSibling)
    })

    it('returns false if the node is not in the editable element.', function () {
      var el = document.createElement('div')
      document.body.appendChild(el)
      el.innerHTML = '<p>Stuff and things</p>'

      expect(this.Node.getContaining(el.firstChild)).toBe(false)

      el.parentNode.removeChild(el)
    })
  })

  describe('Node#areSimilar', function () {

    beforeEach(function () {
      var temp

      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)

      if (!Node) {
        temp = new Compose(this.elem)
        Node = temp.node.constructor
        temp.destroy()
      }

      this.Node = new Node({ elem: this.elem })
    })

    afterEach(function () {
      document.body.removeChild(this.elem)
    })

    it('determines if two elements are similar (1).', function () {
      var a = document.createElement('div'),
          b = document.createElement('div')

      expect(this.Node.areSimilar(a, b)).toBe(true)
    })

    it('determines if two elements are similar (2).', function () {
      var a = document.createElement('article'),
          b = document.createElement('article')

      a.className = 'test'
      b.className = 'test'

      a.setAttribute('title', 'something')
      b.setAttribute('title', 'something')

      expect(this.Node.areSimilar(a, b)).toBe(true)
    })

    it('determines if two elements are similar (3).', function () {
      var a = document.createElement('div'),
          b = document.createElement('div')

      a.className = 'test'
      b.className = 'test'

      a.setAttribute('title', 'something')
      b.setAttribute('title', 'something')

      a.id = 'x'

      expect(this.Node.areSimilar(a, b)).toBe(false)
    })

    it('determines if two elements are similar (4).', function () {
      var a = document.createElement('div'),
          b = document.createTextNode('stuff')

      expect(this.Node.areSimilar(a, b)).toBe(false)
    })

    it('determines if two elements are similar (5).', function () {
      var a = document.createElement('div'),
          b = document.createElement('span')

      a.className = 'x'
      b.className = 'x'

      expect(this.Node.areSimilar(a, b)).toBe(false)
    })

    it('determines if two elements are similar (6).', function () {
      var a = document.createElement('div'),
          b = document.createElement('div')

      a.className = 'test'
      b.className = 'test'

      a.setAttribute('name', 'something')
      b.setAttribute('name', 'something else')

      expect(this.Node.areSimilar(a, b)).toBe(false)
    })
  })
})
