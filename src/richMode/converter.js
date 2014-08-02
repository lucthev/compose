'use strict';

/**
 * A module for converting between elements and their abstract
 * representations. Also defines what types of paragraphs are allowed.
 *
 * TODO: things with sections.
 *
 * @require {serialize}
 * @provide {converter}
 */
function Converter (Compose) {
  var Serialize = Compose.require('serialize'),
      listRegex = /^[ou]l$/,
      allowed

  // The allowed paragraph types.
  allowed = ['p', 'h1', 'h2', 'h3', 'pre', 'blockquote', 'li']

  /**
   * allows(name) determines if an element with the given name is allowed
   * in the editor. Can be used as a function or an object.
   *
   * @param {String} name
   * @return {Boolean}
   */
  function allows (name) {
    return !!allows[name.toLowerCase()]
  }

  // So the allows can be used as an object.
  allowed.forEach(function (key) {
    allows[key] = 1
  })

  /**
   * toParagraph(elem) converts an element to a serialization. The
   * result may have a special type (e.g. type: pullquote for pullquotes)
   * which does not correspond to an element; use Converter.toElement
   * to convert the resulting paragraph back into an element.
   *
   * @param {Element} elem
   * @return {Serialize}
   */
  function toParagraph (elem) {
    var result = new Serialize(elem)

    if (elem.nodeName === 'LI' && elem.parentNode)
      result.type = elem.parentNode.nodeName.toLowerCase()
    else if (elem.classList.contains('pullquote'))
      result.type = 'pullquote'

    if (elem.hasAttribute('data-align'))
      result.align = elem.getAttribute('data-align')

    return result
  }

  /**
   * toElement(paragraph) converts a serialization returned by Converter
   * .toParagraph() back into an element. In the case that the element
   * should be a child, as in the case of list items, the returned
   * element may have detached parent nodes. So for a paragraph representing
   * an ordered list item, the following tree fragment will be created;
   * the returned element will be the <li>:
   *   <ol><li>(text)</li></ol>
   *
   * @param {Serialize}
   * @return {Element}
   */
  function toElement (paragraph) {
    var type = paragraph.type,
        base,
        elem

    if (listRegex.test(type)) {
      paragraph.type = 'li'
      base = paragraph.toElement()
      paragraph.type = type

      elem = document.createElement(type)
      elem.appendChild(base)
    } else if (type === 'pullquote') {
      paragraph.type = 'blockquote'
      base = paragraph.toElement()
      paragraph.type = type

      base.classList.add('pullquote')
    } else {
      base = paragraph.toElement()
    }

    if (paragraph.align)
      base.setAttribute('data-align', paragraph.align)

    return base
  }

  /**
   * canMerge(first, second) determines if two elements can be merged
   * into one.
   *
   * @param {Element} first
   * @param {Element} second
   * @return {Boolean}
   */
  function canMerge (first, second) {
    var firstName,
        secondName

    if (!first || !second || first === second)
      return false

    firstName = first.nodeName
    secondName = second.nodeName

    if (!/^[OU]L$/.test(firstName) || firstName !== secondName)
      return false

    return first.className === second.className
  }

  /**
   * toSectionObj(elem) converts a section to its abstract representation.
   * Note that this does not set the section’s "start" property. If this
   * function is called with no arguments, returns the object corresponding
   * to a plain section element.
   *
   * @param {Element} elem
   * @return {Object}
   */
  function toSectionObj (elem) {
    var section = {}

    if (!elem) return section

    if (elem.nodeName !== 'SECTION')
      throw new Error('Cannot create a section object for ' + elem)

    // TODO: things with sections.

    return section
  }

  /**
   * toSectionElem(section) converts an abstract representation of a
   * section into the corresponding element. If this function is called
   * with no arguments, it returns a plain section element.
   *
   * @param {Object} section
   * @return {Element}
   */
  function toSectionElem (section) {
    var elem = document.createElement('section')

    elem.appendChild(document.createElement('hr'))

    if (!section) return elem

    // TODO: things with sections.

    return elem
  }

  Compose.provide('converter', {
    toParagraph: toParagraph,
    toElement: toElement,
    canMerge: canMerge,
    allows: allows,
    toSectionElem: toSectionElem,
    toSectionObj: toSectionObj
  })
}

module.exports = Converter
