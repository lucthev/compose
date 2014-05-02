'use strict';

/**
 * boldFilter() is a filter for Quill's sanitizer that turns <b> tags
 * into <strong> tags.
 */
function boldFilter (elem) {
  var strong = document.createElement('strong'),
      i

  for (i = 0; i < elem.childNodes.length; i += 1)
    strong.appendChild(elem.childNodes[i].cloneNode(true))

  return { node: strong }
}

// The actual plugin 'adapter'.
function BoldPlugin (Quill) {

  function Bold () {
    document.execCommand('bold', false, null)
  }

  /**
   * queryCommandState() returns true whenever the font-style or
   * font-weight is bold, not just when we're in a <strong>/<b>;
   * we implement our own logic. Bold is true when:
   *
   * (1) The selection is a child of an <strong>
   * (2) The only element in the selection is an <strong>
   * (e.g. |<strong>One</strong>|)
   *
   * Note that for (2), the following also counts: |<em><strong>One</strong></em>|
   */
  Bold.getState = function () {
    var sel = window.getSelection(),
        node

    // If there's no selection, it won't be true.
    if (!sel.rangeCount) return false

    // Check condition (1). We need to check for both <strong>s and <b>s
    // because sanitization is deferred until the next event loop; if we
    // check only <strong>s, querying too soon would return false.
    if (Quill.selection.childOf(/^(STRONG|B)$/i)) return true

    // Check condition (2).
    node = sel.getRangeAt(0).cloneContents()

    // Occasionally, there are bogus text nodes. Normalizing removes them.
    node.normalize()

    while (node && !node.previousSibling && !node.nextSibling) {
      if (/^(STRONG|B)$/.test(node.nodeName)) return true

      node = node.firstChild
    }

    return false
  }

  Bold.isEnabled = function () {
    return document.queryCommandEnabled('bold') && !Quill.selection.childOf(/^(?:H[1-6])$/)
  }

  Bold.destroy = function () {
    Quill.sanitizer
      .removeElements('strong')
      .removeFilter('b', boldFilter)
  }

  Quill.sanitizer
    .addElements('strong')
    .addFilter('b', boldFilter)

  return Bold
}

BoldPlugin.plugin = 'bold'

module.exports = BoldPlugin
