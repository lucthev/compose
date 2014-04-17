define(function () {

  var slice = Array.prototype.slice

  /**
   * flatten(array) flattens an array of arrays.
   *
   * @param {Array} array
   * @return Array
   */
  function flatten (array) {
    var result = [],
        value,
        i, j

    for (i = 0; i < array.length; i += 1) {
      value = array[i]

      if (Array.isArray(value)) {
        value = flatten(value)

        for (j = 0; j < value.length; j += 1)
          result.push(value[j])
      } else result.push(value)
    }

    return result
  }

  /**
   * nonTrivialMutations(mutations) determines if non-trivial mutations
   * occured in the DOM. Trivial mutations are the placement of markers
   * and the addition/removal of empty text nodes.
   *
   * @param {MutationRecord} mutations
   * @return Boolean
   */
  function nonTrivialMutations (mutations) {
    var allMutations,
        relevantMutations

    function notMarker (node) {
      return !(node.nodeType === Node.ELEMENT_NODE &&
        node.className === 'Quill-marker')
    }

    function notEmptyTextNode (node) {
      return !(node.nodeType === Node.TEXT_NODE && !node.data)
    }

    allMutations = flatten(mutations.map(function (mutation) {
      var added = slice.call(mutation.addedNodes),
          removed = slice.call(mutation.removedNodes),
          all = added.concat(removed)

      if (mutation.type === 'attributes')
        all.push(mutation.target)

      return all
    }))

    relevantMutations = allMutations
      .filter(notMarker)
      .filter(notEmptyTextNode)

    return !!relevantMutations.length
  }

  /**
   * makeObserver(Quill) makes a new MutationObserver observing Quill's
   * element; triggers a 'domChange' event when a mutation occurs.
   *
   * @param {Quill} Quill
   * @return MutationObserver
   */
  function makeObserver (Quill) {
    var observer,
        running

    // We don't want to trigger this recursively.
    running = false
    observer = new MutationObserver(function (mutations) {
      if (!running && nonTrivialMutations(mutations)) {
        running = true

        Quill.emit('domChange')

        setTimeout(function () {
          running = false
        }, 0)
      }
    })

    observer.observe(Quill.elem, {
      childList: true,
      attributes: true,
      subtree: true
    })

    return observer
  }

  return makeObserver
})