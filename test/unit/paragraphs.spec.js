/* global describe, it, Compose, expect, chai, TreeMatcher, ChildMatcher */
'use strict';

chai.use(TreeMatcher)
chai.use(ChildMatcher)

describe('Paragraph operation', function () {
  var View,
      Converter,
      Delta

  function init (html) {
    var elem = document.createElement('div'),
        editor

    elem.innerHTML = html
    document.body.appendChild(elem)
    editor = new Compose(elem)
    View = editor.plugins.view
    Converter = editor.plugins.converter
    Delta = editor.plugins.delta

    return editor
  }

  function teardown (editor) {
    var elem = editor.elem

    try {
      editor.destroy()
    } catch (e) {}

    elem.parentNode.removeChild(elem)
  }

  describe('“insert”', function () {
    var operation = 'paragraphInsert'

    it('can insert paragraphs at the end of a section.', function (done) {
      var editor = init('<section><hr><p>One</p></section>'),
          h2 = document.createElement('h2')

      h2.textContent = 'Two'

      View.render(new Delta(operation, 1, Converter.toParagraph(h2)))

      // Rendering is async, but should occur with setImmediate speeds.
      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', '!paragraph-last'],
            html: 'One',
          }, {
            name: 'h2',
            classes: ['!paragraph-first', 'paragraph-last'],
            html: 'Two'
          }]
        }])

        expect(View.paragraphs.length).to.equal(2)
        expect(View.paragraphs[0].type).to.equal('p')
        expect(View.paragraphs[1].type).to.equal('h2')

        teardown(editor)
        done()
      }, 0)
    })

    it('can insert multiple paragraphs at once.', function (done) {
      var editor = init('<section><hr><p>One</p></section>'),
          p1 = document.createElement('p'),
          p2 = document.createElement('p')

      p1.innerHTML = 'Two'
      p2.innerHTML = 'Three'

      View.render([
        new Delta(operation, 1, Converter.toParagraph(p2)),
        new Delta(operation, 1, Converter.toParagraph(p1))
      ])

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', '!paragraph-last'],
            html: 'One'
          }, {
            name: 'p',
            classes: ['!paragraph-first', '!paragraph-last'],
            html: 'Two'
          }, {
            name: 'p',
            classes: ['!paragraph-first', 'paragraph-last'],
            html: 'Three'
          }]
        }])

        expect(View.paragraphs.length).to.equal(3)

        teardown(editor)
        done()
      }, 0)
    })

    it.skip('should throw when trying to inserting at an impossible index (1).',
      function (done) {
        var p = document.createElement('p'),
            editor

        p.innerHTML = 'Stuff'
        editor = init('<section><hr><p>Things</p><h2>Words</h2></section>')

        expect(function () {
          View.render(new Delta(operation, 0, Converter.toParagraph(p)))
        }).to.throw(RangeError)

        teardown(editor)
        done()
      })

    it.skip('should throw when trying to inserting at an impossible index (2).',
      function (done) {
        var p = document.createElement('p'),
            editor

        p.innerHTML = 'Stuff'
        editor = init(
          '<section><hr><p>Things</p><h2>Words</h2></section>' +
          '<section><hr><pre><code>Words.</code></pre></section>'
        )

        expect(function () {
          View.render(new Delta(operation, 5, Converter.toParagraph(p)))
        }).to.throw(RangeError)

        teardown(editor)
        done()
      })

    it('should insert paragraphs before section breaks.', function (done) {
      var pre = document.createElement('pre'),
          editor

      pre.innerHTML = '<code>Two</code>'
      editor = init(
        '<section><hr><p>One</p></section>' +
        '<section><hr><p>Three</p></section>'
      )

      View.render(new Delta(operation, 1, Converter.toParagraph(pre)))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', '!paragraph-last'],
            html: 'One'
          }, {
            name: 'pre',
            classes: ['!paragraph-first', 'paragraph-last'],
            html: '<code>Two</code>'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', 'paragraph-last'],
            html: 'Three'
          }]
        }])

        expect(View.paragraphs.length).to.equal(3)
        expect(View.paragraphs[0].type).to.equal('p')
        expect(View.paragraphs[1].type).to.equal('pre')
        expect(View.paragraphs[2].type).to.equal('p')

        teardown(editor)
        done()
      }, 0)
    })

    it('can insert paragraphs between others.', function (done) {
      var pullquote = document.createElement('blockquote'),
          editor

      pullquote.className = 'pullquote'
      pullquote.innerHTML = '<em>Three</em>'
      pullquote = Converter.toParagraph(pullquote)
      editor = init(
        '<section><hr>' +
          '<p>One</p>' +
          '<h2>Two</h2>' +
          '<p>Four</p>' +
        '</section>'
      )

      View.render(new Delta(operation, 2, pullquote))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', '!paragraph-last'],
            html: 'One'
          }, {
            name: 'h2',
            classes: ['!paragraph-first', '!paragraph-last'],
            html: 'Two'
          }, {
            name: 'blockquote',
            classes: ['!paragraph-first', '!paragraph-last'],
            html: '<em>Three</em>'
          }, {
            name: 'p',
            classes: ['!paragraph-first', 'paragraph-last'],
            html: 'Four'
          }]
        }])

        expect(View.paragraphs.length).to.equal(4)
        expect(View.paragraphs[0].type).to.equal('p')
        expect(View.paragraphs[1].type).to.equal('h2')
        expect(View.paragraphs[2].type).to.equal('pullquote')
        expect(View.paragraphs[3].type).to.equal('p')

        teardown(editor)
        done()
      }, 0)
    })

    it('can insert a list item after a paragraph.', function (done) {
      var li = document.createElement('li'),
          editor

      li.innerHTML = 'Poisson'
      li = Converter.toParagraph(li)
      li.type = 'ol'
      editor = init('<section><hr><p><br></p></section>')

      View.render(new Delta(operation, 1, li))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', '!paragraph-last'],
            html: '<br>'
          }, {
            name: 'ol',
            classes: ['!paragraph-first', '!paragraph-last'],
            children: [{
              name: 'li',
              classes: ['!paragraph-first', 'paragraph-last'],
              html: 'Poisson'
            }]
          }]
        }])

        expect(View.paragraphs.length).to.equal(2)
        expect(View.paragraphs[0].type).to.equal('p')
        expect(View.paragraphs[1].type).to.equal('ol')

        teardown(editor)
        done()
      }, 0)
    })

    it('can insert a list item after another list item.', function (done) {
      var li = document.createElement('li'),
          editor

      li.innerHTML = 'Poisson'
      li = Converter.toParagraph(li)
      li.type = 'ol'
      editor = init('<section><hr><ol><li>Binomial</li></ol></section>')

      View.render(new Delta(operation, 1, li))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            classes: ['!paragraph-first', '!paragraph-last'],
            children: [{
              name: 'li',
              classes: ['paragraph-first', '!paragraph-last'],
              html: 'Binomial'
            }, {
              name: 'li',
              classes: ['!paragraph-first', 'paragraph-last'],
              html: 'Poisson'
            }]
          }]
        }])

        expect(View.paragraphs.length).to.equal(2)
        expect(View.paragraphs[0].type).to.equal('ol')
        expect(View.paragraphs[1].type).to.equal('ol')

        teardown(editor)
        done()
      }, 0)
    })

    it('can insert a list item between other list items.', function (done) {
      var li = document.createElement('li'),
          editor

      li.innerHTML = 'Poisson'
      li = Converter.toParagraph(li)
      li.type = 'ol'
      editor = init(
        '<section><hr><ol>' +
          '<li>Binomial</li>' +
          '<li>Multinomial</li>' +
        '</ol></section>'
      )

      View.render(new Delta(operation, 1, li))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            classes: ['!paragraph-first', '!paragraph-last'],
            children: [{
              name: 'li',
              classes: ['paragraph-first', '!paragraph-last'],
              html: 'Binomial'
            }, {
              name: 'li',
              classes: ['!paragraph-first', '!paragraph-last'],
              html: 'Poisson'
            }, {
              name: 'li',
              classes: ['!paragraph-first', 'paragraph-last'],
              html: 'Multinomial'
            }]
          }]
        }])

        expect(View.paragraphs.length).to.equal(3)
        expect(View.paragraphs[0].type).to.equal('ol')
        expect(View.paragraphs[1].type).to.equal('ol')
        expect(View.paragraphs[2].type).to.equal('ol')

        teardown(editor)
        done()
      }, 0)
    })

    it('can insert an unordered list item between ordered list items.',
      function (done) {
        var li = document.createElement('li'),
            editor

        li.innerHTML = 'Poisson'
        li = Converter.toParagraph(li)
        li.type = 'ul'
        editor = init(
          '<section><hr><ol>' +
            '<li>Binomial</li>' +
            '<li>Multinomial</li>' +
          '</ol></section>'
        )

        View.render(new Delta(operation, 1, li))

        setTimeout(function () {
          expect(editor.elem).to.have.children([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'ol',
              classes: ['!paragraph-first', '!paragraph-last'],
              children: [{
                name: 'li',
                classes: ['paragraph-first', '!paragraph-last'],
                html: 'Binomial'
              }]
            }, {
              name: 'ul',
              classes: ['!paragraph-first', '!paragraph-last'],
              children: [{
                name: 'li',
                classes: ['!paragraph-first', '!paragraph-last'],
                html: 'Poisson'
              }]
            }, {
              name: 'ol',
              classes: ['!paragraph-first', '!paragraph-last'],
              children: [{
                name: 'li',
                classes: ['!paragraph-first', 'paragraph-last'],
                html: 'Multinomial'
              }]
            }]
          }])

          expect(View.paragraphs.length).to.equal(3)
          expect(View.paragraphs[0].type).to.equal('ol')
          expect(View.paragraphs[1].type).to.equal('ul')
          expect(View.paragraphs[2].type).to.equal('ol')

          teardown(editor)
          done()
        }, 0)
      })

    it('can insert an unordered list item after ordered list items.',
      function (done) {
        var li = document.createElement('li'),
            editor

        li.innerHTML = 'Poisson'
        li = Converter.toParagraph(li)
        li.type = 'ul'
        editor = init(
          '<section><hr><ol>' +
            '<li>Binomial</li>' +
            '<li>Multinomial</li>' +
          '</ol></section>'
        )

        View.render(new Delta(operation, 2, li))

        setTimeout(function () {
          expect(editor.elem).to.have.children([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'ol',
              classes: ['!paragraph-first', '!paragraph-last'],
              children: [{
                name: 'li',
                classes: ['paragraph-first', '!paragraph-last'],
                html: 'Binomial'
              }, {
                name: 'li',
                classes: ['!paragraph-first', '!paragraph-last'],
                html: 'Multinomial'
              }]
            }, {
              name: 'ul',
              classes: ['!paragraph-first', '!paragraph-last'],
              children: [{
                name: 'li',
                classes: ['!paragraph-first', 'paragraph-last'],
                html: 'Poisson'
              }]
            }]
          }])

          expect(View.paragraphs.length).to.equal(3)
          expect(View.paragraphs[0].type).to.equal('ol')
          expect(View.paragraphs[1].type).to.equal('ol')
          expect(View.paragraphs[2].type).to.equal('ul')

          teardown(editor)
          done()
        }, 0)
      })

    it('can insert an unordered list item before ordered list items.',
      function (done) {
        var li = document.createElement('li'),
            editor

        li.innerHTML = 'Poisson'
        li = Converter.toParagraph(li)
        li.type = 'ul'
        editor = init(
          '<section><hr>' +
          '<p>First</p>' +
          '<ol>' +
            '<li>Binomial</li>' +
            '<li>Multinomial</li>' +
          '</ol></section>'
        )

        View.render(new Delta(operation, 1, li))

        setTimeout(function () {
          expect(editor.elem).to.have.children([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              classes: ['paragraph-first', '!paragraph-last'],
              html: 'First'
            }, {
              name: 'ul',
              classes: ['!paragraph-first', '!paragraph-last'],
              children: [{
                name: 'li',
                classes: ['!paragraph-first', '!paragraph-last'],
                html: 'Poisson'
              }]
            }, {
              name: 'ol',
              classes: ['!paragraph-first', '!paragraph-last'],
              children: [{
                name: 'li',
                classes: ['!paragraph-first', '!paragraph-last'],
                html: 'Binomial'
              }, {
                name: 'li',
                classes: ['!paragraph-first', 'paragraph-last'],
                html: 'Multinomial'
              }]
            }]
          }])

          expect(View.paragraphs.length).to.equal(4)
          expect(View.paragraphs[0].type).to.equal('p')
          expect(View.paragraphs[1].type).to.equal('ul')
          expect(View.paragraphs[2].type).to.equal('ol')
          expect(View.paragraphs[3].type).to.equal('ol')

          teardown(editor)
          done()
        }, 0)
      })

    it('should not merge lists separated by a section divider.',
      function (done) {
        var li = document.createElement('li'),
            editor

        li.innerHTML = 'Poisson'
        li = Converter.toParagraph(li)
        li.type = 'ul'
        editor = init(
          '<section><hr><p>Stuff</p></section>' +
          '<section><hr><ul><li>A list.</li></ul></section>'
        )

        View.render(new Delta(operation, 1, li))

        setTimeout(function () {
          expect(editor.elem).to.have.children([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              classes: ['paragraph-first', '!paragraph-last'],
              html: 'Stuff'
            }, {
              name: 'ul',
              classes: ['!paragraph-first', '!paragraph-last'],
              children: [{
                name: 'li',
                classes: ['!paragraph-first', 'paragraph-last'],
                html: 'Poisson'
              }]
            }]
          }, {
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'ul',
              classes: ['!paragraph-first', '!paragraph-last'],
              children: [{
                name: 'li',
                classes: ['paragraph-first', 'paragraph-last'],
                html: 'A list.'
              }]
            }]
          }])

          expect(View.paragraphs.length).to.equal(3)
          expect(View.paragraphs[0].type).to.equal('p')
          expect(View.paragraphs[1].type).to.equal('ul')
          expect(View.paragraphs[2].type).to.equal('ul')

          teardown(editor)
          done()
        }, 0)
      })

    it('should merge a list being inserted before another.', function (done) {
      var li = document.createElement('li'),
          editor

      li.innerHTML = 'Two'
      li = Converter.toParagraph(li)
      li.type = 'ul'
      editor = init(
        '<section><hr>' +
          '<p>One</p>' +
          '<ul><li>Three</li><li>Four</li></ul>' +
        '</section>'
      )

      View.render(new Delta(operation, 1, li))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', '!paragraph-last'],
            html: 'One'
          }, {
            name: 'ul',
            classes: ['!paragraph-first', '!paragraph-last'],
            children: [{
              name: 'li',
              classes: ['!paragraph-first', '!paragraph-last'],
              html: 'Two'
            }, {
              name: 'li',
              classes: ['!paragraph-first', '!paragraph-last'],
              html: 'Three'
            }, {
              name: 'li',
              classes: ['!paragraph-first', 'paragraph-last'],
              html: 'Four'
            }]
          }]
        }])

        expect(View.paragraphs.length).to.equal(4)
        expect(View.paragraphs[0].type).to.equal('p')
        expect(View.paragraphs[1].type).to.equal('ul')
        expect(View.paragraphs[2].type).to.equal('ul')
        expect(View.paragraphs[3].type).to.equal('ul')

        teardown(editor)
        done()
      }, 0)
    })
  })

  describe('“update”', function () {
    var operation = 'paragraphUpdate'

    it('can be used to change a paragraph’s content.', function (done) {
      var editor,
          p

      editor = init('<section><hr><p>Stuff</p></section>')
      p = View.paragraphs[0].substr(0)
      p.text = 'Things'

      View.render(new Delta(operation, 0, p))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
          name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', 'paragraph-last'],
            html: 'Things'
          }]
        }])
        expect(View.paragraphs.length).to.equal(1)

        teardown(editor)
        done()
      }, 0)
    })

    it('can be used to style a paragraph’s content.', function (done) {
      var p = document.createElement('p'),
          editor

      p.innerHTML = '<strong>Once</strong> upon <em>a time</em>'
      editor = init('<section><hr><p>Stuff</p></section>')

      View.render(new Delta(operation, 0, Converter.toParagraph(p)))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', 'paragraph-last'],
            html: '<strong>Once</strong> upon <em>a time</em>'
          }]
        }])

        expect(View.paragraphs.length).to.equal(1)

        teardown(editor)
        done()
      }, 0)
    })

    it('can be used to change a paragraph’s type.', function (done) {
      var editor = init('<section><hr><p>Stuff</p></section>'),
          h2

      h2 = View.paragraphs[0].substr(0)
      h2.type = 'h2'

      View.render(new Delta(operation, 0, h2))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'h2',
            classes: ['paragraph-first', 'paragraph-last'],
            html: 'Stuff'
          }]
        }])

        expect(View.paragraphs.length).to.equal(1)
        expect(View.paragraphs[0].type).to.equal('h2')

        teardown(editor)
        done()
      }, 0)
    })

    it('should not interfere with adjacent paragraphs.', function (done) {
      var editor,
          p

      editor = init(
        '<section><hr>' +
          '<p>Stuff</p>' +
          '<h2>Things</h2>' +
          '<h2>More things</h2>' +
        '</section>'
      )
      p = View.paragraphs[1].substr(0)
      p.type = 'p'

      View.render(new Delta(operation, 1, p))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', '!paragraph-last'],
            html: 'Stuff'
          }, {
            name: 'p',
            classes: ['!paragraph-first', '!paragraph-last'],
            html: 'Things'
          }, {
            name: 'h2',
            classes: ['!paragraph-first', 'paragraph-last'],
            html: 'More things'
          }]
        }])

        expect(View.paragraphs.length).to.equal(3)
        expect(View.paragraphs[1].type).to.equal('p')

        teardown(editor)
        done()
      }, 0)
    })

    it('can convert a paragraph to a list item.', function (done) {
      var editor,
          li

      editor = init(
        '<section><hr>' +
          '<p>Ave Cesaria</p>' +
          '<p>Merci</p>' +
          '<p>Formidable</p>' +
        '</section>'
      )

      li = View.paragraphs[1].substr(0)
      li.type = 'ol'

      View.render(new Delta(operation, 1, li))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', '!paragraph-last'],
            html: 'Ave Cesaria'
          }, {
            name: 'ol',
            classes: ['!paragraph-first', '!paragraph-last'],
            children: [{
              name: 'li',
              classes: ['!paragraph-first', '!paragraph-last'],
              html: 'Merci'
            }]
          }, {
            name: 'p',
            classes: ['!paragraph-first', 'paragraph-last'],
            html: 'Formidable'
          }]
        }])

        teardown(editor)
        done()
      }, 0)
    })

    it('should merge a list before when converting a paragraph to a list.',
      function (done) {
        var editor,
            li

        editor = init(
          '<section><hr>' +
            '<ol><li>One</li><li>Two</li></ol>' +
            '<p>Three</p>' +
            '<p>Four</p>' +
          '</section>'
        )

        li = View.paragraphs[2].substr(0)
        li.type = 'ol'

        View.render(new Delta(operation, 2, li))

        setTimeout(function () {
          expect(editor.elem).to.have.children([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'ol',
              classes: ['!paragraph-first', '!paragraph-last'],
              children: [{
                name: 'li',
                classes: ['paragraph-first', '!paragraph-last'],
                html: 'One'
              }, {
                name: 'li',
                classes: ['!paragraph-first', '!paragraph-last'],
                html: 'Two'
              }, {
                name: 'li',
                classes: ['!paragraph-first', '!paragraph-last'],
                html: 'Three'
              }]
            }, {
              name: 'p',
              classes: ['!paragraph-first', 'paragraph-last'],
              html: 'Four'
            }]
          }])

          expect(View.paragraphs.length).to.equal(4)
          expect(View.paragraphs[2].type).to.equal('ol')

          teardown(editor)
          done()
        }, 0)
      })

    it('should merge a list after when converting a paragraph to a list.',
      function (done) {
        var editor,
            li

        editor = init(
          '<section><hr>' +
            '<p>One</p>' +
            '<p>Two</p>' +
            '<ol><li>Three</li><li>Four</li></ol>' +
          '</section>'
        )

        li = View.paragraphs[1].substr(0)
        li.type = 'ol'

        View.render(new Delta(operation, 1, li))

        setTimeout(function () {
          expect(editor.elem).to.have.children([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              classes: ['paragraph-first', '!paragraph-last'],
              html: 'One'
            }, {
              name: 'ol',
              classes: ['!paragraph-first', '!paragraph-last'],
              children: [{
                name: 'li',
                classes: ['!paragraph-first', '!paragraph-last'],
                html: 'Two'
              }, {
                name: 'li',
                classes: ['!paragraph-first', '!paragraph-last'],
                html: 'Three'
              }, {
                name: 'li',
                classes: ['!paragraph-first', 'paragraph-last'],
                html: 'Four'
              }]
            }]
          }])

          expect(View.paragraphs.length).to.equal(4)
          expect(View.paragraphs[1].type).to.equal('ol')

          teardown(editor)
          done()
        }, 0)
      })

    it('should merge a list before & after when converting to a list.',
      function (done) {
        var editor,
            li

        editor = init(
          '<section><hr>' +
            '<ol><li>One</li><li>Two</li></ol>' +
            '<p>Three</p>' +
            '<ol><li>Four</li><li>Five</li></ol>' +
          '</section>'
        )

        li = View.paragraphs[2].substr(0)
        li.type = 'ol'

        View.render(new Delta(operation, 2, li))

        setTimeout(function () {
          expect(editor.elem).to.have.children([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'ol',
              classes: ['!paragraph-first', '!paragraph-last'],
              children: [{
                name: 'li',
                classes: ['paragraph-first', '!paragraph-last'],
                html: 'One'
              }, {
                name: 'li',
                classes: ['!paragraph-first', '!paragraph-last'],
                html: 'Two'
              }, {
                name: 'li',
                classes: ['!paragraph-first', '!paragraph-last'],
                html: 'Three'
              }, {
                name: 'li',
                classes: ['!paragraph-first', '!paragraph-last'],
                html: 'Four'
              }, {
                name: 'li',
                classes: ['!paragraph-first', 'paragraph-last'],
                html: 'Five'
              }]
            }]
          }])

          expect(View.paragraphs.length).to.equal(5)
          expect(View.paragraphs[2].type).to.equal('ol')

          teardown(editor)
          done()
        }, 0)
      })

    it('can convert lists to paragraphs.', function (done) {
      var editor,
          p

      editor = init('<section><hr><ol><li>Stuff</li></ol></section>')
      p = View.paragraphs[0].substr(0)
      p.type = 'p'

      View.render(new Delta(operation, 0, p))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', 'paragraph-last'],
            html: 'Stuff'
          }]
        }])

        expect(View.paragraphs.length).to.equal(1)
        expect(View.paragraphs[0].type).to.equal('p')

        teardown(editor)
        done()
      }, 0)
    })

    it('should split lists when converting to paragraphs (1).',
      function (done) {
        var editor,
            p

        editor = init(
          '<section><hr><ol>' +
            '<li>Stuff</li>' +
            '<li>Claudio</li>' +
          '</ol></section>')
        p = View.paragraphs[0].substr(0)
        p.type = 'p'

        View.render(new Delta(operation, 0, p))

        setTimeout(function () {
          expect(editor.elem).to.have.children([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'p',
              classes: ['paragraph-first', '!paragraph-last'],
              html: 'Stuff'
            }, {
              name: 'ol',
              classes: ['!paragraph-first', '!paragraph-last'],
              children: [{
                name: 'li',
                classes: ['!paragraph-first', 'paragraph-last'],
                html: 'Claudio'
              }]
            }]
          }])

          expect(View.paragraphs.length).to.equal(2)
          expect(View.paragraphs[0].type).to.equal('p')

          teardown(editor)
          done()
        }, 0)
      })

    it('should split lists when converting to paragraphs (2).',
      function (done) {
        var editor,
            p

        editor = init(
          '<section><hr><ol>' +
            '<li>Stuff</li>' +
            '<li>Claudio</li>' +
          '</ol></section>')
        p = View.paragraphs[1].substr(0)
        p.type = 'p'

        View.render(new Delta(operation, 1, p))

        setTimeout(function () {
          expect(editor.elem).to.have.children([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'ol',
              classes: ['!paragraph-first', '!paragraph-last'],
              children: [{
                name: 'li',
                classes: ['paragraph-first', '!paragraph-last'],
                html: 'Stuff'
              }]
            }, {
              name: 'p',
              classes: ['!paragraph-first', 'paragraph-last'],
              html: 'Claudio'
            }]
          }])

          expect(View.paragraphs.length).to.equal(2)
          expect(View.paragraphs[1].type).to.equal('p')

          teardown(editor)
          done()
        }, 0)
      })

    it('should split lists when converting to paragraphs (3).',
      function (done) {
        var editor,
            p

        editor = init(
          '<section><hr><ol>' +
            '<li>Stuff</li>' +
            '<li>Claudio</li>' +
            '<li>Bravo</li>' +
          '</ol></section>')
        p = View.paragraphs[1].substr(0)
        p.type = 'p'

        View.render(new Delta(operation, 1, p))

        setTimeout(function () {
          expect(editor.elem).to.have.children([{
            name: 'section',
            children: [{
              name: 'hr'
            }, {
              name: 'ol',
              classes: ['!paragraph-first', '!paragraph-last'],
              children: [{
                name: 'li',
                classes: ['paragraph-first', '!paragraph-last'],
                html: 'Stuff'
              }]
            }, {
              name: 'p',
              classes: ['!paragraph-first', '!paragraph-last'],
              html: 'Claudio'
            }, {
              name: 'ol',
              classes: ['!paragraph-first', '!paragraph-last'],
              children: [{
                name: 'li',
                classes: ['!paragraph-first', 'paragraph-last'],
                html: 'Bravo'
              }]
            }]
          }])

          expect(View.paragraphs.length).to.equal(3)
          expect(View.paragraphs[1].type).to.equal('p')

          teardown(editor)
          done()
        }, 0)
      })
  })

  describe('“remove”', function () {
    var operation = 'paragraphDelete'

    it('can remove the first paragraph in a section.', function (done) {
      var editor

      editor = init('<section><hr><p>Things</p><h2>Words</h2></section>')

      View.render(new Delta(operation, 0))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'h2',
            classes: ['paragraph-first', 'paragraph-last'],
            html: 'Words'
          }]
        }])

        expect(View.paragraphs.length).to.equal(1)
        expect(View.paragraphs[0].type).to.equal('h2')

        teardown(editor)
        done()
      }, 0)
    })

    it('should change classes correctly.', function (done) {
      var editor = init(
        '<section>' +
          '<ol><li>One</li>' +
          '<li>Two</li></ol>' +
          '<p>Three</p>' +
        '</section>'
      )

      View.render(new Delta(operation, 2))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            classes: ['!paragraph-first', '!paragraph-last'],
            children: [{
              name: 'li',
              classes: ['paragraph-first', '!paragraph-last'],
              html: 'One'
            }, {
              name: 'li',
              classes: ['!paragraph-first', 'paragraph-last'],
              html: 'Two'
            }]
          }]
        }])

        expect(View.paragraphs.length).to.equal(2)

        teardown(editor)
        done()
      }, 0)
    })

    it('can remove the last paragraph in a section.', function (done) {
      var editor

      editor = init('<section><hr><p>Things</p><h2>Words</h2></section>')

      View.render(new Delta(operation, 1))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', 'paragraph-last'],
            html: 'Things'
          }]
        }])

        expect(View.paragraphs.length).to.equal(1)
        expect(View.paragraphs[0].type).to.equal('p')

        teardown(editor)
        done()
      }, 0)
    })

    it('can remove paragraphs in the middle of a section.', function (done) {
      var editor

      editor = init(
        '<section><hr>' +
          '<p>One</p>' +
          '<p>Two</p>' +
          '<p>Three</p>' +
        '</section>'
      )

      View.render(new Delta(operation, 1))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', '!paragraph-last'],
            html: 'One'
          }, {
            name: 'p',
            classes: ['!paragraph-first', 'paragraph-last'],
            html: 'Three'
          }]
        }])

        expect(View.paragraphs.length).to.equal(2)

        teardown(editor)
        done()
      }, 0)
    })

    it.skip('should not be able to remove a section’s only paragraph.',
      function (done) {
        var editor

        editor = init('<section><hr><p>One</p></section>')

        expect(function () {
          View.render(new Delta(operation, 0))
        }).to.throw(Error, /only paragraph/)

        teardown(editor)
        done()
      })

    it('merges elements the removal brought together (1).', function (done) {
      var editor

      editor = init(
        '<section><hr>' +
          '<ol><li>One</li><li>Two</li></ol>' +
          '<p>Three</p>' +
          '<ol><li>Four</li><li>Five</li></ol>' +
        '</section>'
      )

      View.render(new Delta(operation, 2))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            classes: ['!paragraph-first', '!paragraph-last'],
            children: [{
              name: 'li',
              classes: ['paragraph-first', '!paragraph-last'],
              html: 'One'
            }, {
              name: 'li',
              classes: ['!paragraph-first', '!paragraph-last'],
              html: 'Two'
            }, {
              name: 'li',
              classes: ['!paragraph-first', '!paragraph-last'],
              html: 'Four'
            }, {
              name: 'li',
              classes: ['!paragraph-first', 'paragraph-last'],
              html: 'Five'
            }]
          }]
        }])

        expect(View.paragraphs.length).to.equal(4)

        teardown(editor)
        done()
      }, 0)
    })

    it('merges elements the removal brought together (2).', function (done) {
      var editor

      editor = init(
        '<section><hr>' +
          '<ol><li>One</li><li>Two</li></ol>' +
          '<ul><li>Three</li></ul>' +
          '<ol><li>Four</li><li>Five</li></ol>' +
        '</section>'
      )

      View.render(new Delta(operation, 2))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            classes: ['!paragraph-first', '!paragraph-last'],
            children: [{
              name: 'li',
              classes: ['paragraph-first', '!paragraph-last'],
              html: 'One'
            }, {
              name: 'li',
              classes: ['!paragraph-first', '!paragraph-last'],
              html: 'Two'
            }, {
              name: 'li',
              classes: ['!paragraph-first', '!paragraph-last'],
              html: 'Four'
            }, {
              name: 'li',
              classes: ['!paragraph-first', 'paragraph-last'],
              html: 'Five'
            }]
          }]
        }])

        expect(View.paragraphs.length).to.equal(4)

        teardown(editor)
        done()
      }, 0)
    })

    it('can remove list items.', function (done) {
      var editor

      editor = init(
        '<section><hr><ol>' +
          '<li>One</li>' +
          '<li>Two</li>' +
          '<li>Three</li>' +
        '</ol></section>'
      )

      View.render(new Delta(operation, 1))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            classes: ['!paragraph-first', '!paragraph-last'],
            children: [{
              name: 'li',
              classes: ['paragraph-first', '!paragraph-last'],
              html: 'One'
            }, {
              name: 'li',
              classes: ['!paragraph-first', 'paragraph-last'],
              html: 'Three'
            }]
          }]
        }])

        teardown(editor)
        done()
      }, 0)
    })
  })
})
