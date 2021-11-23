exports.newSocialBotsBotModulesTwitterBot = function (processIndex) {

    const MODULE_NAME = 'Twitter Bot'

    let thisObject = {
        taskParameters: undefined,
        format: undefined,
        twitterClient: undefined,
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize(config) {
        /* Twitter Bot Initialization */
        var Twitter = SA.nodeModules.twitter

        let consumer_key = config.consumer_key
        let consumer_secret = config.consumer_secret
        let access_token_key = config.access_token_key
        let access_token_secret = config.access_token_secret

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
        
        if (!consumer_key) {
            logError("consumer_key must be set")
        }
        if (!consumer_secret) {
            logError("consumer_secret must be set")
        }
        if (!access_token_key) {
            logError("access_token_key must be set")
        }
        if (!access_token_secret) {
            logError("access_token_secret must be set")
        }
        var twitterClient = new Twitter({
            consumer_key: consumer_key,
            consumer_secret: consumer_secret,
            access_token_key: access_token_key,
            access_token_secret: access_token_secret
        });
        thisObject.twitterClient = twitterClient

        try {
            thisObject.taskParameters = {
                exchange: TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name,
                market: `${TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName}/${TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName}`
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

    async function sendMessage(message) {
        try {
            message = {text: formatMessage(message)}
        } catch (err) {
            logError(`announce -> Twitter message formatting error -> err = ${err}`)
        }

        const response = await thisObject.twitterClient.post('tweets', message)
            .then(logInfo(`announce -> Twitter bot post tweet -> response -> ${response}`))
            .catch((err) => { logError(`announce -> Twitter bot post tweet -> ${err}`) })
    }

    function formatMessage(message) {
        formattedMessage = thisObject.format
        formattedMessage = formattedMessage.replace('%{EXCHANGE}', thisObject.taskParameters.exchange)
        formattedMessage = formattedMessage.replace('%{MARKET}', thisObject.taskParameters.market)
        formattedMessage = formattedMessage.replace('%{MESSAGE}', message)
        return formattedMessage
    }

    function logInfo(message) {
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] ' + message)
    }
    
    function logWarn(message) {
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[WARN] ' + message)
    }

    function logError(message) {
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] ' + message)
    }
}
