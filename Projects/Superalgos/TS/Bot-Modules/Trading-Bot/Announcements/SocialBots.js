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
            for (let prop in TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots) {
                if (prop.toLowerCase().includes("Bots".toLowerCase())) {
                    for (let i = 0; i < TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop].length; i++) {
                        let socialBot = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop][i]
                        if (socialBot.type === "Telegram Bot") {
                            let config = socialBot.config
                            socialBot.botInstance = TS.projects.superalgos.botModules.telegramBot.newSuperalgosBotModulesTelegramBot(processIndex)
                            socialBot.botInstance.initialize(config.botToken, config.chatId)
                        } else if (socialBot.type === "Discord Bot") {
                            let config = socialBot.config
                            socialBot.botInstance = TS.projects.superalgos.botModules.discordBot.newSuperalgosBotModulesDiscordBot(processIndex)
                            socialBot.botInstance.initialize(config)
                        } else if (socialBot.type === "Slack Bot") {
                            let config = socialBot.config
                            socialBot.botInstance = TS.projects.superalgos.botModules.slackBot.newSuperalgosBotModulesSlackBot(processIndex)
                            socialBot.botInstance.initialize(config)
                        }
                    }
                }
            }

            function announce(text) {
                for (let prop in TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots) {
                    if (prop.toLowerCase().includes("Bots".toLowerCase())) {
                        if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop] !== undefined) {
                            for (let i = 0; i < TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop].length; i++) {
                                let socialBot = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop][i]
                                try {
                                    if (socialBot.type === "Telegram Bot") {
                                        socialBot.botInstance.telegramAPI.sendMessage(socialBot.botInstance.chatId, text).catch(err => TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[WARN] initialize -> initializeSocialBots -> announce -> Telegram API error -> err = " + err))
                                    } else if (socialBot.type === "Discord Bot" ||socialBot.type === "Slack Bot" ) {
                                        socialBot.botInstance.sendMessage(text).catch(err => TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[WARN] initialize -> initializeSocialBots -> announce -> Discord Bot error -> err = " + err))
                                    }
                                } catch (err) {
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[WARN] initialize -> announce -> err = " + err.stack);
                                }
                            }
                        }
                    }
                }
            }

            TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.announce = announce
        }
    }

    function finalize() {
        if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots === undefined) { return }
        for (let prop in TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots) {
            if (prop.includes("Bots")) {
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop] !== undefined) {
                    for (let i = 0; i < TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop].length; i++) {
                        let socialBot = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop][i]
                        if (socialBot.type === "Telegram Bot" || socialBot.type === "Discord Bot" || socialBot.type === "Slack Bot") {
                            socialBot.botInstance.finalize()
                        }
                    }
                }
            }
        }
    }

    function sendMessage(message) {
        if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots !== undefined) {
            for (let prop in TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots) {
                if (prop.includes("Bots")) {
                    if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop] !== undefined) {
                        for (let i = 0; i < TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop].length; i++) {
                            let socialBot = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop][i]
                            if (socialBot.type === "Telegram Bot" || socialBot.type === "Discord Bot" || socialBot.type === "Slack Bot") {
                                socialBot.botInstance.sendMessage(message)
                            }
                        }
                    }
                }
            }
        }
    }
}
