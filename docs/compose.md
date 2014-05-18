# compose.js

The entry point for Compose.

## API

Compose is an [EventEmitter](http://git.io/ee), so it inherits those instance methods (e.g. `on(...)`, `off(...)`, etc).

### var editor = new Compose( elem [, opts] )

Creates an instance of Compose. `elem` can be either an element or a query string (to be used with `document.querySelector`) with which to query an element. `opts` is an optional configuration object with any of the following keys:

`mode`: a Function that defines the mode, or one of the Strings `rich` or `inline` to use Compose's bundled Rich or Inline modes, respectively. Deafults to `rich`.

`debug`: a Boolean indicating whether or not to output debug information. Additionally, some things are disabled in debug mode (e.g. directional selection restores) that would otherwise not be.

### editor.use( Plugin, opts )

Makes the Compose instance use the given plugin. Plugins should be named via a `plugin` property; the plugin will then be accessible by name through the Compose instance. `opts` is an options object (or anything, really) that gets passed along to the plugin. For more information, see [writing a plugin](https://github.com/lucthev/compose/tree/master/docs/plugins/README.md).

### editor.disable( name )

Disables a plugin previously added via `Compose.use(...)`. `name` is the name of the plugin to be disabled, as defined by its `plugin` property.

### editor.destroy( )

Removes all event listeners, references to elements, etc. Disables all plugins. Removes editing capabilities from the editor. Basically, makes everything unusable.

### editor.setImmediate( fn )

Compose provides a setImmediate polyfill, adapted from [YuzuJS/setImmediate](https://github.com/YuzuJS/setImmediate). It schedules actions to be performed on the next turn of the event loop; it's essentially a more efficient version of `setTimeout(fn, 0)`. Compose also proves `clearImmediate`, should you need it.
