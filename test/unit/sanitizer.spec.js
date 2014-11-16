/* global describe, it, Compose, before, expect, chai, Superset */
'use strict';

chai.use(Superset)

describe('The sanitizer should', function () {
  var Serialize,
      sanitize

  before(function (done) {
    var elem = document.createElement('article'),
        editor

    document.body.appendChild(elem)
    editor = new Compose(elem)

    editor.use(function (Compose) {
      sanitize = Compose.require('sanitize')
      Serialize = Compose.require('serialize')
      done()
    })
  })

  it('extract paragraphs from a string of HTML', function () {
    var result = sanitize(
      '<p>One</p>' +
      '<p>Two</p>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0]).to.superset({
      text: 'One',
      type: 'p'
    })
    expect(result.paragraphs[1]).to.superset({
      text: 'Two',
      type: 'p'
    })
  })

  it('group stray inline elements into paragraphs', function () {
    var result = sanitize(
      'Half n ' +
      '<strong>half</strong>' +
      '<p>Two</p>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0]).to.superset({
      text: 'Half n half',
      type: 'p'
    })
    expect(result.paragraphs[1]).to.superset({
      text: 'Two',
      type: 'p'
    })
  })

  it('ignore wrapping elements', function () {
    var result = sanitize(
      '<article>' +
        '<div>' +
          '<p>One</p>' +
          '<div>' +
            '<h2>Two</h2>' +
          '</div>' +
        '</div>' +
      '</article>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0]).to.superset({
      text: 'One',
      type: 'p'
    })
    expect(result.paragraphs[1]).to.superset({
      text: 'Two',
      type: 'h2'
    })
  })

  it('ignore empty paragraphs', function () {
    var result = sanitize(
      '<p>One</p>' +
      '<p></p>'
    )

    expect(result.paragraphs.length).to.equal(1)
    expect(result.paragraphs[0]).to.superset({
      text: 'One',
      type: 'p'
    })
  })

  it('ignore whitespace-only paragraphs', function () {
    var result = sanitize(
      '<h2>One</h2>' +
      '<p>    \n    </p>' +
      '<p>Two</p>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0]).to.superset({
      text: 'One',
      type: 'h2'
    })
    expect(result.paragraphs[1]).to.superset({
      text: 'Two',
      type: 'p'
    })
  })

  it('extract paragraphs from entire documents', function () {
    // Microsoft Word sometimes does this.
    var result = sanitize(
      '<html>' +
        '<head>' +
          '<meta charset="UTF-8">' +
        '</head>' +
        '<body>' +
          '<div>' +
            '<h2>One</h2>' +
            '<blockquote>Two</blockquote>' +
          '</div>' +
        '</body>' +
      '</html>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0]).to.superset({
      text: 'One',
      type: 'h2'
    })
    expect(result.paragraphs[1]).to.superset({
      text: 'Two',
      type: 'blockquote'
    })
  })

  it('treat children of blockquotes as blockquotes', function () {
    var result = sanitize(
      '<blockquote>' +
        '<p>One</p>' +
        '<blockquote>Two</blockquote>' +
      '</blockquote>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0]).to.superset({
      text: 'One',
      type: 'blockquote'
    })
    expect(result.paragraphs[1]).to.superset({
      text: 'Two',
      type: 'blockquote'
    })
  })

  it('treat children of list items as list items', function () {
    var result = sanitize(
      '<ol>' +
        '<li>' +
          '<p>One</p>' +
          '<p>Two</p>' +
        '</li>' +
        '<li>Three</li>' +
      '</ol>'
    )

    expect(result.paragraphs.length).to.equal(3)
    expect(result.paragraphs[0]).to.superset({
      text: 'One',
      type: 'ol'
    })
    expect(result.paragraphs[1]).to.superset({
      text: 'Two',
      type: 'ol'
    })
    expect(result.paragraphs[2]).to.superset({
      text: 'Three',
      type: 'ol'
    })
  })

  it('wrap non-<li> list children', function () {
    var result = sanitize(
      '<ol>' +
        'One' +
        '<li>Two</li>' +
      '</ol>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0]).to.superset({
      text: 'One',
      type: 'ol'
    })
    expect(result.paragraphs[1]).to.superset({
      text: 'Two',
      type: 'ol'
    })
  })

  it('treat plain text as a paragraph', function () {
    var result = sanitize(
      '<meta charset="UTF-8">One'
    )

    expect(result.paragraphs.length).to.equal(1)
    expect(result.paragraphs[0]).to.superset({
      text: 'One',
      type: 'p'
    })
  })

  it('treat two <br>s as a new paragraph', function () {
    var result = sanitize(
      '<p>One<br><br>Two</p>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0]).to.superset({
      text: 'One',
      type: 'p'
    })
    expect(result.paragraphs[1]).to.superset({
      text: 'Two',
      type: 'p'
    })
  })

  it('treat >= two <br>s as a new paragraph', function () {
    var result = sanitize(
      '<blockquote>One<br><br><br>Two</blockquote>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0]).to.superset({
      text: 'One',
      type: 'blockquote'
    })
    expect(result.paragraphs[1]).to.superset({
      text: 'Two',
      type: 'blockquote'
    })
  })

  it('remove consecutive spaces', function () {
    var result = sanitize(
      '<p>One &nbsp; Two</p>'
    )

    expect(result.paragraphs.length).to.equal(1)
    expect(result.paragraphs[0]).to.superset({
      text: 'One Two',
      type: 'p'
    })
  })

  it('leave consecutive spaces in <pre> blocks', function () {
    var result = sanitize(
      '<pre>One &nbsp; Two</pre>'
    )

    expect(result.paragraphs.length).to.equal(1)
    expect(result.paragraphs[0]).to.superset({
      // Note: middle space is a non-breaking space
      text: 'One   Two',
      type: 'pre'
    })
  })

  it('apply smart text filters', function () {
    var result = sanitize(
      '<p>"Orange," replied Alex. "I <3 orange..."</p>'
    )

    expect(result.paragraphs.length).to.equal(1)
    expect(result.paragraphs[0]).to.superset({
      text: '“Orange,” replied Alex. “I ❤ orange…”',
      type: 'p'
    })
  })

  it('not apply smart text filters in <pre> blocks and <code> markups.', function () {
    var result = sanitize(
      '<pre>var x = 1 <3 ? "word" : ""</pre>' +
      '<p>Arrow notation thing: <code>pointer->property</code></p>'
    )

    expect(result.paragraphs.length).to.equal(2)
    expect(result.paragraphs[0]).to.superset({
      text: 'var x = 1 <3 ? "word" : ""',
      type: 'pre'
    })
    expect(result.paragraphs[1]).to.superset({
      text: 'Arrow notation thing: pointer->property',
      type: 'p',
      markups: [{
        type: Serialize.types.code,
        start: 22,
        end: 39
      }]
    })
  })

  it('respect Compose-approved classes', function () {
    var result = sanitize(
      '<div>' +
        '<blockquote class="pullquote">One</blockquote>' +
      '</div>'
    )

    expect(result.paragraphs.length).to.equal(1)
    expect(result.paragraphs[0]).to.superset({
      text: 'One',
      type: 'pullquote'
    })
  })

  it('keep wanted markups', function () {
    var result = sanitize(
      '<p>One <strong>two</strong> three</p>'
    )

    expect(result.paragraphs.length).to.equal(1)
    expect(result.paragraphs[0]).to.superset({
      text: 'One two three',
      type: 'p',
      markups: [{
        type: Serialize.types.bold,
        start: 4,
        end: 7
      }]
    })
  })

  it('recognize <section>s as section starters', function () {
    var result = sanitize(
      '<p>One</p>' +
      '<section>' +
        '<p>Two</p>' +
      '</section>'
    )

    expect(result.sections.length).to.equal(1)
    expect(result.sections[0]).to.superset({
      start: 1
    })
  })

  it('recognize <hr>s as section starters', function () {
    var result = sanitize(
      '<p>One</p>' +
      '<hr>' +
      '<p>Two</p>'
    )

    expect(result.sections.length).to.equal(1)
    expect(result.sections[0]).to.superset({
      start: 1
    })
  })

  it('not keep sections starting at the same index', function () {
    var result = sanitize(
      '<h2>One</h2>' +
      '<section>' +
        '<hr>' +
        '<p>Two</p>' +
      '</section>'
    )

    expect(result.sections.length).to.equal(1)
    expect(result.sections[0]).to.superset({
      start: 1
    })
  })

  it('recognize sections withing wrapping elements', function () {
    var result = sanitize(
      '<div>' +
        '<h2>One</h2>' +
        '<section>' +
          '<p>Two</p>' +
          '<hr>' +
          'Three' +
        '</section>' +
      '</div>'
    )

    expect(result.sections.length).to.equal(2)
    expect(result.sections[0]).to.superset({
      start: 1
    })
    expect(result.sections[1]).to.superset({
      start: 2
    })
  })

  it('ignore trailing sections', function () {
    var result = sanitize(
      '<p>One</p><hr>'
    )

    expect(result.sections.length).to.equal(0)
  })

  it.skip('ignore empty sections', function () {
    var result = sanitize(
      '<p>One</p>' +
      '<section></section>' +
      '<p>Two</p>'
    )

    expect(result.sections.length).to.equal(0)
  })
})
