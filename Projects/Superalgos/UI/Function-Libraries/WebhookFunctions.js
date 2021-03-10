function newSuperalgosFunctionLibraryWebhookFunctions() {
    thisObject = {
        sendTestMessage: sendTestMessage
    }

    return thisObject

    function sendTestMessage(node, callBackFunction) {
        let testMessage = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(node.payload, 'testMessage')
        let letURL = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(node.payload, 'webhookURL')

        httpRequest(testMessage, letURL, onResponse)

        function onResponse(err) {
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                node.payload.uiObject.setInfoMessage('Test Message sent to the Client.')
                callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
            } else {
                node.payload.uiObject.resetErrorMessage('Could not send Test Message to the Client.')
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
        }
    }
}
