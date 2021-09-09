exports.newSocialTradingModulesWebAppInterface = function newSocialTradingModulesWebAppInterface() {
    /*
    This module handles the incomming messages from the Web App.
    At it's current iteration, it will jusr forward those messages
    to the Network Node it is connected to.
    */
    let thisObject = {
        messageReceived: messageReceived,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    async function messageReceived(messageHeader) {
        let response = await DK.running.webSocketsClient.sendMessage(messageHeader)
        return response
    }
}