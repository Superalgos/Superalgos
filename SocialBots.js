exports.newSocialBots = function newSocialBots(bot, logger) {

    const MODULE_NAME = 'Social Bots'

    let thisObject = {
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    const TELEGRAM_BOT_MODULE = require('./TelegramBot.js')

    return thisObject

    function initialize() {
        if (bot.SESSION.socialBots !== undefined) {
            if (bot.SESSION.socialBots.bots !== undefined) {
                for (let i = 0; i < bot.SESSION.socialBots.bots.length; i++) {
                    let socialBot = bot.SESSION.socialBots.bots[i]
                    if (socialBot.type === "Telegram Bot") {
                        let config = socialBot.config
                        socialBot.botInstance = SOCIAL_BOTS_MODULE.newTelegramBot(bot, logger)
                        socialBot.botInstance.initialize(config.botToken, config.chatId)
                    }
                }
            }

            function announce(announcement) {
                if (bot.SESSION.socialBots.bots !== undefined) {
                    for (let i = 0; i < bot.SESSION.socialBots.bots.length; i++) {
                        let socialBot = bot.SESSION.socialBots.bots[i]
                        try {
                            let config = announcement.config

                            if (socialBot.type === "Telegram Bot") {
                                if (announcement.formulaValue !== undefined) {
                                    socialBot.botInstance.telegramAPI.sendMessage(socialBot.botInstance.chatId, announcement.formulaValue).catch(err => parentLogger.write(MODULE_NAME, "[WARN] initialize -> initializeSocialBots -> announce -> Telegram API error -> err = " + err))
                                } else {
                                    socialBot.botInstance.telegramAPI.sendMessage(socialBot.botInstance.chatId, config.text).catch(err => parentLogger.write(MODULE_NAME, "[WARN] initialize -> initializeSocialBots -> announce -> Telegram API error -> err = " + err))
                                }
                            }

                        } catch (err) {
                            parentLogger.write(MODULE_NAME, "[WARN] initialize -> announce -> err = " + err.stack);
                        }
                    }
                }
            }

            bot.SESSION.socialBots.announce = announce
        }
    }

    function finalize() {
        if (bot.SESSION.socialBots === undefined) { return }
        if (bot.SESSION.socialBots.bots !== undefined) {
            for (let i = 0; i < bot.SESSION.socialBots.bots.length; i++) {
                let socialBot = bot.SESSION.socialBots.bots[i]
                if (socialBot.type === "Telegram Bot") {
                    socialBot.botInstance.finalize()
                }
            }
        }
    }

    function sendMessage(message) {
        if (bot.SESSION.socialBots !== undefined) {
            if (bot.SESSION.socialBots.bots !== undefined) {
                for (let i = 0; i < bot.SESSION.socialBots.bots.length; i++) {
                    let socialBot = bot.SESSION.socialBots.bots[i]
                    if (socialBot.type === "Telegram Bot") {
                        socialBot.botInstance.sendMessage(message)
                    }
                }
            }
        }
    }
}