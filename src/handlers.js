'use strict'

module.exports = Handlers

/**
 * The Handler plugin keeps track of handlers for elements and paragraphs.
 *
 * @param {Compose} Compose
 */
function Handlers (Compose) {
  var Serialize = Compose.require('serialize')
  var dom = Compose.require('dom')

  var handlers = [{
    elements: ['P'],
    paragraphs: ['p'],
    serialize: function (element) {
      return new Serialize(element)
    },
    deserialize: function (paragraph) {
      return [paragraph.toElement()]
    }
  }, {
    _isSectionHandler: true,
    elements: ['SECTION', 'HR'],
    paragraphs: [],
    serialize: function (/*section*/) {
      return {}
    },
    deserialize: function (/*obj*/) {
      var section = dom.create('section')

      section.appendChild(dom.create('hr'))
      return section
    }
  }]

  /**
   * forElement(elem) returns the handler for the given element, or
   * null if the element has no handler.
   *
   * @param {Element} elem
   * @return {Object}
   */
  function forElement (elem) {
    for (var i = 0; i < handlers.length; i += 1) {
      if (handlers[i].elements.indexOf(elem.nodeName) >= 0) {
        return handlers[i]
      }
    }

    return null
  }

  /**
   * forParagraph(p) returns the handler for the given paragraph; raises
   * an error if no handler exists.
   *
   * @param {Serialize} p
   * @return {Object}
   */
  function forParagraph (p) {
    for (var i = 0; i < handlers.length; i += 1) {
      if (handlers[i].paragraphs.indexOf(p.type) >= 0) {
        return handlers[i]
      }
    }

    var err = TypeError('No handler for paragraphs of type ' + p.type)
    Compose.emit('error', err)
  }

  /**
   * addHandler(handler) adds the given handler to the list of handlers.
   *
   * @param {Object} handler
   */
  function addHandler (handler) {
    handlers.push(handler)
  }

  /**
   * getElements() returns an array of all supported elements.
   *
   * @return {Array}
   */
  function getElements (opts) {
    opts = opts || {}

    var names = handlers.reduce(function (list, handler) {
      if (handler._isSectionHandler) {
        if (opts.withSections) {
          list.push('SECTION')
        }

        return list
      }

      return list.concat(handler.elements)
    }, [])

    return [].slice.call(Compose.root.querySelectorAll(names.join()))
  }

  Compose.provide('handler', {
    forElement: forElement,
    forParagraph: forParagraph,
    addHandler: addHandler,
    getElements: getElements
  })
}
