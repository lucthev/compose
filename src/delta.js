'use strict';

var Types = {
  paragraphInsert: 1,
  paragraphUpdate: 2,
  paragraphDelete: 3,
  sectionInsert: 4,
  sectionDelete: 5
}

/**
 * Delta constructor. Type should be one of the types above.
 *
 * @param {Int} index
 * @param {*} data
 * @param {String} type
 */
function Delta (index, data, type) {
  this.index = index
  this.data = data
  this.type = Types[type]
}

Delta.types = Types

module.exports = Delta
