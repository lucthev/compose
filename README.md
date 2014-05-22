# Compose

Yet another rich text editing thing. See it in action [here](lucthev.github.io/compose/).

## Installation

You can install Compose via Bower, or just grab the files [here](https://github.com/lucthev/compose/releases/).

```
$ bower install compose
```

On npm, `compose` is something else. Don't try that.

## Usage

Include Compose on your page somewhere (it's not picky):

```html
<script src="/path/to/compose.min.js"></script>
```

Compose is a [UMD](https://github.com/umdjs/umd) module, which means you're not restricted to using it as a Global. Once you've loaded it:

```javascript
var editor = new Compose('#someID')

// Maybe use some plugins.
editor
  .use(Compose.plugin.placeholder, 'Write something…')
  .use(OtherPlugin)

// And maybe you don't want to use the built-in list plugin.
editor.disable('list')

// Or maybe you want to disable editing completely, for some reason.
editor.destroy()
```

## API

More in-depth API docs can be found in the [docs](https://github.com/lucthev/compose/tree/master/docs/) directory.

Compose is an [EventEmitter](http://git.io/ee), so it inherits those instance methods (e.g. `on(...)`, `off(...)`, etc).

### var editor = new Compose( elem [, opts] )

Creates an instance of Compose. `elem` can be either an element or a query string (to be used with `document.querySelector`) with which to query an element. `opts` is an optional configuration object with any of the following keys:

`mode`: a Function that defines the mode, or one of the Strings `rich` or `inline` to use Compose's bundled Rich or Inline modes, respectively. Deafults to `rich`.

`debug`: a Boolean indicating whether or not to output debug information. Additionally, some things are disabled in debug mode (e.g. directional selection restores) that would otherwise not be.

### editor.use( Plugin, opts )

Makes the Compose instance use the given plugin. Plugins should be named via a `plugin` property; the plugin will then be accessible by name through the Compose instance. `opts` is an options object (or anything, really) that gets passed along to the plugin. For more information, see [writing a plugin](https://github.com/lucthev/compose/tree/master/docs/plugins/).

### editor.disable( name )

Disables a plugin previously added via `Compose.use(...)`. `name` is the name of the plugin to be disabled, as defined by its `plugin` property.

### editor.destroy( )

Removes all event listeners, references to elements, etc. Disables all plugins. Removes editing capabilities from the editor. Basically, makes everything unusable.

## License

MIT.
