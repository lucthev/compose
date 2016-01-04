'use strict'

import {Choice, Selection} from 'choice'
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

  insert (index, paragraph) {

  }

  update (index, paragraph) {

  }

  remove (index) {

  }

  /**
   * _tick([forceRestore]) schedules a sync/render, optionally forcing
   * a restoration of the synced selection.
   *
   * @param {Boolean} forceRestore
   */
  _tick (forceRestore = false) {
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
          console.log('Selection is %o %o', sel.start, sel.end)
        }

        // Force-restore the selection after a selection key was pressed
        // to "normalize" it.
        if (sel && forceRestore) {
          try {
            this._choice.restore(sel)
            console.log('Restored selection')
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
            console.log('Synced paragraph at index %d', index)
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
  }
}

export default function ViewPlugin (editor) {
  editor.provide('selection', Selection)
  editor.provide('view', new View(editor))
}
