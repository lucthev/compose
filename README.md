# Compose

Yet another rich text editing thing. See it in action [here](http://thevenard.me/compose).

## Installation

You can install compose via Bower, or just grab the files [here](https://github.com/lucthev/compose/releases/tag/v0.0.1).

```
$ bower install compose
```

On npm, `compose` is something else. Don't try that.

## Usage

Include Compose on your page somewhere (it's not picky):

```html
<script src="/path/to/compose.min.js"></script>
```

Then:

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

For more information, see the [project page](http://lucthev.github.io/compose) or [the documentation](https://github.com/lucthev/compose-toolbar/tree/master/docs).

## License

MIT.
