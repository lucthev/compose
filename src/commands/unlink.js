define(function () {

  function UnlinkPlugin (Quill) {

    function Unlink () {
      document.execCommand('unlink', false, null)
      console.log(this.unlink.getState())
    }

    /**
     * Quill.unlink.getState() determines if there are no links in the
     * selection.
     *
     * @return Boolean
     */
    Unlink.getState = function () {
      return !Quill.selection.contains('a')
    }

    /**
     * Quill.unlink.isEnabled() determines if there are any links in
     * the selection (that is, if unlink would have any effect).
     *
     * @return Boolean
     */
    Unlink.isEnabled = function () {
      return Quill.selection.contains('a')
    }

    return Unlink
  }
  UnlinkPlugin.plugin = 'unlink'

  return UnlinkPlugin
})