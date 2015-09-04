# Compose

Compose is a rich text editor for the web. It’s still under development — it’s fairly stable, but there are still a few major [issues][issues] that need to be resolved before it’s production-ready.

## Contributing

If you like what you see, and would like to contribute, please do! Claim [an issue][issues] as your own by commenting on it — see [below](#how-it-works-the-basics) for the very basics of how Compose works, and, beyond that, I’d be happy to answer any questions you may have.

[Node.js](http://nodejs.org/) and [npm](https://github.com/npm/npm) are needed for development on Compose. Clone the repository, then run `npm install -D` wherever you cloned Compose to, and you should be good to go. Some useful shortcuts for once you’re all set up:

`npm run dev`: watches files and rebuilds Compose when they change. You can play around with your changes by opening `test/functional/test.html` in a browser; hitting the tab key will initialize an empty editor and focus it.

`npm test`: unsurprisingly, this runs the test suite. By default, tests are run in Firefox; to run the tests in Chrome, just do:

```
$ npm install karma-chrome-launcher
$ BROWSER=chrome npm test
```

## How it works (the basics)

At the heart of Compose are two modules: [`serialize-elem`][serelem] and [`choice`][choice]. The user’s selection is saved using `choice`, and the coordinates of that selection can then be used to manipulate rich text using `serialize-elem`. For example, say an user has entered text like so (the `|` denote the endpoints of a left-to-right selection):

```html
<article contenteditable="true">
  <p>Stuff |and| things</p>
</article>
```

Now let’s suppose the user wants to make the selected text italic. We can accomplish this by first saving the selection, using `choice`; it will look like:

```js
/**
 * These are the start and end points of the selection; it starts in
 * paragraph 0, after the sixth character, and ends in paragraph 0
 * after the ninth character.
 */
{
  start: [0, 6],
  end: [0, 9]
}
```

Now, we convert the selected paragraph into an instance of `serialize-elem`, which will allow us to work with it much more easily. We can then make text italic by using some of the serialization’s methods. What we essentially end up doing is:

```js
var paragraph = new Serialize(thatParagraph)

paragraph.addMarkups({
  type: Serialize.types.italic,
  start: 6,
  end: 9
})

thatParagraph.parentNode.replaceChild(paragraph.toElement(), thatParagraph)
```

All that’s left is to restore the user’s saved selection using `choice`, resulting in:

```html
<article contenteditable="true">
  <p>Stuff <em>|and|</em> things</p>
</article>
```

That’s the basic idea behind Compose. If you’d like to dig deeper, [here](https://github.com/lucthev/compose/blob/v1.0/src/richMode/view.js) and [here](https://github.com/lucthev/compose/blob/v1.0/src/richMode/smartText.js) are good places to get a better understanding of how it works in practice. If you have any questions, feel free to ask them via GitHub’s [issue tracker][issues] — I’ll try and get back to you as soon as possible. There’s also a relatively thorough test suite, so, if you would like to see what a particular piece of code does, try commenting it out and see which tests start failing.

## License

MIT.

[issues]: https://github.com/lucthev/compose/issues
[serelem]: https://github.com/lucthev/serialize
[choice]: https://github.com/lucthev/choice
