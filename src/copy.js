'use strict'

const trailingNewline = /.\n$/

export default function copyPlugin (editor) {
  const view = editor.require('view')

  function getSelectedParagraphs (sel) {
    if (!sel) return []

    let startPair = sel.absoluteStart
    let endPair = sel.absoluteEnd
    let paragraphs = view.paragraphs.slice(startPair[0], endPair[0] + 1)
    let last = paragraphs.length - 1

    if (paragraphs.length === 1) {
      paragraphs[0] = paragraphs[0].substring(startPair[1], endPair[1])
    } else {
      paragraphs[0] = paragraphs[0].substr(startPair[1])
      paragraphs[last] = paragraphs[last].substr(0, endPair[1])
    }

    return paragraphs
  }

  function trimTrailingNewline (p) {
    return trailingNewline.test(p.text) ? p.substr(0, p.length - 1) : p
  }

  function copyHTML (sel) {
    sel = sel || view.getSelection()

    if (sel.isCollapsed) return ''

    let paragraphs = getSelectedParagraphs(sel)
    paragraphs = paragraphs.map(p => {
      let trimmed = trimTrailingNewline(p)
      if (!trimmed.text) trimmed.text = '\n'
      return trimmed.toString()
    })

    return paragraphs.join('')
  }

  function copyText (sel) {
    sel = sel || view.getSelection()

    if (sel.isCollapsed) return ''

    let paragraphs = getSelectedParagraphs(sel)
    paragraphs = paragraphs.map(p => trimTrailingNewline(p).text)

    // TODO: should Windows get '\r\n\r\n'?
    return paragraphs.join('\n\n')
  }

  editor.provide('copy', {
    copyHTML,
    copyText
  })
}
