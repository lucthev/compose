/* jshint ignore:start */

// NOTE: we are not testing the Sanitizer itself, just the plugin
// layer we've added.

describe('The Sanitizer plugin', function () {

  var Sanitizer = Quill.getPlugin('sanitizer')

  beforeEach(function () {
    this.elem = document.createElement('div')
    document.body.appendChild(this.elem)

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

  it('can be configured to keep attributes via the addAttribute method.', function () {
    this.Sanitizer.addElements(['p'])

    this.elem.innerHTML = '<p style="color: red;" name="blue" id="x">St<i>uff</i></p>'
    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p>Stuff</p>')

    this.Sanitizer.addAttributes({
      p: ['name', 'id']
    })

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p name="blue" id="x">Stuff</p>')
  })

  it('can be configured to allow protocols within attributes.', function () {
    this.Sanitizer.addElements('a')

    this.elem.innerHTML = '<a href="http://example.com">Stuff</a>'
    expect(toHTML(this.Sanitizer.clean(this.elem))).toEqual('<a>Stuff</a>')

    this.Sanitizer.addAttributes({
      a: ['href']
    })

    this.elem.innerHTML = '<a href="javascript:void(0)">Stuff</a>'
    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<a href="javascript:void(0)">Stuff</a>')

    this.Sanitizer.addProtocols({
      a: { href: ['http', 'https']}
    })

    this.elem.innerHTML = '<a href="javascript:void(0)">Stuff</a>'
    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<a>Stuff</a>')

    this.elem.innerHTML = '<a href="https://example.com">Stuff</a>'
    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<a href="https://example.com">Stuff</a>')
  })

  it('can be configured to use custom filters.', function () {

    function filter (params) {
      var node = params.node,
          name = params.node_name

      if (name === 'hr')
        return { node: node, whitelist: true }
      else return null
    }

    this.Sanitizer.addElements(['p'])

    this.elem.innerHTML = '<p>Things</p><hr><p>Stuff</p>'
    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p>Things</p><p>Stuff</p>')

    this.Sanitizer.addFilter(filter)

    expect(toHTML(this.Sanitizer.clean(this.elem)))
      .toEqual('<p>Things</p><hr><p>Stuff</p>')
  })
})