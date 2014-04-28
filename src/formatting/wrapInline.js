'use strict';

var blocks = ['address', 'article', 'aside', 'blockquote', 'figure',
  'figcaption', 'footer', 'h[1-6]', 'header', 'hr', 'ol', 'ul', 'p',
  'pre', 'section']

var blockRegex = new RegExp('^(' + blocks.join('|') + ')$', 'i')

/**
 * isBlock(elem) determines if an elements is a block element
 * according to the above RegExp.
 *
 * @param {Node} elem
 * @return Boolean
 */
function isBlock (elem) {
  return elem && blockRegex.test(elem.nodeName)
}

/**
 * wrapText(parent) wraps the inline children of parent in <p>s.
 * If multiple consecutive children are inline, they are merged into
 * one <p>. Additionally, top-level <div>s are replaced with <p>s.
 *
 * @param {Node} parent
 */
function wrapText (parent) {
  var node,
      br,
      p,
      i

  for (i = 0; i < parent.childNodes.length; i += 1) {
    node = parent.childNodes[i]

    if (!isBlock(node)) {
      p = document.createElement('p')

      if (node.nodeName === 'DIV') {
        while (node.firstChild)
          p.appendChild(node.removeChild(node.firstChild))
      } else {
        p.appendChild(node.cloneNode(true))

        // Merge consecutive inline elements into the same <p>
        while (node.nextSibling && !isBlock(node.nextSibling))
          p.appendChild(parent.removeChild(node.nextSibling))
      }

      parent.replaceChild(p, node)

      // Make the node refer to the new <p>; this way, if the new <p>
      // has no text content, it will still get a <br>.
      node = p
    }

    // If a block node has no text content, we make sure it has a
    // <br>. Otherwise, it may not be selectable.
    if (isBlock(node)) {

      // Replace whitespace at the beginning of the block.
      node.innerHTML = node.innerHTML.replace(/^\s+/, '')

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
