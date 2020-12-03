exports.newSuperalgosBotModulesTelegramBot = function (processIndex) {

    const MODULE_NAME = 'Telegram Bot'

    let thisObject = {
        telegramBot: undefined,
        telegramAPI: undefined,
        chatId: undefined,
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize(botToken, chatId) {
        /* Telegram Bot Initialization */
        try {
            thisObject.chatId = chatId

            const Telegraf = require('telegraf')

            thisObject.telegramBot = new Telegraf(botToken)
            thisObject.telegramBot.start((ctx) => ctx.reply('Hi! I am the Telegram Bot that will tell you what happens with your trading session.'))
            thisObject.telegramBot.help((ctx) => ctx.reply('I can stop the session if you type STOP.'))
            thisObject.telegramBot.hears('STOP', (ctx) => TS.projects.superalgos.functionLibraries.sessionFunctions.stopSession(processIndex, ' by STOP command at Telegram.'))
            thisObject.telegramBot.launch()

            const Telegram = require('telegraf/telegram')

            thisObject.telegramAPI = new Telegram(botToken)

            const message = "Telegram bot is starting."
            thisObject.telegramAPI.sendMessage(thisObject.chatId, message).catch(err => parentLogger.write(MODULE_NAME, "[WARN] initializeTelegramBot -> Telegram API error -> err = " + err))

        } catch (err) {
            parentLogger.write(MODULE_NAME, "[WARN] initialize -> err = " + err.stack);
        }

    }

    function finalize() {
        const message = "Telegram bot is signing off."
        thisObject.telegramAPI.sendMessage(thisObject.chatId, message).catch(err => parentLogger.write(MODULE_NAME, "[WARN] finalize -> Telegram API error -> err = " + err))
    }

    function sendMessage(message) {
        thisObject.telegramAPI.sendMessage(thisObject.chatId, message).catch(err => parentLogger.write(MODULE_NAME, "[WARN] announce -> Telegram API error -> err = " + err))
    }

}