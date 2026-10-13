exports.newEventServerClient = function newEventServerClient() {
    let thisObject = {
        initialize: initialize,
        listenToEvent: listenToEvent,
        raiseEvent: raiseEvent,
        createEventHandler: createEventHandler
    };

    let eventsServerClient = PL.servers.TASK_MANAGER_SERVER.newEventsServerClient();

    return thisObject;

    function initialize() {
        // Inicializar cliente si se requiere alguna configuración previa
    }

    function createEventHandler(handlerName) {
        eventsServerClient.createEventHandler(handlerName);
    }

    function listenToEvent(handlerName, eventType, ...args) {
        eventsServerClient.listenToEvent(handlerName, eventType, ...args);
    }

    function raiseEvent(handlerName, eventType, event) {
        eventsServerClient.raiseEvent(handlerName, eventType, event);
    }
}