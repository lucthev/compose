/* jshint ignore:start */

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

  // Extracts the HTML of a document fragment as a string.
  function toHTML (fragment) {
    var div = document.createElement('div')
    div.appendChild(fragment)

    return div.innerHTML
  }

  it('strips all elements and attributes by default.', function () {
    this.elem.innerHTML =
      '<div id="test"><ol><li><span class="word"><b><i>Stuff</i></b></span></li></ol></div>'

    expect(toHTML(this.Sanitizer.clean(this.elem))).toEqual('Stuff')
  })

  it('can be configured to keep elements via the addElements method.', function () {
    this.Sanitizer.addElements(['p', 'i'])

    this.elem.innerHTML =
      '<div><blockquote><p name="john">Stuff <b>and</b> <i>things</i></p></blockquote></div>'

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p>Stuff and <i>things</i></p>')
  })

  it('can remove allowed elements via the removeElements method (1).', function () {
    this.Sanitizer.addElements('p')

    this.elem.innerHTML = '<p>Stuff</p>'

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p>Stuff</p>')

    this.Sanitizer.removeElements('p')

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('Stuff')
  })

  it('can remove allowed elements via the removeElements method (2).', function () {
    // Adding the element twice, and remove it once, should still allow
    // the element.

    this.Sanitizer.addElements('p')
    this.Sanitizer.addElements('p')

    this.elem.innerHTML = '<p>Stuff</p>'

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p>Stuff</p>')

    this.Sanitizer.removeElements('p')

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p>Stuff</p>')

    this.Sanitizer.removeElements('p')

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('Stuff')
  })

  it('can be configured to keep attributes via the addAttribute method.', function () {
    var div = document.createElement('div')
    this.Sanitizer.addElements(['p'])

    this.elem.innerHTML = '<p style="color: red;" name="blue" id="x">St<i>uff</i></p>'
    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p>Stuff</p>')

    this.Sanitizer.addAttributes({
      p: ['name', 'id']
    })

    // Directly comparing innerHTML doesn't always work, as some
    // browsers order attributes differently.
    div.innerHTML = toHTML(this.Sanitizer.clean(this.elem))
    expect(div.textContent).toEqual('Stuff')
    expect(/name="blue"/.test(div.innerHTML)).toBe(true)
    expect(/id="x"/.test(div.innerHTML)).toBe(true)
  })

  it('can remove allowed attributes via the removeAttributes method (1).', function () {
    this.Sanitizer
      .addElements('p')
      .addAttributes({ p: ['name'] })

    this.elem.innerHTML = '<p name="x">Words</p>'

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p name="x">Words</p>')

    this.Sanitizer.removeAttributes({ p: ['name'] })

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p>Words</p>')
  })

  it('can remove allowed attributes via the removeAttributes method (2).', function () {
    this.Sanitizer
      .addElements('p')
      .addAttributes({ p: ['name'] })
      .addAttributes({ p: ['name'] })

    this.elem.innerHTML = '<p name="x">Words</p>'

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p name="x">Words</p>')

    this.Sanitizer.removeAttributes({ p: ['name'] })

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p name="x">Words</p>')

    this.Sanitizer.removeAttributes({ p: ['name'] })

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p>Words</p>')
  })

  it('can be configured to allow protocols within attributes.', function () {
    this.Sanitizer.addElements('a')

    this.elem.innerHTML = '<a href="http://example.com">Stuff</a>'
    expect(toHTML(this.Sanitizer.clean(this.elem))).toEqual('<a>Stuff</a>')

    this.Sanitizer.addAttributes({
      a: ['href']
    })

    this.Sanitizer.addProtocols(['http', 'https'])

    this.elem.innerHTML = '<a href="javascript:void(0)">Stuff</a>'
    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<a>Stuff</a>')

    this.elem.innerHTML = '<a href="https://example.com/">Stuff</a>'
    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<a href="https://example.com/">Stuff</a>')
  })

  it('can remove allowed protocols.', function () {
    this.Sanitizer
      .addElements('a')
      .addAttributes({ a: ['href'] })
      .addProtocols(['http', 'https'])
      .addProtocols(['http'])

    this.elem.innerHTML = '<a href="http://www.example.com">Click me</a>'
    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<a href="http://www.example.com">Click me</a>')

    this.Sanitizer.removeProtocols('http')

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<a href="http://www.example.com">Click me</a>')

    this.Sanitizer.removeProtocols(['http'])

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<a>Click me</a>')

    this.elem.innerHTML = '<a href="https://www.example.com">Click me</a>'

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<a href="https://www.example.com">Click me</a>')
  })

  it('can be configured to use custom filters (1).', function () {

    function filter (node) {
      return true
    }

    this.Sanitizer.addElements(['p'])

    this.elem.innerHTML = '<p>Things</p><hr><p>Stuff</p>'
    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p>Things</p><p>Stuff</p>')

    this.Sanitizer.addFilter('hr', filter)

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p>Things</p><hr><p>Stuff</p>')
  })

  it('can be configured to use custom filters (2).', function () {

    function filter (node) {
      return true
    }

    this.Sanitizer.addElements(['p'])

    this.elem.innerHTML = '<p>Things</p><ol><li>Words</li></ol><p>Stuff</p>'
    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p>Things</p>Words<p>Stuff</p>')

    this.Sanitizer.addFilter('ol', filter)

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p>Things</p><ol>Words</ol><p>Stuff</p>')
  })

  it('can remove custom filters.', function () {

    function filter (node) {
      return true
    }

    this.Sanitizer
      .addElements(['p'])
      .addFilter('hr', filter)

    this.elem.innerHTML = '<p>Things</p><hr><p>Stuff</p>'

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p>Things</p><hr><p>Stuff</p>')

    this.Sanitizer.removeFilter('hr', filter)

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p>Things</p><p>Stuff</p>')
  })
})
