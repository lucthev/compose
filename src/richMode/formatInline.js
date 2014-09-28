'use strict';

var types

/**
 * TODO: this code can probably be reduced somehow. A kind of
 * markups.forEach scenario, perhaps?
 */

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

function collapsed (paragraph, type, index) {
  var atStart = index === 0 || paragraph.text[index - 1] === '\n',
      markup,
      i

  for (i = 0; i < paragraph.markups.length; i += 1) {
    markup = paragraph.markups[i]

    if (markup.type > type) break
    if (markup.type < type) continue

    if (atStart && markup.start <= index && markup.end >= index)
      return true
    if (markup.start < index && markup.end >= index)
      return true
  }

  return false
}

/**
 * link(paragraph, start [, end]) determines, for a selection starting
 * at index 'start' ending at 'end' (or 'start' if 'end' is omitted),
 * whether or not any markups overlap the selection.
 *
 * @param {Serialize} paragraph
 * @param {Int >= 0} start
 * @param {Int >= 0} end
 * @return {Boolean}
 */
function link (paragraph, start, end) {
  var collapsed,
      markup,
      i

  if (end === undefined)
    end = start

  collapsed = start === end

  for (i = 0; i < paragraph.markups.length; i += 1) {
    markup = paragraph.markups[i]

    if (markup.type > types.link) break
    if (markup.type < types.link) continue

    if (collapsed && markup.start < start && markup.end > end)
      return markup
    if (collapsed)
      continue

    if (start <= markup.start && markup.start <= end ||
        start <= markup.end && markup.end <= end ||
        markup.start <= start && end <= markup.end)
      return markup
  }

  return false
}

/**
 * removeLinks(paragraph, start [, end]) removes any links overlapping
 * a selection starting at 'start' and ending at 'end' (or 'start', if
 * 'end' is omitted).
 *
 * @param {Serialize} paragraph
 * @param {Int >= 0} start
 * @param {Int >= 0} end
 */
function removeLinks (paragraph, start, end) {
  var markup,
      i

  if (end === undefined)
    end = start

  for (i = 0; i < paragraph.markups.length; i += 1) {
    markup = paragraph.markups[i]

    if (markup.type < types.link) continue
    if (markup.type > types.link) break

    if (markup.start <= start && start < markup.end ||
        markup.start < end && end <= markup.end ||
        markup.start >= start && markup.end <= end)
      paragraph.removeMarkup(markup)
  }
}

function formatInline (Compose) {
  var debug = Compose.require('debug')('compose:formatter:inline'),
      Formatter = Compose.require('formatter'),
      Selection = Compose.require('selection'),
      events = Compose.require('events'),
      Delta = Compose.require('delta'),
      View = Compose.require('view'),
      waiting = null,
      change = {}

  types = Compose.require('serialize').types

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

      if (type === types.link)
        return !!link(paragraph, startPair[1])

      if (change[type] !== undefined)
        return change[type]
      else
        return collapsed(paragraph, type, startPair[1])
    }

    for (i = startPair[0]; i <= endPair[0]; i += 1) {
      paragraph = View.paragraphs[i]
      start = i === startPair[0] ? startPair[1] : 0

      if (i === endPair[0])
        end = endPair[1]
      else
        end = paragraph.length - Number(/\n$/.test(paragraph.text))

      if (type === types.link && link(paragraph, start, end))
        return true
      if (type !== types.link && !overlaps(paragraph, type, start, end))
        return false
    }

    return type !== types.link
  }

  function enabled (type) {
    var sel = Selection.get()

    type = typeof type === 'string' ? types[type] : type

    if (type !== types.link)
      return !!sel

    // Links are only enabled when the selection is in a single paragraph.
    return sel && sel.start[0] === sel.end[0]
  }

  function exec (type, href) {
    var sel = Selection.get(),
        active = status(type),
        paragraph,
        startPair,
        endPair,
        markup,
        start,
        end,
        i

    type = typeof type === 'string' ? types[type] : type
    startPair = sel.isBackwards() ? sel.end : sel.start
    endPair = sel.isBackwards() ? sel.start : sel.end

    debug((active ? 'Disabling: ' : 'Enabling: ') + type)

    if (sel.isCollapsed()) {
      if (type === types.link && active) {
        paragraph = View.paragraphs[startPair[0]].substr(0)
        paragraph.removeMarkup(link(paragraph, startPair[1]))

        View.render(new Delta('paragraphUpdate', startPair[0], paragraph))
        Compose.once('render', function () {
          Selection.set(sel)
        })
      } else if (type === types.link) {
        return
      }

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

      if (type === types.link && active) {
        removeLinks(paragraph, start, end)
      } else {
        markup = {
          type: type,
          start: start,
          end: end
        }

        if (type === types.link)
          markup.href = href || ''

        paragraph[active ? 'removeMarkup' : 'addMarkups'](markup)
      }

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
    status: status,
    enabled: enabled,
    exec: exec,
    preventDefault: cancel('default prevented')
  }
}

module.exports = formatInline
