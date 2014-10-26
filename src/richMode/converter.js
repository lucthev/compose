'use strict';

/**
 * ConversionEvent(from, to) creates a conversion event object; 'from'
 * and 'to' are the start and end products of the conversion,
 * respectively.
 *
 * @param {Element || Object} from
 * @param {Element || Object} to
 */
function ConversionEvent (from, to) {
  this.from = from
  this.to = to

  this.direction = from.nodeType ? 'object' : 'element'

  if ((from.nodeType ? from : to).nodeName === 'SECTION')
    this.type = 'section'
  else
    this.type = 'paragraph'
}

/**
 * A module for converting between elements and their abstract
 * representations. Also defines what types of paragraphs are allowed.
 *
 * TODO: things with sections.
 *
 * @require {serialize}
 * @provide {converter}
 * @emit {conversion}
 */
function Converter (Compose) {
  var Serialize = Compose.require('serialize'),
      allowed

  // The allowed paragraph types.
  allowed = {
    p: 1,
    h2: 1,
    h3: 1,
    pre: 1,
    blockquote: 1,
    li: 1
  }

  /**
   * allows(name) determines if an element with the given name is allowed
   * in the editor. Can be used as a function or an object.
   *
   * @param {String} name
   * @return {Boolean}
   */
  function allows (name) {
    return !!allowed[name.toLowerCase()]
  }

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
    var result = new Serialize(elem),
        evt

    // <li>s arbitrarily default to being ordered list items.
    if (elem.nodeName === 'LI' && (!elem.parentNode ||
        !/^[OU]L$/.test(elem.parentNode.nodeName)))
      result.type = 'OL'
    else if (elem.nodeName === 'LI')
      result.type = elem.parentNode.nodeName.toLowerCase()
    else if (elem.classList.contains('pullquote'))
      result.type = 'pullquote'

    if (elem.hasAttribute('data-align'))
      result.align = elem.getAttribute('data-align')

    evt = new ConversionEvent(elem, result)
    Compose.emit('conversion', evt)

    return evt.to
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
        elem,
        evt

    if (/^[ou]l$/.test(type)) {
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

    evt = new ConversionEvent(paragraph, base)
    Compose.emit('conversion', evt)

    return evt.to
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
    var section = {},
        evt

    if (!elem) return section

    if (elem.nodeName !== 'SECTION')
      throw new Error('Cannot create a section object for ' + elem)

    // TODO: things with sections.
    evt = new ConversionEvent(elem, section)
    Compose.emit('conversion', evt)

    return evt.to
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
    var elem = document.createElement('section'),
        hr = document.createElement('hr'),
        evt

    hr.setAttribute('contenteditable', false)
    elem.appendChild(hr)

    if (!section) return elem

    // TODO: things with sections.
    evt = new ConversionEvent(section, elem)
    Compose.emit('conversion', evt)

    return evt.to
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
