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

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    async function sendMessage(message) {

    }

    
}