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
  var debug = Compose.require('debug')('compose:formatter:inline'),
      types = Compose.require('serialize').types,
      Formatter = Compose.require('formatter'),
      Selection = Compose.require('selection'),
      events = Compose.require('events'),
      Delta = Compose.require('delta'),
      View = Compose.require('view'),
      waiting = null,
      change = {}

  function cancel (reason) {
    return function () {
      debug('Cancelling: ' + reason)
      waiting = null
      change = {}
    }
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

    debug((active ? 'Disabling: ' : 'Enabling: ') + type)

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

  Compose.on('paste', cancel('paste'))
  Compose.on('mousedown', cancel('mousedown'))
  Compose.on('keydown', function (e) {
    if (events.selectKey(e))
      cancel('selection key')()
  })

  Compose.on('sync', function (index, paragraph) {
    var types = Object.keys(change),
        sel = Selection.get()

    if (events.composing()) {
      debug('Delaying, composition underway.')
      return
    }

    if (!sel || !waiting || !sel.isCollapsed() || types.length === 0 ||
      sel.start[0] !== waiting.start[0] || sel.start[1] <= waiting.start[1])
      return cancel('sync conditions not met')()

    paragraph = paragraph.substr(0)
    sel = new Selection(sel.start.slice())

    types.forEach(function (type) {
      paragraph[change[type] ? 'addMarkups' : 'removeMarkup']({
        type: parseInt(type),
        start: waiting.start[1],
        end: sel.start[1]
      })

      if (change[type])
        paragraph.mergeAdjacent()

      delete change[type]
    })

    View.render(new Delta('paragraphUpdate', index, paragraph))
    Compose.once('render', function () {
      Selection.set(sel)
    })

    cancel('successful sync')()
  })

  Compose.on('paragraphUpdate', function (index, paragraph) {
    var types = Object.keys(change)

    if (waiting && index !== waiting.start[0])
      return

    if (!waiting || types.length === 0 || paragraph.length <= waiting.start[1])
      return cancel('paragraphUpdate conditions not met')()

    types.forEach(function (type) {
      paragraph[change[type] ? 'addMarkups' : 'removeMarkup']({
        type: parseInt(type),
        start: waiting.start[1],
        end: waiting.start[1] + 1
      })

      if (change[type])
        paragraph.mergeAdjacent()

      delete change[type]
    })

    cancel('successful paragraphUpdate')()
  })

  Formatter.inline = {
    exec: exec,
    status: status,
    preventDefault: cancel('default prevented')
  }
}

module.exports = formatInline
