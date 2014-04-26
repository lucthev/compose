'use strict';

// Used to extract the protocol from a string.
var PROTOCOL_REGEX = /^([A-Za-z0-9\+\-\.\&\;\*\s]*?)(?:\:|&*0*58|&*x0*3a)/i,
    Slice = Array.prototype.slice

function Sanitizer () {
  this.attributes = {}
  this.elements = {}
  this.filters = {}
  this.protocols = []
}

/**
 * Sanitizer.clean(node) sanitizes the given node in-place.
 *
 * @param {Element} container
 * @return Context
 */
Sanitizer.prototype.clean = function (container) {
  this.current = container

  function clean (node) {
    /* jshint validthis:true */
    if (node.nodeType === Node.ELEMENT_NODE) {
      cleanElement.call(this, node)
    } else if (node.nodeType !== Node.TEXT_NODE) {
      // Remove all nodes that aren't elements or text.

      node.parentNode.removeChild(node)
    }
  }

  function cleanElement (elem) {
    /* jshint validthis:true*/
    var children = Slice.call(elem.childNodes),
        i, parent, name, attrs, attr, val
    var whitelisted = transform.call(this, elem)

    name = elem.nodeName.toLowerCase()
    parent = this.current

    if (whitelisted) {
      this.current = elem
    } else if (this.elements[name]) {
      this.current = elem

      // Clean attributes
      attrs = this.attributes[name] || []

      Slice.call(elem.attributes)
        .forEach(function (attribute) {
          attr = attribute.name

          if (attrs.indexOf(attr) < 0)
            elem.removeAttribute(attr)
          else if (attr === 'href') {
            val = attribute.value.toLowerCase().match(PROTOCOL_REGEX)

            if (!val || this.protocols.indexOf(val[1]) < 0)
              elem.removeAttribute(attr)
          }
        }.bind(this))

    } else {
      while (elem.firstChild) {
        parent.insertBefore(
          elem.removeChild(elem.firstChild),
          elem.nextSibling
        )
      }

      parent.removeChild(elem)
    }

    // Iterate over child nodes
    for (i = 0; i < children.length; i += 1) {
      clean.call(this, children[i])
    }

    this.current = parent
  }

  function transform (node) {
    /* jshint validthis:true */
    var name = node.nodeName.toLowerCase(),
        retVal = false,
        output

    if (this.filters[name]) {
      this.filters[name].forEach(function (fn) {
        output = fn(node)

        if (output) retVal = true
      })
    }

    return retVal
  }

  for (var i = 0; i < container.childNodes.length; i += 1) {
    clean.call(this, container.childNodes[i])
  }

  container.normalize()

  return this
}

/**
 * Sanitize.addElements(elements) adds to the list of allowed
 * elements. Takes an array of lowercase tag names.
 *
 * @param {Array} elements
 * @return Context
 */
Sanitizer.prototype.addElements = function (elems) {
  var elem,
      i

  if (typeof elems === 'string')
    elems = [elems]

  for (i = 0; i < elems.length; i += 1) {
    elem = elems[i]
    if (!this.elements[elem]) this.elements[elem] = 1
    else this.elements[elem] += 1
  }

  return this
}

/**
 * Sanitize.removeElements(elements) removes elements from the list
 * of allowed elements. Takes an array of lowercase tag names.
 *
 * @param {Array} elements
 * @return Context
 */
Sanitizer.prototype.removeElements = function (elems) {
  var elem,
      i

  if (typeof elems === 'string')
    elems = [elems]

  for (i = 0; i < elems.length; i += 1) {
    elem = elems[i]
    if (this.elements[elem]) this.elements[elem] -= 1
  }

  return this
}

/**
 * Sanitizer.addAttributes(attributes) adds attributes allowed on an
 * element.
 *
 * @param {Object} attributes
 * @return Context
 */
Sanitizer.prototype.addAttributes = function (attributes) {

  Object.keys(attributes).forEach(function (key) {
    var allowed = this.attributes[key] || []

    attributes[key].forEach(function (attr) {
      allowed.push(attr)
    })

    this.attributes[key] = allowed
  }.bind(this))

  return this
}

/**
 * Sanitizer.removeAttributes(attributes) removes attributes allowed
 * on an element.
 *
 * @param {Object} attributes
 * @return Context
 */
Sanitizer.prototype.removeAttributes = function (attributes) {

  Object.keys(attributes).forEach(function (key) {
    var allowed = this.attributes[key] || []

    attributes[key].forEach(function (attr) {
      var index = allowed.indexOf(attr)

      if (index >= 0)
        allowed.splice(index, 1)
    })

    this.attributes[key] = allowed
  }.bind(this))

  return this
}

/**
 * Sanitize.addFilter(filter) add a transformer to the sanitizer.
 *
 * @param {Function} filter
 * @return Context
 */
Sanitizer.prototype.addFilter = function (name, filter) {
  if (!this.filters[name]) this.filters[name] = []

  this.filters[name].push(filter)

  return this
}

/**
 * Sanitize.removeFilter(filter) removes a transformer from the sanitizer.
 *
 * @param {Function} filter
 * @return Context
 */
Sanitizer.prototype.removeFilter = function (name, filter) {
  var index

  if (!this.filters[name]) return

  index = this.filters[name].indexOf(filter)
  if (index >= 0) this.filters[name].splice(index, 1)

  return this
}

/**
 * Sanitizer.addProtocols() adds to the list of allowed protocols.
 *
 * @param {Array} protocols
 * @return Context
 */
Sanitizer.prototype.addProtocols = function (protocols) {
  this.protocols = this.protocols.concat(protocols)

  return this
}

/**
 * Sanitizer.addProtocols() removes from the list of allowed protocols.
 *
 * @param {Array} protocols
 * @return Context
 */
Sanitizer.prototype.removeProtocols = function (protocols) {
  var index,
      i

  if (typeof protocols === 'string')
    protocols = [protocols]

  for (i = 0; i < protocols.length; i += 1) {
    index = this.protocols.indexOf(protocols[i])

    if (index >= 0)
      this.protocols.splice(index, 1)
  }


  return this
}

Sanitizer.plugin = 'sanitizer'

module.exports = Sanitizer
