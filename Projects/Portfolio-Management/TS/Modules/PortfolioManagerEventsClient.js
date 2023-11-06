exports.newPortfolioManagementModulesPortfolioManagerEventsClient = function (processIndex) {
    /*
    This code runs inside the Trading Bots.
    
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
    let onMessageFunctionsMap = new Map()

    return thisObject

    function initialize() {

    }

    function finalize() {
        onMessageFunctionsMap = undefined
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
            message.messageId = SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId()
            onMessageFunctionsMap.set(message.messageId, onMessageFunction)

            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(
                SESSION_KEY,
                'Request From Trading Bot',
                message
            )
            /* 
            Third, events Callback
            */
            function onMessageFunction(response) {

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
                        promiseStatus = 'Resolved'
                        let response = {
                            status: 'Error',
                            value: 0,
                            reason: "Communication Error"
                        }
                        resolve(response)
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
                    onMessageFunctionsMap.delete(message.messageId)
                    resolve(response)
                }
            }
        })
        return promise
    }

    function onResponse(messageHeader) {
        let onMessageFunction = onMessageFunctionsMap.get(messageHeader.event.messageId)

        if (onMessageFunction !== undefined) {
            onMessageFunctionsMap.delete(messageHeader.event.messageId)
            onMessageFunction(messageHeader.event)
        } else {
            // This message does not have a request waiting for it, so it will be ignored.
        }
    }
}