'use strict';

/**
 * This module sets up the editor when in rich mode. Adds the paragraphs
 * to the view, etc. Assumes a valid layout (i.e. something getChildren)
 * won’t complain about.
 *
 * TODO: more leniency. Basic: putting in a paragraph if the editor is empty.
 * Advanced: coercing lousy markup into something Compose can consume.
 */
function setup (Compose) {
  var View = Compose.require('view'),
      getChildren = Compose.require('getChildren'),
      Converter = Compose.require('converter'),
      numHrs = 0,
      paragraphs,
      children,
      section,
      i

  paragraphs = Object.keys(Converter.allows)
  paragraphs.push('hr')
  paragraphs = paragraphs.join(',')
  paragraphs = Compose.elem.querySelectorAll(paragraphs)

  if (!paragraphs.length)
    throw new Error('The editor must have at least one paragraph.')

  for (i = 0; i < paragraphs.length; i += 1) {
    if (paragraphs[i].nodeName === 'HR') {
      section = Converter.toSectionObj(paragraphs[i].parentNode)
      section.start = i - numHrs
      View.sections.push(section)

      numHrs += 1
      continue
    }

    View.paragraphs.push(Converter.toParagraph(paragraphs[i]))
  }

  children = getChildren()
  if (children.length !== paragraphs.length - numHrs)
    throw new Error('Failed to properly initialize Compose.')
}

module.exports = setup
