exports.newPortfolioManagementModulesPortfolioManagerEventsInterface = function (processIndex) {
    /*
    This object represents the interface between the Portfolio Manager and Trading Bots.
    It is an events based interface because the communication happens via the Events Server.
    */
    let thisObject = {
        run: run,
        initialize: initialize,
        finalize: finalize
    }

    var MANAGERS_KEY;

    return thisObject

    function initialize() {
        MANAGERS_KEY = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY;
    }

    function finalize() {

    }

    function run() {
        for (let i = 0; i < TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES.length; i++) {
            
            let SESSION_KEY = TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES[i].referenceParent.name +
            '-' + TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES[i].referenceParent.type +
            '-' + TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES[i].referenceParent.id;
            
            waitForRequests()

            function waitForRequests() {

                TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
                    SESSION_KEY,
                    'Request From Trading Bot',
                    undefined,
                    SESSION_KEY,
                    undefined,
                    onRequest)
        
                function onRequest() {
                    let message  = arguments[0].event;
                    message.returnToCallerId = arguments[0].callerId;
                    inbound(message);
                    
                    /*let response = 'This is the response'///portfolioSystem.newRequest(message)
        
                    TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(
                        SESSION_KEY,
                        'Response From Profile Manager',
                        response
                    )*/
                }
            }            
        }
    }

    function inbound(message) {
        // First, listen for processed response:
        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
            MANAGERS_KEY,
            message.returnToCallerId,
            undefined,
            undefined,
            undefined,
            outbound
        );

        // Second, hand off event to PortfolioManager BotModule:
        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(
            MANAGERS_KEY,
            message.question,
            message
        );
    }

    function outbound() {
        let message = arguments[0];


        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(
            message.event.returnToCallerId,
            'Response From Portfolio Manager',
            message.event
        )
    }
}