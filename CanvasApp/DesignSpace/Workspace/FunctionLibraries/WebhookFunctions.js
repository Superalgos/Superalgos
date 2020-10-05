function newWebhookFunctions() {
    thisObject = {
        sendTestMessage: sendTestMessage
    }

    return thisObject

    function sendTestMessage(node, callBackFunction) {
        let testMessage = loadPropertyFromNodeConfig(node.payload, 'testMessage')
        let letURL = loadPropertyFromNodeConfig(node.payload, 'webhookURL')

        callServer(testMessage, letURL, onResponse)

        function onResponse(err) {
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
            } else {
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
        }
    }
}
