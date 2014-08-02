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

// Block elements to ignore.
var Ignoring = {
  HR: true
}

function ChildPlugin (Compose) {

  Compose.provide('getChildren', function () {
    var node = Compose.elem.firstChild,
        dom = Compose.require('dom'),
        children = [],
        child,
        li

    while (node) {
      if (!dom.isElem(node) || node.nodeName !== 'SECTION')
        throw new Error('Immediate children of the editor should be sections.')

      child = node.firstChild
      while (child) {

        if (Ignoring[child.nodeName]) {
          child = child.nextSibling
          continue
        }

        // TODO: maybe also check that the block element is “allowed?”
        if (!dom.isBlock(child))
          throw new Error('Editor has escaped paragraph mode.')

        // Lists are replaced with <li>s.
        if (/^[OU]L$/.test(child.nodeName)) {
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

      node = node.nextSibling
    }

    return children
  })
}

module.exports = ChildPlugin