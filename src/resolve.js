'use strict';

var paragraph = require('./paragraph'),
    section = require('./section'),
    Delta = require('./delta')

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
      paragraphs.splice(index, 0, delta.paragraph.substr(0))
      for (i = 0; i < sections.length; i += 1) {
        if (sections[i].start >= delta.index)
          sections[i].start += 1
      }
      break

    case Delta.types.paragraphUpdate:
      paragraphs[index] = delta.paragraph.substr(0)
      break

    case Delta.types.paragraphDelete:
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
  switch (delta.type) {
    case Delta.types.paragraphInsert:
      paragraph.insert(View, delta)
      break

    case Delta.types.paragraphUpdate:
      paragraph.update(View, delta)
      break

    case Delta.types.paragraphDelete:
      paragraph.remove(View, delta)
      break

    case Delta.types.sectionInsert:
      section.insert(View, delta)
      break

    case Delta.types.sectionUpdate:
      section.update(View, delta)
      break

    case Delta.types.sectionDelete:
      section.remove(View, delta)
      break
  }
}
