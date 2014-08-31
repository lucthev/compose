'use strict';

var paragraphs = require('./paragraphs'),
    sections = require('./sections')

function viewPlugin (Compose) {
  var setImmediate = Compose.require('setImmediate'),
      getChildren = Compose.require('getChildren'),
      Selection = Compose.require('selection'),
      Converter = Compose.require('converter'),
      Delta = Compose.require('delta'),
      ParagraphOperations,
      SectionOperations

  ParagraphOperations = paragraphs(Compose)
  SectionOperations = sections(Compose)

  function View () {
    this._modified = -1
    this._queue = []
    this._rendering = false

    this.paragraphs = []
    this.sections = []

    Compose.on('keydown', function () {
      var sel = Selection.get(),
          start

      start = sel.isBackwards() ? sel.end : sel.start
      this._modified = start[0]

      this._rendering = true
      setImmediate(this._render.bind(this))
    }.bind(this))
  }

  /**
   * isSectionStart(index) determines if a section starts at the given
   * index.
   *
   * @param {Int >= 0} index
   * @return {Boolean}
   */
  View.prototype.isSectionStart = function (index) {
    var i

    for (i = 0; i < this.sections.length; i += 1) {
      if (this.sections[i].start === index)
        return true
    }

    return false
  }

  View.prototype.render = function (deltas) {
    if (!Array.isArray(deltas))
      this._queue.push(deltas)
    else
      this._queue.push.apply(this._queue, deltas)

    if (!this._rendering) {
      this._rendering = true
      setImmediate(this._render.bind(this))
    }
  }

  View.prototype._render = function () {
    var children = getChildren(),
        index = this._modified,
        paragraph,
        copy,
        i

    if (index >= 0 && !this._queue.length) {
      paragraph = Converter.toParagraph(children[index])

      if (paragraph.equals(this.paragraphs[index]))
        return

      copy = paragraph.substr(0)
      Compose.emit('paragraphUpdate', index, paragraph)

      if (copy.equals(paragraph)) {
        this.paragraphs[index] = paragraph
        return
      }

      // The paragraph has been modified by a plugin; we want
      // these changes to be rendered in this render window.
      // In the case that emitting the paragraphUpdate event caused
      // the plugins to render some Deltas, we want ours to be at the
      // front of the queue; otherwise, we may not end up updating
      // the paragraph we think we are.
      this._queue.unshift(new Delta('paragraphUpdate', index, paragraph))
    }

    // TODO: don’t update paragraphs when they are identical to the ones
    // in the view.
    Delta.reduce(this._queue)

    // TODO: cache result of getChildren() somewhere?
    for (i = 0; i < this._queue.length; i += 1) {
      resolveDelta(this, this._queue[i])
    }

    this._queue = []
    this._modified = -1
    this._rendering = false

    Compose.emit('render')
  }

  function resolveDelta (View, delta) {
    var type = Delta.types[delta.type]

    if (type === 'paragraphInsert')
      ParagraphOperations.insert.call(View, delta)
    else if (type === 'paragraphUpdate')
      ParagraphOperations.update.call(View, delta)
    else if (type === 'paragraphDelete')
      ParagraphOperations.remove.call(View, delta)
    else if (type === 'sectionInsert')
      SectionOperations.insert.call(View, delta)
    else if (type === 'sectionUpdate')
      SectionOperations.update.call(View, delta)
    else if (type === 'sectionDelete')
      SectionOperations.remove.call(View, delta)
    else
      throw new TypeError('Invalid Delta type.')
  }

  Compose.provide('view', new View())
}

module.exports = viewPlugin;
