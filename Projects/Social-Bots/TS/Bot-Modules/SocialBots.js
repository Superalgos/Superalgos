exports.newSocialBotsBotModulesSocialBots = function (processIndex) {

    const MODULE_NAME = 'Social Bots'

    let thisObject = {
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {
        if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots !== undefined) {
            for (let prop in TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots) {
                if (prop.toLowerCase().includes("Bots".toLowerCase())) {
                    for (let i = 0; i < TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop].length; i++) {
                        let socialBot = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop][i]
                        let config = socialBot.config
                        let commands = socialBot.socialBotCommand
                        if (socialBot.type === "Telegram Bot") {
                            socialBot.botInstance = TS.projects.socialBots.botModules.telegramBot.newSocialBotsBotModulesTelegramBot(processIndex)
                            socialBot.botInstance.initialize(config, commands)
                        } else if (socialBot.type === "Discord Bot") {
                            socialBot.botInstance = TS.projects.socialBots.botModules.discordBot.newSocialBotsBotModulesDiscordBot(processIndex)
                            socialBot.botInstance.initialize(config)
                        } else if (socialBot.type === "Slack Bot") {
                            socialBot.botInstance = TS.projects.socialBots.botModules.slackBot.newSocialBotsBotModulesSlackBot(processIndex)
                            socialBot.botInstance.initialize(config)
                        } else if (socialBot.type === "Twitter Bot") {
                            socialBot.botInstance = SA.projects.socialBots.botModules.twitterBot.newSocialBotsBotModulesTwitterBot(processIndex)
                            socialBot.botInstance.initialize(config)
                        }
                    }
                }
            }

            function announce(text) {
                for (let prop in TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots) {
                    if (prop.toLowerCase().includes("Bots".toLowerCase())) {
                        if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop] !== undefined) {
                            for (let i = 0; i < TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop].length; i++) {
                                let socialBot = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop][i]
                                try {
                                    if (socialBot.type === "Telegram Bot") {
                                        socialBot.botInstance.telegramAPI.sendMessage(socialBot.botInstance.chatId, text)
                                            .catch(err => TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[WARN] initialize -> initializeSocialBots -> announce -> Telegram API error -> err = " + err))
                                    } else if (socialBot.type === "Discord Bot" || socialBot.type === "Slack Bot" || socialBot.type === "Twitter Bot") {
                                        socialBot.botInstance.sendMessage(text)
                                            .catch(err => TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[WARN] initialize -> initializeSocialBots -> announce -> Bot error -> err = " + err))
                                    }
                                } catch (err) {
                                    SA.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[WARN] initialize -> announce -> err = " + err.stack);
                                }
                            }
                        }
                    }
                }
            }

            TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.announce = announce
        }
    }

    function finalize() {
        if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots === undefined) { return }
        for (let prop in TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots) {
            if (prop.includes("Bots")) {
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop] !== undefined) {
                    for (let i = 0; i < TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop].length; i++) {
                        let socialBot = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop][i]
                        if (socialBot.type === "Telegram Bot" || socialBot.type === "Discord Bot" || socialBot.type === "Slack Bot" || socialBot.type === "Twitter Bot") {
                            socialBot.botInstance.finalize()
                        }
                    }
                }
            }
        }
    }

    function sendMessage(message) {
        if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots !== undefined) {
            for (let prop in TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots) {
                if (prop.includes("Bots")) {
                    if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop] !== undefined) {
                        for (let i = 0; i < TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop].length; i++) {
                            let socialBot = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots[prop][i]
                            if (socialBot.type === "Telegram Bot" || socialBot.type === "Discord Bot" || socialBot.type === "Slack Bot" || socialBot.type === "Twitter Bot") {
                                socialBot.botInstance.sendMessage(message)
                            }
                        }
                    }
                }
            }
        }
    }
}
