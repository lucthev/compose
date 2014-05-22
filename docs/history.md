# History

The module that manages the undo/redo stack. Listens for the `change` event emitted by [Throttle](https://github.com/lucthev/compose/tree/master/docs/throttle.md) to push a new history item.

## API

By default, the in instance of History is available as `Compose#history`. For the most part, you shouldn't have to interact with it.

### var history = new History( Compose )

Creates an instance of History. Relies on Compose's [`Selection`](https://github.com/lucthev/compose/tree/master/docs/selection.md) module, so make sure that it is present upon initialization.

### history.push( item )

Pushes the given item onto the stack. `item` should really only be the innerHTML of th editor, otherwise this will cause problems when `undo`ing and `redo`ing.

### history.undo( )

Restores the editor to a previous state, if possible, using innerHTML previously pushed onto the stack. Tries to restore the selection.

### history.redo( )

Restores the editor to a newer state, if possible. Tries to restore the selection.

### history.destroy( )

Removes event listeners, deletes references to elements, etc. A clean-up task.

## Other useful properties

There are a couple other properties you might make use of.

### history.max

The maximum number of history items to keep. Defaults to 100. Setting this higher will allow you to go undo further, but may use more memory.

### history.stack

The array holding the history items.
