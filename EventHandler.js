 ﻿
function newEventHandler () {
  let thisObject = {
    name: undefined,                            // This is for debugging purposes only.
    listenToEvent: listenToEvent,
    stopListening: stopListening,
    raiseEvent: raiseEvent
  }

  var eventHandlers = []        // Here we store all the functions we will call when an event is raiseed.

  return thisObject

  function initialize () {

  }

  function listenToEvent (eventType, handler, extraData) {
    eventHandlers.push([eventType, handler, extraData])
  }

  function stopListening (pEventType, pHandler) {
    if (pHandler === undefined) {
      pHandler = 'Anonymous Function'
    }

    for (let i = 0; i < eventHandlers.length; i++) {
      let record = eventHandlers[i]
      let eventType = record[0]
      let handler = record[1]

      if (pHandler === 'Anonymous Function') {
        if (pEventType === eventType) {
          eventHandlers.splice(i, 1)

          return
        }
      } else {
        if (pEventType === eventType && pHandler.toString() === handler.toString()) {
          eventHandlers.splice(i, 1)

          return
        }
      }
    }
  }

  function raiseEvent (eventType, event) {
    for (var i = 0; i < eventHandlers.length; i++) {
            /* We will execute all the functions listening to this event type. */

      if (eventHandlers[i][0] === eventType) {
        var handler = eventHandlers[i][1]
        var extraData = eventHandlers[i][2]

        handler(event, extraData)
      }
    }
  }
}
