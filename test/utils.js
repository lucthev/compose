/**
 * fireEvent is borrowed from daviferreira/medium-editor; copyright goes to
 * the original author:
 *
 * Copyright 2014 Davi Ferreira
 * "THE BEER-WARE LICENSE" (Revision 42):
 *
 * As long as you retain this notice you can do whatever you want with this stuff. If we meet some
 * day, and you think this stuff is worth it, you can buy me a beer in return.
 */

function fireEvent (element, event, keyCode, ctrlKey, target, relatedTarget) {
  var evt

  if (document.createEvent) {
       // dispatch for firefox + others
       evt = document.createEvent('HTMLEvents');
       evt.initEvent(event, true, true ); // event type,bubbling,cancelable
       if (keyCode) {
        evt.keyCode = keyCode;
       }
       if (ctrlKey) {
        evt.ctrlKey = true;
       }
       if (target) {
        evt.target = target;
       }
       if (relatedTarget) {
        evt.relatedTarget = relatedTarget;
       }
       return !element.dispatchEvent(evt);
   } else {
       // dispatch for IE
       evt = document.createEventObject();
       return element.fireEvent('on'+event,evt)
   }
}

function setContent (elem, html) {
  var sel = window.getSelection(),
      range = document.createRange(),
      markers

  elem.innerHTML = html.replace(/\|/g, '<span class="Quill-marker"></span>')

  if (/\|/.test(html)) {
    markers = elem.querySelectorAll('.Quill-marker')

    range.setStartBefore(markers[0])

    if (markers.length === 1)
      range.setEndAfter(markers[0])
    else range.setEndAfter(markers[1])

    for (var i = 0; i < markers.length; i += 1) {
      var parent = markers[i].parentNode

      parent.removeChild(markers[i])

      parent.normalize()
    }

    sel.removeAllRanges()
    sel.addRange(range)
  }
}