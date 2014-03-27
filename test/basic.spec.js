/* jshint ignore:start */

describe('Quill', function () {

  var id = 'editor',
      quill

  beforeEach(function () {
    this.elem = document.createElement('div')
    this.elem.id = id
    document.body.appendChild(this.elem)
  })

  afterEach(function () {
    if (quill && quill.destroy && !quill._destroyed)
      quill = quill.destroy()

    document.body.removeChild(this.elem)
  })

  it('should be available as a global.', function () {
    expect(window.Quill).not.toBeUndefined()
  })

  it('can be called as a constructor.', function () {
    quill = new Quill('#' + id)

    expect(quill).toEqual(jasmine.any(Quill))
  })

  it('can be called as a function.', function () {
    quill = Quill(document.getElementById(id))

    expect(quill).toEqual(jasmine.any(Quill))
  })

  it('should allow multiple instances.', function () {
    var el = document.createElement('div')
    el.id = 'temp'
    document.body.appendChild(el)

    var q1 = Quill('#' + id)
    var q2 = new Quill(el)

    q1.destroy()
    q2.destroy()

    document.body.removeChild(el)
  })

  it('can take an element as a first parameter.', function () {
    quill = Quill(document.getElementById(id))

    expect(quill.elem).toEqual(this.elem)
  })

  it('can take a string as a first parameter.', function () {
    quill = new Quill('#' + id)

    expect(quill.elem).toEqual(this.elem)
  })

  it('should use querySelector if passed a string.', function () {
    spyOn(document, 'querySelector').and.callThrough()
    quill = Quill('#' + id)

    expect(document.querySelector).toHaveBeenCalled()
  })

  it('should present a destroy method.', function () {
    quill = new Quill('#' + id)

    expect(quill.destroy).toEqual(jasmine.any(Function))
  })

  // Note that this doesn't actually check that listeners were properly
  // removed.
  it('should remove all event listeners upon destruction.', function () {
    spyOn(this.elem, 'addEventListener').and.callThrough()
    spyOn(this.elem, 'removeEventListener').and.callThrough()

    new Quill('#' + id).destroy()

    expect(this.elem.addEventListener.calls.count())
      .toEqual(this.elem.removeEventListener.calls.count())
  })

  it('should delete reference to the element upon destruction.', function () {
    quill = Quill(this.elem)
    expect(quill.elem).toEqual(this.elem)

    quill.destroy()
    expect(quill.elem).not.toEqual(this.elem)
  })
})