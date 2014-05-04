/* global describe, it, beforeEach, afterEach, expect, Quill, setContent */
'use strict';

describe('The Smart Text plugin', function () {

  describe('single quotes', function () {

    beforeEach(function () {
      this.elem = document.createElement('article')
      document.body.appendChild(this.elem)

      this.Quill = new Quill(this.elem)
    })

    afterEach(function (done) {
      document.body.removeChild(this.elem)

      setTimeout(function () {
        this.Quill.destroy()

        done()
      }.bind(this), 10)
    })

    it('converts straight single quotes to curly quotes (1).', function () {
      setContent(this.elem, '<p>It\'s a nice day.</p>')

      // Simulate input; this should trigger Sanitization, which is responsible
      // good punctuation.
      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>It’s a nice day.</p>')
    })

    it('converts straight single quotes to curly quotes (2).', function () {
      setContent(this.elem, '<p>One \'two\' three</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>One ‘two’ three</p>')
    })

    it('converts straight single quotes to curly quotes (3).', function () {
      setContent(this.elem, '<p>One (\'two\') three</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>One (‘two’) three</p>')
    })

    it('converts straight single quotes to curly quotes (4).', function () {
      setContent(this.elem, '<p>One <strong>\'two</strong>\' three</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>One <strong>‘two</strong>’ three</p>')
    })

    it('converts straight single quotes to curly quotes (5).', function () {
      setContent(this.elem, '<p>One \'<strong><em>two</em> three</strong> four\'</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>One ‘<strong><em>two</em> three</strong> four’</p>')
    })

    it('converts straight single quotes to curly quotes (6).', function () {
      setContent(this.elem, '<p>One \'\' two</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>One ‘’ two</p>')
    })

    it('converts straight single quotes to curly quotes (7).', function () {
      setContent(this.elem, '<p>\'Once upon a time.\'</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>‘Once upon a time.’</p>')
    })

    it('converts straight single quotes to curly quotes (8).', function () {
      // The position of the cursor means a marker will be inserted between
      // the quotation mark and the rest of word; this should not affect the
      // outcome.
      setContent(this.elem, '<p>\'Yes,|\' he replied.</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>‘Yes,’ he replied.</p>')
    })

    it('converts straight single quotes to curly quotes (9).', function () {
      setContent(this.elem, '<p>\'(Words)\'</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>‘(Words)’</p>')
    })

    it('converts straight single quotes to curly quotes (10).', function () {
      setContent(this.elem, '<ul><li>One</li><li>\'Two\'</li></ul>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<ul><li>One</li><li>‘Two’</li></ul>')
    })

    it('converts straight single quotes to curly quotes (11).', function () {
      setContent(this.elem, '<p>(\'</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>(‘</p>')
    })

    it('should not replace quotes in code blocks.', function () {
      this.Quill.sanitizer.addElements('pre')

      setContent(this.elem, '<pre>var str = \'something\'</pre>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<pre>var str = \'something\'</pre>')

      this.Quill.sanitizer.removeElements('pre')
    })
  })

  describe('double quotes', function () {

    beforeEach(function () {
      this.elem = document.createElement('article')
      document.body.appendChild(this.elem)

      this.Quill = new Quill(this.elem)
    })

    afterEach(function (done) {
      document.body.removeChild(this.elem)

      setTimeout(function () {
        this.Quill.destroy()

        done()
      }.bind(this), 10)
    })

    it('converts straight double quotes to curly quotes (1).', function () {
      setContent(this.elem, '<p>"It is a nice day," she said.</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>“It is a nice day,” she said.</p>')
    })

    it('converts straight double quotes to curly quotes (2).', function () {
      setContent(this.elem, '<p>One "two" three</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>One “two” three</p>')
    })

    it('converts straight double quotes to curly quotes (3).', function () {
      setContent(this.elem, '<p>One ("two") three</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>One (“two”) three</p>')
    })

    it('converts straight double quotes to curly quotes (4).', function () {
      setContent(this.elem, '<p>One <strong>"two</strong>" three</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>One <strong>“two</strong>” three</p>')
    })

    it('converts straight double quotes to curly quotes (5).', function () {
      setContent(this.elem, '<p>One "<strong><em>two</em> three</strong> four"</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>One “<strong><em>two</em> three</strong> four”</p>')
    })

    it('converts straight single quotes to curly quotes (6).', function () {
      setContent(this.elem, '<p>One "" two</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>One “” two</p>')
    })

    it('converts straight double quotes to curly quotes (7).', function () {
      setContent(this.elem, '<p>"Once upon a time."</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>“Once upon a time.”</p>')
    })

    it('converts straight double quotes to curly quotes (8).', function () {
      // The position of the cursor means a marker will be inserted between
      // the quotation mark and the rest of word; this should not affect the
      // outcome.
      setContent(this.elem, '<p>"Yes,|" he replied.</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>“Yes,” he replied.</p>')
    })

    it('converts straight double quotes to curly quotes (9).', function () {
      setContent(this.elem, '<p>"(Words)"</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>“(Words)”</p>')
    })

    it('converts straight double quotes to curly quotes (10).', function () {
      setContent(this.elem, '<ul><li>One</li><li>"Two"</li></ul>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<ul><li>One</li><li>“Two”</li></ul>')
    })

    it('converts straight double quotes to curly quotes (11).', function () {
      setContent(this.elem, '<p>("</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>(“</p>')
    })

    it('should not replace quotes in code blocks.', function () {
      this.Quill.sanitizer.addElements('pre')

      setContent(this.elem, '<pre>var str = "something"</pre>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<pre>var str = "something"</pre>')

      this.Quill.sanitizer.removeElements('pre')
    })
  })

  describe('primes', function () {

    beforeEach(function () {
      this.elem = document.createElement('article')
      document.body.appendChild(this.elem)

      this.Quill = new Quill(this.elem)
    })

    afterEach(function (done) {
      document.body.removeChild(this.elem)

      setTimeout(function () {
        this.Quill.destroy()

        done()
      }.bind(this), 10)
    })

    it('are inserted after a number (1).', function () {
      setContent(this.elem, '<p>4\'.</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>4′.</p>')
    })

    it('are inserted after a number (2).', function () {
      setContent(this.elem, '<p>He was short, at 4\'11".</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>He was short, at 4′11″.</p>')
    })

    it('are inserted after a number (3).', function () {
      setContent(this.elem, '<p>He was short, at <strong>4</strong>\'<em>11</em>".</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>He was short, at <strong>4</strong>′<em>11</em>″.</p>')
    })

    it('are inserted after a number (4).', function () {
      setContent(this.elem, '<p>He was short (he was 4\'11").</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>He was short (he was 4′11″).</p>')
    })

    it('should not be inserted after a word. (1).', function () {
      setContent(this.elem, '<p>He was short (he was four\').</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .not.toEqual('<p>He was short (he was four′).</p>')
    })

    it('should not be inserted after a word. (2).', function () {
      setContent(this.elem, '<p>%\':"</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>%’:”</p>')
    })
  })

  describe('all together now!', function () {

    beforeEach(function () {
      this.elem = document.createElement('article')
      document.body.appendChild(this.elem)

      this.Quill = new Quill(this.elem)
    })

    afterEach(function (done) {
      document.body.removeChild(this.elem)

      setTimeout(function () {
        this.Quill.destroy()

        done()
      }.bind(this), 10)
    })

    it('everything (1).', function () {
      setContent(this.elem, '<p>"He\'s short," said John. "He\'s about 4\'11"."</p>')

      this.Quill.emit('input')

      expect(this.elem.innerHTML)
        .toEqual('<p>“He’s short,” said John. “He’s about 4′11″.”</p>')
    })
  })
})
