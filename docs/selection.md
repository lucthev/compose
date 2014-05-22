# Selection

A module for dealing with selection-related tasks.

## API

You may want to have a look at the native [Selection](https://developer.mozilla.org/en/docs/Web/API/Selection) and [Range](https://developer.mozilla.org/en/docs/Web/API/Range) APIs to gain a better understanding of this module.

Compose uses a marker system to keep track of the selection; when `selection.save( )` is called, for example, invisible `span`s, the markers, are placed in the document at the boundaries of the selection; these markers are then used to restore the selection when `selection.restore( )` is called.

An instance of Selection is available as `Compose#selection`.

### var selection = new Selection( Compose )

Creates an instance of Selection. Expects Compose's [Sanitizer](https://github.com/lucthev/compose/tree/master/docs/formatting/sanitizer.md) and [Node](https://github.com/lucthev/compose/tree/master/docs/node.md) modules to be present.

### selection.createMarker( atEnd )

Returns a marker element. This marker will be one of:

```html
<!-- If atEnd is false -->
<span class="Compose-marker start"></span>

<!-- If atEnd is true -->
<span class="Compose-marker end"></span>
```

### selection.isMarker( node )

Returns a boolean indicating whether or not the given node a selection marker.

### selection.getMarkers( )

Returns a NodeList of all markers in the editor.

### selection.removeMarkers( )

Removes any markers present in the editor at the time of calling.

### selection.selectRange( range [, backwards ] )

Selects the given range. Optionally, if `backwards` is true, reverses the direction of the selection to produce a right-to-left selection. If debug mode is enabled, however, the range will not be selected directionally.

### selection.save( )

Places markers in the editor to keep track of the selection. Useful when, say, manipulating elements in the editor, which would otherwise cause the selection to be lost.

### selection.restore( )

Restores the selection from previously placed markers.

### selection.getContaining( )

Returns the node containing the selection's anchor node, or false if the selection is not in the editor.

### selection.childOf( matcher )

Returns a boolean indicating whether or not the selection is wholly contained in an element whose tag name matches the RegExp `matcher`.

### selection.forEachBlock( action )

Iterates over the elements contained or partially contained in the selection that represent a 'visual' block (`<p>`, `<h2>`, etc., but `<li>`s instead of `<[ou]l>`). `action` is a function that is called once for each block, and is passed blocks in document order. Tolerates removal/replacement of nodes.

### selection.contains( query )

Returns a boolean indicating whther or not the selection contains nodes matching the `querySelector`-compatible String `query`.

### selection.isNewLine( )

Returns a boolean indicating whether or not the caret is on a new line. A new line is a `<p>` with no text content (other than potential [placeholders](https://github.com/lucthev/compose/tree/master/docs/plugins/placeholder.md)).

### selection.at( position, elem )

Determines if the caret is collapsed and at the start or end of `elem`, depending on the value of `position`. If `position` is the String `end`, checks if the caret is at the end of the element; if it is `start` or any other value, check if the caret is at the start.

### selection.placeCaret( node [, atEnd ] )

Places the caret at the start or the end of the Node `node`, depening on the value of the boolean `atEnd`.

### selection.destroy( )

Deletes references to elements, removes [Sanitizer](https://github.com/lucthev/compose/tree/master/docs/formatting/sanitizer.md) filters, etc.
