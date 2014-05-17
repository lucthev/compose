'use strict';

/**
 * scheduleSave() schedules a state save.
 */
function scheduleSave () {
  var throttle = this

  if (throttle.scheduled)
    throttle.scheduled = clearTimeout(throttle.scheduled)

  // Force a state save every so often.
  if (throttle.min && !throttle.forced)
    throttle.forced = setTimeout(function scheduleForced () {

      // Don't save twice.
      clearTimeout(throttle.scheduled)
      throttle.forced = null
      throttle.emit('change')
    }, throttle.min)

  // Schedule a state save once the user finishes typing.
  throttle.scheduled = setTimeout(function scheduleTimed () {

    throttle.forced = clearTimeout(throttle.forced)
    throttle.emit('change')
  }, throttle.max)
}

function onInput () {
  this.emit('input')
}

function Throttle (Compose) {
  this.emit = Compose.emit.bind(Compose)
  this.off = Compose.off.bind(Compose)
  this.elem = Compose.elem

  this.max = 200
  this.min = 460

  // Saving bound event listeners for later removal.
  this.scheduleSave = scheduleSave.bind(this)
  this.onInput = onInput.bind(Compose)

  Compose.elem.addEventListener('input', this.onInput)
  Compose.on('input', this.scheduleSave)
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

/**
 * Throtte.destroy() removes event listners etc.
 */
Throttle.prototype.destroy = function () {
  this.elem.removeEventListener('input', this.onInput)
  this.off('input', this.scheduleSave)

  clearTimeout(this.scheduled)
  clearTimeout(this.forced)

  delete this.elem
  delete this.emit
  delete this.off

  return null
}

Throttle.plugin = 'throttle'

module.exports = Throttle
