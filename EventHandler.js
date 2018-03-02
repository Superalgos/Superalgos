
function newEventHandler() {

    let eventHandler = {
        containerName: "",                  // This is for debugging purposes only.
        parentEventHandler: undefined,             // Here we store the parent cointainer zoom object. 
        listenToEvent: listenToEvent,
        raiseEvent: raiseEvent,
        initialize: initialize
    };

    var eventHandlers = [];        // Here we store all the functions we will call when an event is comming.

    return eventHandler;

    function initialize() {

        
    }

    function listenToEvent(eventType, handler, extraData) {

        eventHandlers.push([eventType, handler, extraData]);

    }

    function raiseEvent(eventType, event) {

        for (var i = 0; i < eventHandlers.length; i++) {

            /* We will execute all the functions listening to this event type. */

            if (eventHandlers[i][0] === eventType) {

                var handler = eventHandlers[i][1];
                var extraData = eventHandlers[i][2];

                handler(event, extraData);

            }
        }
    }
}
