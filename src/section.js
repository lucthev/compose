'use strict';

module.exports = SectionOperations

/**
 * Plugin that defines section operations. Currently, not much is done
 * with sections.
 *
 * @param {Compose} Compose
 */
function SectionOperations (Compose) {
  var View = Compose.require('view'),
      dom = Compose.require('dom')

  function serialize (/*section*/) {
    return {}
  }

  function insert (index/*, section*/) {
    var start = View.elements[index],
        previous,
        element

    start = dom.split(start)
    previous = start.parentNode

    element = dom.create('section')
    element.appendChild(dom.create('hr'))

    while (start.nextSibling)
      element.appendChild(dom.remove(start.nextSibling))

    // Insert the first pargraph in the section after the <hr>
    dom.after(element.firstChild, dom.remove(start))
    dom.after(previous, element)
  }

  function update (/*index, section*/) {

  }

  function remove (index) {
    var paragraph,
        section,
        handler,
        elem,
        end,
        i

    section = View.elements[index].parentNode
    while (section.nodeName !== 'SECTION')
      section = section.parentNode

    for (i = 0; i < View.sections.length; i += 1) {
      if (View.sections[i].start !== index)
        continue

      end = View.sections[i] ? View.sections[i].start : View.elements.length
      break
    }

    // Transfer paragraphs from the section being removed to the previous
    // section by removing and reinserting it. In the case that there is a
    // list on either side of the section break, for example, simply moving
    // the elements themselves would result in two adjacent lists (instead
    // of one merged list, which is probably desirable).
    for (i = index; i < end; i += 1) {
      elem = View.elements[i]
      handler = View.handlerForElement(elem)

      paragraph = handler.serialize(elem)
      handler.remove(i) // Not necessary?
      handler.insert(i, paragraph)
    }

    dom.remove(section)
  }

  View.allow({
    elements: ['SECTION', 'HR'],
    paragraphs: [],
    serialize: serialize,
    insert: insert,
    update: update,
    remove: remove
  })
}
