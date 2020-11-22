
function newEventHandler() {
    let thisObject = {
        name: undefined,                            // This is for debugging purposes only.
        listenToEvent: listenToEvent,
        stopListening: stopListening,
        raiseEvent: raiseEvent,
        finalize: finalize
    }

    let eventHandlers = []        // Here we store all the functions we will call when an event is raiseed.

    return thisObject

    function finalize() {
        eventHandlers = []
    }

    function listenToEvent(eventType, handler, extraData) {
        let eventSubscriptionId = newUniqueId()
        eventHandlers.push([eventType, handler, extraData, eventSubscriptionId])
        return eventSubscriptionId
    }

    function stopListening(pEventSubscriptionId) {
        for (let i = 0; i < eventHandlers.length; i++) {
            if (pEventSubscriptionId === eventHandlers[i][3]) {
                eventHandlers.splice(i, 1)
                return
            }
        }
    }

    function raiseEvent(eventType, event) {
        for (var i = 0; i < eventHandlers.length; i++) {
            /* We will execute all the functions listening to this event type. */

            if (eventHandlers[i][0] === eventType) {
                let handler = eventHandlers[i][1]
                let extraData = eventHandlers[i][2]

                handler(event, extraData)
            }
        }
    }
}
