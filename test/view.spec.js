/* eslint-env mocha */
'use strict'

describe('View', function () {
  const TIMEOUT = 10
  let editor = null
  let view = null
  let P = null

  beforeEach(function () {
    let el = document.createElement('div')
    el.innerHTML =
      '<p>1</p>' +
      '<p>2</p>' +
      '<p>3</p>'
    document.body.appendChild(el)

    editor = new window.Compose(el).init()
    view = editor.require('view')
    P = view.converters.P
  })

  afterEach(function () {
    document.body.removeChild(editor.root)
    editor = view = P = null
  })

  it('insert at at < 0 throws', function (done) {
    expect(function () {
      view.insert(-1, P.fromText('X'))
    }).to.throw()
    done()
  })

  it('insert at 0 throws', function (done) {
    expect(function () {
      view.insert(0, P.fromText('X'))
    }).to.throw()
    done()
  })

  it('insert past the end throws', function (done) {
    expect(function () {
      view.insert(4, P.fromText('X'))
    }).to.throw()
    done()
  })

  it('update at < 0 throws', function (done) {
    expect(function () {
      view.update(-1, P.fromText('a'))
    }).to.throw()
    done()
  })

  it('update past the end throws', function (done) {
    expect(function () {
      view.update(3, P.fromText('a'))
    }).to.throw()
    done()
  })

  it('removing an only paragraph throws', function (done) {
    view.remove(0)
    view.remove(0)
    expect(function () {
      view.remove(0)
    }).to.throw()
    done()
  })

  it('removing at < 0 throws', function (done) {
    expect(function () {
      view.remove(-1)
    }).to.throw()
    done()
  })

  it('removing past the end throws', function (done) {
    expect(function () {
      view.remove(3)
    }).to.throw()
    done()
  })

  it('delayed actions', function (done) {
    view.insert(1, P.fromText('a'))

    setTimeout(function () {
      view.update(2, P.fromText('b'))
      view.insert(4, P.fromText('c'))

      setTimeout(function () {
        view.remove(3)
        view.update(0, P.fromText('d'))

        setTimeout(function () {
          view.remove(0)

          setTimeout(function () {
            expect(editor.root.innerHTML).to.equal(
              '<p>a</p><p>b</p><p>c</p>'
            )
            done()
          }, TIMEOUT)
        }, TIMEOUT)
      }, TIMEOUT)
    }, TIMEOUT)
  })

  const tests = [
    {
      desc: 'insert at the end',
      actions: [
        ['insert', 3, '4']
      ],
      result: '<p>1</p><p>2</p><p>3</p><p>4</p>'
    },
    {
      desc: 'insert between others',
      actions: [
        ['insert', 1, 'a']
      ],
      result: '<p>1</p><p>a</p><p>2</p><p>3</p>'
    },
    {
      desc: 'double insert in the middle',
      actions: [
        ['insert', 1, 'a'],
        ['insert', 2, 'b']
      ],
      result: '<p>1</p><p>a</p><p>b</p><p>2</p><p>3</p>'
    },
    {
      desc: 'insert at new end',
      actions: [
        ['insert', 1, 'a'],
        ['insert', 4, 'b']
      ],
      result: '<p>1</p><p>a</p><p>2</p><p>3</p><p>b</p>'
    },
    {
      desc: 'update at 0',
      actions: [
        ['update', 0, 'a']
      ],
      result: '<p>a</p><p>2</p><p>3</p>'
    },
    {
      desc: 'update in the middle',
      actions: [
        ['update', 1, 'a']
      ],
      result: '<p>1</p><p>a</p><p>3</p>'
    },
    {
      desc: 'update at the end',
      actions: [
        ['update', 2, 'a']
      ],
      result: '<p>1</p><p>2</p><p>a</p>'
    },
    {
      desc: 'multiple update',
      actions: [
        ['update', 0, 'a'],
        ['update', 2, 'c']
      ],
      result: '<p>a</p><p>2</p><p>c</p>'
    },
    {
      desc: 'double update at the same index',
      actions: [
        ['update', 1, 'a'],
        ['update', 1, 'b']
      ],
      result: '<p>1</p><p>b</p><p>3</p>'
    },
    {
      desc: 'insert & update at same index',
      actions: [
        ['insert', 1, 'a'],
        ['update', 1, 'b']
      ],
      result: '<p>1</p><p>b</p><p>2</p><p>3</p>'
    },
    {
      desc: 'update at a new index',
      actions: [
        ['insert', 1, 'a'],
        ['update', 3, 'b']
      ],
      result: '<p>1</p><p>a</p><p>2</p><p>b</p>'
    },
    {
      desc: 'consecutive insert & update',
      actions: [
        ['insert', 1, 'a'],
        ['update', 2, 'b']
      ],
      result: '<p>1</p><p>a</p><p>b</p><p>3</p>'
    },
    {
      desc: 'remove at index 0',
      actions: [
        ['remove', 0]
      ],
      result: '<p>2</p><p>3</p>'
    },
    {
      desc: 'remove the last paragraph',
      actions: [
        ['remove', 2]
      ],
      result: '<p>1</p><p>2</p>'
    },
    {
      desc: 'remove a middle paragraph',
      actions: [
        ['remove', 1]
      ],
      result: '<p>1</p><p>3</p>'
    },
    {
      desc: 'consecutive removals',
      actions: [
        ['remove', 1],
        ['remove', 1]
      ],
      result: '<p>1</p>'
    },
    {
      desc: 'non-consecutive removals',
      actions: [
        ['remove', 0],
        ['remove', 1]
      ],
      result: '<p>2</p>'
    },
    {
      desc: 'non-consecutive insert & removal',
      actions: [
        ['insert', 1, 'a'],
        ['remove', 3]
      ],
      result: '<p>1</p><p>a</p><p>2</p>'
    },
    {
      desc: 'consecutive insert & removal',
      actions: [
        ['insert', 1, 'a'],
        ['remove', 1]
      ],
      result: '<p>1</p><p>2</p><p>3</p>'
    },
    {
      desc: '',
      actions: [
        []
      ],
      result: '<p>1</p><p>2</p><p>3</p>'
    },
    {
      desc: '',
      actions: [
        []
      ],
      result: '<p>1</p><p>2</p><p>3</p>'
    },
    {
      desc: '',
      actions: [
        []
      ],
      result: '<p>1</p><p>2</p><p>3</p>'
    },
    {
      desc: '',
      actions: [
        []
      ],
      result: '<p>1</p><p>2</p><p>3</p>'
    }
  ]

  tests.forEach(function (test) {
    const { desc, actions, result } = test

    // Skip over tests that have not yet been filled out
    if (!desc) return

    it(desc, function (done) {
      actions.forEach(([method, index, text]) => {
        view[method](index, text ? P.fromText(text) : text)
      })

      setTimeout(function () {
        expect(editor.root.innerHTML).to.equal(result)
        done()
      }, TIMEOUT)
    })
  })
})
