exports.newSocialTradingModulesWebAppInterface = function newSocialTradingModulesWebAppInterface() {

    let thisObject = {
        sendToWebApp: undefined,
        messageReceived: messageReceived,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    function messageReceived(messageHeader) {
        let response = {
            result: 'Ok',
            message: 'Hello !'
        }
        return  
    }
}