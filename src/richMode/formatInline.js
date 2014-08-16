'use strict';

function overlaps (paragraph, type, start, end) {
  var markup,
      i

  for (i = 0; i < paragraph.markups.length; i += 1) {
    markup = paragraph.markups[i]

    if (markup.type > type) break
    if (markup.type < type) continue

    if (markup.start <= start && markup.end >= end)
      return true
  }

  return false
}

function formatInline (Compose) {
  var types = Compose.require('serialize').types,
      Formatter = Compose.require('formatter'),
      Selection = Compose.require('selection'),
      events = Compose.require('events'),
      Delta = Compose.require('delta'),
      View = Compose.require('view'),
      waiting = false,
      change = {}

  function cancel () {
    waiting = false
    change = {}
  }

  function status (type) {
    var sel = Selection.get(),
        paragraph,
        startPair,
        endPair,
        start,
        end,
        i

    type = typeof type === 'string' ? types[type] : type
    startPair = sel.isBackwards() ? sel.end : sel.start
    endPair = sel.isBackwards() ? sel.start : sel.end

    if (sel.isCollapsed()) {
      paragraph = View.paragraphs[startPair[0]]

      if (change[type] !== undefined)
        return change[type]
      else
        return overlaps(paragraph, type, startPair[1], endPair[1])
    }

    for (i = startPair[0]; i <= endPair[0]; i += 1) {
      paragraph = View.paragraphs[i]
      start = i === startPair[0] ? startPair[1] : 0

      if (i === endPair[0])
        end = endPair[1]
      else
        end = paragraph.length - Number(/\n$/.test(paragraph.text))

      if (!overlaps(paragraph, type, start, end))
        return false
    }

    return true
  }

  function exec (type) {
    var sel = Selection.get(),
        active = status(type),
        paragraph,
        startPair,
        endPair,
        start,
        end,
        i

    type = typeof type === 'string' ? types[type] : type
    startPair = sel.isBackwards() ? sel.end : sel.start
    endPair = sel.isBackwards() ? sel.start : sel.end

    if (sel.isCollapsed()) {
      if (change[type] === active)
        delete change[type]
      else
        change[type] = !active

      if (!waiting)
        waiting = new Selection(sel.start.slice())

      return
    }

    for (i = startPair[0]; i <= endPair[0]; i += 1) {
      paragraph = View.paragraphs[i].substr(0)
      start = i === startPair[0] ? startPair[1] : 0

      if (i === endPair[0])
        end = endPair[1]
      else
        end = paragraph.length - Number(/\n$/.test(paragraph.text))

      paragraph[active ? 'removeMarkup' : 'addMarkups']({
        type: type,
        start: start,
        end: end
      })

      if (!active)
        paragraph.mergeAdjacent()

      View.render(new Delta('paragraphUpdate', i, paragraph))
    }

    Compose.once('render', function () {
      Selection.set(sel)
    })
  }

  Compose.on('paste', cancel)
  Compose.on('mousedown', cancel)
  Compose.on('keydown', function (e) {
    if (events.selectKey(e))
      cancel()
  })

  Compose.on('keypress', function (e) {
    applyChanges(e.defaultPrevented)
  })
  Compose.on('compositionend', function () {
    applyChanges(false)
  })

  function applyChanges (modifySelection) {
    if (!waiting)
      return cancel()

    Compose.once('paragraphUpdate', function (index, paragraph) {
      var sel = Selection.get()

      if (modifySelection && sel) {
        sel = new Selection(sel.start.slice())
        sel.start[1] = sel.end[1] = sel.start[1] + 1
      }

      if (!sel || !waiting || sel.start[0] !== waiting.start[0] ||
          sel.start[1] <= waiting.start[1] || Object.keys(change).length === 0)
        return cancel()

      Object.keys(change).forEach(function (type) {
        paragraph[change[type] ? 'addMarkups' : 'removeMarkup']({
          type: parseInt(type),
          start: waiting.start[1],
          end: sel.start[1]
        })

        if (change[type])
          paragraph.mergeAdjacent()

        delete change[type]
      })

      Compose.once('render', function () {
        Selection.set(sel)
      })

      cancel()
    })
  }

  Formatter.inline = {
    exec: exec,
    status: status,
    preventDefault: cancel
  }
}

module.exports = formatInline
