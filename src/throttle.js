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
        throttle.Venti.trigger('change')
      }, throttle.min)

    if (!throttle.max) return throttle.Venti.trigger('change')

    // Schedule a state save once the user finishes typing.
    throttle.scheduled = setTimeout(function () {

      throttle.forced = clearTimeout(throttle.forced)
      throttle.Venti.trigger('change')
    }, throttle.max)
  }

  function Throttle (Venti) {
    this.Venti = Venti

    this.max = 150
    this.min = 320

    this.Venti.elem.addEventListener('input', scheduleSave.bind(this))
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
    this.Venti.elem.removeEventListener('input', scheduleSave)

    delete this.Venti

    return null
  }

  Throttle.plugin = 'throttle'

  return Throttle
})