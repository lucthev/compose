define(function () {

  var blocks = ['address', 'article', 'aside', 'figure', 'figcaption',
    'footer', 'h[1-6]', 'header', 'hr', 'ol', 'ul', 'p', 'pre', 'section']

  var blockRegex = new RegExp('^(' + blocks.join('|') + ')$', 'i')

  /**
   * isBlock(elem) determines if an elements is a block element
   * according to the above RegExp.
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

    /**
     * We're implementing our own insertHTML command; this avoids
     * browser inconsistencies like styling <span>s or attributes
     * getting removed.
     */
    function insertHTML (html) {
      var sel = window.getSelection(),
          selRange = sel.rangeCount ? sel.getRangeAt(0) : false,
          div = document.createElement('div'),
          cleaned,
          selStart,
          selEnd,
          startRange,
          endRange,
          startFrag,
          endFrag,
          marker,
          first

      if (!selRange) return

      // We replace whitespace with appropriate characters.
      html = html.replace(/ /g, '\u00A0').replace(/\n/g, '<br>')
      div.innerHTML = html
      cleaned = Quill.sanitizer.clean(div)

      // Make a marker.
      marker = document.createElement('span')
      marker.className = 'Quill-marker'

      // If the caret is on a new line, just insert wrapped HTML.
      if (Quill.selection.isNewLine()) {
        wrapText(cleaned)
        cleaned.lastChild.appendChild(marker)

        Quill.elem.insertBefore(cleaned, Quill.selection.getContaining())

        Quill.selection.forEachBlock(function (block) {
          Quill.elem.removeChild(block)
        })

        if (!Quill.throttle.isTyping())
          Quill.emit('change')

        return
      }

      /**
       * We get the parts not selected in the blocks as document
       * fragments; so, <p>Stu|ff</p><h2>Wo|rd</h2> will result in
       * a startFrag with <p>Stu</p> and endFrag with <h2>rd</h2>.
       */
      selStart = Quill.selection.getContaining(selRange.startContainer)
      selEnd = Quill.selection.getContaining(selRange.endContainer)
      startRange = document.createRange()
      endRange = document.createRange()

      startRange.setStartBefore(selStart)
      startRange.setEnd(selRange.startContainer, selRange.startOffset)
      endRange.setStart(selRange.endContainer, selRange.endOffset)
      endRange.setEndAfter(selEnd)

      startFrag = startRange.cloneContents()
      endFrag = endRange.cloneContents()

      // Place marker.
      endFrag.firstChild
        .insertBefore(marker, endFrag.firstChild.firstChild)

      first = startFrag.firstChild
      while (cleaned.firstChild && !isBlock(cleaned.firstChild))
        first.appendChild(cleaned.removeChild(cleaned.firstChild))

      // FIXME: should not merge start and end.
      if (!cleaned.firstChild && selStart.nodeName === selEnd.nodeName) {
        first = endFrag.firstChild

        while (first && first.firstChild)
          startFrag.firstChild.appendChild(first.removeChild(first.firstChild))

        Quill.elem.insertBefore(startFrag, selStart)
      } else if (!cleaned.firstChild) {
        Quill.elem.insertBefore(startFrag, selStart)
        Quill.elem.insertBefore(endFrag, selStart)
      } else {
        wrapText(cleaned)

        if (selStart.nodeName === cleaned.firstChild.nodeName) {
          first = cleaned.firstChild

          while (first.firstChild) {
            startFrag.firstChild
              .appendChild(first.removeChild(first.firstChild))
          }

          cleaned.removeChild(first)
        }

        Quill.elem.insertBefore(startFrag, selStart)

        while (cleaned.firstChild)
          Quill.elem.insertBefore(cleaned.firstChild, selStart)

        if (selStart.previousSibling.nodeName === endFrag.firstChild.nodeName ||
            !endFrag.firstChild.textContent.trim()) {
          first = endFrag.firstChild

          while (first.firstChild) {
            selStart.previousSibling
              .appendChild(first.removeChild(first.firstChild))
          }
        } else Quill.elem.insertBefore(endFrag, selStart)
      }

      // Remove old selection and restore selection.
      Quill.selection.forEachBlock(function (block) {
        Quill.elem.removeChild(block)
      })

      if (!Quill.throttle.isTyping())
        Quill.emit('change')
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