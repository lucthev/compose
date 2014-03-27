/**
 * This code is borrowed from daviferreira/medium-editor; copyright goes to
 * the original author:
 *
 * Copyright 2014 Davi Ferreira
 * "THE BEER-WARE LICENSE" (Revision 42):
 *
 * As long as you retain this notice you can do whatever you want with this stuff. If we meet some
 * day, and you think this stuff is worth it, you can buy me a beer in return.
 */

function fireEvent (element, event, keyCode, ctrlKey, target, relatedTarget) {
   if (document.createEvent) {
       // dispatch for firefox + others
       var evt = document.createEvent("HTMLEvents");
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
       var evt = document.createEventObject();
       return element.fireEvent('on'+event,evt)
   }
}