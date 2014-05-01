'use strict';

function LinkPlugin (Quill) {

  var Protocols = ['http', 'https', 'mailto']

  function Link (href) {
    var sel = window.getSelection(),
        content,
        range,
        a

    // We can't do anything if there is no selection.
    if (!sel.rangeCount || sel.isCollapsed) return

    if (!href)
      return document.execCommand('unlink', false, null)

    sel = window.getSelection()
    range = sel.getRangeAt(0)
    content = range.extractContents()

    a = document.createElement('a')
    a.setAttribute('href', href)
    range.insertNode(a)
    a.appendChild(content)

    sel.removeAllRanges()
    sel.addRange(range)

    Quill.emit('input')
  }

  /**
   * Quill.link.getState() determines if a link exists in the selection
   * or the selection is a child of a link. Differs significantly from
   * document.queryCommandState('createLink').
   *
   * @return Boolean
   */
  Link.getState = function () {
    return !!Quill.selection.childOf(/^a$/i) ||
      Quill.selection.contains('a')
  }

  Link.isEnabled = function () {
    return !Quill.selection.contains('a')
  }

  Link.destroy = function () {
    Quill.sanitizer
      .removeElements('a')
      .removeAttributes({
        a: ['href']
      })
      .removeProtocols(Protocols)
  }

  Quill.sanitizer
    .addElements('a')
    .addAttributes({
      a: ['href']
    })
    .addProtocols(Protocols)

  return Link
}
LinkPlugin.plugin = 'link'

module.exports = LinkPlugin
