'use strict';

function shortcuts (Compose) {
  var types = Compose.require('serialize').types,
      Formatter = Compose.require('formatter'),
      Selection = Compose.require('selection'),
      events = Compose.require('events'),
      View = Compose.require('view')

  Compose.on('keydown', function (e) {
    var sel = Selection.get(),
        paragraph,
        len

    if (events.selectall(e)) {
      e.preventDefault()

      len = View.paragraphs.length - 1
      paragraph = View.paragraphs[len]

      if (/\n$/.test(paragraph.text))
        sel = new Selection([0, 0], [len, paragraph.length - 1])
      else
        sel = new Selection([0, 0], [len, paragraph.length])

      Selection.set(sel)
    } else if (e.keyCode === 66 && events.modKey(e)) {
      // Mod+B

      e.preventDefault()
      Formatter.inline.exec(types.bold)
    } else if (e.keyCode === 73 && events.modKey(e)) {
      // Mod+I

      e.preventDefault()
      Formatter.inline.exec(types.italic)
    } else if (e.altKey) {

      switch (e.keyCode) {
        case 49: // Alt+1
          e.preventDefault()
          return Formatter.block.exec('h2')
        case 50: // Alt+2
          e.preventDefault()
          return Formatter.block.exec('h3')
        case 53: // Alt+5
          e.preventDefault()
          return Formatter.block.exec('blockquote')
        case 54: // Alt+6
          e.preventDefault()
          return Formatter.block.exec('pre')
        case 55: // Alt+7
          e.preventDefault()
          return Formatter.block.exec('pullquote')
        case 48: // Alt+0
          e.preventDefault()
          return Formatter.block.exec('p')
      }
    }
  })
}

module.exports = shortcuts
