# Throttle

A module to buffer input events. Listens for Compose's `input` event, and emits a `change` event after a specified amount of time. You can set a maximum and minimum frequency for the change event; these default to 200ms and 460ms, respectively. If multiple `input` events are fired within a few ms of each other, only one `change` event will be fired: 200ms after the last `input` event. If the `input` event is repeatedly fired 199ms apart, however, the `change` event will still be emitted 460ms after the first `input` event. You can set the speed yourself via the `setSpeed( )` method.

## API

There's not much to see here. An instance of Throttle is available as `Compose#throttle`.

### var throttle = new Throttle( Compose )

Creates an instance of Throttle. Does not rely on any of Compose's modules except the EventEmitter methods.

### throttle.setSpeed( maximum, minimum )

Sets the maximum and minimum frequencies with which the `change` event will be fired. Note that the relationship is inversely propotional, so `maximum` is actually the smaller of the two numbers. Both `maximum` and `minumum` must be grater than 0, and `minimum` must be greater than `maximum`.

### throttle.destroy( )

Removes event listeners and deletes references to elements.
