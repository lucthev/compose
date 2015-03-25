'use strict'

var paragraph = require('./paragraph')
var section = require('./section')
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
  var paragraphs = View.paragraphs
  var index = delta.index

  switch (delta.type) {
    case 'paragraphInsert':
      if (index <= 0 || index > paragraphs.length) {
        throw RangeError('Cannot insert a paragraph at index ' + index)
      }

      break

    case 'paragraphUpdate':
      if (index < 0 || index >= paragraphs.length) {
        throw RangeError('Cannot update a paragraph at index ' + index)
      }

      break

    case 'paragraphDelete':
      if (index < 0 || index >= paragraphs.length) {
        throw RangeError('Cannot remove paragraph at index ' + index)
      }

      if ((View.isSectionStart(index + 1) || index >= paragraphs.length - 1) &&
          View.isSectionStart(index)) {
        throw Error('Cannot remove the only paragraph in a section.')
      }

      break

    case 'sectionInsert':
      if (index < 0 || index >= paragraphs.length) {
        throw RangeError('Cannot create section starting at index ' + index)
      }

      if (View.isSectionStart(index)) {
        throw Error('An existing section begins at index ' + index)
      }

      break

    case 'sectionUpdate':
      if (!View.isSectionStart(index)) {
        throw Error('Cannot update non-existant section at index ' + index)
      }

      break

    case 'sectionDelete':
      if (index === 0) {
        throw Error('The first section cannot be removed.')
      }

      if (!View.isSectionStart(index)) {
        throw Error('Cannot remove non-existant section at index ' + index)
      }

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
  var paragraphs = View.paragraphs
  var sections = View.sections
  var index = delta.index
  var i

  switch (delta.type) {
    case 'paragraphInsert':
      paragraphs.splice(index, 0, delta.paragraph.substr(0))
      for (i = 0; i < sections.length; i += 1) {
        if (sections[i].start >= delta.index) {
          sections[i].start += 1
        }
      }
      break

    case 'paragraphUpdate':
      paragraphs[index] = delta.paragraph.substr(0)
      break

    case 'paragraphDelete':
      paragraphs.splice(index, 1)
      for (i = 0; i < sections.length; i += 1) {
        if (sections[i].start > index) {
          sections[i].start -= 1
        }
      }
      break

    case 'sectionInsert':
      for (i = 0; i < sections.length; i += 1) {
        if (sections[i].start > delta.index) {
          break
        }
      }

      sections.splice(i, 0, delta.section)
      break

    case 'sectionUpdate':
      for (i = 0; i < sections.length; i += 1) {
        if (sections[i].start !== index) {
          continue
        }

        sections[i] = delta.section
        break
      }
      break

    case 'sectionDelete':
      for (i = 0; i < sections.length; i += 1) {
        if (sections[i].start !== delta.index) {
          continue
        }

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
    case 'paragraphInsert':
      paragraph.insert(View, delta)
      break

    case 'paragraphUpdate':
      paragraph.update(View, delta)
      break

    case 'paragraphDelete':
      paragraph.remove(View, delta)
      break

    case 'sectionInsert':
      section.insert(View, delta)
      break

    case 'sectionUpdate':
      section.update(View, delta)
      break

    case 'sectionDelete':
      section.remove(View, delta)
      break
  }
}
