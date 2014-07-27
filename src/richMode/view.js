'use strict';

var paragraphs = require('./paragraphs'),
    sections = require('./sections')

function viewPlugin (Compose) {
  var setImmediate = Compose.require('timers').setImmediate,
      getChildren = Compose.require('getChildren'),
      Serialize = Compose.require('serialize'),
      Delta = Compose.require('delta'),
      ParagraphOperations,
      SectionOperations

  // Hackish. Get the paragraph and section operations without polluting
  // the module system.
  Compose.use(paragraphs)
  ParagraphOperations = Compose.require(paragraphs.provided)
  Compose.disable(paragraphs.provided)

  Compose.use(sections)
  SectionOperations = Compose.require(sections.provided)
  Compose.disable(sections.provided)

  function View () {
    this._modified = {}
    this._queue = []
    this._rendering = false

    this.paragraphs = []
    this.sections = []
  }

  /**
   * isSectionStart(index) determines if a sections starts at the given
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

  View.prototype.markModified = function (index) {
    this._modified[index] = 1
  }

  View.prototype.sync = function () {
    var children = getChildren(),
        child

    Object.keys(this._modified).forEach(function (index) {
      var state

      child = children[index]

      if (!child) return

      state = new Serialize(child)

      if (!state.equals(this.paragraphs[index]))
        this.paragraphs[index] = state
    })

    this._modified = {}
  }

  View.prototype.render = function (deltas) {
    if (!Array.isArray(deltas))
      this._queue.push(deltas)
    else
      this._queue.push.apply(this._queue, deltas)

    if (!this._rendering)
      this._rendering = setImmediate(function () {
        this._render()
        this._rendering = false
      }.bind(this))
  }

  View.prototype._render = function () {
    var action,
        delta,
        i

    Delta.reduce(this._queue)

    // TODO: cache result of getChildren() somewhere?

    for (i = 0; i < this._queue.length; i += 1) {
      delta = this._queue[i]

      // Get the string form of the delta type.
      action = Delta.types[delta.type]

      this['_' + action](delta)
    }

    this._queue = []
  }

  View.prototype._paragraphInsert = ParagraphOperations.insert
  View.prototype._paragraphUpdate = ParagraphOperations.update
  View.prototype._paragraphDelete = ParagraphOperations.remove

  View.prototype._sectionInsert = SectionOperations.insert
  View.prototype._sectionUpdate = SectionOperations.update
  View.prototype._sectionDelete = SectionOperations.remove

  Compose.provide('view', new View())
}

module.exports = viewPlugin;
