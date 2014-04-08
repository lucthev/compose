define(['vendor/sanitize/sanitize.js'], function (Sanitize) {

  /**
   * Sanitize.addElements(elements) adds to the list of allowed
   * elements. Takes an array of lowercase tag names.
   *
   * @param {Array} elements
   */
  Sanitize.prototype.addElements = function (elements) {
    if (typeof elements === 'string')
      this.allowed_elements[elements] = true
    else if (Array.isArray(elements)) {
      elements.forEach(function (elem) {
        this.allowed_elements[elem] = true
      }.bind(this))
    } else
      throw new TypeError('Sanitize.addElements should be passed a String or an Array.')
  }

  /**
   * Sanitize.addAttributes(attributes) adds attributes allowed on an
   * element.
   * See (https://github.com/gbirke/Sanitize.js#attributes-object)
   *
   * @param {Object} attributes
   */
  Sanitize.prototype.addAttributes = function (attributes) {
    Object.keys(attributes).forEach(function (key) {
      var allowed = this.config.attributes[key] || []

      attributes[key].forEach(function (attr) {
        if (allowed.indexOf(attr) < 0)
          allowed.push(attr)
      })

      this.config.attributes[key] = allowed
    }.bind(this))
  }

  /**
   * Sanitize.addFilter(filter) add a transformer to the sanitizer.
   * (see https://github.com/gbirke/Sanitize.js#transformers)
   *
   * @param {Function}
   */
  Sanitize.prototype.addFilter = function (filter) {
    if (typeof filter !== 'function')
      throw new TypeError('Sanitizing filters must be functions.')

    this.transformers.push(filter)
  }

  /**
   * Sanitize.addProtocols(protocols) adds protocols allowed in certain
   * attributes.
   * See (https://github.com/gbirke/Sanitize.js#protocols-object)
   *
   * @param {Object} protocols
   */
  Sanitize.prototype.addProtocols = function (protocols) {
    Object.keys(protocols).forEach(function (tagName) {
      var tag = this.config.protocols[tagName] || {}

      Object.keys(protocols[tagName]).forEach(function (attr) {
        var allowed = tag[attr] || []

        protocols[tagName][attr].forEach(function (pcol) {
          if (allowed.indexOf(pcol) < 0)
            allowed.push(pcol)
        })

        tag[attr] = allowed
      })

      this.config.protocols[tagName] = tag
    }.bind(this))
  }

  // An alias for Sanitize.clean_node().
  Sanitize.prototype.clean = Sanitize.prototype.clean_node

  // Plugin name.
  Sanitize.plugin = 'sanitizer'

  return Sanitize
})