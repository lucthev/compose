define(function () {

  // NOTE: this is not a complete list, but it should suit our needs.
  // Note also that it does not include <div>; we'll replace those with <p>
  var blocks = ['address', 'article', 'aside', 'figure', 'figcaption',
    'footer', 'h[1-6]', 'header', 'hr', 'ol', 'ul', 'p', 'pre', 'section']

  var blockRegex = new RegExp('^(' + blocks.join('|') + ')$', 'i')

  /**
   * isBlock(elem) determines if an elements is a block element,
   * according the the above RegExp
   *
   * @param {Node} elem
   * @return Boolean
   */
  function isBlock (elem) {
    return elem && blockRegex.test(elem.nodeName)
  }

  /**
   * wrapText(parent) wraps the inline children of parent in <p>s.
   * If multiple successive children are inline, they are merged into
   * one <p>. Additionally, top-level <div>s are replaced with <p>s.
   *
   * @param {Node} parent
   */
  function wrapText (parent) {
    var node,
        p, i

    for (i = 0; i < parent.childNodes.length; i += 1) {
      node = parent.childNodes[i]

      if (isBlock(node)) continue

      p = document.createElement('p')

      if (node.nodeName === 'DIV') {
        while (node.firstChild)
          p.appendChild(node.removeChild(node.firstChild))

        parent.replaceChild(p, node)
      } else {
        p.appendChild(node.cloneNode(true))

        while (node.nextSibling && !isBlock(node.nextSibling))
          p.appendChild(parent.removeChild(node.nextSibling))

        parent.replaceChild(p, node)
      }
    }
  }

  function insertHTMLPlugin (Quill) {

    function insertHTML (html) {
      var div = document.createElement('div'),
          cleaned,
          spans

      div.innerHTML = html

      // Inserting whitespace-only HTML sometimes causes orphaned <p>s.
      if (!div.textContent.trim()) return

      // We wrap text beforehand so all nodes get filtered;
      // otherwise, text nodes are ignored.
      wrapText(div)

      cleaned = Quill.sanitizer.clean(div)

      // Wrap any nodes that may have been orphaned by sanitization.
      wrapText(cleaned)

      while (div.firstChild)
        div.removeChild(div.firstChild)

      // We need the cleaned HTML as a string.
      div.appendChild(cleaned)

      document.execCommand('insertHTML', false, div.innerHTML)

      // insertHTML may have insert styling <span>s; we remove them.
      spans = Quill.elem.querySelectorAll('span')
      spans = Array.prototype.slice.call(spans)
      spans.forEach(function (span) {

        // We operate only on styling spans.
        // NOTE: this obviously creates problems if people actually
        // want to use styling spans.
        if (!span.hasAttribute('style')) return

        while (span.firstChild)
          span.parentNode
            .insertBefore(span.removeChild(span.firstChild), span)

        span.parentNode.removeChild(span)
      })
    }

    insertHTML.getState = function () {
      document.queryCommandState('insertHTML')
    }

    insertHTML.isEnabled = function () {
      document.queryCommandEnabled('insertHTML')
    }

    return insertHTML
  }

  insertHTMLPlugin.plugin = 'insertHTML'

  return insertHTMLPlugin
})