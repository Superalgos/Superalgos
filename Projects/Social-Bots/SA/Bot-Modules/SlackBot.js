exports.newSocialBotsBotModulesSlackBot = function () {

    let thisObject = {
        taskParameters: undefined,
        format: undefined,
        conversationId: undefined,
        slackClient: undefined,
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize(config) {
        /* Slack Bot Initialization */
        const { WebClient } = SA.nodeModules.slack

        // read token from node config
        let token = config.token
        // Read a token from the environment variables, if present
        if (process.env.SLACK_TOKEN) {
            token = process.env.SLACK_TOKEN;
        }
        if (!token) {
            logError("token must be set")
        }

        // read conversation id (channel or DM) from config
        let conversationId = config.conversationId
        if (!conversationId) {
            logError("conversationId must be set")
        }
        thisObject.conversationId = conversationId

        // Initialize
        const slackClient = new WebClient(token)
        thisObject.slackClient = slackClient

        try {
            let exchange = 'TestExchange'
            let market = 'TestBase/TestQuote'
            if (typeof TS !== 'undefined' && TS) {
                exchange = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name
                market = `${TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName}/${TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName}`
            }
            thisObject.taskParameters = {
                exchange: exchange,
                market: market
            }
            if (config.format === undefined) {
                thisObject.format = "%{MESSAGE}"
            } else {
                thisObject.format = config.format
            }
        } catch (err) {
            logError(`initialize -> err = ${err.stack}`)
        }
    }

    function finalize() {}

    async function sendMessage(text) {
        try {
            let message = formatMessage(text)
            let response = await thisObject.slackClient.chat.postMessage({
                text: message,
                channel: thisObject.conversationId,
              })
            let successMessage = JSON.parse(JSON.stringify(response))
            logInfo(`sendMessage -> Slack bot send message -> response -> ok: ${successMessage.ok}, channel: ${successMessage.channel}`)
            return response
        } catch (err) {
            logError(`sendMessage -> Slack bot send message -> ${err}`)
            return err
        }
    }

    function formatMessage(message) {
        formattedMessage = thisObject.format
        formattedMessage = formattedMessage.replace('%{EXCHANGE}', thisObject.taskParameters.exchange)
        formattedMessage = formattedMessage.replace('%{MARKET}', thisObject.taskParameters.market)
        formattedMessage = formattedMessage.replace('%{MESSAGE}', message)
        return formattedMessage
    }

    function logInfo(message) {
        console.log('[INFO] ', message)
    }

    function logError(message) {
        console.error('[ERROR] ', message)
    }
}
