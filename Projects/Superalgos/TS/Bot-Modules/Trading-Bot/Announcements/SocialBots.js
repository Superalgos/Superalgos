exports.newSuperalgosBotModulesSocialBots = function (processIndex) {

    const MODULE_NAME = 'Social Bots'

    let thisObject = {
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {
        if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots !== undefined) {
            if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.bots !== undefined) {
                for (let i = 0; i < TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.bots.length; i++) {
                    let socialBot = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.bots[i]
                    if (socialBot.type === "Telegram Bot") {
                        let config = socialBot.config
                        socialBot.botInstance = TS.projects.superalgos.botModules.telegramBot.newSuperalgosBotModulesTelegramBot(processIndex)
                        socialBot.botInstance.initialize(config.botToken, config.chatId)
                    }
                }
            }

            function announce(text) {
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.bots !== undefined) {
                    for (let i = 0; i < TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.bots.length; i++) {
                        let socialBot = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.bots[i]
                        try {
                            if (socialBot.type === "Telegram Bot") {
                                socialBot.botInstance.telegramAPI.sendMessage(socialBot.botInstance.chatId, text).catch(err => TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[WARN] initialize -> initializeSocialBots -> announce -> Telegram API error -> err = " + err))
                            }
                        } catch (err) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[WARN] initialize -> announce -> err = " + err.stack);
                        }
                    }
                }
            }

            TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.announce = announce
        }
    }

    function finalize() {
        if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots === undefined) { return }
        if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.bots !== undefined) {
            for (let i = 0; i < TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.bots.length; i++) {
                let socialBot = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.bots[i]
                if (socialBot.type === "Telegram Bot") {
                    socialBot.botInstance.finalize()
                }
            }
        }
    }

    function sendMessage(message) {
        if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots !== undefined) {
            if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.bots !== undefined) {
                for (let i = 0; i < TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.bots.length; i++) {
                    let socialBot = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.bots[i]
                    if (socialBot.type === "Telegram Bot") {
                        socialBot.botInstance.sendMessage(message)
                    }
                }
            }
        }
    }
}