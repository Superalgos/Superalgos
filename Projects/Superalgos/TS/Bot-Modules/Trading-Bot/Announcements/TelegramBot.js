exports.newSuperalgosBotModulesTelegramBot = function (processIndex) {

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

    function initialize(botToken, chatId) {
        /* Telegram Bot Initialization */
        try {
            thisObject.chatId = chatId

            const Telegraf = require('telegraf')

            thisObject.telegramBot = new Telegraf(botToken)
            thisObject.telegramBot.start((ctx) => ctx.reply('Hi! I am the Telegram Bot that will tell you what happens with your trading session.'))
            thisObject.telegramBot.help((ctx) => ctx.replyWithHTML('<b><u>SUPERALGOS BOT HELP</u></b>\n\n' +
                '•   Use /stop to stop the session.\n' +
                '•   Use /help to receive this help message.\n' +
                '•   Use /balances for episode balances.\n' +
                '•   Use /counters for episode counters.\n' +
                '•   Use /statistics for episode statistics.\n' +
                '•   Use /uptime for episode uptime.'))
            thisObject.telegramBot.command('stop', (ctx) => TS.projects.superalgos.functionLibraries.sessionFunctions.stopSession(processIndex, 'by command from Telegram.'))
            thisObject.telegramBot.command('balances', (ctx) => interpretCommand('balances', processIndex))
            thisObject.telegramBot.command('uptime', (ctx) => interpretCommand('uptime', processIndex))
            thisObject.telegramBot.command('statistics', (ctx) => interpretCommand('statistics', processIndex))
            thisObject.telegramBot.command('counters', (ctx) => interpretCommand('counters', processIndex))
            thisObject.telegramBot.launch()

            const Telegram = require('telegraf/telegram')

            thisObject.telegramAPI = new Telegram(botToken)

            const message = "Telegram bot is starting. For assistance type /help."
            thisObject.telegramAPI.sendMessage(thisObject.chatId, message)

        } catch (err) {
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[WARN] initialize -> Telegram API error -> err = " + err.stack)
        }

    }

    function finalize() {
        const message = "Telegram bot is signing off."
        thisObject.telegramAPI.sendMessage(thisObject.chatId, message).catch(err => TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
            "[WARN] finalize -> Telegram API error -> err = " + err.stack))
    }

    function sendMessage(message) {
        thisObject.telegramAPI.sendMessage(thisObject.chatId, message).catch(err => TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
            "[WARN] sendMessage -> Telegram API error -> err = " + err.stack))
    }


    function interpretCommand(command, processIndex) {

        let message
        let tradingEngine
        let tradingEpisode
        let sessionNode
        let sessionName

        tradingEngine = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        tradingEpisode = tradingEngine.tradingCurrent.tradingEpisode

        sessionNode = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE
        sessionName = sessionNode.name


        switch (command) {
            case 'balances': {

                let baseAsset = TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName
                let quotedAsset = TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName

                message = "<b><u>SUPERALGOS BALANCES</u></b>\n\n<b>Trading Session:</b> " + sessionName +
                    "\n<b>Pair:</b> " + baseAsset + "/" + quotedAsset +
                    "\n<b>Base Asset:</b> " + tradingEpisode.episodeBaseAsset.balance.value + " " + baseAsset +
                    "\n<b>Quoted Asset:</b> " + tradingEpisode.episodeQuotedAsset.balance.value + " " + quotedAsset
                break
            }
            case 'uptime': {

                let sessionBegin = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_BEGIN

                let dateBegin = new Date(sessionBegin)
                let dateNow = new Date();

                let seconds = Math.floor((dateNow - (dateBegin))/1000)
                let minutes = Math.floor(seconds/60)
                let hours = Math.floor(minutes/60)
                let days = Math.floor(hours/24)

                hours = hours-(days*24)
                minutes = minutes-(days*24*60)-(hours*60)
                seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60)

                let uptime = days + "D, " + hours + "H, " + minutes + "M, " + seconds + "S"

                message = "<b><u>SUPERALGOS UPTIME</u></b>\n\n<b>Trading Session:</b> " + sessionName +
                    "\n<b>Uptime:</b> " + uptime
                break
            }
            case 'statistics': {

                message = "<b><u>SUPERALGOS STATISTICS</u></b>\n\n<b>Trading Session:</b> " + sessionName +
                    "\n<b>Days:</b> " + (tradingEpisode.tradingEpisodeStatistics.days.value).toFixed(2) +
                    "\n<b>Profit Loss:</b> " + tradingEpisode.tradingEpisodeStatistics.profitLoss.value +
                    "\n<b>ROI:</b> " + (tradingEpisode.tradingEpisodeStatistics.ROI.value).toFixed(2) +
                    "\n<b>Annualized Rate Of Return:</b> " + (tradingEpisode.tradingEpisodeStatistics.annualizedRateOfReturn.value).toFixed(2) +
                    "\n<b>Hit Fail:</b> " + tradingEpisode.tradingEpisodeStatistics.hitFail.value
                break
            }
            case 'counters': {

                message = "<b><u>SUPERALGOS COUNTERS</u></b>\n\n<b>Trading Session:</b> " + sessionName +
                    "\n<b>Periods:</b> " + tradingEpisode.tradingEpisodeCounters.periods.value +
                    "\n<b>Strategies:</b> " + tradingEpisode.tradingEpisodeCounters.strategies.value +
                    "\n<b>Positions:</b> " + tradingEpisode.tradingEpisodeCounters.positions.value +
                    "\n<b>Orders:</b> " + tradingEpisode.tradingEpisodeCounters.orders.value +
                    "\n<b>Hits:</b> " + tradingEpisode.tradingEpisodeCounters.hits.value +
                    "\n<b>Fails:</b> " + tradingEpisode.tradingEpisodeCounters.fails.value
                break
            }
        }

        thisObject.telegramAPI.sendMessage(thisObject.chatId, message, {parse_mode: 'HTML'}).catch(err => TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
            "[WARN] sendMessage -> Telegram API error -> err = " + err.stack))

    }

}