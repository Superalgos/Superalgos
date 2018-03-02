
function newEventHandler() {

    const CONSOLE_LOG = false;

    let thisObject = {
        name: undefined,                            // This is for debugging purposes only.
        parentEventHandler: undefined,              // Here we store the parent cointainer zoom object. 
        listenToEvent: listenToEvent,
        raiseEvent: raiseEvent,
        initialize: initialize
    };

    var eventHandlers = [];        // Here we store all the functions we will call when an event is comming.

    return thisObject;

    function initialize() {

        
    }

    function listenToEvent(eventType, handler, extraData) {

        eventHandlers.push([eventType, handler, extraData]);

        if (thisObject.name !== undefined && CONSOLE_LOG === true) {

            console.log("Event Handler named " + thisObject.name + " received a request to listenToEvent " + eventType + " and call " + (handler.toString()).substring(0, 50));

        }

    }

    function raiseEvent(eventType, event) {

        if (thisObject.name !== undefined && CONSOLE_LOG === true) {

            console.log("Event Handler named " + thisObject.name + " received a request to raiseEvent " + eventType + " with this data " + (event.toString()).substring(0, 50));

        }

        for (var i = 0; i < eventHandlers.length; i++) {

            /* We will execute all the functions listening to this event type. */

            if (eventHandlers[i][0] === eventType) {

                var handler = eventHandlers[i][1];
                var extraData = eventHandlers[i][2];

                if (thisObject.name !== undefined && CONSOLE_LOG === true) {

                    console.log("Event Handler named " + thisObject.name + " received a request to raiseEvent " + eventType + " and will call this handler: " + (handler.toString()).substring(0,50));

                }

                handler(event, extraData);

            }
        }
    }
}
