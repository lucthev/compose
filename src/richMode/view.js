'use strict';

function ViewProvider (Compose) {
  var getChildren = Compose.require('getChildren'),
      setImmediate = Compose.require('timers').setImmediate

  function View () {
    this.paragraphs = []
    this.sections = []

    this._queue = []
    this._scheduled = false
  }

  View.prototype.resolve = function (deltas) {
    if (!Array.isArray(deltas))
      deltas = [deltas]

    this._queue.push.apply(this._queue, deltas)

    if (!this._scheduled)
      this._scheduled = setImmediate(function scheduleRender () {
        this.render()

        this._scheduled = false
      }.bind(this))
  }

  View.prototype.render = function () {
    // body...
  }
}

module.exports = ViewProvider
