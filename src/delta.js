'use strict';

var Types = {
  paragraphInsert: 1,
  paragraphUpdate: 2,
  paragraphDelete: 3,
  sectionInsert: 4,
  sectionUpdate: 5,
  sectionDelete: 6
}

// We should also be able to look up the string from the number.
Object.keys(Types).forEach(function (key) {
  Types[Types[key]] = key
})

/**
 * Delta constructor. Type should be one of the types above.
 *
 * @param {String || Number} type
 * @param {Int} index
 * @param {*} data
 */
function Delta (type, index, data) {
  if (!(this instanceof Delta))
    return new Delta(type, index, data)

  this.index = index
  this.type = typeof type !== 'number' ? Types[type] : type

  if (data && this.type <= 3)
    this.paragraph = data
  else if (data)
    this.section = data
}

// Expose types.
Delta.types = Types

module.exports = Delta
