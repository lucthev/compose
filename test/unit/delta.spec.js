/*global describe, it, Compose, expect, chai, TreeMatcher, ChildMatcher,
  afterEach, listPlugin, formatBlock */
'use strict'

chai.use(TreeMatcher)
chai.use(ChildMatcher)

describe('Delta operation', function () {
  var Serialize,
      editor,
      View,
      root,
      p

  describe('paragraphInsert should', function () {
    var op = makeApplier('paragraphInsert')

    afterEach(teardown)

    it('insert a P at the very end of the editor', function (done) {
      setup('<section><hr><p>One</p></section>')

      p = Serialize.fromText('Two')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: 'Two'
          }]
        }])

        done()
      }, 0)
    })

    it('insert before section breaks', function (done) {
      setup(
        '<section><hr><p>One</p></section>' +
        '<section><hr><p>Three</p></section>'
      )

      p = Serialize.fromText('Two')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: 'Two'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'Three'
          }]
        }])

        done()
      }, 0)
    })

    it('not be able to insert at index 0', function (done) {
      setup('<section><hr><p>One</p></section>')

      p = Serialize.fromText('X')
      expect(function () {
        op(0, p)
      }).to.throw(RangeError)

      done()
    })

    it('not be able to insert beyond the editor', function (done) {
      setup('<section><hr><p>One</p></section>')

      p = Serialize.fromText('X')
      expect(function () {
        op(2, p)
      }).to.throw(RangeError)

      done()
    })

    it('not be able  to insert before the editor', function (done) {
      setup('<section><hr><p>One</p></section>')

      p = Serialize.fromText('X')
      expect(function () {
        op(-1, p)
      }).to.throw(RangeError)

      done()
    })

    it('immediately update the View', function (done) {
      setup('<section><hr><p>One</p></section>')

      var View = editor.plugins.view
      expect(View.paragraphs.length).to.equal(1)

      p = Serialize.fromText('Two')
      op(1, p)

      expect(View.paragraphs.length).to.equal(2)
      expect(View.paragraphs[1].text).to.equal('Two')

      done()
    })

    it('update the DOM on next tick', function (done) {
      setup('<section><hr><p>One</p></section>')

      p = Serialize.fromText('Two')
      op(1, p)

      expect(root).to.have.children([{
        name: 'section',
        children: [{
          name: 'hr'
        }, {
          name: 'p',
          html: 'One'
        }]
      }])

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: 'Two'
          }]
        }])

        done()
      }, 0)
    })

    it('insert paragraphs between others', function (done) {
      setup('<section><hr><p>One</p><p>Three</p></section>')

      p = Serialize.fromText('Two')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: 'Two'
          }, {
            name: 'p',
            html: 'Three'
          }]
        }])

        done()
      }, 0)
    })

    it('insert an H2 after a P', function (done) {
      setup('<section><hr><p>One</p></section>')

      p = Serialize.fromText('Two', 'h2')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'h2',
            html: 'Two'
          }]
        }])

        done()
      }, 0)
    })

    it('insert an H2 between two Ps', function (done) {
      setup('<section><hr><p>One</p><p>Three</p></section>')

      p = Serialize.fromText('Two', 'h2')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'h2',
            html: 'Two'
          }, {
            name: 'p',
            html: 'Three'
          }]
        }])

        done()
      }, 0)
    })

    it('insert an OL > LI after a P', function (done) {
      setup('<section><hr><p>One</p></section>')

      p = Serialize.fromText('Two', 'ol')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'Two'
            }]
          }]
        }])

        done()
      }, 0)
    })

    it('insert an OL > LI between two Ps', function (done) {
      setup('<section><hr><p>One</p><p>Three</p></section>')

      p = Serialize.fromText('Two', 'ol')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'Two'
            }]
          }, {
            name: 'p',
            html: 'Three'
          }]
        }])

        done()
      }, 0)
    })

    it('insert a P between two OL > LIs', function (done) {
      setup('<section><hr><ol><li>One</li><li>Three</li></ol></section>')

      p = Serialize.fromText('Two')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'One'
            }]
          }, {
            name: 'p',
            html: 'Two'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'Three'
            }]
          }]
        }])

        done()
      }, 0)
    })

    it('insert a P after an OL > LI', function (done) {
      setup('<section><hr><ol><li>One</li></ol></section>')

      p = Serialize.fromText('Two')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'One'
            }]
          }, {
            name: 'p',
            html: 'Two'
          }]
        }])

        done()
      }, 0)
    })

    it('insert an OL > LI after an OL > LI', function (done) {
      setup('<section><hr><ol><li>One</li></ol></section>')

      p = Serialize.fromText('Two', 'ol')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'One'
            }, {
              name: 'li',
              html: 'Two'
            }]
          }]
        }])

        done()
      }, 0)
    })

    it('insert an OL > LI between two OL > LIs', function (done) {
      setup('<section><hr><ol><li>One</li><li>Three</li></ol></section>')

      p = Serialize.fromText('Two', 'ol')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'One'
            }, {
              name: 'li',
              html: 'Two'
            }, {
              name: 'li',
              html: 'Three'
            }]
          }]
        }])

        done()
      }, 0)
    })

    it('insert an UL > LI after an OL > LI', function (done) {
      setup('<section><hr><ol><li>One</li></ol></section>')

      p = Serialize.fromText('Two', 'ul')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'One'
            }]
          }, {
            name: 'ul',
            children: [{
              name: 'li',
              html: 'Two'
            }]
          }]
        }])

        done()
      }, 0)
    })

    it('insert an UL > LI between two OL > LIs', function (done) {
      setup('<section><hr><ol><li>One</li><li>Three</li></ol></section>')

      p = Serialize.fromText('Two', 'ul')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'One'
            }]
          }, {
            name: 'ul',
            children: [{
              name: 'li',
              html: 'Two'
            }]
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'Three'
            }]
          }]
        }])

        done()
      }, 0)
    })

    it('insert an OL > LI before an OL > LI and a section', function (done) {
      setup(
        '<section><hr><p>One</p></section>' +
        '<section><hr><ol><li>Three</li></ol></section>'
      )

      p = Serialize.fromText('Two', 'ol')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'Two'
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
              html: 'Three'
            }]
          }]
        }])

        done()
      }, 0)
    })
  })

  describe('paragraphUpdate should', function () {
    var op = makeApplier('paragraphUpdate')

    afterEach(teardown)

    it('update a paragraph’s text', function (done) {
      setup('<section><hr><p>One</p><p>Two</p><p>Three</p></section>')

      p = Serialize.fromText('2')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: '2'
          }, {
            name: 'p',
            html: 'Three'
          }]
        }])

        done()
      }, 0)
    })

    it('be able to update the first paragraph', function (done) {
      setup('<section><hr><p>One</p><p>Two</p></section>')

      p = Serialize.fromText('1')
      op(0, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }, {
            name: 'p',
            html: 'Two'
          }]
        }])

        done()
      }, 0)
    })

    it('be able to update the last paragraph', function (done) {
      setup('<section><hr><p>One</p><p>Two</p></section>')

      p = Serialize.fromText('2')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: '2'
          }]
        }])

        done()
      }, 0)
    })

    it('be able to update the only paragraph', function (done) {
      setup('<section><hr><p>One</p></section>')

      p = Serialize.fromText('1')
      op(0, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: '1'
          }]
        }])

        done()
      }, 0)
    })

    it('update a paragraph’s markups', function (done) {
      setup('<section><hr><p>One</p></section>')

      p = Serialize.fromText('One')
      p.addMarkups({
        type: Serialize.types.bold,
        start: 1,
        end: 2
      })
      op(0, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'O<strong>n</strong>e'
          }]
        }])

        done()
      }, 0)
    })

    it('update before section breaks', function (done) {
      setup(
        '<section><hr><p>One</p><p>Two</p></section>' +
        '<section><hr><p>Three</p></section>'
      )

      p = Serialize.fromText('2')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
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
            html: 'Three'
          }]
        }])

        done()
      }, 0)
    })

    it('not update paragraphs before the editor', function (done) {
      setup('<section><hr><p>One</p></section>')

      p = Serialize.fromText('X')

      expect(function () {
        op(-1, p)
      }).to.throw(RangeError)

      done()
    })

    it('not update paragraphs after the editor', function (done) {
      setup('<section><hr><p>One</p></section>')

      p = Serialize.fromText('X')

      expect(function () {
        op(1, p)
      }).to.throw(RangeError)

      done()
    })

    it('change the first P to an H2', function (done) {
      setup('<section><hr><p>One</p></section>')

      p = Serialize.fromText('One', 'h2')
      op(0, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'h2',
            html: 'One'
          }]
        }])

        done()
      }, 0)
    })

    it('change a middle P to an H2', function (done) {
      setup('<section><hr><p>One</p><p>Two</p><p>Three</p></section>')

      p = Serialize.fromText('Two', 'h2')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'h2',
            html: 'Two'
          }, {
            name: 'p',
            html: 'Three'
          }]
        }])

        done()
      }, 0)
    })

    it('change the first P to an OL > LI', function (done) {
      setup('<section><hr><p>One</p></section>')

      p = Serialize.fromText('One', 'ol')
      op(0, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'One'
            }]
          }]
        }])

        done()
      }, 0)
    })

    it('change a P followed by an OL > LI to an OL > LI', function (done) {
      setup('<section><hr><p>One</p><p>Two</p><ol><li>Three</li></ol></section>')

      p = Serialize.fromText('Two', 'ol')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'Two'
            }, {
              name: 'li',
              html: 'Three'
            }]
          }]
        }])

        done()
      }, 0)
    })

    it('change a P preceded by an OL > LI to an OL > LI', function (done) {
      setup('<section><hr><ol><li>One</li></ol><p>Two</p></section>')

      p = Serialize.fromText('Two', 'ol')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'One'
            }, {
              name: 'li',
              html: 'Two'
            }]
          }]
        }])

        done()
      }, 0)
    })

    it('change a P surrounded by OL > LIs to an OL > LI', function (done) {
      setup('<section><hr><ol><li>One</li></ol><p>Two</p><ol><li>Three</li></ol></section>')

      p = Serialize.fromText('Two', 'ol')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'One'
            }, {
              name: 'li',
              html: 'Two'
            }, {
              name: 'li',
              html: 'Three'
            }]
          }]
        }])

        done()
      }, 0)
    })

    it('change a starting OL > LI to a P', function (done) {
      setup('<section><hr><ol><li>One</li></ol></section>')

      p = Serialize.fromText('One')
      op(0, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }]
        }])

        done()
      }, 0)
    })

    it('change a middle OL > LI to a P', function (done) {
      setup('<section><hr><ol><li>One</li><li>Two</li></ol><p>Three</p></section>')

      p = Serialize.fromText('Two')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'One'
            }]
          }, {
            name: 'p',
            html: 'Two'
          }, {
            name: 'p',
            html: 'Three'
          }]
        }])

        done()
      }, 0)
    })

    it('change the middle OL > LI in a trio to a P', function (done) {
      setup('<section><hr><ol><li>One</li><li>Two</li><li>Three</li></ol></section>')

      p = Serialize.fromText('Two')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'One'
            }]
          }, {
            name: 'p',
            html: 'Two'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'Three'
            }]
          }]
        }])

        done()
      }, 0)
    })

    it('change the only paragraph in a section to an H2', function (done) {
      setup(
        '<section><hr><p>One</p></section>' +
        '<section><hr><p>Two</p></section>'
      )

      p = Serialize.fromText('Two', 'h2')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'h2',
            html: 'Two'
          }]
        }])

        done()
      }, 0)
    })

    it('change the only paragraph in a section to an OL > LI', function (done) {
      setup(
        '<section><hr><p>One</p></section>' +
        '<section><hr><p>One</p></section>'
      )

      p = Serialize.fromText('Two', 'ol')
      op(1, p)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'Two'
            }]
          }]
        }])

        done()
      }, 0)
    })
  })

  describe('paragraphDelete should', function () {
    var op = makeApplier('paragraphDelete')

    afterEach(teardown)

    it('remove the last paragraph', function (done) {
      setup('<section><hr><p>One</p><p>Two</p></section>')

      op(1)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }]
        }])

        done()
      }, 0)
    })

    it('remove the first paragraph', function (done) {
      setup('<section><hr><p>X</p><p>One</p></section>')

      op(0)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }]
        }])

        done()
      }, 0)
    })

    it('remove paragraphs after section breaks', function (done) {
      setup(
        '<section><hr><p>One</p></section>' +
        '<section><hr><p>X</p><p>Two</p></section>'
      )

      op(1)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'Two'
          }]
        }])

        done()
      }, 0)
    })

    it('remove paragraphs before section breaks', function (done) {
      setup(
        '<section><hr><p>One</p><p>X</p></section>' +
        '<section><hr><p>Two</p></section>'
      )

      op(1)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'Two'
          }]
        }])

        done()
      }, 0)
    })

    it('remove paragraphs in the middle', function (done) {
      setup('<section><hr><p>One</p><p>X</p><p>Two</p></section>')

      op(1)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: 'Two'
          }]
        }])

        done()
      }, 0)
    })

    it('not remove the only paragraph in a section', function (done) {
      setup('<section><hr><p>One</p></section>')

      expect(function () {
        op(0)
      }).to.throw(Error)

      done()
    })

    it('not remove paragraphs before the editor', function (done) {
      setup('<section><hr><p>One</p></section>')

      expect(function () {
        op(-1)
      }).to.throw(RangeError)

      done()
    })

    it('not remove paragraphs after the editor', function (done) {
      setup('<section><hr><p>One</p></section>')

      expect(function () {
        op(1)
      }).to.throw(RangeError)

      done()
    })

    it('remove a P surrounded by OL > LIs', function (done) {
      setup('<section><hr><ol><li>One</li></ol><p>X</p><ol><li>Two</li></ol></section>')

      op(1)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'One'
            }, {
              name: 'li',
              html: 'Two'
            }]
          }]
        }])

        done()
      }, 0)
    })

    it('remove an OL > LI surrounded by OL > LIs', function (done) {
      setup('<section><hr><ol><li>One</li><li>X</li><li>Two</li></ol></section>')

      op(1)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'One'
            }, {
              name: 'li',
              html: 'Two'
            }]
          }]
        }])

        done()
      }, 0)
    })

    it('remove an OL > LI surrounded by UL > LIs', function (done) {
      setup('<section><hr><ul><li>One</li></ul><ol><li>X</li></ol><ul><li>Two</li></ul></section>')

      op(1)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ul',
            children: [{
              name: 'li',
              html: 'One'
            }, {
              name: 'li',
              html: 'Two'
            }]
          }]
        }])

        done()
      }, 0)
    })

    it('remove a starting OL > LI', function (done) {
      setup('<section><hr><ol><li>X</li></ol><p>One</p></section>')

      op(0)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }]
        }])

        done()
      }, 0)
    })
  })

  describe('sectionInsert should', function () {
    var op = makeApplier('sectionInsert')

    afterEach(teardown)

    it('not insert a section where another starts', function (done) {
      setup(
        '<section><hr><p>One</p></section>' +
        '<section><hr><p>Two</p></section>'
      )

      expect(function () {
        op(1, { start: 1 })
      }).to.throw(Error)

      done()
    })

    it('not insert a section before the editor', function (done) {
      setup('<section><hr><p>One</p></section>')

      expect(function () {
        op(-1, { start: -1 })
      }).to.throw(RangeError)

      done()
    })

    it('not insert a section after the editor', function (done) {
      setup('<section><hr><p>One</p></section>')

      expect(function () {
        op(1, { start: 1 })
      }).to.throw(RangeError)

      done()
    })

    it('insert a section between two Ps', function (done) {
      setup('<section><hr><p>One</p><p>Two</p></section>')

      op(1, { start: 1 })

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }]
        }, {
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'Two'
          }]
        }])

        done()
      }, 0)
    })

    it('insert a section between two OL > LIs', function (done) {
      setup('<section><hr><ol><li>One</li><li>Two</li></ol></section>')

      op(1, { start: 1 })

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'One'
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
              html: 'Two'
            }]
          }]
        }])

        done()
      }, 0)
    })
  })

  describe('sectionUpdate should', function () {
    var op = makeApplier('sectionUpdate')

    afterEach(teardown)

    it('not update a non-existant section', function (done) {
      setup('<section><hr><p>One</p><p>Two</p></section>')

      expect(function () {
        op(1, { start: 1 })
      }).to.throw(Error)

      done()
    })
  })

  describe('sectionDelete should', function () {
    var op = makeApplier('sectionDelete')

    afterEach(teardown)

    it('not remove the first section', function (done) {
      setup(
        '<section><hr><p>One</p></section>' +
        '<section><hr><p>Two</p></section>'
      )

      expect(function () {
        op(0)
      }).to.throw(Error)

      done()
    })

    it('not remove sections before the editor', function (done) {
      setup('<section><hr><p>One</p><p>Two</p></section>')

      expect(function () {
        op(-1)
      }).to.throw(Error)

      done()
    })

    it('not remove sections after the editor', function (done) {
      setup('<section><hr><p>One</p><p>Two</p></section>')

      expect(function () {
        op(2)
      }).to.throw(Error)

      done()
    })

    it('remove a section between two Ps', function (done) {
      setup(
        '<section><hr><p>One</p></section>' +
        '<section><hr><p>Two</p></section>'
      )

      op(1)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'p',
            html: 'One'
          }, {
            name: 'p',
            html: 'Two'
          }]
        }])

        done()
      }, 0)
    })

    it('remove a section between two OL > LIs', function (done) {
      setup(
        '<section><hr><ol><li>One</li></ol></section>' +
        '<section><hr><ol><li>Two</li></ol></section>'
      )

      op(1)

      setTimeout(function () {
        expect(root).to.have.children([{
          name: 'section',
          children: [{
            name: 'hr'
          }, {
            name: 'ol',
            children: [{
              name: 'li',
              html: 'One'
            }, {
              name: 'li',
              html: 'Two'
            }]
          }]
        }])

        done()
      }, 0)
    })
  })

  function setup (html) {
    root = document.createElement('div')
    root.innerHTML = html
    document.body.appendChild(root)

    editor = new Compose(root)
    editor.use(listPlugin)
    editor.use(formatBlock)
    Serialize = editor.require('serialize')
    View = editor.require('view')

    // Perform some setup.
    var all = [].slice.call(root.querySelectorAll('section,p,h2,li'))

    all.forEach(function (el) {
      var section,
          p

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

  function makeApplier (type) {
    return function (index, data) {
      var Delta = editor.plugins.delta
      var View = editor.plugins.view

      View.resolve(new Delta(type, index, data))
    }
  }

  function teardown () {
    document.body.removeChild(root)
    p = null
  }
})
