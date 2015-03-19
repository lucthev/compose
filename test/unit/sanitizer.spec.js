/*eslint-env mocha *//*global Compose, formatBlock, expect, listPlugin */
'use strict'

describe('The sanitizer should', function () {
  var Serialize,
      sanitize

  before(init)

  it('extract paragraphs from a string of HTML', function () {
    var result = sanitize(
      '<p>One</p>' +
      '<p>Two</p>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0].text).to.equal('One')
    expect(result.paragraphs[0].type).to.equal('p')
    expect(result.paragraphs[1].text).to.equal('Two')
    expect(result.paragraphs[1].type).to.equal('p')
  })

  it('group stray inline elements into paragraphs', function () {
    var result = sanitize(
      'Half n ' +
      '<strong>half</strong>' +
      '<p>Two</p>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0].text).to.equal('Half n half')
    expect(result.paragraphs[0].type).to.equal('p')
    expect(result.paragraphs[1].text).to.equal('Two')
    expect(result.paragraphs[1].type).to.equal('p')
  })

  it('ignore unknown elements', function () {
    var result = sanitize(
      '<article>' +
        '<div>' +
          '<p>One</p>' +
          '<div>' +
            '<p>Two</p>' +
          '</div>' +
        '</div>' +
      '</article>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0].text).to.equal('One')
    expect(result.paragraphs[0].type).to.equal('p')
    expect(result.paragraphs[1].text).to.equal('Two')
    expect(result.paragraphs[1].type).to.equal('p')
  })

  it('insert BRs into empty paragraphs', function () {
    var result = sanitize(
      '<p>One</p>' +
      '<p></p>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0].text).to.equal('One')
    expect(result.paragraphs[0].type).to.equal('p')
    expect(result.paragraphs[1].text).to.equal('\n')
    expect(result.paragraphs[1].type).to.equal('p')
  })

  it('insert BRs into whitespace-only paragraphs', function () {
    var result = sanitize(
      '<p>One</p>' +
      '<p>        </p>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0].text).to.equal('One')
    expect(result.paragraphs[0].type).to.equal('p')
    expect(result.paragraphs[1].text).to.equal('\n')
    expect(result.paragraphs[1].type).to.equal('p')
  })

  it('remove extraneous whitespace', function () {
    var result = sanitize(
      '<p>          One        </p>'
    )

    expect(result.paragraphs.length).to.equal(1)
    expect(result.paragraphs[0].text).to.equal('One')
    expect(result.paragraphs[0].type).to.equal('p')
  })

  it('extract paragraphs from entire documents', function () {
    // Microsoft Word sometimes does something similar when copy+pasting
    var result = sanitize(
      '<html>' +
        '<head>' +
          '<meta charset="UTF-8">' +
          '<title>Test</title>' +
        '</head>' +
        '<body>' +
          '<div>' +
            '<p>One</p>' +
            '<p>Two</p>' +
          '</div>' +
        '</body>' +
      '</html>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0].text).to.equal('One')
    expect(result.paragraphs[0].type).to.equal('p')
    expect(result.paragraphs[1].text).to.equal('Two')
    expect(result.paragraphs[1].type).to.equal('p')
  })

  it('correct invalid markup', function () {
    var result = sanitize(
      '<div>One<span><p>Two</p></span>Three</div>'
    )

    expect(result.paragraphs.length).to.equal(3)
    expect(result.paragraphs[0].text).to.equal('One')
    expect(result.paragraphs[0].type).to.equal('p')
    expect(result.paragraphs[1].text).to.equal('Two')
    expect(result.paragraphs[1].type).to.equal('p')
    expect(result.paragraphs[2].text).to.equal('Three')
    expect(result.paragraphs[2].type).to.equal('p')
  })

  it('account for styles in invalid markup', function () {
    var result = sanitize('<div>One<strong><p>Two</p></strong>Three</div>')

    expect(result.paragraphs.length).to.equal(3)
    expect(result.paragraphs[0].markups).to.eql([])
    expect(result.paragraphs[1].markups).to.eql([{
      type: Serialize.types.bold,
      start: 0,
      end: 3
    }])
    expect(result.paragraphs[2].markups).to.eql([])
  })

  it('recognize invalid markup in lists', function () {
    var result = sanitize(
      '<ol>' +
        '<p>One</p>' +
        '<li>Two</li>' +
      '</ol>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0].text).to.equal('One')
    expect(result.paragraphs[0].type).to.equal('p')
    expect(result.paragraphs[1].text).to.equal('Two')
    expect(result.paragraphs[1].type).to.equal('ol')
  })

  it('bubble down inline elements', function () {
    var result = sanitize('<div><strong><div><p>One</p></div></strong></div>')

    expect(result.paragraphs.length).to.equal(1)
    expect(result.paragraphs[0].markups).to.eql([{
      type: Serialize.types.bold,
      start: 0,
      end: 3
    }])
  })

  it('bubble down inline elements (3)', function () {
    var result = sanitize('<p>One</p><strong><p>Two</p></strong><p>Three</p>')

    expect(result.paragraphs.length).to.equal(3)
    expect(result.paragraphs[0].markups.length).to.eql(0)
    expect(result.paragraphs[1].markups.length).to.eql(1)
    expect(result.paragraphs[0].markups.length).to.eql(0)
  })

  /**
   * Regression test: the sanitizer used to “unwrap” elements it didn’t
   * recognize. The list plugin adds a handler for LIs, not their parent
   * lists, but needs to know the type of the parent list. The sanitizer
   * would unwrap ULs; the orphaned LIs would then default to ordered.
   */
  it('not unwrap elements (e.g. UL)', function () {
    var result = sanitize(
      '<ul><li>One</li></ul>'
    )

    expect(result.paragraphs.length).to.equal(1)
    expect(result.paragraphs[0].text).to.equal('One')
    expect(result.paragraphs[0].type).to.equal('ul')
  })

  it('not unwrap elements (e.g. OL)', function () {
    var result = sanitize(
      '<ol><li>One</li></ol>'
    )

    expect(result.paragraphs.length).to.equal(1)
    expect(result.paragraphs[0].text).to.equal('One')
    expect(result.paragraphs[0].type).to.equal('ol')
  })

  it('recognize the children of LIs as LIs', function () {
    var result = sanitize(
      '<ul><li><p>One</p>Two</li></ul>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0].text).to.equal('One')
    expect(result.paragraphs[0].type).to.equal('ul')
    expect(result.paragraphs[1].text).to.equal('Two')
    expect(result.paragraphs[1].type).to.equal('ul')
  })

  it('treat plain text as a paragraph', function () {
    var result = sanitize(
      '<meta charset="UTF-8">One'
    )

    expect(result.paragraphs.length).to.equal(1)
    expect(result.paragraphs[0].text).to.equal('One')
    expect(result.paragraphs[0].type).to.equal('p')
  })

  it('split paragraphs at double newlines', function () {
    var result = sanitize(
      '<p>One<br><br>Two</p>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0].text).to.equal('One')
    expect(result.paragraphs[0].type).to.equal('p')
    expect(result.paragraphs[1].text).to.equal('Two')
    expect(result.paragraphs[1].type).to.equal('p')
  })

  it('leave trailing double newlines', function () {
    var result = sanitize(
      '<p>One<br><br></p>' +
      '<p>Two</p>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0].text).to.equal('One\n\n')
    expect(result.paragraphs[0].type).to.equal('p')
    expect(result.paragraphs[1].text).to.equal('Two')
    expect(result.paragraphs[1].type).to.equal('p')
  })

  it('accurately split > 2 BRs', function () {
    var result = sanitize(
      '<p>One<br><br><br>Two</p>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0].text).to.equal('One')
    expect(result.paragraphs[0].type).to.equal('p')
    expect(result.paragraphs[1].text).to.equal('\nTwo')
    expect(result.paragraphs[1].type).to.equal('p')
  })

  it.skip('remove consecutive spaces', function () {
    var result = sanitize(
      '<p>One &nbsp; Two</p>'
    )

    expect(result.paragraphs.length).to.equal(1)
    expect(result.paragraphs[0].text).to.equal('One Two')
    expect(result.paragraphs[0].type).to.equal('p')
  })

  it.skip('leave consecutive spaces in <pre> blocks', function () {
    var result = sanitize(
      '<pre>One &nbsp; Two</pre>'
    )

    expect(result.paragraphs.length).to.equal(1)
    expect(result.paragraphs[0].text).to.equal('One \u00A0 Two')
    expect(result.paragraphs[0].type).to.equal('pre')
  })

  it('keep wanted markups', function () {
    var result = sanitize(
      '<p>One <strong>two</strong> three</p>'
    )

    expect(result.paragraphs.length).to.equal(1)
    expect(result.paragraphs[0].text).to.equal('One two three')
    expect(result.paragraphs[0].type).to.equal('p')
    expect(result.paragraphs[0].markups).to.eql([{
      type: Serialize.types.bold,
      start: 4,
      end: 7
    }])
  })

  it('recognize <hr>s as section starters', function () {
    var result = sanitize(
      '<p>One</p>' +
      '<hr>' +
      '<p>Two</p>'
    )

    expect(result.sections.length).to.equal(1)
    expect(result.sections[0].start).to.equal(1)
  })

  it('not keep sections starting at the same index', function () {
    var result = sanitize(
      '<p>One</p>' +
      '<section>' +
        '<hr>' +
        '<p>Two</p>' +
      '</section>'
    )

    expect(result.sections.length).to.equal(1)
    expect(result.sections[0].start).to.equal(1)
  })

  it('recognize sections within wrapping elements', function () {
    var result = sanitize(
      '<div>' +
        '<p>One</p>' +
        '<section>' +
          '<p>Two</p>' +
          '<hr>' +
          'Three' +
        '</section>' +
      '</div>'
    )

    expect(result.sections.length).to.equal(2)
    expect(result.sections[0].start).to.equal(1)
    expect(result.sections[1].start).to.equal(2)
  })

  it('ignore trailing sections', function () {
    var result = sanitize(
      '<p>One</p><hr>'
    )

    expect(result.sections.length).to.equal(0)
  })

  function init () {
    var elem = document.createElement('article')

    document.body.appendChild(elem)
    var editor = new Compose(elem)
    editor.use(formatBlock)
    editor.use(listPlugin)

    sanitize = editor.require('sanitizer')
    Serialize = editor.require('serialize')
  }
})
