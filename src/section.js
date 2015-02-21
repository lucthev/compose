'use strict';

var dom = require('./dom')

exports.insert = function (View, delta) {
  var handler = View.handlerForElement('SECTION'),
      previousSection,
      section,
      start

  start = View.elements[delta.index - 1]
  start = dom.splitAt(start)

  previousSection = start.parentNode
  section = handler.deserialize(delta.section)

  while (start.nextSibling)
    section.appendChild(dom.remove(start.nextSibling))

  dom.after(previousSection, section)
}

exports.update = function (/*View, delta*/) {

}

exports.remove = function (View, delta) {
  var index = delta.index,
      previous,
      section

  previous = dom._ancestorsAsArray(View.elements[index - 1])[0]
  section = dom.ancestor(View.elements[index], 'SECTION')

  while (section.lastChild.nodeName !== 'HR')
    dom.after(previous, section.removeChild(section.lastChild))

  dom.remove(section)

  dom._merge(View.elements[index - 1], View.elements[index])
}
