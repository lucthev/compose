/* jshint ignore:start */

describe('The History (undo) Plugin', function () {

  var History,
      Selection,
      callback,
      history,
      quill,
      elem

  beforeEach(function () {
    elem = document.createElement('div')
    document.body.appendChild(elem)

    // Make our fake Quill
    if (!History) {
      var temp = new Quill(elem)
      History = temp.history.constructor
      Selection = temp.selection.constructor
      temp.destroy()
    }

    quill = new Quill(elem)
    quill.disable('history')
    spyOn(quill, 'on')
    spyOn(quill, 'off')
    spyOn(quill, 'emit')

    quill.history = history = new History(quill)

    // This is the change listener:
    callback = quill.on.calls.argsFor(0)[1]
  })

  afterEach(function (done) {
    document.body.removeChild(elem)

    // Remove extraneous markers. This happens because we are firing
    // the change callback when the element is not focussed; this
    // shouldn't happen in real life.
    var markers = document.body.querySelectorAll('.Quill-marker')
    markers = Array.prototype.slice.call(markers)
    markers.forEach(function (marker) {
      marker.parentNode.removeChild(marker)
    })

    setTimeout(function () {
      if (history) history = history.destroy()

      done()
    }, 10)
  })

  it('should listen to Quill\'s change event.', function () {
    expect(quill.on).toHaveBeenCalledWith('change', jasmine.any(Function))
  })

  it('should save initial state as soon as the element is focussed.',
    function (done) {

    spyOn(history, 'push').and.callThrough()

    expect(history.push.calls.count()).toEqual(0)
    expect(history.length).toEqual(0)

    fireEvent(elem, 'focus')

    // Give it some time.
    setTimeout(function () {
      expect(history.push.calls.count()).toEqual(1)
      expect(history.length).toEqual(1)

      done()
    }, 0)
  })

  it('should save state on change.', function (done) {
    spyOn(history, 'push').and.callThrough()

    var content = '<p>Stuff</p>'
    elem.innerHTML = content

    // Simulates the change event.
    callback()

    setTimeout(function () {
      expect(history.push.calls.count()).toEqual(1)
      expect(history.length).toEqual(1)
      expect(history.stack[0]).toEqual(content)

      done()
    }, 0)
  })

  it('should restore a previous state on undo/redo.', function () {
    var content = '<p>Stuff</p>',
        different = '<p>Things</p>'

    elem.innerHTML = content
    callback()
    elem.innerHTML = different
    callback()

    // I have no idea how to actually fire Cmd/Ctrl-Z.
    // Doesn't really matter.
    history.undo()

    expect(elem.innerHTML).toEqual(content)
    expect(history.length).toEqual(history.stack.length - 1)

    history.redo()
    expect(elem.innerHTML).toEqual(different)
  })

  it('should accurately manage states.', function () {
    var states = ['<p>A</p>', '<p>B</p>']

    for (var i = 0; i < states.length; i += 1) {
      elem.innerHTML = states[i]
      callback()
    }

    history.undo()
    elem.innerHTML = '<p>C</p>'
    callback()
    elem.innerHTML = '<p>D</p>'
    callback()

    history.undo()
    expect(elem.innerHTML).toEqual('<p>C</p>')
  })

  it('should only keep a certain number of states.', function () {

    // Push more than allowed.
    for (var i = 0; i < history.max + 10; i += 1)
      callback()

    expect(history.length).toEqual(history.stack.length)
    expect(history.length).toEqual(history.max)
  })

  it('should emit a change event on undo/redo.', function () {

    // Push a few states.
    callback()
    callback()

    expect(quill.emit).not.toHaveBeenCalled()

    history.undo()
    expect(quill.emit)
      .toHaveBeenCalledWith('change', jasmine.any(String))

    quill.emit.calls.reset()

    history.redo()
    expect(quill.emit)
      .toHaveBeenCalledWith('change', jasmine.any(String))
  })

  it('should ignore the change events it emits.', function () {

    for (var i = 0; i < 3; i += 1)
      callback()

    var realLength = history.stack.length,
        length = history.length

    spyOn(history, 'push').and.callThrough()

    history.undo()
    history.undo()

    expect(history.push).not.toHaveBeenCalled()
    expect(quill.emit).toHaveBeenCalled()
    expect(history.stack.length).toEqual(realLength)
    expect(history.length).toEqual(length - 2) // We undid twice.
  })

  it('should present a destroy method.', function () {
    expect(history.destroy).toEqual(jasmine.any(Function))
  })

  it('should remove all listeners upon destruction.', function () {
    spyOn(elem, 'addEventListener').and.callThrough()
    spyOn(elem, 'removeEventListener').and.callThrough()

    new History(quill).destroy()

    expect(elem.addEventListener.calls.count())
      .toEqual(elem.removeEventListener.calls.count())
  })
})
