exports.newSocialBotsBotModulesDiscordBot = function (processIndex) {

    const MODULE_NAME = 'Discord Bot'

    let thisObject = {
        webhookURL: undefined,
        taskParameters: undefined,
        format: undefined,
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize(config) {
        /* Discord Bot Initialization */
        
        try {
            thisObject.webhookURL = config.webhookURL
            thisObject.taskParameters = {
                exchange: TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name,
                market: TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName +
                    '/' +
                    TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
            }
            if (config.format === undefined) {
                thisObject.format = "%{MESSAGE}"
            } else {
                thisObject.format = config.format
            }
        } catch (err) {
            logError("initialize -> err = " + err.stack);
        }

    }

    function finalize() {}

    function sendMessage(message) {
        const https = SA.nodeModules.https

        try {
            message = formatMessage(message)
            message = JSON.stringify({content: message})
        } catch (err) {
            logError("announce -> Discord JSON message error -> err = " + err)
        }

        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }

            const req = https.request(thisObject.webhookURL, requestOptions, (res) => {
                let response = ''
                res.on('data', (data) => { response += data })
                res.on('end', () => { resolve(response) })
            })

            req.on('error', (err) => {
                reject(err)
                logWarn("announce -> Discord request error -> err = " + err)
            })

            req.write(message)
            req.end()
        })
    }

    function formatMessage(message) {
        formattedMessage = thisObject.format
        formattedMessage = formattedMessage.replace('%{EXCHANGE}', thisObject.taskParameters.exchange)
        formattedMessage = formattedMessage.replace('%{MARKET}', thisObject.taskParameters.market)
        formattedMessage = formattedMessage.replace('%{MESSAGE}', message)
        return formattedMessage
    }

    function logWarn(message) {
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[WARN] ' + message)
    }

    function logError(message) {
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] ' + message)
    }
}
