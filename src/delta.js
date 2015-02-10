'use strict';

module.exports = Delta

/**
 * Delta constructor. Type should be one of the types defined below.
 *
 * @param {String || Number} type
 * @param {Int} index
 * @param {*} data
 */
function Delta (type, index, data) {
  if (!(this instanceof Delta))
    return new Delta(type, index, data)

  this.index = index
  this.type = typeof type !== 'number' ? Delta.types[type] : type

  if (this.type <= Delta.types.paragraphDelete)
    this.paragraph = data || null
  else
    this.section = data || null
}

// Expose types.
Delta.types = {
  paragraphInsert: 1,
  paragraphUpdate: 2,
  paragraphDelete: 3,
  sectionInsert: 4,
  sectionUpdate: 5,
  sectionDelete: 6
}
