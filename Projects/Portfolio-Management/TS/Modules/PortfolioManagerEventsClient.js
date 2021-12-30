exports.newPortfolioManagementModulesPortfolioManagerEventsClient = function (processIndex) {
    /*
    This object represents the client to access the Portfolio Manager Interface from a Trading Bot.
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

    async function sendMessage(message, timeout) {

        /* This function packages a communication transaction with Portfolio Bot:
         *  First listening for the response
         *  Second raising the event
         *  Third resolving the promise by returning the reply
         */

        let promise = new Promise((resolve, reject) => {

            let promiseStatus = 'Unresolved'
            if (timeout !== undefined) {
                setTimeout(onTimeout, timeout)
            }
            /* 
            First, listen for response
            */
            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
                SESSION_KEY,
                'Response From Portfolio Manager',
                undefined,
                SESSION_KEY,
                undefined,
                onResponse
            )
            /* 
            Second, Raise Event 
            */
            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(
                SESSION_KEY,
                'Request From Trading Bot',
                message
            )
            /* 
            Third, events Callback
            */
            function onResponse() {
                let response = arguments[0].event

                if (response !== undefined) {
                    if (response.reason === undefined) {
                        response.reason = "Reply from Portfolio Manager"
                    }                
                    if (promiseStatus === 'Unresolved') {
                        promiseStatus = 'Resolved'
                        resolve(response)
                    }
                } else {
                    if (promiseStatus === 'Unresolved') {
                        promiseStatus = 'Rejected'
                        reject()
                    }
                }
            }

            function onTimeout() {
                    if (promiseStatus === 'Unresolved') {
                    let response = {
                        status: 'Timeout',
                        value: 0,
                        reason: "Portfolio Manager Not Responding"
                    }
                    promiseStatus = 'Resolved'
                    resolve(response)
                }
            }
        })
        return promise
    }
}