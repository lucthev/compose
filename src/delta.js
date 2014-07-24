'use strict';

var Types = {
  paragraphInsert: 1,
  paragraphUpdate: 2,
  paragraphDelete: 3,
  sectionInsert: 4,
  sectionUpdate: 5,
  sectionDelete: 6
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

/**
 * Delta.compress(deltas) takes an array of Deltas and reduces it to
 * the minimum number of deltas necessary to represent the same changes
 * the original represented. For example, if there are two update
 * operations on the same paragraph, the first will get discarded.
 *
 * @param {[Deltas]}
 */
Delta.compress = function (deltas) {

}

Delta.types = Types

module.exports = Delta
