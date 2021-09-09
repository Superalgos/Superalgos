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

    async function messageReceived(message) {
        let messageHeader
        try {
            messageHeader = JSON.parse(message)
        } catch (err) {
            let response = {
                result: 'Error',
                message: 'messageHeader Not Coorrect JSON Format.'
            }
            return JSON.stringify(response)
        }

        switch (messageHeader.requestType) {
            case 'Query': {
                let queryMessage
                try {
                    queryMessage = JSON.parse(messageHeader.queryMessage)
                } catch (err) {
                    let response = {
                        result: 'Error',
                        message: 'queryMessage Not Coorrect JSON Format.'
                    }
                    return JSON.stringify(response)
                }
                queryMessage.emitterUserProfileId = DK.TEST_NETWORK_CLIENT_USER_PROFILE_ID
                messageHeader.queryMessage = JSON.stringify(queryMessage)

                let response = {
                    result: 'Ok',
                    message: 'Web App Interface Query Processed.',
                    data: await DK.running.webSocketsClient.sendMessage(JSON.stringify(messageHeader))
                }
                return response
            }
            case 'Event': {
                let eventMessage
                try {
                    eventMessage = JSON.parse(messageHeader.eventMessage)
                } catch (err) {
                    let response = {
                        result: 'Error',
                        message: 'eventMessage Not Coorrect JSON Format.'
                    }
                    return JSON.stringify(response)
                }
                eventMessage.emitterUserProfileId = DK.TEST_NETWORK_CLIENT_USER_PROFILE_ID
                messageHeader.eventMessage = JSON.stringify(eventMessage)

                let response = {
                    result: 'Ok',
                    message: 'Web App Interface Event Processed.',
                    data: await DK.running.webSocketsClient.sendMessage(JSON.stringify(messageHeader))
                }
                return response
            }
            default: {
                let response = {
                    result: 'Error',
                    message: 'requestType Not Supported.'
                }
                return JSON.stringify(response)
            }
        }
    }
}