# Node

A collection of node and element-related utilities.

## API

An instance of Node is available as Compose#node.

### var node = new Node( Compose )

Creates an instance of Node. Does not rely on any of Compose's modules.

### node.isElem( node )

Determines if the given object is an Element.

### node.isText( node )

Determines if the given object is a text node.

### node.isBlock( elem )

Determines if the given element is a block element, by matching the node's name against [a list](https://github.com/lucthev/compose/blob/master/src/node.js#L30-L33) of block elements.

__Note__: the list is incomplete, but it should suffice for most editing applications.

### node.isInline( elem )

Determines if the given element is an inline element, by matching the node's name against [a list](https://github.com/lucthev/compose/blob/master/src/node.js#L46-L47) of inline elements.

__Note__: the list is incomplete, but it should suffice for most editing applications.

### node.getContaining( node )

Returns the immediate child of the editor element that contains the given node, or false if the given node is not a child of the editor element. Only useful in modes that allow for block elements (i.e. using this in [Inline mode](https://github.com/lucthev/compose/blob/master/docs/inline.md) will not yield meaningful results).

### node.childOf( node, tagName )

Tests if the given node is a child of an element whose tag matches the  regular expression `tagName`. If so, returns the matched element; else, returns false. `tagName` can also be a string, in which case it is assumed the string should match only the full, case-insensitive tag name of an element (i.e. we make the RegExp `/^tagName$/i`).

### node.areSimilar( elem1, elem2 )

Determines if two elements are similar. Two elements are said to be similar if they have the same tag name and the same attributes. Returns a boolean.

### node.destroy( )

Deletes references to elements.
