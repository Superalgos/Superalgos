function newFoundationsFunctionLibrarySocialBotsFunctions() {
    let thisObject = {
        sendTelegramTestMessage: sendTelegramTestMessage,
        sendDiscordTestMessage: sendDiscordTestMessage,
        sendSlackTestMessage: sendSlackTestMessage,
        sendTwitterTestMessage: sendTwitterTestMessage
    }

    return thisObject

    function sendTelegramTestMessage(node, callBackFunction) {

        let botToken = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(node.payload, 'botToken')
        let chatId = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(node.payload, 'chatId')

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

        let webhookURL = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(node.payload, 'webhookURL')

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

        let webhookURL = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(node.payload, 'webhookURL')

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
        var Twitter = SA.nodeModules.twitter

        let consumer_key = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(node.payload, 'consumer_key')
        let consumer_secret = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(node.payload, 'consumer_secret')
        let access_token_key = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(node.payload, 'access_token_key')
        let access_token_secret = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(node.payload, 'access_token_secret')

        if (process.env.TWITTER_CONSUMER_KEY) {
            consumer_key = process.env.TWITTER_CONSUMER_KEY
        }
        if (process.env.TWITTER_CONSUMER_SECRET) {
            consumer_secret = process.env.TWITTER_CONSUMER_SECRET
        }
        if (process.env.TWITTER_ACCESS_TOKEN_KEY) {
            access_token_key = process.env.TWITTER_ACCESS_TOKEN_KEY
        }
        if (process.env.TWITTER_ACCESS_TOKEN_SECRET) {
            access_token_secret = process.env.TWITTER_ACCESS_TOKEN_SECRET
        }
        
        var twitterclient = new Twitter({
            consumer_key: consumer_key,
            consumer_secret: consumer_secret,
            access_token_key: access_token_key,
            access_token_secret: access_token_secret
        });
        
        let message = JSON.stringify({status: "Test message from Superalgos!"})

        twitterclient.post('statuses/update', message,  function(error, tweet, response) {
            if(error) {
                callBackFunction({ result: "Fail", message: error })
            }
            console.log(tweet);  // Tweet body.
            console.log(response);  // Raw response object.
        });
    }
}
