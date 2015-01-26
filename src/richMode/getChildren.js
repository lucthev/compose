/**
 * In rich mode, the editor might look like:
 *
 * <article id="editor" contenteditable="true">
 *   <section class="section-first">
 *     <hr>
 *     <p>Some text.</p>
 *     <p>More, <strong>rich</strong> text.</p>
 *   </section>
 *   <section class="section-last">
 *     <hr>
 *     <h2>New section.</h2>
 *     <p>With even <em>more</em> text.</p>
 *   </section>
 * </article>
 *
 * There are many things (the <section>s, <hr>s) that are not essential
 * to the editing experience; it can be useful to only consider those
 * elements that are relevant.
 *
 * getChildren(), in rich mode, gets the children of the editor that are
 * “relevant” to Compose. getChildren throws an error when there are
 * extraneous elements; if, for example, a block element is coexisting
 * alongside the <section>s, or an inline element is a sibling of a block
 * element.
 *
 * @return {Array}
 */
'use strict';

function ChildPlugin (Compose) {
  var Converter = Compose.require('converter'),
      listRegex = /^[OU]L$/

  function getChildren () {
    var section = Compose.root.firstChild,
        dom = Compose.require('dom'),
        children = [],
        child,
        name,
        li

    while (section) {
      if (!dom.isElement(section) || section.nodeName !== 'SECTION')
        throw new Error('Immediate children of the editor should be sections.')

      child = section.firstChild
      if (child.nodeName !== 'HR')
        throw new Error('Sections should begin with an <hr>.')
      child = child.nextSibling

      while (child) {
        name = child.nodeName
        if (!Converter.allows(name) && !listRegex.test(name)) {
          throw new Error('Sections should only have block elements ' +
            'as children.')
        }

        // Lists are replaced with <li>s.
        if (listRegex.test(child.nodeName)) {
          li = child.firstChild

          while (li) {
            if (li.nodeName !== 'LI')
              throw new Error('Lists should only contain <li>s.')

            children.push(li)

            li = li.nextSibling
          }
        } else
          children.push(child)

        child = child.nextSibling
      }

      section = section.nextSibling
    }

    return children
  }

  Compose.provide('getChildren', getChildren)
}

module.exports = ChildPlugin
