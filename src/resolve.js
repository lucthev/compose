'use strict';

var Delta = require('../delta')

/**
 * inline(View, delta) resolves a delta against the given View
 * (i.e. updates the View to reflect the changes represented by the delta).
 *
 * @param {View} View
 * @param {Delta} delta
 */
exports.inline = function (View, delta) {
  var paragraphs = View.paragraphs,
      index = delta.index,
      i

  switch (delta.type) {
    case Delta.paragraphInsert:
      if (index <= 0 || index > paragraphs.length)
        throw RangeError('Cannot insert a paragraph at index ' + index)

      View.paragraphs.splice(index, 0, delta.paragraph)
      for (i = 0; i < View.sections.length; i += 1) {
        if (View.sections[i].start >= delta.index)
          View.sections[i].start += 1
      }
      break

    case Delta.paragraphUpdate:
      if (index < 0 || index >= paragraphs.length)
        throw RangeError('Cannot update a paragraph at index ' + index)

      View.paragraphs[index] = delta.paragraph
      break

    case Delta.paragraphDelete:
      if (index < 0 || index >= paragraphs.length)
        throw RangeError('Cannot remove paragraph at index ' + index)

      if ((View.isSectionStart(index + 1) || index === paragraphs.length) &&
          View.isSectionStart(index))
        throw Error('Cannot remove the only paragraph in a section.')

      View.paragraphs.splice(index, 1)
      for (i = 0; i < View.sections.length; i += 1) {
        if (View.sections[i].start > index)
          View.sections[i].start -= 1
      }
      break

    case Delta.sectionInsert:
      if (index < 0 || index >= paragraphs.length)
        throw RangeError('Cannot create section starting at index ' + index)

      for (i = 0; i < View.sections.length; i += 1) {
        if (View.sections[i].start > delta.index)
          break
      }

      View.sections.splice(i, 0, delta.section)
      break

    case Delta.sectionUpdate:
      if (!View.isSectionStart(index))
        throw Error('Cannot update non-existant section at index ' + index)

      for (i = 0; i < View.sections.length; i += 1) {
        if (View.sections[i].start !== index)
          continue

        View.sections[i] = delta.section
        break
      }
      break

    case Delta.sectionDelete:
      if (index === 0)
        throw Error('The first section cannot be removed.')
      if (!View.isSectionStart(index))
        throw Error('Cannot remove non-existant section at index ' + index)

      for (i = 0; i < View.sections.length; i += 1) {
        if (View.sections[i].start !== delta.index)

        View.sections.splice(i, 1)
        break
      }
      break

    default:
      throw TypeError(delta.type + ' is not a valid Delta type')
  }
}

/**
 * DOM(View, delta) resolves a delta against the DOM.
 *
 * @param {View} View
 * @param {Delta} delta
 */
exports.DOM = function (View, delta) {
  var previous,
      handler

  if (delta.paragraph)
    handler = View.handlerForParagraph(delta.paragraph.type)
  else
    handler = View.handlerForElement('section')

  if (!handler)
    throw Error('No handler for paragraphs of type ' + delta.paragraph.type)

  switch (delta.type) {
    case Delta.types.paragraphInsert:
      handler.insert(delta.index, delta.paragraph)
      break

    case Delta.types.paragraphUpdate:
      previous = View.paragraphs[delta.index]

      // If the update operation changed the type: remove, then insert
      // the two paragraphs. Presumably, the handler for one type of
      // paragraph won’t know how to properly handle element of the
      // other type.
      if (delta.paragraph.type !== previous.type) {
        handler.insert(delta.index + 1, delta.paragraph)
        View.handlerForParagraph(previous.type).remove(delta.index)
      } else {
        handler.update(delta.index, delta.paragraph)
      }
      break

    case Delta.types.paragraphDelete:
      handler.remove(delta.index)
      break

    case Delta.types.sectionInsert:
      handler.insert(delta.index, delta.section)
      break

    case Delta.types.sectionUpdate:
      handler.update(delta.index, delta.section)
      break

    case Delta.types.sectionDelete:
      handler.remove(delta.index)
      break

    // Note that we don’t really have to check for invalid Delta
    // types at this point; it’s been done in inlineResolve().
  }
}


