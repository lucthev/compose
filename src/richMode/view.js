'use strict';

var paragraphs = require('./paragraphs'),
    sections = require('./sections')

function viewPlugin (Compose) {
  var setImmediate = Compose.require('setImmediate'),
      getChildren = Compose.require('getChildren'),
      Selection = Compose.require('selection'),
      Converter = Compose.require('converter'),
      Delta = Compose.require('delta'),
      Paragraph,
      Section

  Paragraph = paragraphs(Compose)
  Section = sections(Compose)

  function scheduleSync () {
    var sel = Selection.get(),
        start

    start = sel.isBackwards() ? sel.end : sel.start
    this._modified = start[0]

    this._rendering = true
    setImmediate(this._render.bind(this))
  }

  function View () {
    this._modified = -1
    this._queue = []
    this._rendering = false

    this.paragraphs = []
    this.sections = []

    Compose.on('keypress', scheduleSync.bind(this))
    Compose.on('compositionend', scheduleSync.bind(this))
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
        i

    if (index >= 0) {
      paragraph = Converter.toParagraph(children[index])

      if (!paragraph.equals(this.paragraphs[index])) {
        Compose.emit('sync', index, paragraph)
        this.paragraphs[index] = paragraph
      }
    }

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
    switch (Delta.types[delta.type]) {
      case 'paragraphInsert':
        Paragraph.insert.call(View, delta)
        break
      case 'paragraphUpdate':

        // When the update is identical to the current paragraph,
        // take no action.
        if (delta.paragraph.equals(View.paragraphs[delta.index]))
          return

        Paragraph.update.call(View, delta)
        break
      case 'paragraphDelete':
        Paragraph.remove.call(View, delta)
        break
      case 'sectionInsert':
        Section.insert.call(View, delta)
        break
      case 'sectionUpdate':
        Section.update.call(View, delta)
        break
      case 'sectionDelete':
        Section.remove.call(View, delta)
        break

      default:
        throw new TypeError('Invalid Delta type.')
    }
  }

  Compose.provide('view', new View())
}

module.exports = viewPlugin;
