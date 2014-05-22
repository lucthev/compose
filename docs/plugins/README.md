# Plugins

Plugins extend the basic functionality provided by Compose. Plugins are functions that are called with the `new` constructor and passed an instance of Compose as their first parameter.

## Example

The best way to learn is by example. In this example, we're going to make a a plugin that converts all text to uppercase. For simplicity, we'll assume this plugin will only be used in modes that allow only plain text (e.g. the bundled [Inline mode](https://github.com/lucthev/compose/tree/master/docs/inline.md)).

We'll call our plugin `UpperCase`. Plugins are passed an instance of Compose as their first parameter, so let's account for that:

```js
function UpperCase (Compose) {}
```

Great. It doesn't do anything yet, but we'll add some functionality soon. if we try using it (`Compose#use( UpperCase )`), however, Compose will complain:

```
✗ Error: Plugins should be named via a 'plugin' property.
```

Plugins must have a name so that Compose can disable them upon destruction (or individually by calling `Compose#disable( 'pluginName' )`). So let's give our plugin a name:

```js
function UpperCase (Compose) {}

UpperCase.plugin = 'upperCase'
```

And now the fun part: making all text uppercase. We'll listen for Compose's `input` event and make changes as appropriate:

```js
// The event listener. This will be bound to Compose, so don't worry
// about the liberal use of 'this'.
function onInput () {
  var children = this.elem.childNodes,
      node,
      i

  // We want to preserve the selection.
  this.selection.save()

  // Iterate through the editor element's children.
  for (i = 0; i < children.length; i += 1) {

    node = children[i]

    // We can use Compose's Node module to determine if the node
    // is a text node:
    if (this.node.isText(node)) {

      // Make everything uppercase.
      node.data = node.data.toUpperCase()
    }
  }

  // Restore the selection.
  this.selection.restore()
}

function UpperCase (Compose) {

  Compose.on('input', onInput.bind(Compose))
}

UpperCase.plugin = 'UpperCase'
```

This should now work. But what what happends if you try to disable it?

```js
var editor = new Compose('#someID')

editor.use(UpperCase)

editor.disable('upperCase')
```

You'll notice text still gets converted to uppercase; this is because the event listener our UpperCase module added is never removed when being disabled. So let's add that functionality:

```js
function onInput () {
  var children = this.elem.childNodes,
      node,
      i

  this.selection.save()

  for (i = 0; i < children.length; i += 1) {
    node = children[i]

    if (this.node.isText(node))
      node.data = node.data.toUpperCase()
  }

  this.selection.restore()
}

function UpperCase (Compose) {

  // Note that we have to keep the bound event handler here to
  // be able to get rid of it later.
  this.onInput = onInput.bind(Compose)

  // We'll also have to keep a reference to 'off' somewhere.
  this.off = Compose.off.bind(Compose)

  Compose.on('input', this.onInput)
}

// If plugins present a 'destroy' method, it will be called when that
// plugin is being disabled.
UpperCase.prototype.destroy = function () {

  // Remove the event listener:
  this.off('input', this.onInput)
}

UpperCase.plugin = 'UpperCase'
```

And that's it! We've made a plugin that converts all input to uppercase.

## Caveat

Walking through the editor after input and making transformations on nodes is exactly what the [Sanitizer](https://github.com/lucthev/compose/tree/master/docs/formatting/sanitizer.md) module does. It would have been simpler to implement our plugin as a sanitizer filter, with the added benefit of being able to work in any mode:

```js
function textFilter (textNode) {
  textNode.data = textNode.data.toUpperCase()
}

function UpperCase (Compose) {
  this.sanitizer = Compose.sanitizer

  Compose.sanitizer.addTextFormatter(textFilter)
}

UpperCase.prototype.destroy = function () {
  this.sanitizer.removeTextFilter(textFilter)
}

UpperCase.plugin = 'upperCase'
```
