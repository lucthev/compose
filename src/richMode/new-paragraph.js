'use strict';

module.exports = ParagraphOperations

/**
 * ParagraphOperations() defines the set of basic paragraph operations
 * (see also: View#allow).
 *
 * @param {Compose} Compose
 */
function ParagraphOperations (Compose) {
  var Serialize = Compose.require('serialize'),
      View = Compose.require('view'),
      dom = Compose.require('dom')

  function serialize (element) {
    return new Serialize(element)
  }

  function insert (index, serialization) {
    var element = serialization.toElement(),
        previous = View.elements[index - 1]

    View.elements.splice(index, 0, element)
    previous = dom.split(previous)
    dom.after(previous, element)
  }

  function update (index, serialization) {
    var element = serialization.toElement(),
        current = View.elements[index]

    dom.replace(current, element)
    View.elements[index] = element
  }

  function remove (index) {
    dom.remove(View.elements[index])
    View.elements.splice(index, 1)
  }

  View.allow({
    elements: ['P'],
    paragraphs: ['p'],
    serialize: serialize,
    insert: insert,
    update: update,
    remove: remove
  })
}
