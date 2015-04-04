'use strict'

module.exports = Delta

/**
 * Delta constructor. Type should be one of the types defined below.
 *
 * @param {String || Number} type
 * @param {Int} index
 * @param {*} data
 */
function Delta (type, index, data) {
  if (!(this instanceof Delta)) {
    return new Delta(type, index, data)
  }

  validateType(type)

  this.index = index
  this.type = type

  if (type[0] === 'p') {
    this.paragraph = data || null
  } else {
    this.section = data || null
  }
}

function validateType (type) {
  if (typeof type !== 'string' || (
    type !== 'paragraphInsert' &&
    type !== 'paragraphUpdate' &&
    type !== 'paragraphDelete' &&
    type !== 'sectionInsert' &&
    type !== 'sectionUpdate' &&
    type !== 'sectionDelete'
  )) {
    throw TypeError(type + 'is not a valid delta type')
  }
}

/**
 * Delta.reduce(deltas) takes an array of deltas and removes unnecessary
 * ones. Returns a new array, but may mutate the original one or its deltas.
 *
 * @param {Array} deltas
 * @return {Array} deltas
 */
Delta.reduce = function (deltas) {
  return deltas.reduce(reducer, [])
}

function reducer (array, delta) {
  var last = array[array.length - 1] || {}

  if (last.index !== delta.index || delta.type !== 'paragraphUpdate') {
    array.push(delta)
    return array
  }

  if (last.type === 'paragraphInsert' || last.type === 'paragraphUpdate') {
    last.paragraph = delta.paragraph
  } else {
    array.push(delta)
  }

  return array
}
