exports.newPortfolioManagementModulesPortfolioManagerEventsClient = function (processIndex) {
    /*
    This object represents the client to access the Portfolio Manager from a Trading Bot.
    It is an events client because the communication with the Portfolio Manager happens 
    at the events layer, provided by the Events Server.
    */
    let thisObject = {
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    const SESSION_KEY = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    async function sendMessage(message) {

        /* This function packages a communication transaction with Portfolio Bot:
         *  First listening for the response
         *  Second raising the event
         *  Third resolving the promise by returning the reply
         */

        let promise = new Promise((resolve, reject) => {
            // First, listen for response:
            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
                SESSION_KEY,
                'Response From Profile Manager',
                undefined,
                SESSION_KEY,
                undefined,
                triggerOnEventsCallback
            );

            // Second, Raise Event:
            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(
                SESSION_KEY,
                'Request From Trading Bot',
                message
            );

            // Third, events Callback:
            function triggerOnEventsCallback() {
                console.log("-----HERE @ triggerOnResponse callback received----- arguments[0].event=>" + arguments[0].event);
                if (arguments[0].event !== undefined) {
                    resolve(arguments[0]);
                } else { reject(); }
            }
        });
        return promise;
    }
}