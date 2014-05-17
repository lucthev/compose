'use strict';

// Used to extract the protocol from a string.
var PROTOCOL_REGEX = /^([A-Za-z0-9\+\-\.\&\;\*\s]*?)(?:\:|&*0*58|&*x0*3a)/i,
    Slice = Array.prototype.slice

/**
 * clean(node) takes a node and decides what kind of transformations
 * to apply to it.
 *
 * @param {Node} node
 */
function clean (node) {
  var type = node.nodeType

  if (type === Node.TEXT_NODE) {
    formatText.call(this,node)
  } else if (type === Node.ELEMENT_NODE) {
    cleanElement.call(this, node)
  } else {
    // Remove all nodes that aren't elements or text.

    node.parentNode.removeChild(node)
  }
}

/**
 * cleanElement(elem) cleans the given element.
 *
 * @param {Element} elem
 */
function cleanElement (elem) {
  var transformed = transformElem.call(this, elem),
      whitelisted = transformed.whitelist,
      replacement = transformed.node,
      children,
      parent,
      attrs,
      attr,
      name,
      val,
      i

  parent = this.current

  if (replacement) {
    parent.replaceChild(replacement, elem)
    elem = replacement
  }

  if (!transformed.remove) {
    name = elem.nodeName.toLowerCase()
    children = Slice.call(elem.childNodes)
  } else children = []

  if (transformed.remove) {
    parent.removeChild(elem)
  } else if (whitelisted) {
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

          /**
           * We use elem.href; this way, any relative URLs are converted
           * to their absolute equivalent, where possible. This means
           * potentially garbage values will be OK'd; care must be taken.
           */
          val = elem.href.toLowerCase().match(PROTOCOL_REGEX)

          if (!val || this.protocols.indexOf(val[1]) < 0)
            elem.removeAttribute(attr)
        }
      }.bind(this))

  } else {
    while (elem.firstChild) {
      parent.insertBefore(
        elem.removeChild(elem.firstChild),
        elem
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

/**
 * transformElem(node) applies element filters to the given element.
 *
 * @param {Element} node
 * @return {Object}
 */
function transformElem (node) {
  var name = node.nodeName.toLowerCase(),
      returned,
      filters,
      output

  returned = {
    node: false,
    whitelist: false,
    remove: false
  }

  // Apply transformations for the elements and wildcards.
  filters = this.filters[name] || []
  filters.concat(this.filters['*'] || [])
    .forEach(function (fn) {

      // There no point in applying further transformation if the
      // node is going to be removed.
      if (!returned.remove)
        output = fn(node) || {}

      if (output.node) returned.node = output.node
      if (output.whitelist) returned.whitelist = true
      if (output.remove) returned.remove = true
    })

  return returned
}

/**
 * formatText(node) applies text formatters to a text node.
 *
 * @param {Node} node
 */
function formatText (node) {
  var i

  for (i = 0; i < this.textFormatters.length; i += 1)
    this.textFormatters[i](node)
}

function Sanitizer (Quill) {
  this.attributes = {}
  this.elements = {}
  this.filters = {}
  this.textFormatters = []
  this.protocols = []

  this.emit = Quill.emit.bind(Quill)
}

/**
 * Sanitizer.clean(node) sanitizes the given node in-place.
 *
 * @param {Element} container
 * @return {Context}
 */
Sanitizer.prototype.clean = function (container) {

  // Emit a 'beforeclean' event with the container as an argument.
  this.emit('beforeclean', container)

  this.current = container

  Slice.call(container.childNodes).forEach(clean.bind(this))

  // Join adjacent text nodes and whatnot.
  container.normalize()

  // Emit an 'afterclean' event with the container as an argument.
  this.emit('afterclean', container)

  return this
}

/**
 * Sanitizer.url(href) validates the given url against the Sanitizer's
 * list of allowed protocols. Returns an object with the protocol and
 * whether or not the protocol is valid.
 *
 * @param {String} href
 * @return {Object}
 */
Sanitizer.prototype.url = function (href) {
  var val = href.toLowerCase().match(PROTOCOL_REGEX)

  return {
    protocol: val ? val[1] : false,
    valid: val && this.protocols.indexOf(val[1]) >= 0
  }
}

/**
 * Sanitize.addElements(elements) adds to the list of allowed
 * elements. Takes an array of lowercase tag names.
 *
 * @param {Array} elements
 * @return {Context}
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
 * @return {Context}
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
 * @return {Context}
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
 * @return {Context}
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
 * The transformer will only get called on elements with the given
 * name. If the name is omitted, the filter will be applied to all
 * elements.
 *
 * @param {String} name
 * @param {Function} filter
 * @return {Context}
 */
Sanitizer.prototype.addFilter = function (name, filter) {
  if (typeof name === 'function') {
    filter = name
    name = '*'
  }

  if (!this.filters[name]) this.filters[name] = []

  this.filters[name].push(filter)

  return this
}

/**
 * Sanitize.removeFilter(filter) removes a transformer from the sanitizer.
 *
 * @param {Function} filter
 * @return {Context}
 */
Sanitizer.prototype.removeFilter = function (name, filter) {
  var index

  if (typeof name === 'function') {
    filter = name
    name = '*'
  }

  if (!this.filters[name]) return

  index = this.filters[name].indexOf(filter)
  if (index >= 0) this.filters[name].splice(index, 1)

  return this
}

/**
 * Sanitizer.addTextFormatter(fn) adds the given text formatter.
 *
 * @param {Function} fn
 * @return {Context}
 */
Sanitizer.prototype.addTextFormatter = function (fn) {
  this.textFormatters.push(fn)

  return this
}

/**
 * Sanitizer.removeTextFormatter(fn) removes the given text formatter.
 *
 * @param {Function} fn
 * @return {Context}
 */
Sanitizer.prototype.removeTextFormatter = function (fn) {
  var index = this.textFormatters.indexOf(fn)

  if (index >= 0) this.textFormatters.splice(index, 0)

  return this
}

/**
 * Sanitizer.addProtocols() adds to the list of allowed protocols.
 *
 * @param {Array} protocols
 * @return {Context}
 */
Sanitizer.prototype.addProtocols = function (protocols) {
  this.protocols = this.protocols.concat(protocols)

  return this
}

/**
 * Sanitizer.addProtocols() removes from the list of allowed protocols.
 *
 * @param {Array} protocols
 * @return {Context}
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

Sanitizer.prototype.destroy = function () {

  delete this.attributes
  delete this.elements
  delete this.filters
  delete this.textFormatters
  delete this.protocols

  delete this.emit
}

Sanitizer.plugin = 'sanitizer'

module.exports = Sanitizer
