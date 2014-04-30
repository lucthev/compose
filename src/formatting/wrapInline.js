'use strict';

/**
 * wrapText(parent) wraps the inline children of parent in <p>s.
 * If multiple consecutive children are inline, they are merged into
 * one <p>. Additionally, top-level <div>s are replaced with <p>s.
 *
 * @param {Node} parent
 */
function wrapText (parent) {
  /* jshint validthis:true */
  var node,
      br,
      p,
      i

  for (i = 0; i < parent.childNodes.length; i += 1) {
    node = parent.childNodes[i]

    if (!this.isBlock(node)) {
      p = document.createElement('p')

      if (node.nodeName === 'DIV') {
        while (node.firstChild)
          p.appendChild(node.removeChild(node.firstChild))
      } else {
        p.appendChild(node.cloneNode(true))

        // Merge consecutive inline elements into the same <p>
        while (node.nextSibling && !this.isBlock(node.nextSibling))
          p.appendChild(parent.removeChild(node.nextSibling))
      }

      parent.replaceChild(p, node)

      // Make the node refer to the new <p>; this way, if the new <p>
      // has no text content, it will still get a <br>.
      node = p
    }

    // If a block node has no text content, we make sure it has a
    // <br>. Otherwise, it may not be selectable.
    if (this.isBlock(node)) {

      // Remove whitespace at the beginning of the block.
      while (this.isText(node.firstChild) && !node.firstChild.data.trim())
        node.removeChild(node.firstChild)

      if (!node.textContent && !node.querySelectorAll('br').length &&
          node.nodeName !== 'HR') {
        br = document.createElement('br')

        // We want to append in the innermost element (i.e. if we have
        // <p><b></b></p>, it should end up being <p><b><br></b></p>)
        while (node.lastChild && node.lastChild.nodeType === Node.ELEMENT_NODE)
          node = node.lastChild

        // We don't, however, want it to end up in a marker.
        if (!node.classList.contains('Quill-marker'))
          node.appendChild(br)
        else node.parentNode.insertBefore(br, node.nextSibling)
      }
    }
  }
}

module.exports = wrapText
