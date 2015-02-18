'use strict';

var dom = require('./dom')

exports.insert = function (View, delta) {
  var handler = View.handlerForElement('SECTION'),
      previousSection,
      section,
      start

  start = View.elements[delta.index]
  start = dom.splitAt(start)

  previousSection = start.parentNode
  section = handler.deserialize(delta.section)

  while (start.nextSibling)
    section.appendChild(dom.remove(start.nextSibling))

  // Insert the first paragraph in the section after the HR
  dom.after(section.firstChild, dom.remove(start))
  dom.after(previousSection, section)
}

exports.update = function (/*View, delta*/) {

}

exports.remove = function (View, delta) {
  var previous = View.paragraphs[delta.index - 1],
      current = View.paragraphs[delta.index],
      previousSection,
      section,
      len,
      i

  section = current.parentNode
  while (section.nodeName !== 'SECTION')
    section = section.parentNode

  previousSection = section.previousSibling

  while (section.lastChild.nodeName !== 'HR')
    dom.after(previous, dom.remove(section.lastChild))

  dom.remove(section)

  // Join “nested” elements the removal might have brought together
  // (e.g. two OL > LIs)
  previous = ancestorsAsArray(previous)
  current = ancestorsAsArray(current)

  len = Math.min(current.length, previous.length) - 1
  for (i = 0; i < len; i += 1) {
    if (current[i].nodeName !== previous[i].nodeName)
      break

    while (current[i].lastChild)
      dom.after(previous[i + 1], dom.remove(current[i].lastChild))

    dom.remove(current[i])
  }
}

// Utility function copied from paragraph.js.
// TODO(luc): maybe find a way to share this code? Underscored methods
// in the dom module, perhaps.
function ancestorsAsArray (element) {
  var ancestors = [element]

  while (element.parentNode && element.parentNode.nodeName !== 'SECTION') {
    element = element.parentNode
    ancestors.unshift(element)
  }

  return ancestors
}
