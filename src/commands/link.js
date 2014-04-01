define(function () {

  function LinkPlugin (Quill) {

    function Link (href) {
      if (href) {
        href += ''
        document.execCommand('createLink', false, href)
      }
    }

    /**
     * Quill.link.getState() determines if a link exists in the selection.
     * Differs significantly from document.queryCommandState('createLink').
     *
     * @return Boolean
     */
    Link.getState = function () {
      return Quill.selection.contains('a')
    }

    Link.isEnabled = function () {
      return !Quill.selection.contains('a')
    }

    return Link
  }
  LinkPlugin.plugin = 'link'

  return LinkPlugin
})