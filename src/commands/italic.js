'use strict';

/**
 * italicFilter() is a filter for Quill's sanitizer that turns <i>
 * tags into <em> tags.
 */
function italicFilter (elem) {
  var em = document.createElement('em'),
      i

  for (i = 0; i < elem.childNodes.length; i += 1)
    em.appendChild(elem.childNodes[i].cloneNode(true))

  return { node: em }
}

function ItalicPlugin (Quill) {

  function Italic () {
    document.execCommand('italic', false, null)
  }

  /**
   * queryCommandState() returns true whenever the font-style is italic,
   * not just when we're in an <em>/<i>; we implement our own logic.
   * Italic is true when:
   *
   * (1) The selection is a child of an <em>
   * (2) The only element in the selection is an <em> (e.g. |<em>One</em>|)
   *
   * Note that for (2), the following also counts: |<b><em>One</em></b>|
   */
  Italic.getState = function () {
    var sel = window.getSelection(),
        child,
        node,
        i

    // If there's no selection, it won't be true.
    if (!sel.rangeCount) return false

    // Check condition (1). We need to check for both <em>s and <i>s
    // because sanitization is deferred until the next event loop; if we
    // check only <em>s, querying too soon would return false.
    if (Quill.selection.childOf(/^(EM|I)$/i)) return true

    // Check condition (2).
    node = sel.getRangeAt(0).cloneContents()

    while (node && !node.previousSibling && !node.nextSibling) {

      // Occasionally, there are bogus text nodes. We remove them.
      for (i = 0; i < node.childNodes.length; i += 1) {
        child = node.childNodes[i]

        if (Quill.node.isText(child) && !child.data)
          node.removeChild(child)
      }

      if (/^(EM|I)$/.test(node.nodeName)) return true

      node = node.firstChild
    }

    return false
  }

  Italic.isEnabled = function () {
    return document.queryCommandEnabled('italic')
  }

  Italic.destroy = function () {
    Quill.sanitizer
      .removeElements('em')
      .removeFilter('i', italicFilter)
  }

  Quill.sanitizer
    .addElements('em')
    .addFilter('i', italicFilter)

  return Italic
}

ItalicPlugin.plugin  = 'italic'

module.exports = ItalicPlugin
