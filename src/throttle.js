define(function () {

  function scheduleSave () {
    var throttle = this

    if (throttle.scheduled)
      throttle.scheduled = clearTimeout(throttle.scheduled)

    // Force a state save every so often.
    if (throttle.min && !throttle.forced)
      throttle.forced = setTimeout(function () {

        throttle._typing = false

        // Don't save twice.
        clearTimeout(throttle.scheduled)
        throttle.forced = null
        throttle.Quill.emit('change')
      }, throttle.min)

    if (!throttle.max) return throttle.Quill.emit('change')

    throttle._typing = true

    // Schedule a state save once the user finishes typing.
    throttle.scheduled = setTimeout(function () {

      throttle._typing = false

      throttle.forced = clearTimeout(throttle.forced)
      throttle.Quill.emit('change')
    }, throttle.max)
  }

  function Throttle (Quill) {
    this.Quill = Quill

    this.max = 150
    this.min = 320
    this._typing = false

    // Saving bound event listener to remove it later.
    this.scheduleSave = scheduleSave.bind(this)

    Quill.elem.addEventListener('input', this.scheduleSave)
  }

  /**
   * Throttle.isTyping() determines if a state save is pending.
   *
   * @return Boolean
   */
  Throttle.prototype.isTyping = function () {
    return this._typing
  }

  /**
   * Throttle.setSpeed(max, min) regulates the intervals at which
   * states are saved. If either max or min are falsy, states will
   * be saved upon input.
   *
   * @param {Number >= 0} max
   * @param {Number >= 0} min
   */
  Throttle.prototype.setSpeed = function (max, min) {
    if (!max || !min)
      this.max = this.min = 0
    else {
      this.max = max
      this.min = min
    }
  }

  Throttle.prototype.destroy = function () {
    this.Quill.elem.removeEventListener('input', this.scheduleSave)

    delete this.scheduleSave
    delete this.Quill

    return null
  }

  Throttle.plugin = 'throttle'

  return Throttle
})