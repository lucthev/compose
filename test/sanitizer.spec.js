/* global beforeEach, describe, it, Quill, expect, afterEach */

'use strict';

describe('The Sanitizer plugin', function () {

  var Sanitizer

  beforeEach(function () {
    var temp

    this.elem = document.createElement('div')
    document.body.appendChild(this.elem)

    if (!Sanitizer) {
      temp = new Quill(this.elem)
      Sanitizer = temp.sanitizer.constructor
      temp.destroy()
    }

    this.Sanitizer = new Sanitizer()
  })

  afterEach(function () {
    document.body.removeChild(this.elem)
  })

  it('strips all elements and attributes by default.', function () {
    this.elem.innerHTML =
      '<div id="test"><ol><li><span class="word"><b><i>Stuff</i></b></span></li></ol></div>'

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML).toEqual('Stuff')
  })

  it('can be configured to keep elements via the addElements method (1).', function () {
    this.Sanitizer.addElements(['p', 'i'])

    this.elem.innerHTML =
      '<div><blockquote><p name="john">Stuff <b>and</b> <i>things</i></p></blockquote></div>'

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<p>Stuff and <i>things</i></p>')
  })

  it('can be configured to keep elements via the addElements method (2).', function () {
    this.Sanitizer.addElements('p')

    this.elem.innerHTML =
      '<p>One</p><!-- Comment --><p>Two</p>'

    expect(this.elem.childNodes[1].nodeType).toEqual(Node.COMMENT_NODE)

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<p>One</p><p>Two</p>')
  })

  it('can remove allowed elements via the removeElements method (1).', function () {
    this.Sanitizer.addElements('p')

    this.elem.innerHTML = '<p>Stuff</p>'

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML).toEqual('<p>Stuff</p>')

    this.elem.innerHTML = '<p>Stuff</p>'
    this.Sanitizer.removeElements(['p'])

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML).toEqual('Stuff')
  })

  it('can remove allowed elements via the removeElements method (2).', function () {
    // Adding the element twice, and remove it once, should still allow
    // the element.

    this.Sanitizer.addElements('p')
    this.Sanitizer.addElements('p')

    this.elem.innerHTML = '<p>Stuff</p>'
    this.Sanitizer.clean(this.elem)

    expect(this.elem.innerHTML).toEqual('<p>Stuff</p>')

    this.Sanitizer.removeElements('p')

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML).toEqual('<p>Stuff</p>')

    this.Sanitizer.removeElements('p')

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML).toEqual('Stuff')
  })

  it('can be configured to keep attributes via the addAttribute method.', function () {
    var content = '<p style="color: red;" name="blue" id="x">St<i>uff</i></p>'

    this.elem.innerHTML = content
    this.Sanitizer.addElements(['p'])
    this.Sanitizer.clean(this.elem)

    expect(this.elem.innerHTML).toEqual('<p>Stuff</p>')

    this.Sanitizer.addAttributes({
      p: ['name', 'id']
    })

    this.elem.innerHTML = content
    this.Sanitizer.clean(this.elem)

    // Directly comparing innerHTML doesn't work, as some browsers
    // order the attributes differently.
    expect(this.elem.textContent).toEqual('Stuff')
    expect(this.elem.childNodes.length).toEqual(1)
    expect(this.elem.firstChild.attributes.length).toEqual(2)
    expect(this.elem.firstChild.getAttribute('name')).toEqual('blue')
    expect(this.elem.firstChild.getAttribute('id')).toEqual('x')
  })

  it('can remove allowed attributes via the removeAttributes method (1).', function () {
    this.Sanitizer
      .addElements('p')
      .addAttributes({ p: ['name'] })

    this.elem.innerHTML = '<p name="x">Words</p>'

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<p name="x">Words</p>')

    this.Sanitizer.removeAttributes({ p: ['name'] })

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<p>Words</p>')
  })

  it('can remove allowed attributes via the removeAttributes method (2).', function () {
    this.Sanitizer
      .addElements('p')
      .addAttributes({ p: ['name'] })
      .addAttributes({ p: ['name'] })

    this.elem.innerHTML = '<p name="x">Words</p>'

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<p name="x">Words</p>')

    this.Sanitizer.removeAttributes({ p: ['name'] })

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<p name="x">Words</p>')

    this.Sanitizer.removeAttributes({ p: ['name'] })

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<p>Words</p>')
  })

  it('can be configured to allow protocols within links.', function () {
    this.Sanitizer.addElements('a')

    this.elem.innerHTML = '<a href="http://example.com">Stuff</a>'
    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML).toEqual('<a>Stuff</a>')

    this.Sanitizer.addAttributes({
      a: ['href']
    })

    this.elem.innerHTML = '<a href="javascript:void(0)">Stuff</a>'
    this.Sanitizer.addProtocols(['http', 'https'])

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML).toEqual('<a>Stuff</a>')

    this.elem.innerHTML = '<a href="https://example.com/">Stuff</a>'
    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<a href="https://example.com/">Stuff</a>')
  })

  it('can remove allowed protocols.', function () {
    this.Sanitizer
      .addElements('a')
      .addAttributes({ a: ['href'] })
      .addProtocols(['http', 'https'])
      .addProtocols(['http'])

    this.elem.innerHTML = '<a href="http://www.example.com">Click me</a>'
    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<a href="http://www.example.com">Click me</a>')

    this.Sanitizer.removeProtocols('http')

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<a href="http://www.example.com">Click me</a>')

    this.Sanitizer.removeProtocols(['http'])

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<a>Click me</a>')

    this.elem.innerHTML = '<a href="https://www.example.com">Click me</a>'

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<a href="https://www.example.com">Click me</a>')
  })

  it('can be configured to use custom filters (1).', function () {

    function filter () {
      return { whitelist: true }
    }

    this.Sanitizer.addElements(['p'])

    this.elem.innerHTML = '<p>Things</p><hr><p>Stuff</p>'
    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML).toEqual('<p>Things</p><p>Stuff</p>')

    this.elem.innerHTML = '<p>Things</p><hr><p>Stuff</p>'
    this.Sanitizer.addFilter('hr', filter)

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<p>Things</p><hr><p>Stuff</p>')
  })

  it('can be configured to use custom filters (2).', function () {

    function filter () {
      return { whitelist: true }
    }

    this.Sanitizer.addElements(['p'])

    this.elem.innerHTML = '<p>Things</p><ol><li>Words</li></ol><p>Stuff</p>'
    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<p>Things</p>Words<p>Stuff</p>')

    this.elem.innerHTML = '<p>Things</p><ol><li>Words</li></ol><p>Stuff</p>'
    this.Sanitizer.addFilter('ol', filter)

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<p>Things</p><ol>Words</ol><p>Stuff</p>')
  })

  it('can add wildcard filters (1).', function () {
    var visited = []

    function filter (node) {
      visited.push(node.nodeName.toLowerCase())
    }

    this.Sanitizer.addFilter('*', filter)

    this.elem.innerHTML =
      '<p>One</p><h2>Two</h2><blockquote>Three</blockquote>'
    this.Sanitizer.clean(this.elem)
    expect(visited).toEqual(['p', 'h2', 'blockquote'])
  })

  it('can add wildcard filters (2).', function () {
    var visited = []

    function filter (node) {
      visited.push(node.nodeName.toLowerCase())
    }

    this.Sanitizer.addFilter(filter)

    this.elem.innerHTML =
      '<p>One</p><h2>Two</h2><blockquote>Three</blockquote>'
    this.Sanitizer.clean(this.elem)
    expect(visited).toEqual(['p', 'h2', 'blockquote'])
  })

  it('can remove custom filters.', function () {

    function filter () {
      return { whitelist: true }
    }

    this.Sanitizer
      .addElements(['p'])
      .addFilter('hr', filter)

    this.elem.innerHTML = '<p>Things</p><hr><p>Stuff</p>'

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<p>Things</p><hr><p>Stuff</p>')

    this.Sanitizer.removeFilter('hr', filter)

    this.Sanitizer.clean(this.elem)
    expect(this.elem.innerHTML)
      .toEqual('<p>Things</p><p>Stuff</p>')
  })

  it('should allow removal of elements from within filters.', function () {

    // A filter which replaces <b>s with <strong>s.
    function filter (node) {
      var strong = document.createElement('strong')

      strong.innerHTML = node.innerHTML

      return { node: strong }
    }

    this.Sanitizer
      .addElements(['p', 'strong'])
      .addFilter('b', filter)

    this.elem.innerHTML = '<p><b>Word</b></p>'

    expect(function () {
      this.Sanitizer.clean(this.elem)
    }.bind(this)).not.toThrow()
    expect(this.elem.innerHTML).toEqual('<p><strong>Word</strong></p>')
  })

  // I was seeing something similar in inline mode.
  it('miscellaneous (1)', function () {

    // A filter that whitelists certain <span>s.
    function filter (span) {
      return { whitelist: span.classList.contains('Quill-marker') }
    }

    this.Sanitizer.addFilter('span', filter)

    this.elem.innerHTML = '<p>One</p><p>Two<span class="Quill-marker"></span></p>'
    this.Sanitizer.clean(this.elem)

    expect(this.elem.innerHTML)
      .toEqual('OneTwo<span class="Quill-marker"></span>')
  })
})
