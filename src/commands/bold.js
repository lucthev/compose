'use strict';

/**
 * boldFilter() is a filter for Compose's sanitizer that turns <b> tags
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
function BoldPlugin (Compose) {

  function Bold () {
    document.execCommand('bold', false, null)
  }

  /**
   * queryCommandState() returns true whenever the font-weight is bold,
   * not just when we're in a <strong>/<b>; we implement our own logic.
   * Bold is true when:
   *
   * (1) The selection is a child of a <strong>
   * (2) The only element in the selection is an <strong>
   *     (e.g. |<strong>One</strong>|)
   *
   * Note that for (2), the following also counts: |<em><strong>One</strong></em>|
   */
  Bold.getState = function () {
    var sel = window.getSelection(),
        node

    if (!sel.rangeCount) return false

    // Check condition (1).
    if (Compose.selection.childOf(/^(STRONG|B)$/i)) return true

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
    return document.queryCommandEnabled('bold') && !Compose.selection.childOf(/^(?:H[1-6])$/)
  }

  Bold.destroy = function () {
    Compose.sanitizer
      .removeElements('strong')
      .removeFilter('b', boldFilter)
  }

  Compose.sanitizer
    .addElements('strong')
    .addFilter('b', boldFilter)

  return Bold
}

BoldPlugin.plugin = 'bold'

module.exports = BoldPlugin
