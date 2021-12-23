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
                    let message  = arguments[0];
                    SA.projects.portfolioManagement.globals.memory.modules.PORTFOLIO_MANAGER.processEvent(message.event)

                    // Return response:
                    TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(
                        message.callerId,
                        'Response From Portfolio Manager',
                        message.event
                    )
                }
            }            
        }
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