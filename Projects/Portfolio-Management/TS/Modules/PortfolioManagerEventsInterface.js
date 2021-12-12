exports.newPortfolioManagementModulesPortfolioManagerEventsInterface = function (processIndex) {
    /*
    This object represents the interface between the Portfolio Manager and Trading Bots.
    It is an events based interface because the communicatin happens via the Events Server.
    */
    let thisObject = {
        run: run,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    function run() {
        for (let i = 0; i < TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES.length; i++) {
            let sessionId = TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES[i].referenceParent.id
            waitForRequests(sessionId)
        }
    }

    function waitForRequests(sessionId) {

        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
            sessionId,
            'Request From Trading Bot',
            undefined,
            sessionId,
            undefined,
            onRequest)

        function onRequest() {
            message = arguments[0].event
            let response = 'This is the response'///portfolioSystem.newRequest(message)

            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(
                sessionId,
                'Response From Profile Manager',
                response
            )
        }
    }
}