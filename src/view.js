'use strict'

import {Choice, Selection} from 'choice'
import diff from 'generic-diff'
import diffDelta from 'diff-delta'
import Paragraph from './model'
import {selectionKeys} from './events'

class View {
  constructor (editor) {
    this.editor = editor

    this._choice = new Choice(editor.root, () => {
      return this.paragraphs.map(p => p.element)
    })

    this._selection = null
    this._selectionSet = false
    this.paragraphs = []
    this._oldParagraphs = null

    this.converters = {
      P: Paragraph
    }

    let listener = () => {
      this._tick(true)
    }
    editor.on('focus', listener)
    editor.on('blur', listener)
    editor.on('mouseup', listener)
    editor.on('keydown', (e) => {
      this._tick(!!selectionKeys[e.keyCode])
    })

    editor.once('init', () => this.init())
  }

  /**
   * init() initializes the view.
   * FIXME: this needs to be more robust (sanitize & whatnot).
   */
  init () {
    let query = Object.keys(this.converters).join(',')
    let elements = this.editor.root.querySelectorAll(query)

    this.paragraphs = [].map.call(elements, (el) => {
      let paragraph = this.convert(el)
      paragraph.element = el
      return paragraph
    })
  }

  /**
   * convert(element) converts the element to its abstract representation.
   *
   * @param {Element} element
   * @return {Object}
   */
  convert (element) {
    let Converter = this.converters[element.nodeName]

    return new Converter(element)
  }

  /**
   * getSelection() gets the current selection.
   *
   * @return {Selection}
   */
  getSelection () {
    return this._selection
  }

  /**
   * setSelection(sel) sets the selection to `sel`, and schedules a
   * render so that these changes get reflected in the DOM.
   *
   * @param {Selection} sel
   */
  setSelection (sel) {
    if (!Selection.equals(this._selection, sel)) {
      this._selection = sel
      this._selectionSet = true
    }

    this._tick()
  }

  /**
   * insert(index, paragraph) inserts the given paragraph at the given index,
   * and schedules a render to propagate these changes to the DOM.
   *
   * @param {Int} index
   * @param {Paragraph} paragraph
   */
  insert (index, paragraph) {
    if (index <= 0 || index > this.paragraphs.length) {
      throw RangeError(`Cannot insert a paragraph at index ${index}.`)
    }

    if (!this._oldParagraphs) {
      this._oldParagraphs = this.paragraphs.slice()
    }

    this.paragraphs.splice(index, 0, paragraph)
    this._tick()
  }

  /**
   * update(index, paragraph) sets the paragraph at the given index to
   * the given paragraph, and schedules a render to propagate these changes
   * to the DOM.
   *
   * @param {Int} index
   * @param {Paragraph} paragraph
   */
  update (index, paragraph) {
    if (index < 0 || index >= this.paragraphs.length) {
      throw RangeError(`Cannot update a paragraph at index ${index}.`)
    }

    if (!this._oldParagraphs) {
      this._oldParagraphs = this.paragraphs.slice()
    }

    this.paragraphs[index] = paragraph
    this._tick()
  }

  /**
   * remove(index) removes the paragraph at the given index, and
   * schedules a render to propagate these changes to the DOM.
   *
   * @param {Int} index
   */
  remove (index) {
    let len = this.paragraphs.length

    if (index < 0 || index >= len) {
      throw RangeError(`Cannot remove paragraph at index ${index}.`)
    } else if (len === 1) {
      throw Error('Cannot remove the only paragraph.')
    }

    if (!this._oldParagraphs) {
      this._oldParagraphs = this.paragraphs.slice()
    }

    this.paragraphs.splice(index, 1)
    this._tick()
  }

  /**
   * _tick([normalizeSel]) schedules a sync/render; if `normalizeSel` is true,
   * the selection will be normalized after syncing, when applicable.
   *
   * @param {Boolean} normalizeSel
   */
  _tick (normalizeSel = false) {
    if (this._rendering) return

    // TODO: look at requestAnimationFrame
    this._rendering = setImmediate(() => {
      if (!this._oldParagraphs && !this._selectionSet) {
        // No programmatic changes. Sync any "natural" changes that may
        // have occurred (selection & elements).
        let sel = this._choice.getSelection()
        if (!Selection.equals(sel, this._selection)) {
          this._selection = sel
          this.editor.emit('selectionchanged', sel)
        }

        // Force-restore the selection after a selection key was pressed
        // to "normalize" it.
        if (sel && normalizeSel) {
          try {
            this._choice.restore(sel)
          } catch (e) {
            this.editor.emit('error', e)
          }
        }

        if (sel) {
          let index = sel.absoluteStart[0]
          let paragraph = this.paragraphs[index]
          let maybeUpdated = this.convert(paragraph.element)
          if (!paragraph.equals(maybeUpdated)) {
            maybeUpdated.element = paragraph.element
            this.editor.emit('paragraphupdated', index, maybeUpdated)
            this.paragraphs[index] = maybeUpdated
          }
        }
      }

      this.render()
      this._rendering = 0
    })
  }

  /**
   * render() renders changes (content changes or selection changes)
   * to the DOM.
   */
  render () {
    if (this._selectionSet && !this._selection) {
      this.editor.root.blur()
    } else if (this._selectionSet) {
      try {
        this._choice.restore(this._selection)

        // TODO: should this happen when the selection is set?
        this.editor.emit('selectionchanged', this._selection)
      } catch (e) {
        this.editor.emit('error', e)
      }
    }

    this._selectionSet = false

    if (!this._oldParagraphs) return

    let d = diff(this._oldParagraphs, this.paragraphs, (a, b) => a.equals(b))
    let deltas = diffDelta(d)

    deltas.forEach((delta) => {
      if (delta.added && delta.removed) {
        delta.items.forEach((p, index) => {
          let el = this._oldParagraphs[delta.index + index].element
          el.parentNode.replaceChild(p.toElement(), el)
          this._oldParagraphs[delta.index + index] = p
        })
      } else if (delta.added) {
        this._oldParagraphs.splice(delta.index, 0, delta.items)
        delta.items.forEach((p, index) => {
          let el = this._oldParagraphs[delta.index + index - 1].element
          let ref = el.nextSibling
          el.parentNode.insertBefore(p.toElement(), ref)
        })
      } else {
        this._oldParagraphs.splice(delta.index, delta.items.length)
        delta.items.forEach((p) => {
          let el = p.element
          el.parentNode.removeChild(el)
        })
      }
    })

    // TODO: is it actually necessary to nullify this?
    this._oldParagraphs = null
  }
}

export default function ViewPlugin (editor) {
  editor.provide('selection', Selection)
  editor.provide('view', new View(editor))
}
