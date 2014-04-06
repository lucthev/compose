define(function () {

  // The actual plugin 'adapter'.
  function BoldPlugin (Quill) {

    /**
     * toBold() converts <strong> tags in the selection to <b> tags.
     */
    function toBold () {
      Quill.selection.forEachBlock(function (block) {
        var strongs = block.getElementsByTagName('strong')
        strongs = Array.prototype.slice.call(strongs)

        strongs.forEach(function (strong) {
          var b = document.createElement('b')

          // We're assuming strong/b tags will not have attributes
          // that need keeping.
          b.innerHTML = strong.innerHTML

          strong.parentNode.replaceChild(b, strong)
        })
      })
    }

    /**
     * toStrong() converts <b> tags in the selection to <strong> tags.
     */
    function toStrong () {
      Quill.selection.forEachBlock(function (block) {
        var bs = block.getElementsByTagName('b')
        bs = Array.prototype.slice.call(bs)

        bs.forEach(function (b) {
          var strong = document.createElement('strong')

          // We're assuming strong/b tags will not have attributes
          // that need keeping.
          strong.innerHTML = b.innerHTML

          b.parentNode.replaceChild(strong, b)
        })
      })
    }

    function Bold () {
      toBold()
      document.execCommand('bold', false, null)
      toStrong()
    }

    Bold.getState = function() {
      return document.queryCommandState('bold')
    }

    Bold.isEnabled = function () {
      return document.queryCommandEnabled('bold') && !Quill.selection.childOf(/^(?:H[1-6])$/)
    }

    return Bold
  }
  BoldPlugin.plugin = 'bold'

  return BoldPlugin
})