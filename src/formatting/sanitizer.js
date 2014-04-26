'use strict';

var Sanitize = require('../vendor/sanitize/sanitize.js')

/**
 * Sanitize.addElements(elements) adds to the list of allowed
 * elements. Takes an array of lowercase tag names.
 *
 * @param {Array} elements
 * @return Context
 */
Sanitize.prototype.addElements = function (elements) {
  if (typeof elements === 'string')
    elements = [elements]

  elements.forEach(function (elem) {
    if (this.allowed_elements[elem])
      this.allowed_elements[elem] += 1
    else this.allowed_elements[elem] = 1
  }.bind(this))

  return this
}

/**
 * Sanitize.removeElements(elements) removes elements from the list
 * of allowed elements. Takes an array of lowercase tag names.
 *
 * @param {Array} elements
 * @return Context
 */
Sanitize.prototype.removeElements = function (elements) {
  if (typeof elements === 'string')
    elements = [elements]

  elements.forEach(function (elem) {
    if (this.allowed_elements[elem])
      this.allowed_elements[elem] -= 1
  }.bind(this))

  return this
}

/**
 * Sanitize.addAttributes(attributes) adds attributes allowed on an
 * element.
 * See (https://github.com/gbirke/Sanitize.js#attributes-object)
 *
 * @param {Object} attributes
 * @return Context
 */
Sanitize.prototype.addAttributes = function (attributes) {

  Object.keys(attributes).forEach(function (key) {
    var allowed = this.config.attributes[key] || []

    attributes[key].forEach(function (attr) {
      allowed.push(attr)
    })

    this.config.attributes[key] = allowed
  }.bind(this))

  return this
}

/**
 * Sanitize.removeAttributes(attributes) removes attributes allowed
 * on an element.
 * See (https://github.com/gbirke/Sanitize.js#attributes-object)
 *
 * @param {Object} attributes
 * @return Context
 */
Sanitize.prototype.removeAttributes = function (attributes) {

  Object.keys(attributes).forEach(function (key) {
    var allowed = this.config.attributes[key] || []

    attributes[key].forEach(function (attr) {
      var index = allowed.indexOf(attr)

      if (index >= 0)
        allowed.splice(index, 1)
    })

    this.config.attributes[key] = allowed
  }.bind(this))

  return this
}

/**
 * Sanitize.addFilter(filter) add a transformer to the sanitizer.
 * (see https://github.com/gbirke/Sanitize.js#transformers)
 *
 * @param {Function} filter
 * @return Context
 */
Sanitize.prototype.addFilter = function (filter) {
  this.transformers.push(filter)

  return this
}

/**
 * Sanitize.removeFilter(filter) removes a transformer from the
 * sanitizer (see https://github.com/gbirke/Sanitize.js#transformers).
 *
 * @param {Function} filter
 * @return Context
 */
Sanitize.prototype.removeFilter = function (filter) {
  var index = this.transformers.indexOf(filter)

  if (index >= 0) this.transformers.splice(index, 1)

  return this
}

/**
 * Sanitize.addProtocols(protocols) adds protocols allowed in certain
 * attributes.
 * See (https://github.com/gbirke/Sanitize.js#protocols-object)
 *
 * @param {Object} protocols
 * @return Context
 */
Sanitize.prototype.addProtocols = function (protocols) {

  Object.keys(protocols).forEach(function (tagName) {
    var tag = this.config.protocols[tagName] || {}

    Object.keys(protocols[tagName]).forEach(function (attr) {
      var allowed = tag[attr] || []

      protocols[tagName][attr].forEach(function (pcol) {
        allowed.push(pcol)
      })

      tag[attr] = allowed
    })

    this.config.protocols[tagName] = tag
  }.bind(this))

  return this
}

/**
 * Sanitize.removeProtocols(protocols) removes protocols allowed in
 * certain attributes.
 * See (https://github.com/gbirke/Sanitize.js#protocols-object)
 *
 * @param {Object} protocols
 * @return Context
 */
Sanitize.prototype.removeProtocols = function (protocols) {

  Object.keys(protocols).forEach(function (tagName) {
    var tag = this.config.protocols[tagName] || {}

    Object.keys(protocols[tagName]).forEach(function (attr) {
      var allowed = tag[attr] || []

      protocols[tagName][attr].forEach(function (pcol) {
        var index = allowed.indexOf(pcol)

        if (allowed.indexOf(pcol) >= 0)
          allowed.splice(index, 1)
      })

      tag[attr] = allowed
    })

    this.config.protocols[tagName] = tag
  }.bind(this))

  return this
}

// An alias for Sanitize.clean_node().
Sanitize.prototype.clean = Sanitize.prototype.clean_node

// Plugin name.
Sanitize.plugin = 'sanitizer'

module.exports = Sanitize
