/* jshint ignore:start */

describe('Rich mode', function () {

  describe('basic functionality', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)

      this.quill = new Quill(this.elem)
    })

    afterEach(function (done) {
      document.body.removeChild(this.elem)

      setTimeout(function () {
        this.quill.destroy()

        done()
      }.bind(this), 10)
    })

    it('should append a paragraph to empty elements.', function () {

      // Don't get too specific; FF, for example, might add <br type='moz'>,
      // so explicitly checking for <p><br></p> might not work.
      expect(this.elem.firstChild.nodeName).toEqual('P')
    })

    it('should not append paragraphs to non-empty elements.', function () {
      setContent(this.elem, '<p>Stuff</p>')

      expect(this.elem.innerHTML).toEqual('<p>Stuff</p>')
    })

    // NOTE: these don't work in PhantomJS, for whatever reason.
    if (!/PhantomJS/i.test(navigator.userAgent)) {
      it('should place the caret in the correct place when focusing (1).', function () {
        this.elem.focus()

        expect(this.elem.firstChild.nodeName.toLowerCase()).toEqual('p')
        expect(this.quill.selection.getContaining()).toEqual(this.elem.firstChild)
      })

      it('should place the caret in the correct place when focusing (2).', function () {
        setContent(this.elem, '<p><i><b id="x">Stuff</b></i></p>')

        this.elem.focus()

        var sel = window.getSelection(),
            range = sel.getRangeAt(0)

        expect(range.startContainer)
          .toEqual(document.querySelector('#x').firstChild)
      })

      it('should place the caret in the correct place when focusing (3).', function () {
        setContent(this.elem, '<p>Stuff <i><b>and things</b></i></p>')

        this.elem.focus()

        var sel = window.getSelection(),
            range = sel.getRangeAt(0)

        expect(range.startContainer)
          .toEqual(this.elem.firstChild.firstChild)
      })
    }
  })

  describe('bold/italic', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)

      this.quill = new Quill(this.elem)
    })

    afterEach(function (done) {
      document.body.removeChild(this.elem)

      setTimeout(function () {
        this.quill.destroy()

        done()
      }.bind(this), 10)
    })

    it('bold should use the <strong> tag.', function (done) {
      setContent(this.elem, '<p>One |two| three</p>')

      this.quill.bold()

      // Sanitization, which is responsible for converting <b> and <i>
      // to <strong> and <em>, is deferred until the next event loop;
      // we have to go async.
      setTimeout(function () {
        expect(this.elem.innerHTML)
          .toEqual('<p>One <strong>two</strong> three</p>')

        done()
      }.bind(this), 0)
    })

    it('italic should use the <em> tag.', function (done) {
      setContent(this.elem, '<p>One |two| three</p>')

      this.quill.italic()

      setTimeout(function () {
        expect(this.elem.innerHTML)
          .toEqual('<p>One <em>two</em> three</p>')

        done()
      }.bind(this), 0)
    })

    it('bold should report the correct state (1)', function () {
      setContent(this.elem, '<p>One |two| three</p>')

      this.quill.bold()

      expect(this.quill.bold.getState()).toBe(true)
    })

    it('bold should report the correct state (2)', function () {
      setContent(this.elem, '<p>One |<em><strong>two</strong></em>| three</p>')

      expect(this.quill.bold.getState()).toBe(true)
    })

    it('bold should report the correct state (3)', function () {
      setContent(this.elem, '<h2>One two three</h2>')

      // Headings usually have font-weight: bold; we'll set it explicitly
      // anyways.
      this.elem.firstChild.style.fontWeight = 'bold'

      expect(this.quill.bold.getState()).toBe(false)
    })

    it('italic should report the correct state (1)', function () {
      setContent(this.elem, '<p>One |two| three</p>')

      this.quill.italic()

      expect(this.quill.italic.getState()).toBe(true)
    })

    it('italic should report the correct state (2)', function () {
      setContent(this.elem, '<p>One |<strong><em>two</em></strong>| three</p>')

      expect(this.quill.italic.getState()).toBe(true)
    })

    it('italic should report the correct state (3)', function () {
      setContent(this.elem, '<blockquote>One two three</blockquote>')

      // We'll pretend blockquotes are italicized.
      this.elem.firstChild.style.fontStyle = 'italic'

      expect(this.quill.italic.getState()).toBe(false)
    })
  })

  describe('headings', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)

      this.quill = new Quill(this.elem)
    })

    afterEach(function (done) {
      document.body.removeChild(this.elem)

      setTimeout(function () {
        this.quill.destroy()

        done()
      }.bind(this), 10)
    })

    it('should correctly convert paragraphs to headings (1).', function () {
      setContent(this.elem, '<p>Stuff|</p>')

      this.quill.heading(2)

      expect(this.elem.innerHTML).toEqual('<h2>Stuff</h2>')
    })

    it('should correctly convert paragraphs to headings (2).', function () {
      setContent(this.elem, '<p>|Stuff</p>')

      this.quill.heading(2)

      expect(this.elem.innerHTML).toEqual('<h2>Stuff</h2>')
    })

    it('should correctly convert paragraphs to headings (3).', function () {
      setContent(this.elem, '<p>St|uf|f</p>')

      this.quill.heading(2)

      expect(this.elem.innerHTML).toEqual('<h2>Stuff</h2>')
    })

    it('should correctly convert paragraphs to headings (4).', function () {
      setContent(this.elem, '<p>|Stuff</p><p>Things|</p>')

      this.quill.heading(2)

      expect(this.elem.innerHTML).toEqual('<h2>Stuff</h2><h2>Things</h2>')
    })

    it('should conserve attributes when converting.', function () {
      // We have to add attributes to the sanitizer.
      this.quill.sanitizer.addAttributes({
        p: ['id', 'name'],
        h2: ['id', 'name']
      })

      setContent(this.elem, '<p id="word">|Stuff</p><p name="blue">Thing|s</p>')

      this.quill.heading(2)

      expect(this.elem.innerHTML)
        .toEqual('<h2 id="word">Stuff</h2><h2 name="blue">Things</h2>')
    })

    it('should properly convert multiple paragraphs to headings.', function () {
      setContent(this.elem, '<p>S|tuff</p><p>Thin|gs</p>')

      this.quill.heading(2)

      expect(this.elem.innerHTML)
        .toEqual('<h2>Stuff</h2><h2>Things</h2>')
    })

    it('and headings to paragraphs.', function () {
      setContent(this.elem, '<h2>S|tuff</h2><h2>Thin|gs</h2>')

      this.quill.heading(0)

      expect(this.elem.innerHTML).toEqual('<p>Stuff</p><p>Things</p>')
    })

    it('should insert paragraphs after headings.', function () {
      setContent(this.elem, '<h2>Stuff|</h2><p>Things</p>')

      fireEvent(this.elem, 'keydown', 13)
      expect(this.elem.innerHTML)
        .toEqual('<h2>Stuff</h2><p><br></p><p>Things</p>')
      expect(this.quill.selection.getContaining())
        .toEqual(this.elem.firstChild.nextSibling)
    })
  })

  describe('pre', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)

      this.quill = new Quill(this.elem)
    })

    afterEach(function (done) {
      document.body.removeChild(this.elem)

      setTimeout(function () {
        this.quill.destroy()

        done()
      }.bind(this), 10)
    })

    it('should correctly convert paragraphs to <pre>s (1).', function () {
      setContent(this.elem, '<p>Stuff|</p>')

      this.quill.pre(true)

      expect(this.elem.innerHTML).toEqual('<pre>Stuff</pre>')
    })

    it('should correctly convert paragraphs to <pre>s (2).', function () {
      setContent(this.elem, '<p>|Stuff</p>')

      this.quill.pre(true)

      expect(this.elem.innerHTML).toEqual('<pre>Stuff</pre>')
    })

    it('should correctly convert paragraphs to <pre>s (3).', function () {
      setContent(this.elem, '<p>St|uf|f</p>')

      this.quill.pre(true)

      expect(this.elem.innerHTML).toEqual('<pre>Stuff</pre>')
    })

    it('should correctly convert paragraphs to <pre>s (4).', function () {
      setContent(this.elem, '<p>|Stuff</p><p>Things|</p>')

      this.quill.pre(true)

      expect(this.elem.innerHTML).toEqual('<pre>Stuff</pre><pre>Things</pre>')
    })

    it('should correctly convert <pre>s to <p>s (1).', function () {
      setContent(this.elem, '<pre>Stuff|</pre>')

      this.quill.pre(false)

      expect(this.elem.innerHTML).toEqual('<p>Stuff</p>')
    })

    it('should correctly convert <pre>s to <p>s (2).', function () {
      setContent(this.elem, '<pre>|Stuff</pre>')

      this.quill.pre()

      expect(this.elem.innerHTML).toEqual('<p>Stuff</p>')
    })

    it('should correctly convert <pre>s to <p>s (3).', function () {
      setContent(this.elem, '<pre>St|uf|f</pre>')

      this.quill.pre()

      expect(this.elem.innerHTML).toEqual('<p>Stuff</p>')
    })

    it('should correctly convert <pre>s to <p>s (4).', function () {
      setContent(this.elem, '<pre>|Stuff</pre><pre>Things|</pre>')

      this.quill.pre()

      expect(this.elem.innerHTML).toEqual('<p>Stuff</p><p>Things</p>')
    })

    it('should conserve attributes when converting.', function () {
      // We have to add attributes to the sanitizer.
      this.quill.sanitizer.addAttributes({
        p: ['id', 'name'],
        pre: ['id', 'name']
      })

      setContent(this.elem, '<p id="word">|Stuff</p><p name="blue">Thing|s</p>')

      this.quill.pre(true)

      expect(this.elem.innerHTML)
        .toEqual('<pre id="word">Stuff</pre><pre name="blue">Things</pre>')

      this.quill.pre(false)

      expect(this.elem.innerHTML)
        .toEqual('<p id="word">Stuff</p><p name="blue">Things</p>')
    })
  })

  describe('horizontal rules', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)

      this.quill = new Quill(this.elem)
    })

    afterEach(function (done) {
      document.body.removeChild(this.elem)

      setTimeout(function () {
        this.quill.destroy()

        done()
      }.bind(this), 10)
    })

    it('should be inserted when pressing enter on a new line.', function () {
      setContent(this.elem, '<p>Stuff</p><p>|<br></p>')

      fireEvent(this.elem, 'keydown', 13)
      expect(this.elem.children.length).toEqual(3)
      expect(this.elem.children[1].nodeName).toEqual('HR')
    })

    it('should not be inserted if the newline is the first paragraph.', function () {
      setContent(this.elem, '<p>|<br></p>')

      fireEvent(this.elem, 'keydown', 13)
      expect(this.elem.innerHTML).toEqual('<p><br></p>')
    })

    it('should not be inserted if the newline is preceded by an HR.', function () {
      setContent(this.elem, '<p>Stuff</p><hr><p>|<br></p>')

      fireEvent(this.elem, 'keydown', 13)
      expect(this.elem.children.length).toEqual(3)
      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff</p><hr><p><br></p>')
    })

    it('should be deleted as appropriate (1).', function () {
      setContent(this.elem, '<p>Stuff</p><hr><p>|Words</p>')

      // Simulate backspace.
      fireEvent(this.elem, 'keydown', 8)
      expect(this.elem.children.length).toEqual(2)
      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff</p><p>Words</p>')
    })

    it('should be deleted as appropriate (2).', function () {
      setContent(this.elem, '<p>Stuff|</p><hr><p>Words</p>')

      // Simulate forward delete.
      fireEvent(this.elem, 'keydown', 46)
      expect(this.elem.children.length).toEqual(2)
      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff</p><p>Words</p>')
    })
  })

  describe('blockquotes', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)

      this.quill = new Quill(this.elem)
    })

    afterEach(function (done) {
      document.body.removeChild(this.elem)

      setTimeout(function () {
        this.quill.destroy()

        done()
      }.bind(this), 10)
    })

    it('can be inserted normally.', function () {
      setContent(this.elem, '<p>Stuff|</p>')

      this.quill.blockquote(true)

      expect(this.elem.innerHTML)
        .toEqual('<blockquote>Stuff</blockquote>')

      this.quill.blockquote(false)

      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff</p>')
    })

    it('can be inserted with an optional class.', function () {
      setContent(this.elem, '<p>Stuff|</p>')

      this.quill.blockquote('test')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('test')
    })

    it('should remove the class when converting back to paragraphs.', function () {
      setContent(this.elem, '<p>S|tuff|</p>')
      this.elem.focus()

      this.quill.blockquote('test')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('test')

      this.quill.blockquote(false)

      expect(this.elem.innerHTML).toEqual('<p>Stuff</p>')
      expect(this.elem.firstChild.hasAttribute('class')).toBe(false)
    })

    it('should remove the class when converting to a normal blockquote.', function () {
      setContent(this.elem, '<p>St|u|ff</p>')
      this.elem.focus()

      this.quill.blockquote('test')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('test')

      this.quill.blockquote(true)

      expect(this.elem.innerHTML).toEqual('<blockquote>Stuff</blockquote>')
      expect(this.elem.firstChild.hasAttribute('class')).toBe(false)
    })

    it('should change the class when appropriate.', function () {
      setContent(this.elem, '<p>Stu|ff</p>')
      this.elem.focus()

      this.quill.blockquote('test')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('test')

      this.quill.blockquote('word')

      expect(this.elem.firstChild.nodeName).toEqual('BLOCKQUOTE')
      expect(this.elem.firstChild.className).toEqual('word')
    })

    it('should work over multiple blocks.', function () {
      setContent(this.elem, '<p>St|uff</p><p>Thin|gs</p>')
      this.elem.focus()

      this.quill.blockquote(true)

      expect(this.elem.innerHTML)
        .toEqual('<blockquote>Stuff</blockquote><blockquote>Things</blockquote>')

      this.quill.blockquote(false)

      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff</p><p>Things</p>')
    })

    it('should preserve other attributes.', function () {
      // We have to add the attributes to Quill's sanitizer.
      this.quill.sanitizer.addAttributes({
        p: ['name'],
        blockquote: ['name']
      })

      setContent(this.elem, '<p name="word">S|tuff</p>')
      this.elem.focus()

      this.quill.blockquote(true)

      expect(this.elem.innerHTML)
        .toEqual('<blockquote name="word">Stuff</blockquote>')

      this.quill.blockquote(false)

      expect(this.elem.innerHTML)
        .toEqual('<p name="word">Stuff</p>')
    })
  })

  describe('links', function () {

    beforeEach(function () {
      this.elem = document.createElement('div')
      document.body.appendChild(this.elem)

      this.quill = new Quill(this.elem)

      // We're adding a filter to allow basically any <a>.
      function filter (a) {
        return { whitelist: true }
      }

      this.quill.sanitizer.addFilter('a', filter)

      jasmine.addMatchers(customMatchers)
    })

    afterEach(function (done) {
      document.body.removeChild(this.elem)

      setTimeout(function () {
        this.quill.destroy()

        done()
      }.bind(this), 10)
    })

    it('can insert links over text.', function () {
      setContent(this.elem, '<p>Stuff |and| things</p>')

      this.quill.link('http://www.example.com')

      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff <a href="http://www.example.com">and</a> things</p>')

      this.quill.link(false)

      expect(this.elem.innerHTML)
        .toEqual('<p>Stuff and things</p>')
    })

    it('can insert link over mixed content (1).', function () {
      setContent(this.elem, '<h2>One tw|o <em>th|ree</em></h2>')

      this.quill.link('#')

      expect(this.elem.innerHTML)
        .toEqual('<h2>One tw<a href="#">o <em>th</em></a><em>ree</em></h2>')

      this.quill.link(false)

      expect(this.elem.innerHTML)
        .toEqual('<h2>One two <em>three</em></h2>')
    })

    it('can insert links over entire elements (1).', function () {
      setContent(this.elem, '<p>One |<strong>two</strong>| three</p>')

      this.quill.link('/')

      // Different browsers treat this differently. We don't care, as
      // long as it's relatively semantic.
      expect(this.elem.innerHTML).toBeOneOf([
        '<p>One <a href="/"><strong>two</strong></a> three</p>',
        '<p>One <strong><a href="/">two</a></strong> three</p>'])

      this.quill.link(false)

      expect(this.elem.innerHTML)
        .toEqual('<p>One <strong>two</strong> three</p>')
    })

    it('can insert links over entire elements (2).', function () {
      setContent(this.elem, '<p>One <em>|two|</em> three</p>')

      this.quill.link('/')

      // Different browsers treat this differently. We don't care, as
      // long as it's relatively semantic.
      expect(this.elem.innerHTML)
        .toEqual('<p>One <em><a href="/">two</a></em> three</p>')

      this.quill.link(false)

      expect(this.elem.innerHTML)
        .toEqual('<p>One <em>two</em> three</p>')
    })

    it('can insert links over entire elements (3).', function () {
      setContent(this.elem, '<p>One |<strong>two|</strong> three</p>')

      this.quill.link('mailto:abc@example.com')

      expect(this.elem.innerHTML).toBeOneOf([
        '<p>One <strong><a href="mailto:abc@example.com">two</a></strong> three</p>',
        '<p>One <a href="mailto:abc@example.com"><strong>two</strong></a> three</p>'])

      this.quill.link(false)

      expect(this.elem.innerHTML)
        .toEqual('<p>One <strong>two</strong> three</p>')
    })
  })
})
