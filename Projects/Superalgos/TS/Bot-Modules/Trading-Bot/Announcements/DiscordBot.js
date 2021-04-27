exports.newSuperalgosBotModulesDiscordBot = function (processIndex) {

    const MODULE_NAME = 'Discord Bot'

    let thisObject = {
        DiscordBot: undefined,
        webhookURL: undefined,
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize(webhookURL) {
        /* Discord Bot Initialization */
        
        try {
            thisObject.webhookURL = webhookURL

            const message = "Discord bot has started."
            thisObject.sendMessage(message).catch(err => parentLogger.write(MODULE_NAME, "[WARN] initializeDiscordBot -> Discord error -> err = " + err))

        } catch (err) {
            parentLogger.write(MODULE_NAME, "[WARN] initialize -> err = " + err.stack);
        }

    }

    function finalize() {
        const message = "Discord bot has stopped."
        thisObject.sendMessage(message).catch(err => parentLogger.write(MODULE_NAME, "[WARN] finalize -> Discord error -> err = " + err))
    }

    function sendMessage(message) {
        const https = require('https');

        try {
            message = JSON.stringify(message);
        } catch (err) {
            parentLogger.write(MODULE_NAME, "[WARN] announce -> Discord JSON message error -> err = " + err)
        }

        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: 'POST',
                header: { 'Content-Type': 'application/json' }
            }

            const req = https.request(thisObject.webhookURL, requestOptions, (res) => {
                let response = ''
                res.on('data', (data) => { response += data })
                res.on('end', () => { resolve(response) })
            })

            req.on('error', (err) => {
                reject(err)
                parentLogger.write(MODULE_NAME, "[WARN] announce -> Discord request error -> err = " + err)
            })

            req.write(message)
            req.end()
        })
    }

}
