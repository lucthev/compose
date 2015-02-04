'use strict';

function formatBlock (Compose) {
  var Selection = Compose.require('selection'),
      Formatter = Compose.require('formatter'),
      Delta = Compose.require('delta'),
      View = Compose.require('view')

  function status (type) {
    var sel = Selection.get(),
        start,
        end

    start = sel.isBackwards() ? sel.end[0] : sel.start[0]
    end = sel.isBackwards() ? sel.start[0] : sel.end[0]

    while (start <= end) {
      if (View.paragraphs[start].type !== type)
        return false

      start += 1
    }

    return true
  }

  function exec (type) {
    var active = status(type),
        sel = Selection.get(),
        paragraph,
        start,
        end

    start = sel.isBackwards() ? sel.end[0] : sel.start[0]
    end = sel.isBackwards() ? sel.start[0] : sel.end[0]

    while (start <= end) {
      paragraph = View.paragraphs[start].substr(0)
      paragraph.type = active ? 'p' : type
      View.render(new Delta('paragraphUpdate', start, paragraph))

      start += 1
    }

    Compose.once('render', function () {
      Selection.set(sel)
    })
  }

  Formatter.block = {
    status: status,
    exec: exec
  }
}

module.exports = formatBlock
