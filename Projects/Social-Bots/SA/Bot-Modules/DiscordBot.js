exports.newSocialBotsBotModulesDiscordBot = function () {

    let thisObject = {
        discordClient: undefined,
        taskParameters: undefined,
        channelId: undefined,
        format: undefined,
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    async function initialize(config) {
        /* Discord Bot Initialization */
        const { Client, Intents } = SA.nodeModules.discordjs

        const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
        thisObject.discordClient = client

        token = config.token
        if (!token) {
            let error = "token must be set"
            logError(error)
            return error
        }

        let channelId = config.channelId
        if (!channelId) {
            let error = "channelId must be set"
            logError(error)
            return error
        }
        thisObject.channelId = channelId

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

        let connected = new Promise((resolve) => {
                thisObject.discordClient.once('ready', resolve({ status: 'Ready!'}))
            })
        thisObject.discordClient.on('error', error => {
            logError(`Social Bot > Discord > ${error}`)
            return Promise.reject(error)
        })
        
        await thisObject.discordClient.login(token)
        let response = await connected
        return response
    }

    function finalize() {}

    async function sendMessage(text) {
        let message = formatMessage(text)
        try {
            if (!(thisObject.discordClient.isReady())) {
                let connected = new Promise((resolve) => {
                    thisObject.discordClient.once('ready', resolve)
                })
                await connected
            }
            const channel = thisObject.discordClient.channels.cache.get(thisObject.channelId)
            let response = await channel.send(message)
            let success = { messageId: JSON.parse(JSON.stringify(response)).id }
            return success
        } catch (error) {
            logError(error)
            return error
        }
    }

    function formatMessage(message) {
        formattedMessage = thisObject.format
        formattedMessage = formattedMessage.replace('%{EXCHANGE}', thisObject.taskParameters.exchange)
        formattedMessage = formattedMessage.replace('%{MARKET}', thisObject.taskParameters.market)
        formattedMessage = formattedMessage.replace('%{MESSAGE}', message)
        return formattedMessage
    }

    function logError(message) {
        console.error('[ERROR]', message)
    }
}
