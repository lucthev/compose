'use strict';

var Delta = require('./delta')

/**
 * validate(View, delta) performs a validation check on the given
 * Delta, ensuring it can be applied cleanly to the given View.
 * If the Delta is invalid, an error is thrown.
 *
 * @param {View} View
 * @param {Delta} delta
 */
exports.validate = function (View, delta) {
  var paragraphs = View.paragraphs,
      index = delta.index

  switch (delta.type) {
    case Delta.types.paragraphInsert:
      if (index <= 0 || index > paragraphs.length)
        throw RangeError('Cannot insert a paragraph at index ' + index)

      break

    case Delta.types.paragraphUpdate:
      if (index < 0 || index >= paragraphs.length)
        throw RangeError('Cannot update a paragraph at index ' + index)

      break

    case Delta.types.paragraphDelete:
      if (index < 0 || index >= paragraphs.length)
        throw RangeError('Cannot remove paragraph at index ' + index)

      if ((View.isSectionStart(index + 1) || index === paragraphs.length) &&
          View.isSectionStart(index))
        throw Error('Cannot remove the only paragraph in a section.')

      break

    case Delta.types.sectionInsert:
      if (index < 0 || index >= paragraphs.length)
        throw RangeError('Cannot create section starting at index ' + index)
      if (View.isSectionStart(index))
        throw Error('An existing section begins at index ' + index)

      break

    case Delta.types.sectionUpdate:
      if (!View.isSectionStart(index))
        throw Error('Cannot update non-existant section at index ' + index)

      break

    case Delta.types.sectionDelete:
      if (index === 0)
        throw Error('The first section cannot be removed.')
      if (!View.isSectionStart(index))
        throw Error('Cannot remove non-existant section at index ' + index)

      break

    default:
      throw TypeError(delta.type + ' is not a valid Delta type')
  }
}

/**
 * inline(View, delta) resolves a delta against the given View
 * (i.e. updates the View to reflect the changes represented by the delta).
 *
 * @param {View} View
 * @param {Delta} delta
 */
exports.inline = function (View, delta) {
  var paragraphs = View.paragraphs,
      sections = View.sections,
      index = delta.index,
      i

  switch (delta.type) {
    case Delta.types.paragraphInsert:
      paragraphs.splice(index, 0, delta.paragraph)
      for (i = 0; i < sections.length; i += 1) {
        if (sections[i].start >= delta.index)
          sections[i].start += 1
      }
      break

    case Delta.types.paragraphUpdate:

      // Make note of the type of the previous paragraph. This information
      // will be sued when swapping out paragraphs in the DOM; when a change
      // of types occurs, we need to remove the old paragraph using one
      // handler and insert the new paragraph using another.
      delta._oldType = paragraphs[index].type

      paragraphs[index] = delta.paragraph
      break

    case Delta.types.paragraphDelete:

      // Splice out the paragraph; append it to the Delta, because it will
      // be used later in resolve.DOM to determine what handler should
      // remove the paragraph.
      delta.paragraph = paragraphs[index]
      paragraphs.splice(index, 1)

      for (i = 0; i < sections.length; i += 1) {
        if (sections[i].start > index)
          sections[i].start -= 1
      }
      break

    case Delta.types.sectionInsert:
      for (i = 0; i < sections.length; i += 1) {
        if (sections[i].start > delta.index)
          break
      }

      sections.splice(i, 0, delta.section)
      break

    case Delta.types.sectionUpdate:
      for (i = 0; i < sections.length; i += 1) {
        if (sections[i].start !== index)
          continue

        sections[i] = delta.section
        break
      }
      break

    case Delta.types.sectionDelete:
      for (i = 0; i < sections.length; i += 1) {
        if (sections[i].start !== delta.index)

        sections.splice(i, 1)
        break
      }
      break
  }
}

/**
 * DOM(View, delta) resolves a delta against the DOM.
 *
 * @param {View} View
 * @param {Delta} delta
 */
exports.DOM = function (View, delta) {
  var handler

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

      // If the update operation changed the type: remove, then insert
      // the two paragraphs. Presumably, the handler for one type of
      // paragraph won’t know how to properly handle element of the
      // other type.
      if (delta.paragraph.type !== delta._oldType) {
        handler.insert(delta.index + 1, delta.paragraph)
        View.handlerForParagraph(delta._oldType).remove(delta.index)
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
  }
}
