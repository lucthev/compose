/**
 * An unordered list is created via typing '*' or '-' followed
 * immediately by a space. An ordered list is created by typing '1.'
 * followed by a space. Text after the trigger does not matter, so
 * <p>1.|Stuff</p> (where | is the caret) and pressing space will
 * still make a list whose first item is 'Stuff'.
 */

function onKeydown (e) {
  var container = this.selection.getContaining(),
      sel = window.getSelection(),
      range,
      marker,
      list,
      text,
      li

  if (!container || !sel.isCollapsed) return

  range = sel.getRangeAt(0).cloneRange()

  if (e.keyCode === 32 && container.nodeName === 'P') {
    // Space bar.

    // Get text:
    range.setStartBefore(container)
    text = range.cloneContents().firstChild.textContent

    // TODO: I can't seem to make a RegExp that works for this.
    if (text !== '1.' && text !== '*' && text !== '-') return

    // The space bar just creates the list; we don't actually want
    // to insert a space.
    e.preventDefault()

    // Place marker (there should only be one):
    this.selection.placeMarkers()
    marker = this.selection.getMarkers()[0]

    // Placing the marker will have split the text, so the previous
    // sibling will be the '1.' or whatever else.
    while (marker.previousSibling)
      marker.parentNode.removeChild(marker.previousSibling)

    // Turn our <p> into a <li>
    li = document.createElement('li')

    while (container.firstChild)
      li.appendChild(container.removeChild(container.firstChild))

    // Insert a <br> if necessary (no textContent and no existing <br>)
    if (!li.textContent && !li.querySelector('br')) {
      marker.parentNode
        .insertBefore(document.createElement('br'), marker.nextSibling)
    }

    // Make the new list. Merging of consecutive lists is handled by
    // the sanitizer filter, so we don't bother checking that here.
    list = text === '1.' ? 'ol' : 'ul'
    list = document.createElement(list)
    list.appendChild(li)

    this.elem.replaceChild(list, container)

    this.selection.selectMarkers()

    // Trigger change if necessary.
    this.emit('input')

  } else if (e.keyCode === 8 || e.keyCode === 13) {
    // Backspace or enter.

    // Get the parent list element, if applicable.
    container = this.selection.childOf(/^LI$/i)

    if (!container) return

    if ((e.keyCode === 8 && this.selection.atStartOf(container)) ||
        (e.keyCode === 13 && !container.textContent)) {
      e.preventDefault()

      this.list.splitList(container)

      this.emit('input')
    }
  }
}

function listFilter (params) {
  var elem = params.node,
      name = params.node_name,
      node,
      next,
      li

  if (!/^[ou]l$/.test(name)) return null

  // Merge consecutive lists.
  node = elem.nextSibling
  while (node && node.nodeName === elem.nodeName) {
    next = node.nextSibling

    while (node.firstChild)
      elem.appendChild(node.removeChild(node.firstChild))

    node.parentNode.removeChild(node)

    node = next
  }

  // Wrap all children in <li>s, if applicable.
  node = elem.firstChild
  while (node) {

    if (node.nodeName !== 'LI') {
      li = document.createElement('li')
      li.appendChild(node.cloneNode(true))

      // Consecutive non-<li> nodes get merged into a single <li>.
      while (node.nextSibling && node.nextSibling.nodeName !== 'LI')
        li.appendChild(elem.removeChild(node.nextSibling))

      next = node.nextSibling
      elem.replaceChild(li, node)
      node = next

    } else node = node.nextSibling
  }
}

function autoList (Quill) {
  this.selection = Quill.selection
  this.elem = Quill.elem
  this.Quill = Quill

  // Store bound event handlers for later removal.
  this.onKeydown = onKeydown.bind(Quill)

  this.elem.addEventListener('keydown', this.onKeydown)

  Quill.sanitizer
    .addElements(['ol', 'ul', 'li'])
    .addFilter(listFilter)
}

/**
 * splitList(listItem) splits a list at the given <li>. The <li> is
 * transformed into a <p>. If no <li>s remain in the list, the list
 * is removed. If rmSelection is true, the selection is disregarded.
 *
 * @param {Element} listItem
 * @param {Boolean} rmSelection
 */
autoList.prototype.splitList = function (listItem, rmSelection) {
  var parent = listItem.parentNode,
      listType = parent.nodeName,
      before,
      after,
      node,
      next,
      p

  if (!/^[OU]L$/.test(listType)) return

  if (!rmSelection)
    this.selection.placeMarkers()

  before = document.createElement(listType)
  after = document.createElement(listType)

  node = parent.firstChild
  next = node.nextSibling
  while (node !== listItem) {
    before.appendChild(parent.removeChild(node))
    node = next
    if (node) next = node.nextSibling
  }

  if (before.childNodes.length)
    parent.parentNode.insertBefore(before, parent)

  node = listItem.nextSibling
  while (node) {
    next = node.nextSibling
    after.appendChild(parent.removeChild(node))
    node = next
  }

  if (after.childNodes.length)
    parent.parentNode.insertBefore(after, parent.nextSibling)

  // Turn the list item into a paragraph.
  p = document.createElement('p')
  while (listItem.firstChild)
    p.appendChild(listItem.removeChild(listItem.firstChild))

  // Replace the <li>'s parent with the new paragraph.
  parent.parentNode.replaceChild(p, parent)

  if (!rmSelection)
    this.selection.selectMarkers()

  return p
}

autoList.prototype.destroy = function () {
  this.elem.removeEventListener('keydown', this.onKeydown)

  this.Quill.sanitizer
    .removeElements(['ol', 'ul', 'li'])
    .removeFilter(listFilter)

  delete this.elem
  delete this.selection
  delete this.Quill
}

// Plugin name:
autoList.plugin = 'list'

module.exports = autoList
