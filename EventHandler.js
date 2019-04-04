 ﻿
function newEventHandler () {
  const CONSOLE_LOG = false

  let thisObject = {
    name: undefined,                            // This is for debugging purposes only.
    parentEventHandler: undefined,              // Here we store the parent cointainer zoom object.
    listenToEvent: listenToEvent,
    stopListening: stopListening,
    raiseEvent: raiseEvent,
    initialize: initialize
  }

  var eventHandlers = []        // Here we store all the functions we will call when an event is comming.

  return thisObject

  function initialize () {

  }

  function listenToEvent (eventType, handler, extraData) {
    eventHandlers.push([eventType, handler, extraData])

    if (thisObject.name !== undefined && CONSOLE_LOG === true) {
      console.log('Event Handler named ' + thisObject.name + ' received a request to listenToEvent ' + eventType + ' and call ' + (handler.toString()).substring(0, 50))
    }
  }

  function stopListening (pEventType, pHandler) {
    if (thisObject.name !== undefined && CONSOLE_LOG === true) {
      console.log('Event Handler named ' + thisObject.name + ' received a request to stop listening to an the event ' + pEventType + ' with this handler: ' + pHandler)
    }

    for (let i = 0; i < eventHandlers.length; i++) {
      let record = eventHandlers[i]
      let eventType = record[0]
      let handler = record[1]

      if (pEventType === eventType && pHandler.toString() === handler.toString()) {
        eventHandlers.splice(i, 1)

        if (thisObject.name !== undefined && CONSOLE_LOG === true) {
          console.log('Evethandler found and deleted.')
        }

        return
      }
    }
  }

  function raiseEvent (eventType, event) {
    if (thisObject.name !== undefined && CONSOLE_LOG === true) {
      console.log('Event Handler named ' + thisObject.name + ' received a request to raiseEvent ' + eventType + ' with this data ' + (event.toString()).substring(0, 50))
    }

    for (var i = 0; i < eventHandlers.length; i++) {
            /* We will execute all the functions listening to this event type. */

      if (eventHandlers[i][0] === eventType) {
        var handler = eventHandlers[i][1]
        var extraData = eventHandlers[i][2]

        if (thisObject.name !== undefined && CONSOLE_LOG === true) {
          console.log('Event Handler named ' + thisObject.name + ' received a request to raiseEvent ' + eventType + ' and will call this handler: ' + (handler.toString()).substring(0, 50))
        }

        handler(event, extraData)
      }
    }
  }
}
