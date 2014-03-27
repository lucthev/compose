/* jshint ignore:start */

describe('The History (undo) Plugin', function () {

  var History = Quill.getPlugin('history'),
      selection,
      callback,
      history,
      quill,
      elem

  beforeEach(function () {
    elem = document.createElement('div')
    document.body.appendChild(elem)

    // Make our fake Quill
    selection = jasmine.createSpyObj('selection',
      ['placeMarkers', 'removeMarkers', 'selectMarkers'])
    quill = jasmine.createSpyObj('quill', ['on', 'off', 'trigger'])
    quill.selection = selection
    quill.elem = elem

    history = new History(quill)

    callback = quill.on.calls.argsFor(0)[1]
  })

  afterEach(function () {
    document.body.removeChild(elem)
    if (history) history = history.destroy()
  })

  it('should listen to Quill\'s change event.', function () {
    expect(quill.on).toHaveBeenCalledWith('change', jasmine.any(Function))
  })

  it('should save initial state as soon as the element is focussed.', function (done) {
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

    // I have no idea how to actually fire Cmd/Ctrl-z.
    history.undo()

    expect(elem.innerHTML).toEqual(content)
    expect(history.length).toEqual(history.stack.length - 1)

    history.redo()
    expect(elem.innerHTML).toEqual(different)
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

    expect(quill.trigger).not.toHaveBeenCalled()

    history.undo()
    expect(quill.trigger).toHaveBeenCalledWith('change', jasmine.any(Array))

    quill.trigger.calls.reset()

    history.redo()
    expect(quill.trigger).toHaveBeenCalledWith('change', jasmine.any(Array))
  })

  // Sort of a flaky test.
  it('should ignore the change events it emits.', function () {

    for (var i = 0; i < 3; i += 1)
      callback()

    var realLength = history.stack.length,
        length = history.length

    history.undo()
    history.undo()

    expect(quill.trigger).toHaveBeenCalled()
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