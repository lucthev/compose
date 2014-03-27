/* global define, clearTimeout, setTimeout */

define(function () {

  function scheduleSave () {
    var throttle = this

    if (throttle.scheduled)
      throttle.scheduled = clearTimeout(throttle.scheduled)

    // Force a state save every so often.
    if (throttle.min && !throttle.forced)
      throttle.forced = setTimeout(function () {

        // Don't save twice.
        clearTimeout(throttle.scheduled)
        throttle.forced = null
        throttle.Quill.trigger('change')
      }, throttle.min)

    if (!throttle.max) return throttle.Quill.trigger('change')

    // Schedule a state save once the user finishes typing.
    throttle.scheduled = setTimeout(function () {

      throttle.forced = clearTimeout(throttle.forced)
      throttle.Quill.trigger('change')
    }, throttle.max)
  }

  function Throttle (Quill) {
    this.Quill = Quill

    this.max = 150
    this.min = 320

    // Saving bound event listener to remove it later.
    this.scheduleSave = scheduleSave.bind(this)

    Quill.elem.addEventListener('input', this.scheduleSave)
  }

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