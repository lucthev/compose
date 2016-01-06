/* eslint-env mocha */
'use strict'

/**
 * Manual tests to be run when the view code is changed. Testing
 * these is hard, and various Selenium oddities make it unreliable.
 */
describe.skip('The view should', function () {
  it('emit selectionchange events on input')
  it('emit selectionchange events when arrow keys result in caret movement')
  it('not emit selectionchange events when arrow keys do not cause movement')
  it('emit selectionchange events when clicks cause movement')
  it('not emit selectionchange events when clicks do not cause movement')
  it('emit selectionchange events when the selection changes programatically')

  it('emit delta events on input')
  it('emit delta events on resolve (e.g. spacebar)')
  it('emit contentchanged events on input')
  it('emit contentchanged events after spacebar')

  it('not prevent IME composition by needlessly restoring the selection')
  // it('not restore the selection after regular input') // Same as above
  it('always restore the selection after arrow keys')
  it('always restore the selection after a click or focus')

  it('not sync after a resolve (e.g. spacebar)')
  it('not sync after a programmatic selection change (e.g. selectall)')
})
