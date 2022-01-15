const createError = require('http-errors');

exports.newWebAppInterface = function newWebAppInterface() {
    /*
    This module handles the incoming messages from the Web App.
    At it's current version, it will just forward those messages
    to the Network Node it is connected to.

    Later, it will try to use the personal social graph as a cache,
    so as to minimize the requests to Network Nodes.
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

    async function messageReceived(message) {
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
                return await DK.desktopApp.p2pNetworkClient.socialGraphNetworkServiceClient.messageReceived(messageHeader)
                break
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