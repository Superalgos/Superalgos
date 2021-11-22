function newSocialBotsFunctionLibrarySocialBotsFunctions() {
    let thisObject = {
        sendTelegramTestMessage: sendTelegramTestMessage,
        sendDiscordTestMessage: sendDiscordTestMessage,
        sendSlackTestMessage: sendSlackTestMessage,
        sendTwitterTestMessage: sendTwitterTestMessage
    }

    return thisObject

    function sendTelegramTestMessage(node, callBackFunction) {

        let botToken = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'botToken')
        let chatId = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'chatId')

        if (botToken === undefined) {
            node.payload.uiObject.setErrorMessage('botToken parameter not defined.')
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }

        if (chatId === undefined) {
            node.payload.uiObject.setErrorMessage('chatId parameter not defined.')
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }

        let params = {
            text: "Test Message from Superalgos",
            chat_id: chatId
        }

        httpRequestJSON(JSON.stringify(params),"https://api.telegram.org/bot" + botToken  + "/sendMessage", onResponse)

        function onResponse(err) {
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                node.payload.uiObject.setInfoMessage('Telegram message sent.')
                callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
            } else {
                node.payload.uiObject.setErrorMessage('Could not send Telegram message. Error Response: ' + err.message)
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
        }

        function httpRequestJSON(pContentToSend, pPath, callBackFunction) {
            let xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, xmlHttpRequest.responseText);
                    return;
                } else if (this.readyState === 4 && (this.status === 404 || this.status === 401 || this.status === 400)) {
                    callBackFunction({
                        result: "Fail",
                        message: JSON.parse(xmlHttpRequest.responseText).description,
                        code: JSON.parse(xmlHttpRequest.responseText).error_code
                    });
                    return;
                }
            };

            if (pContentToSend === undefined) {
                xmlHttpRequest.open("GET", pPath, true);
                xmlHttpRequest.send();
            } else {
                try {
                    let blob = new Blob([pContentToSend], { type: 'application/json' });
                    xmlHttpRequest.open("POST", pPath, true);
                    xmlHttpRequest.send(blob);
                } catch (err) {
                    if (ERROR_LOG === true) { console.log(spacePad(MODULE_NAME, 50) + " : " + "[ERROR] callServer -> err.message = " & err.message); }
                    callBackFunction({ result: "Fail", message: err.message })
                }
            }
        }
    }

    function sendDiscordTestMessage(node, callBackFunction) {

        let webhookURL = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'webhookURL')

        if (webhookURL === undefined) {
            node.payload.uiObject.setErrorMessage('webhookURL parameter not defined.')
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }

        let message = "Test message from Superalgos!"

        httpRequestJSON(JSON.stringify({content: message}), webhookURL, onResponse)

        function onResponse(err) {
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                node.payload.uiObject.setInfoMessage('Discord message sent.')
                callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
            } else {
                node.payload.uiObject.setErrorMessage('Could not send Discord message. Error Response: ' + err.message)
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
        }

        function httpRequestJSON(pContentToSend, pPath, callBackFunction) {
            let xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, xmlHttpRequest.responseText);
                    return;
                } else if (this.readyState === 4 && (this.status === 404 || this.status === 401 || this.status === 400)) {
                    callBackFunction({
                        result: "Fail",
                        message: JSON.parse(xmlHttpRequest.responseText).description,
                        code: JSON.parse(xmlHttpRequest.responseText).error_code
                    });
                    return;
                }
            };

            if (pContentToSend === undefined) {
                xmlHttpRequest.open("GET", pPath, true);
                xmlHttpRequest.send();
            } else {
                try {
                    let blob = new Blob([pContentToSend], { type: 'application/json' });
                    xmlHttpRequest.open("POST", pPath, true);
                    xmlHttpRequest.send(blob);
                } catch (err) {
                    if (ERROR_LOG === true) { console.log(spacePad(MODULE_NAME, 50) + " : " + "[ERROR] callServer -> err.message = " & err.message); }
                    callBackFunction({ result: "Fail", message: err.message })
                }
            }
        }
    }

    function sendSlackTestMessage(node, callBackFunction) {

        let webhookURL = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'webhookURL')

        if (webhookURL === undefined) {
            node.payload.uiObject.setErrorMessage('webhookURL parameter not defined.')
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }

        let message = "Test message from Superalgos!"

        httpRequestJSON(JSON.stringify({text: message}), webhookURL, onResponse)

        function onResponse(err) {
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                node.payload.uiObject.setInfoMessage('Slack message sent.')
                callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
            } else {
                node.payload.uiObject.setErrorMessage('Could not send Slack message. Error Response: ' + err.message)
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
        }

        function httpRequestJSON(pContentToSend, pPath, callBackFunction) {
            let xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, xmlHttpRequest.responseText);
                    return;
                } else if (this.readyState === 4 && (this.status === 404 || this.status === 401 || this.status === 400)) {
                    callBackFunction({
                        result: "Fail",
                        message: xmlHttpRequest.responseText
                    });
                    return;
                }
            };

            if (pContentToSend === undefined) {
                xmlHttpRequest.open("GET", pPath, true);
                xmlHttpRequest.send();
            } else {
                try {
                    let blob = new Blob([pContentToSend]);
                    xmlHttpRequest.open("POST", pPath, true);
                    xmlHttpRequest.send(blob);
                } catch (err) {
                    if (ERROR_LOG === true) { console.log(spacePad(MODULE_NAME, 50) + " : " + "[ERROR] callServer -> err.message = " & err.message); }
                    callBackFunction({ result: "Fail", message: err.message })
                }
            }
        }
    }

    function sendTwitterTestMessage(node, callBackFunction) {
        let message = {text: "Test message from Superalgos!"}

        if (UI.environment.DEMO_MODE === true) {
            if (window.location.hostname !== 'localhost') {
                node.payload.uiObject.setWarningMessage('Superalgos is running is DEMO MODE. This means that you can not send test messages.', 5)
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                return
            }
        }

        let validationsResult = validations(node)
        if (validationsResult === undefined) {
            // If something fails at validations we just quit.
            console.log('[DEBUG] valiations empty')
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }
        let lanNetworkNode = validationsResult.lanNetworkNode
        if (lanNetworkNode === undefined) {
            // This means that the validations failed.
            console.log('[DEBUG] lan network empty')
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }

        // create event listener
        console.log('[DEBUG] creating listener')
        let eventSubscriptionIdOnStatus
        let eventsServerClient = UI.projects.foundations.spaces.designSpace.workspace.eventsServerClients.get(lanNetworkNode.id)
        let eventHandlerKey = `Social Bot - ${node.payload.parentNode.payload.parentNode.payload.parentNode.id}`
        console.log('[DEBUG] event handler key: ', eventHandlerKey)
        eventsServerClient.listenToEvent(eventHandlerKey, 'Test announcement', undefined, node.id, onResponse, onStatus)

        // create event
        console.log('[DEBUG] creating event')
        let event = {
            message: message
        }
        let key = node.name + '-' + node.type + '-' + node.id
        eventsServerClient.raiseEvent(key, 'Test announcement', event)

        function onResponse(message) {
            console.log('[DEBUG] on response')
            eventSubscriptionIdOnStatus = message.eventSubscriptionId
        }

        function onStatus(message) {
            console.log('[DEBUG] on status')
            eventsServerClient.stopListening(eventHandlerKey, eventSubscriptionIdOnStatus, node.id)

            if (message.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                node.payload.uiObject.setInfoMessage('Twitter message sent.')
                callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
            } else {
                node.payload.uiObject.setErrorMessage('Could not send Twitter message. Error Response: ' + err.message)
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
        }
    }

    function validations(node) {
        let result = {}
        console.log(node)
        result.taskManager = node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode
        result.lanNetworkNode = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(result.taskManager, 'LAN Network Node', undefined, true, false, true, false)

        return result
    }
}
