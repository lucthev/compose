
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
      throttle.Quill.emit('change')
    }, throttle.min)

  if (!throttle.max) return throttle.Quill.emit('change')

  // Schedule a state save once the user finishes typing.
  throttle.scheduled = setTimeout(function () {

    throttle.forced = clearTimeout(throttle.forced)
    throttle.Quill.emit('change')
  }, throttle.max)
}

function onInput () {
  this.emit('input')
}

function Throttle (Quill) {
  this.Quill = Quill

  this.max = 150
  this.min = 320

  // Saving bound event listeners for later removal.
  this.scheduleSave = scheduleSave.bind(this)
  this.onInput = onInput.bind(Quill)

  Quill.elem.addEventListener('input', this.onInput)
  Quill.on('input', this.scheduleSave)
}

/**
 * Throttle.setSpeed(max, min) regulates the intervals at which
 * states are saved.
 *
 * @param {Number > 0} max
 * @param {Number > max} min
 */
Throttle.prototype.setSpeed = function (max, min) {
  if (!max || !min || max >= min) return

  this.max = max
  this.min = min
}

Throttle.prototype.destroy = function () {
  this.Quill.elem.removeEventListener('input', this.onInput)
  this.Quill.off('input', this.scheduleSave)

  clearTimeout(this.scheduled)
  clearTimeout(this.forced)
  delete this.scheduleSave
  delete this.Quill

  return null
}

Throttle.plugin = 'throttle'

module.exports = Throttle