exports.newFoundationsBotModulesTelegramBot = function (processIndex) {

    const MODULE_NAME = 'Telegram Bot'

    let thisObject = {
        telegramBot: undefined,
        telegramAPI: undefined,
        chatId: undefined,
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize,
        interpretCommand: interpretCommand
    }

    return thisObject

    function initialize(config, commands) {
        /* Telegram Bot Initialization */
        try {
            let botToken = config.botToken
            let chatId = config.chatId

            thisObject.chatId = chatId

            const { Telegraf } = SA.nodeModules.telegraf

            thisObject.telegramBot = new Telegraf(botToken)
            thisObject.telegramBot.start((ctx) => ctx.reply('Hi! I am the Telegram Bot that will tell you what happens with your trading session.'))
            thisObject.telegramBot.help((ctx) => ctx.replyWithHTML('<b><u>SUPERALGOS BOT HELP</u></b>\n\n' +
                '•   Use /stop to stop the session.\n' +
                '•   Use /help to receive this help message.\n\n' +
                'Additional commands can be configured using the Social Bot Command node.'))
            thisObject.telegramBot.command('stop', (ctx) => TS.projects.foundations.functionLibraries.sessionFunctions.stopSession(processIndex, 'by command from Telegram.'))

            /* Set up additional commands for each Social Bot Command node */
            if(commands !== undefined) {
                for (let i = 0; i < commands.length; i++) {
                    thisObject.telegramBot.command(commands[i].config.name, (ctx) => interpretCommand(commands[i].formula.code, processIndex))
                }
            }

            thisObject.telegramBot.launch()

            thisObject.telegramAPI = thisObject.telegramBot.telegram

            const message = "Telegram bot is starting. For assistance type /help."
            thisObject.telegramAPI.sendMessage(thisObject.chatId, message)

        } catch (err) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[WARN] initialize -> Telegram API error -> err = " + err.stack)
        }

    }

    function finalize() {
        const message = "Telegram bot is signing off."
        thisObject.telegramAPI.sendMessage(thisObject.chatId, message).catch(err => TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
            "[WARN] finalize -> Telegram API error -> err = " + err.stack))
    }

    function sendMessage(message) {
        thisObject.telegramAPI.sendMessage(thisObject.chatId, message).catch(err => TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
            "[WARN] sendMessage -> Telegram API error -> err = " + err.stack))
    }


    function interpretCommand(command, processIndex) {

        let message
        let tradingEngine
        let tradingSystem
        let sessionParameters

        if(TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE !== undefined) {
            tradingEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
            tradingSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
        }
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters

        let taskParameters = {
            exchange: TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name,
            market: TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName +
                '/' +
                TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
        }

        try {
            message = eval(command)
        } catch (err) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[WARN] interpretCommand -> Telegram API error evaluating user formula -> err = " + err.stack)
            return
        }

        thisObject.telegramAPI.sendMessage(thisObject.chatId, message, {parse_mode: 'HTML'}).catch(err => TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
            "[WARN] sendMessage -> Telegram API error -> err = " + err.stack))

    }

}