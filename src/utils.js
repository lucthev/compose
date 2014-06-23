'use strict';

exports.toArray = function (obj) {
  return Array.prototype.slice.call(obj)
}

exports.hasOwnProp = function (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

/**
 * Inheritance. Pruned from Node.js utils.
 * https://github.com/joyent/node/blob/master/lib/util.js#L615-L638
 */
exports.inherits = function (ctor, superCtor) {
  ctor.super_ = superCtor
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  })
}
