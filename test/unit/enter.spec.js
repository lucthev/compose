/*eslint-env mocha */
'use strict'

var expect = window.expect

describe('Enter', function () {
  var editor
  var Selection
  var View
  var enter

  afterEach(teardown)

  describe('newline', function () {
    it('in an empty paragraph', function (done) {
      setup('<section><hr><p><br></p></section>')
      View.selection = new Selection([0, 0])

      enter.newline()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br><br>'
          }]
        }])

        expect(View.selection).to.eql(new Selection([0, 1]))
        done()
      }, 0)
    })

    it('at the end of a paragraph', function (done) {
      setup('<section><hr><p>1</p></section>')
      View.selection = new Selection([0, 1])

      enter.newline()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1<br><br>'
          }]
        }])

        expect(View.selection).to.eql(new Selection([0, 2]))
        done()
      }, 0)
    })

    it('at the start of a paragraph', function (done) {
      setup('<section><hr><p>1</p></section>')
      View.selection = new Selection([0, 0])

      enter.newline()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>1'
          }]
        }])

        expect(View.selection).to.eql(new Selection([0, 1]))
        done()
      }, 0)
    })

    it('ignoring trailing BRs', function (done) {
      setup('<section><hr><p>1<br></p></section>')
      View.selection = new Selection([0, 1])

      enter.newline()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1<br><br>'
          }]
        }])

        expect(View.selection).to.eql(new Selection([0, 2]))
        done()
      }, 0)
    })

    it('ignoring trailing BRs, with text selected', function (done) {
      setup('<section><hr><p>123<br></p></section>')
      View.selection = new Selection([0, 1], [0, 3])

      enter.newline()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1<br><br>'
          }]
        }])

        expect(View.selection).to.eql(new Selection([0, 2]))
        done()
      }, 0)
    })

    it('in the middle of a paragraph', function (done) {
      setup('<section><hr><p>12</p></section>')
      View.selection = new Selection([0, 1])

      enter.newline()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1<br>2'
          }]
        }])

        expect(View.selection).to.eql(new Selection([0, 2]))
        done()
      }, 0)
    })

    it('in the middle, with text selected', function (done) {
      setup('<section><hr><p>123</p></section>')
      View.selection = new Selection([0, 2], [0, 1])

      enter.newline()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1<br>3'
          }]
        }])

        expect(View.selection).to.eql(new Selection([0, 2]))
        done()
      }, 0)
    })

    it('before a BR', function (done) {
      setup('<section><hr><p>1<br>2</p></section>')
      View.selection = new Selection([0, 2])

      enter.newline()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }, {
            name: 'p',
            html: '2'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('before a BR, with text selected', function (done) {
      setup('<section><hr><p>123<br>4</p></section>')
      View.selection = new Selection([0, 3], [0, 1])

      enter.newline()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }, {
            name: 'p',
            html: '4'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('after a BR', function (done) {
      setup('<section><hr><p>1<br>2</p></section>')
      View.selection = new Selection([0, 2])

      enter.newline()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }, {
            name: 'p',
            html: '2'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('after a BR, with text selected', function (done) {
      setup('<section><hr><p>1<br>234</p></section>')
      View.selection = new Selection([0, 2], [0, 4])

      enter.newline()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }, {
            name: 'p',
            html: '4'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('on a blank line', function (done) {
      setup('<section><hr><p>1<br><br></p></section>')
      View.selection = new Selection([0, 2])

      enter.newline()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('over multiple paragraphs', function (done) {
      setup('<section><hr><h2>1</h2><p>2</p><p>3</p></section>')
      View.selection = new Selection([0, 1], [2, 0])

      enter.newline()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'h2',
            html: '1<br>3'
          }]
        }])

        expect(View.selection).to.eql(new Selection([0, 2]))
        done()
      }, 0)
    })

    it('over multiple sections', function (done) {
      setup(
        '<section><hr><p>12</p></section>' +
        '<section><hr><p>34</p></section>' +
        '<section><hr><p>56</p></section>'
      )
      View.selection = new Selection([2, 1], [0, 1])

      enter.newline()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1<br>6'
          }]
        }])

        expect(View.selection).to.eql(new Selection([0, 2]))
        done()
      }, 0)
    })

    it('in the non-first paragraph', function (done) {
      setup('<section><hr><p>12</p><p>34</p><p>5678</p></section>')
      View.selection = new Selection([2, 3])

      enter.newline()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '12'
          }, {
            name: 'p',
            html: '34'
          }, {
            name: 'p',
            html: '567<br>8'
          }]
        }])

        expect(View.selection).to.eql(new Selection([2, 4]))
        done()
      }, 0)
    })
  })

  describe('newParagraph', function () {
    it('in an empty paragraph', function (done) {
      setup('<section><hr><p><br></p></section>')
      View.selection = new Selection([0, 0])

      enter.newParagraph()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('in the middle of a paragraph', function (done) {
      setup('<section><hr><p>12</p></section>')
      View.selection = new Selection([0, 1])

      enter.newParagraph()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }, {
            name: 'p',
            html: '2'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('at the end of a paragraph', function (done) {
      setup('<section><hr><p>1</p></section>')
      View.selection = new Selection([0, 1])

      enter.newParagraph()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('at the end of a paragraph, trailing BR', function (done) {
      setup('<section><hr><p>1<br></p></section>')
      View.selection = new Selection([0, 1])

      enter.newParagraph()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('in the middle of a paragraph, text selected', function (done) {
      setup('<section><hr><p>123</p></section>')
      View.selection = new Selection([0, 1], [0, 2])

      enter.newParagraph()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }, {
            name: 'p',
            html: '3'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('in the middle of an LI', function (done) {
      setup('<section><hr><ol><li>12</li></ol></section>')
      View.selection = new Selection([0, 1])

      enter.newParagraph()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: '1'
            }, {
              name: 'li',
              html: '2'
            }]
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('at the start of a paragraph', function (done) {
      setup('<section><hr><p>1</p></section>')
      View.selection = new Selection([0, 0])

      enter.newParagraph()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>'
          }, {
            name: 'p',
            html: '1'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('at the start of a paragraph, text selected', function (done) {
      setup('<section><hr><p>12</p></section>')
      View.selection = new Selection([0, 0], [0, 1])

      enter.newParagraph()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>'
          }, {
            name: 'p',
            html: '2'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('before a section', function (done) {
      setup(
        '<section><hr><p>1</p></section>' +
        '<section><hr><p>2</p></section>'
      )
      View.selection = new Selection([0, 1])

      enter.newParagraph()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '2'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('on a blank line', function (done) {
      setup('<section><hr><p>1<br><br></p></section>')
      View.selection = new Selection([0, 2])

      enter.newParagraph()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1<br><br>'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('selecting a whole line', function (done) {
      setup('<section><hr><p>1<br>2</p></section>')
      View.selection = new Selection([0, 2], [0, 3])

      enter.newParagraph()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1<br><br>'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('over multiple paragraphs', function (done) {
      setup('<section><hr><h2>12</h2><p>34</p><p>56</p></section>')
      View.selection = new Selection([0, 1], [2, 1])

      enter.newParagraph()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'h2',
            html: '1'
          }, {
            name: 'p',
            html: '6'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('over multiple sections', function (done) {
      setup(
        '<section><hr><p>12</p></section>' +
        '<section><hr><p>34</p></section>' +
        '<section><hr><p>56</p></section>'
      )
      View.selection = new Selection([2, 1], [0, 1])

      enter.newParagraph()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }, {
            name: 'p',
            html: '6'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('in the middle of a paragraph', function (done) {
      setup('<section><hr><p>12</p><p>34</p><p>5678</p></section>')
      View.selection = new Selection([2, 3])

      enter.newParagraph()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '12'
          }, {
            name: 'p',
            html: '34'
          }, {
            name: 'p',
            html: '567'
          }, {
            name: 'p',
            html: '8'
          }]
        }])

        expect(View.selection).to.eql(new Selection([3, 0]))
        done()
      }, 0)
    })
  })

  describe('newSection', function () {
    it('in an empty paragraph', function (done) {
      setup('<section><hr><p><br></p></section>')
      View.selection = new Selection([0, 0])

      enter.newSection()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('in the middle of a paragraph', function (done) {
      setup('<section><hr><p>12</p></section>')
      View.selection = new Selection([0, 1])

      enter.newSection()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '2'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('at the end of a paragraph', function (done) {
      setup('<section><hr><p>1</p></section>')
      View.selection = new Selection([0, 1])

      enter.newSection()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('at the end of a paragraph, trailing BR', function (done) {
      setup('<section><hr><p>1<br></p></section>')
      View.selection = new Selection([0, 1])

      enter.newSection()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('in the middle of an LI', function (done) {
      setup('<section><hr><ol><li>12</li></ol></section>')
      View.selection = new Selection([0, 1])

      enter.newSection()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: '1'
            }]
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: '2'
            }]
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('at the start of a paragraph', function (done) {
      setup('<section><hr><p>1</p></section>')
      View.selection = new Selection([0, 0])

      enter.newSection()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('before a section', function (done) {
      setup(
        '<section><hr><p>12</p></section>' +
        '<section><hr><p>34</p></section>'
      )
      View.selection = new Selection([0, 1])

      enter.newSection()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '2'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '34'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('after a section', function (done) {
      setup(
        '<section><hr><p>12</p></section>' +
        '<section><hr><p>34</p></section>'
      )
      View.selection = new Selection([1, 1])

      enter.newSection()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '12'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '3'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '4'
          }]
        }])

        expect(View.selection).to.eql(new Selection([2, 0]))
        done()
      }, 0)
    })

    it('on a blank line', function (done) {
      setup('<section><hr><p>1<br><br></p></section>')
      View.selection = new Selection([0, 2])

      enter.newSection()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1<br><br>'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('selecting a whole line', function (done) {
      setup('<section><hr><p>1<br>2</p></section>')
      View.selection = new Selection([0, 3], [0, 2])

      enter.newSection()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1<br><br>'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '<br>'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('over multiple paragraphs', function (done) {
      setup('<section><hr><h2>12</h2><p>34</p><p>56</p></section>')
      View.selection = new Selection([0, 1], [2, 1])

      enter.newSection()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'h2',
            html: '1'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '6'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('over multiple sections', function (done) {
      setup(
        '<section><hr><p>12</p></section>' +
        '<section><hr><p>34</p></section>' +
        '<section><hr><p>56</p></section>'
      )
      View.selection = new Selection([2, 1], [0, 1])

      enter.newSection()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '6'
          }]
        }])

        expect(View.selection).to.eql(new Selection([1, 0]))
        done()
      }, 0)
    })

    it('in the non-first paragraph', function (done) {
      setup('<section><hr><p>12</p><p>34</p><p>5678</p></section>')
      View.selection = new Selection([2, 3])

      enter.newSection()

      setTimeout(function () {
        expect(editor.root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '12'
          }, {
            name: 'p',
            html: '34'
          }, {
            name: 'p',
            html: '567'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '8'
          }]
        }])

        expect(View.selection).to.eql(new Selection([3, 0]))
        done()
      }, 0)
    })
  })

  function setup (html) {
    var elem = document.createElement('div')
    elem.innerHTML = html
    document.body.appendChild(elem)

    editor = new window.Compose(elem)
    editor.use(window.listPlugin)
    editor.use(window.formatBlock)
    View = editor.require('view')
    Selection = editor.require('selection')
    enter = editor.require('enter')

    // Perform some setup.
    var all = [].slice.call(elem.querySelectorAll('section,p,h2,li'))

    all.forEach(function (el) {
      var section
      var p

      if (el.nodeName === 'SECTION') {
        section = View.handlerForElement(el).serialize(el)
        section.start = View.elements.length
        View.sections.push(section)
      } else {
        View.elements.push(el)
        p = View.handlerForElement(el).serialize(el)
        View.paragraphs.push(el.nodeName === 'LI' ? p[0] : p)
      }
    })
  }

  function teardown () {
    document.body.removeChild(editor.root)
    editor = Selection = View = enter = null
  }
})
