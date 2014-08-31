/* global describe, it, Compose, expect, chai, TreeMatcher, ChildMatcher */
'use strict';

chai.use(TreeMatcher)
chai.use(ChildMatcher)

describe('Section operation', function () {
  var clearImmediate,
      View,
      Converter,
      Delta

  function init (html) {
    var elem = document.createElement('div'),
        editor

    elem.innerHTML = html
    document.body.appendChild(elem)
    editor = new Compose(elem)
    editor.use(function (Compose) {
      View = Compose.require('view')
      Converter = Compose.require('converter')
      Delta = Compose.require('delta')
      clearImmediate = Compose.require('clearImmediate')
    })

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
    var operation = 'sectionInsert'

    it('can create new sections.', function (done) {
      var editor = init(
        '<section><hr>' +
          '<p>One</p>' +
          '<p>Two</p>' +
        '</section>'
      )

      View.render(new Delta(operation, 1, { start: 1 }))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          classes: ['section-first', '!section-last'],
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }]
        }, {
          name: 'section',
          classes: ['!section-first', 'section-last'],
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'Two'
          }]
        }])

        expect(View.sections.length).to.equal(2)
        expect(View.sections[0].start).to.equal(0)
        expect(View.sections[1].start).to.equal(1)

        teardown(editor)
        done()
      }, 0)
    })

    it.skip('should throw when creating sections at an invalid index (1).',
      function (done) {
        var editor = init(
          '<section><hr>' +
            '<h2>One</h2>' +
            '<p>Two</p>' +
          '</section>'
        )

        expect(function () {
          View.render(new Delta(operation, -1, { start: -1 }))
        }).to.throw(RangeError)

        teardown(editor)
        done()
      })

    it.skip('should throw when creating sections at an invalid index (2).',
      function (done) {
        var editor = init(
          '<section><hr>' +
            '<h2>One</h2>' +
            '<p>Two</p>' +
          '</section>'
        )


        expect(function () {
          View.render(new Delta(operation, 2, { start: 2 }))
        }).to.throw(RangeError)

        teardown(editor)
        done()
      })

    it('can insert a section between others.', function (done) {
      var editor = init(
        '<section><hr>' +
          '<p>One</p>' +
          '<pre>Two</pre>' +
          '<blockquote>Three</blockquote>' +
        '</section>' +
        '<section><hr>' +
          '<p>Four</p>' +
        '</section>'
      )

      View.render(new Delta(operation, 2, { start: 2 }))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          classes: ['section-first', '!section-last'],
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', '!paragraph-last'],
            html: 'One'
          }, {
            name: 'pre',
            classes: ['!paragraph-first', 'paragraph-last'],
            html: 'Two'
          }]
        }, {
          name: 'section',
          classes: ['!section-first', '!section-last'],
          children: [{
            name: 'hr'
          }, {
            name: 'blockquote',
            classes: ['paragraph-first', 'paragraph-last'],
            html: 'Three'
          }]
        }, {
          name: 'section',
          classes: ['!section-first', 'section-last'],
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', 'paragraph-last'],
            html: 'Four'
          }]
        }])

        expect(View.sections.length).to.equal(3)
        expect(View.sections[0].start).to.equal(0)
        expect(View.sections[1].start).to.equal(2)
        expect(View.sections[2].start).to.equal(3)

        teardown(editor)
        done()
      }, 0)
    })

    it('should update paragraph classes.', function (done) {
      var editor = init(
        '<section><hr>' +
          '<p>One</p>' +
          '<h2>Two</h2>' +
          '<p>Three</p>' +
          '<pre>Four</pre>' +
        '</section>'
      )

      View.render(new Delta(operation, 2, { start: 2 }))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          classes: ['section-first', '!section-last'],
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', '!paragraph-last'],
            html: 'One'
          }, {
            name: 'h2',
            classes: ['!paragraph-first', 'paragraph-last'],
            html: 'Two'
          }]
        }, {
          name: 'section',
          classes: ['!section-first', 'section-last'],
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', '!paragraph-last'],
            html: 'Three'
          }, {
            name: 'pre',
            classes: ['!paragraph-first', 'paragraph-last'],
            html: 'Four'
          }]
        }])

        expect(View.sections.length).to.equal(2)
        expect(View.sections[0].start).to.equal(0)
        expect(View.sections[1].start).to.equal(2)

        teardown(editor)
        done()
      }, 0)
    })

    it('can insert section breaks before lists.', function (done) {
      var editor = init(
        '<section><hr>' +
          '<p>One</p>' +
          '<ol>' +
            '<li>Two</li>' +
            '<li>Three</li>' +
          '</ol>' +
          '<h2>Four</h2>' +
        '</section>'
      )

      View.render(new Delta(operation, 1, { start: 1 }))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          classes: ['section-first', '!section-last'],
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', 'paragraph-last'],
            html: 'One'
          }]
        }, {
          name: 'section',
          classes: ['!section-first', 'section-last'],
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            classes: ['!paragraph-first', '!paragraph-last'],
            children: [{
              name: 'li',
              classes: ['paragraph-first', '!paragraph-last'],
              html: 'Two'
            }, {
              name: 'li',
              classes: ['!paragraph-first', '!paragraph-last'],
              html: 'Three'
            }]
          }, {
            name: 'h2',
            classes: ['!paragraph-first', 'paragraph-last'],
            html: 'Four'
          }]
        }])

        expect(View.sections.length).to.equal(2)
        expect(View.sections[0].start).to.equal(0)
        expect(View.sections[1].start).to.equal(1)

        teardown(editor)
        done()
      }, 0)
    })

    it('can insert section breaks within lists.', function (done) {
      var editor = init(
        '<section><hr>' +
          '<p>One</p>' +
          '<ol>' +
            '<li>Two</li>' +
            '<li>Three</li>' +
          '</ol>' +
          '<h2>Four</h2>' +
        '</section>'
      )

      View.render(new Delta(operation, 2, { start: 2 }))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          classes: ['section-first', '!section-last'],
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
              classes: ['!paragraph-first', 'paragraph-last'],
              html: 'Two'
            }]
          }]
        }, {
          name: 'section',
          classes: ['!section-first', 'section-last'],
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            classes: ['!paragraph-first', '!paragraph-last'],
            children: [{
              name: 'li',
              classes: ['paragraph-first', '!paragraph-last'],
              html: 'Three'
            }]
          }, {
            name: 'h2',
            classes: ['!paragraph-first', 'paragraph-last'],
            html: 'Four'
          }]
        }])

        expect(View.sections.length).to.equal(2)
        expect(View.sections[0].start).to.equal(0)
        expect(View.sections[1].start).to.equal(2)

        teardown(editor)
        done()
      }, 0)
    })

    it('can insert section breaks after lists.', function (done) {
      var editor = init(
        '<section><hr>' +
          '<p>One</p>' +
          '<ol>' +
            '<li>Two</li>' +
            '<li>Three</li>' +
          '</ol>' +
          '<h2>Four</h2>' +
        '</section>'
      )

      View.render(new Delta(operation, 3, { start: 3 }))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          classes: ['section-first', '!section-last'],
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
              classes: ['!paragraph-first', 'paragraph-last'],
              html: 'Three'
            }]
          }]
        }, {
          name: 'section',
          classes: ['!section-first', 'section-last'],
          children: [{
            name: 'hr'
          }, {
            name: 'h2',
            classes: ['paragraph-first', 'paragraph-last'],
            html: 'Four'
          }]
        }])

        expect(View.sections.length).to.equal(2)
        expect(View.sections[0].start).to.equal(0)
        expect(View.sections[1].start).to.equal(3)

        teardown(editor)
        done()
      }, 0)
    })

    it('can insert section breaks after lists.', function (done) {
      var editor = init(
        '<section><hr>' +
          '<p>One</p>' +
          '<ol>' +
            '<li>Two</li>' +
            '<li>Three</li>' +
          '</ol>' +
          '<h2>Four</h2>' +
        '</section>'
      )

      View.render(new Delta(operation, 3, { start: 3 }))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          classes: ['section-first', '!section-last'],
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
              classes: ['!paragraph-first', 'paragraph-last'],
              html: 'Three'
            }]
          }]
        }, {
          name: 'section',
          classes: ['!section-first', 'section-last'],
          children: [{
            name: 'hr'
          }, {
            name: 'h2',
            classes: ['paragraph-first', 'paragraph-last'],
            html: 'Four'
          }]
        }])

        expect(View.sections.length).to.equal(2)
        expect(View.sections[0].start).to.equal(0)
        expect(View.sections[1].start).to.equal(3)

        teardown(editor)
        done()
      }, 0)
    })
  })

  describe('“remove”', function () {
    var operation = 'sectionDelete'

    it('removes sections.', function (done) {
      var editor = init(
        '<section><hr>' +
          '<p>One</p>' +
          '<p>Two</p>' +
        '</section>' +
        '<section><hr>' +
          '<p>Three</p>' +
        '</section>'
      )

      View.render(new Delta(operation, 2))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          classes: ['section-first', 'section-last'],
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

        expect(View.sections.length).to.equal(1)
        expect(View.sections[0].start).to.equal(0)

        teardown(editor)
        done()
      }, 0)
    })

    it.skip('should throw when removing a non-existant section.', function (done) {
      var editor = init(
        '<section><hr>' +
          '<p>One</p>' +
          '<p>Two</p>' +
        '</section>' +
        '<section><hr>' +
          '<p>Three</p>' +
        '</section>'
      )

      expect(function () {
        View.render(new Delta(operation, 1))
      }).to.throw(/exist/)

      teardown(editor)
      done()
    })

    it.skip('should throw when removing the first section.', function (done) {
      var editor = init(
        '<section><hr>' +
          '<p>One</p>' +
          '<p>Two</p>' +
        '</section>' +
        '<section><hr>' +
          '<p>Three</p>' +
        '</section>'
      )

      expect(function () {
        View.render(new Delta(operation, 0))
      }).to.throw(/first/)

      teardown(editor)
      done()
    })

    it('should merge elements the removal brought together.', function (done) {
      var editor = init(
        '<section><hr>' +
          '<p>One</p>' +
          '<ol><li>Two</li></ol>' +
        '</section>' +
        '<section><hr>' +
          '<ol><li>Three</li></ol>' +
          '<p>Four</p>' +
        '</section>'
      )

      View.render(new Delta(operation, 2))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          classes: ['section-first', 'section-last'],
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', '!paragraph-last'],
            html: 'One'
          }, {
            name: 'ol',
            classes: ['!section-first', '!section-last'],
            children: [{
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

        expect(View.sections.length).to.equal(1)
        expect(View.sections[0].start).to.equal(0)

        teardown(editor)
        done()
      }, 0)
    })

    it('can remove a section from between others.', function (done) {
      var editor = init(
        '<section><hr>' +
          '<p>One</p>' +
          '<pre>Two</pre>' +
        '</section>' +
        '<section><hr>' +
          '<p>Three</p>' +
        '</section>' +
        '<section><hr>' +
          '<h2>Four</h2>' +
          '<p>Five</p>' +
        '</section>'
      )

      View.render(new Delta(operation, 2))

      setTimeout(function () {
        expect(editor.elem).to.have.children([{
          name: 'section',
          classes: ['section-first', '!section-last'],
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            classes: ['paragraph-first', '!paragraph-last'],
            html: 'One'
          }, {
            name: 'pre',
            classes: ['!paragraph-first', '!paragraph-last'],
            html: 'Two'
          }, {
            name: 'p',
            classes: ['!paragraph-first', 'paragraph-last'],
            html: 'Three'
          }]
        }, {
          name: 'section',
          classes: ['!section-first', 'section-last'],
          children: [{
            name: 'hr'
          }, {
            name: 'h2',
            classes: ['paragraph-first', '!paragraph-last'],
            html: 'Four'
          }, {
            name: 'p',
            classes: ['!paragraph-first', 'paragraph-last'],
            html: 'Five'
          }]
        }])

        expect(View.sections.length).to.equal(2)
        expect(View.sections[0].start).to.equal(0)
        expect(View.sections[1].start).to.equal(3)

        teardown(editor)
        done()
      }, 0)
    })
  })
})
