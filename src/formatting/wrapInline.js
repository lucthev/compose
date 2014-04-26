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

// TODO: let plugins tap into an event or something of the sort
// that would let them take action on the sanitized HTML; for
// example, the link plugin could remove links with no href or links
// with no text content.

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

    // If a block node has no text content, we make sure it has a
    // <br>. Otherwise, it may not be selectable.
    // TODO: we may not want <br>s in all block elements (e.g. <hr>)
    if (isBlock(node)) {
      if (!node.textContent && !node.querySelectorAll('br').length &&
          node.nodeName !== 'HR') {
        br = document.createElement('br')

        while (node.lastChild && node.lastChild.nodeType === Node.ELEMENT_NODE)
          node = node.lastChild

        if (node.className !== 'Quill-marker')
          node.appendChild(br)
        else node.parentNode.insertBefore(br, node)
      }

      continue
    }

    p = document.createElement('p')

    if (node.nodeName === 'DIV') {
      while (node.firstChild)
        p.appendChild(node.removeChild(node.firstChild))

      parent.replaceChild(p, node)
    } else {
      p.appendChild(node.cloneNode(true))

      // Merge consecutive inline elements into the same <p>
      while (node.nextSibling && !isBlock(node.nextSibling))
        p.appendChild(parent.removeChild(node.nextSibling))

      parent.replaceChild(p, node)
    }
  }
}

module.exports = wrapText
