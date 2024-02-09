exports.newWebAppInterface = function newWebAppInterface() {
    /*
    This module handles the incoming messages from the Web App.
    At it's current version, it will just routes the messages to the Network
    Service Client that is going to process them.
    */
    let thisObject = {
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    async function sendMessage(message) {
        let messageHeader
        try {
            messageHeader = JSON.parse(message)
        } catch (err) {
            let response = {
                result: 'Error',
                message: 'messageHeader Not Correct JSON Format.'
            }
            return JSON.stringify(response)
        }

        switch (messageHeader.networkService) {
            case 'Social Graph': {
                let response = await ST.socialTradingApp.p2pNetworkClient.socialGraphNetworkServiceClient.sendMessage(messageHeader)
                return response
            }
            case 'Trading Signals': {
                break
            }
            default: {
                let response = {
                    result: 'Error',
                    message: 'networkService Not Supported.'
                }
                return JSON.stringify(response)
            }
        }
    }
}