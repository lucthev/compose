'use strict';

function LinkPlugin (Quill) {

  var Protocols = ['http', 'https', 'mailto']

  function Link (href) {
    if (href) {
      href += ''
      document.execCommand('createLink', false, href)
    } else document.execCommand('unlink', false, null)
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
