exports.newSession = function newSession(bot, parentLogger) {

    const MODULE_NAME = "Session"
    const FULL_LOG = true;
    const ONE_YEAR_IN_MILISECONDS = 365 * 24 * 60 * 60 * 1000

    let thisObject = {
        initialize: initialize
    }

    return thisObject;

    function initialize(pProcessConfig, callBackFunction) {
        try {
            if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            let telegramAPI

            /* Initialize this info so that everything is logged propeerly */

            bot.SESSION = {
                name: bot.processNode.session.name,
                id: bot.processNode.session.id
            }

            /* Set the folderName for early logging */
            if (bot.processNode.session.config.folderName === undefined) {
                bot.SESSION.folderName = bot.SESSION.id
            } else {
                bot.SESSION.folderName = bot.processNode.session.config.folderName + "-" + bot.SESSION.id
            }

            /* Check if there is a session */
            if (bot.processNode.session === undefined) {
                parentLogger.write(MODULE_NAME, "[ERROR] initialize -> Cannot run without a Session.");
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return;
            }

            /* Listen to event to start or stop the session. */
            bot.sessionKey = bot.processNode.session.name + '-' + bot.processNode.session.type + '-' + bot.processNode.session.id
            global.SESSION_MAP.set(bot.sessionKey, bot.sessionKey)

            global.EVENT_SERVER_CLIENT.listenToEvent(bot.sessionKey, 'Run Session', undefined, bot.sessionKey, undefined, runSession)
            global.EVENT_SERVER_CLIENT.listenToEvent(bot.sessionKey, 'Stop Session', undefined, bot.sessionKey, undefined, stopSession)

            callBackFunction(global.DEFAULT_OK_RESPONSE)
            return

            function runSession(message) {

                try {
                    if (bot.SESSION_STATUS === 'Idle' || bot.SESSION_STATUS === 'Running') { return } // This happens when the UI is reloaded, the session was running and tries to run it again.

                    /* We are going to run the Definition comming at the event. */
                    bot.APP_SCHEMA_ARRAY = JSON.parse(message.event.appSchema)
                    bot.TRADING_SYSTEM = JSON.parse(message.event.tradingSystem)
                    bot.TRADING_ENGINE = JSON.parse(message.event.tradingEngine)
                    bot.SESSION = JSON.parse(message.event.session)
                    bot.DEPENDENCY_FILTER = JSON.parse(message.event.dependencyFilter)
                    bot.RESUME = message.event.resume

                    /* Setup the APP_SCHEMA_MAP based on the APP_SCHEMA_ARRAY */
                    bot.APP_SCHEMA_MAP = new Map()
                    for (let i = 0; i < bot.APP_SCHEMA_ARRAY.length; i++) {
                        let nodeDefinition = bot.APP_SCHEMA_ARRAY[i]
                        let key = nodeDefinition.type
                        bot.APP_SCHEMA_MAP.set(key, nodeDefinition)
                    }

                    /* Set the folderName for logging, reports, context and data output */
                    let config
                    if (bot.SESSION.config !== undefined) {
                        config = bot.SESSION.config
                        if (config.folderName === undefined) {
                            bot.SESSION.folderName = bot.SESSION.id
                        } else {
                            bot.SESSION.folderName = config.folderName + "-" + bot.SESSION.id
                        }
                    }

                    if (checkParemeters() === false) { return }


                    /* Extract values from different sources and consolidate them under one structure that is going to be used later on. */
                    setValuesToUse(message)

                    /* Set up Social Bots */
                    initializeSocialBots()

                    let allGood
                    switch (bot.SESSION.type) {
                        case 'Backtesting Session': {
                            allGood = startBackTesting(message)
                            break
                        }
                        case 'Live Trading Session': {
                            allGood = startLiveTrading(message)
                            break
                        }
                        case 'Fordward Testing Session': {
                            allGood = startFordwardTesting(message)
                            break
                        }
                        case 'Paper Trading Session': {
                            allGood = startPaperTrading(message)
                            break
                        }
                    }
                    if (allGood === true) {
                        bot.SESSION_STATUS = 'Idle'
                        bot.STOP_SESSION = false
                    } else {
                        bot.STOP_SESSION = true
                    }
                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> runSession -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function checkParemeters() {
                /*
                Here we check all the Session Parameters received. If something critical is missing we abort returning false. If something
                non critical is missing, we complete it with a default value.
                */

                if (bot.SESSION.parameters === undefined) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> Session Node with no Parameters."); }
                    return false
                }

                /* Time Range */
                if (bot.SESSION.parameters.timeRange === undefined) { // if the Time Range is missing we create a default one.
                    bot.SESSION.parameters.timeRange = {
                        name: 'Missing Time Range',
                        type: 'Time Range',
                        config: {
                            initialDatetime: (new Date()).valueOf(),
                            finalDatetime: (new Date()).valueOf()
                        }
                    }
                }
                if (bot.SESSION.parameters.timeRange.config.initialDatetime === undefined) { // if the initialDatetime is missing we create a default one.
                    bot.SESSION.parameters.timeRange.config.initialDatetime = (new Date()).valueOf()
                }
                if (bot.SESSION.parameters.timeRange.config.finalDatetime === undefined) { // if the finalDatetime is missing we create a default one.
                    bot.SESSION.parameters.timeRange.config.finalDatetime = (new Date()).valueOf()
                }

                /* Time Frame */
                if (bot.SESSION.parameters.timeFrame === undefined) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> Session Parameters Node with no Time Frame."); }
                    return false
                }
                if (bot.SESSION.parameters.timeFrame.label === undefined) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> Session Parameters Node with no Time Frame Label configuration."); }
                    return false
                }

                /* Session Base Asset */
                if (bot.SESSION.parameters.sessionBaseAsset === undefined) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> Session Parameters Node with no Session Base Asset."); }
                    return false
                }
                if (bot.SESSION.parameters.sessionBaseAsset.config.initialBalance === undefined) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> Session Parameters Session Base Asset with no initialBalance configuration."); }
                    return false
                }
                if (bot.SESSION.parameters.sessionBaseAsset.config.minimumBalance === undefined) {
                    bot.SESSION.parameters.sessionBaseAsset.config.minimumBalance = 0
                }
                if (bot.SESSION.parameters.sessionBaseAsset.config.maximumBalance === undefined) {
                    bot.SESSION.parameters.sessionBaseAsset.config.maximumBalance = Number.MAX_SAFE_INTEGER
                }

                /* Session Quoted Asset */
                if (bot.SESSION.parameters.sessionQuotedAsset === undefined) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> Session Parameters Node with no Session Quoted Asset."); }
                    return false
                }
                if (bot.SESSION.parameters.sessionQuotedAsset.config.initialBalance === undefined) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> Session Parameters Session Quoted Asset with no initialBalance configuration."); }
                    return false
                }
                if (bot.SESSION.parameters.sessionQuotedAsset.config.minimumBalance === undefined) {
                    bot.SESSION.parameters.sessionQuotedAsset.config.minimumBalance = 0
                }
                if (bot.SESSION.parameters.sessionQuotedAsset.config.maximumBalance === undefined) {
                    bot.SESSION.parameters.sessionQuotedAsset.config.maximumBalance = Number.MAX_SAFE_INTEGER
                }

                /* Slippage */
                if (bot.SESSION.parameters.slippage === undefined) { // if the Slippage is missing we create a default one.
                    bot.SESSION.parameters.timeRange = {
                        name: 'Missing Slippage',
                        type: 'Slippage',
                        config: {
                            positionRate: 0,
                            stopLoss: 0,
                            takeProfit: 0
                        }
                    }
                }
                if (bot.SESSION.parameters.slippage.config.positionRate === undefined) { // if the positionRate is missing we create a default one.
                    bot.SESSION.parameters.slippage.config.positionRate = 0
                }
                if (bot.SESSION.parameters.slippage.config.stopLoss === undefined) { // if the stopLoss is missing we create a default one.
                    bot.SESSION.parameters.slippage.config.stopLoss = 0
                }
                if (bot.SESSION.parameters.slippage.config.takeProfit === undefined) { // if the takeProfit is missing we create a default one.
                    bot.SESSION.parameters.slippage.config.takeProfit = 0
                }

                /* Fee Structure */
                if (bot.SESSION.parameters.feeStructure === undefined) { // if the Fee Structure is missing we create a default one.
                    bot.SESSION.parameters.feeStructure = {
                        name: 'Missing Fee Structure',
                        type: 'Fee Structure',
                        config: {
                            maker: 0,
                            taker: 0
                        }
                    }
                }
                if (bot.SESSION.parameters.feeStructure.config.maker === undefined) { // if the maker is missing we create a default one.
                    bot.SESSION.parameters.feeStructure.config.maker = 0
                }
                if (bot.SESSION.parameters.feeStructure.config.taker === undefined) { // if the taker is missing we create a default one.
                    bot.SESSION.parameters.feeStructure.config.taker = 0
                }

                return true
            }


            function stopSession(message) {
                try {
                    bot.STOP_SESSION = true
                    finalizeSocialBots()
                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> stopSession -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function checkDatetimes() {
                if (bot.SESSION.parameters.timeRange.config.initialDatetime.valueOf() < (new Date()).valueOf()) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[WARN] initialize -> checkDatetimes -> Overriding initialDatetime with present datetime because " + bot.SESSION.parameters.timeRange.config.initialDatetime + " is in the past."); }
                    bot.SESSION.parameters.timeRange.config.initialDatetime = new Date()
                }
                if (bot.SESSION.parameters.timeRange.config.finalDatetime.valueOf() < (new Date()).valueOf()) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[WARN] initialize -> checkDatetimes -> Overriding finalDatetime with present datetime plus one year because " + bot.SESSION.parameters.timeRange.config.finalDatetime + " is in the past."); }
                    bot.SESSION.parameters.timeRange.config.finalDatetime = new Date() + ONE_YEAR_IN_MILISECONDS
                }
            }

            function startBackTesting(message) {
                bot.startMode = "Backtest"
                if (bot.SESSION.parameters.timeRange.config.finalDatetime.valueOf() > (new Date()).valueOf()) {
                    bot.SESSION.parameters.timeRange.config.finalDatetime = new Date()
                }
                bot.resumeExecution = false;
                bot.hasTheBotJustStarted = true
                bot.multiPeriodProcessDatetime = new Date(bot.SESSION.parameters.timeRange.config.initialDatetime.valueOf())
                return true
            }

            function startLiveTrading(message) {

                if (process.env.KEY === undefined || process.env.SECRET === undefined) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[ERROR] initialize -> startLiveTrading -> Key 'codeName' or 'secret' not provided. Plese check that and try again."); }
                    return
                }

                bot.startMode = "Live"
                checkDatetimes()
                bot.resumeExecution = false;
                bot.multiPeriodProcessDatetime = new Date(bot.SESSION.parameters.timeRange.config.initialDatetime.valueOf())
                bot.hasTheBotJustStarted = true
                pProcessConfig.liveWaitTime = getTimeFrameFromLabel(bot.VALUES_TO_USE.timeFrame)
                return true
            }

            function startFordwardTesting(message) {

                if (process.env.KEY === undefined || process.env.SECRET === undefined) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[WARN] initialize -> startFordwardTesting -> Key name or Secret not provided, not possible to run the process in Forward Testing mode."); }
                    console.log("Key 'codeName' or 'secret' not provided. Plese check that and try again.")
                    return
                }

                bot.startMode = "Live"
                checkDatetimes()
                bot.resumeExecution = false;
                bot.multiPeriodProcessDatetime = new Date(bot.SESSION.parameters.timeRange.config.initialDatetime.valueOf())
                bot.hasTheBotJustStarted = true

                /* Reduce the balance */

                let balancePercentage = 1 // This is the default value

                if (bot.SESSION.config.balancePercentage !== undefined) {
                    balancePercentage = bot.SESSION.config.balancePercentage
                }

                bot.VALUES_TO_USE.initialBalanceA = bot.VALUES_TO_USE.initialBalanceA * balancePercentage / 100
                bot.VALUES_TO_USE.initialBalanceB = bot.VALUES_TO_USE.initialBalanceB * balancePercentage / 100

                bot.VALUES_TO_USE.minimumBalanceA = bot.VALUES_TO_USE.minimumBalanceA * balancePercentage / 100
                bot.VALUES_TO_USE.minimumBalanceB = bot.VALUES_TO_USE.minimumBalanceB * balancePercentage / 100

                bot.VALUES_TO_USE.maximumBalanceA = bot.VALUES_TO_USE.maximumBalanceA * balancePercentage / 100
                bot.VALUES_TO_USE.maximumBalanceB = bot.VALUES_TO_USE.maximumBalanceB * balancePercentage / 100

                pProcessConfig.normalWaitTime = getTimeFrameFromLabel(bot.VALUES_TO_USE.timeFrame)

                return true
            }

            function startPaperTrading(message) {
                bot.startMode = "Backtest"

                checkDatetimes()
                bot.resumeExecution = false;
                bot.hasTheBotJustStarted = true
                bot.multiPeriodProcessDatetime = new Date(bot.SESSION.parameters.timeRange.config.initialDatetime.valueOf())
                pProcessConfig.normalWaitTime = getTimeFrameFromLabel(bot.VALUES_TO_USE.timeFrame)
                return true
            }

            function getTimeFrameFromLabel(timeFrameLabel) {

                for (let i = 0; i < global.marketFilesPeriods.length; i++) {
                    let value = global.marketFilesPeriods[i][0]
                    let label = global.marketFilesPeriods[i][1]

                    if (timeFrameLabel === label) {
                        return value
                    }
                }

                for (let i = 0; i < global.dailyFilePeriods.length; i++) {
                    let value = global.dailyFilePeriods[i][0]
                    let label = global.dailyFilePeriods[i][1]

                    if (timeFrameLabel === label) {
                        return value
                    }
                }
            }

            function setValuesToUse(message) {

                /* Session Type Dependant Default Values */

                switch (bot.SESSION.type) {
                    case 'Backtesting Session': {
                        bot.SESSION.parameters.timeRange.config.initialDatetime = new Date((new Date()).valueOf() - ONE_YEAR_IN_MILISECONDS)
                        bot.SESSION.parameters.timeRange.config.finalDatetime = new Date()
                        break
                    }
                    case 'Live Trading Session': {
                        bot.SESSION.parameters.timeRange.config.initialDatetime = new Date()
                        bot.SESSION.parameters.timeRange.config.finalDatetime = new Date((new Date()).valueOf() + ONE_YEAR_IN_MILISECONDS)
                        break
                    }
                    case 'Fordward Testing Session': {
                        bot.SESSION.parameters.timeRange.config.initialDatetime = new Date()
                        bot.SESSION.parameters.timeRange.config.finalDatetime = new Date((new Date()).valueOf() + ONE_YEAR_IN_MILISECONDS)
                        break
                    }
                    case 'Paper Trading Session': {
                        bot.SESSION.parameters.timeRange.config.initialDatetime = new Date()
                        bot.SESSION.parameters.timeRange.config.finalDatetime = new Date((new Date()).valueOf() + ONE_YEAR_IN_MILISECONDS)
                        break
                    }
                }

                let tradingSystem = bot.TRADING_SYSTEM

                if (tradingSystem !== undefined) {

                    /* Applying Session Level Parameters */
                    if (bot.SESSION !== undefined) {
                        if (bot.SESSION.parameters !== undefined) {

                            /* Base Asset and Initial Balances. */
                            {
                                if (bot.SESSION.parameters.baseAsset !== undefined) {
                                    if (bot.SESSION.parameters.baseAsset.referenceParent !== undefined) {
                                        if (bot.SESSION.parameters.baseAsset.referenceParent.referenceParent !== undefined) {

                                            let config = bot.SESSION.parameters.baseAsset.referenceParent.referenceParent.config

                                            if (config.codeName !== undefined) {
                                                bot.VALUES_TO_USE.baseAsset = config.codeName;
                                            }

                                            config = bot.SESSION.parameters.baseAsset.config

                                            if (bot.VALUES_TO_USE.baseAsset === bot.market.baseAsset) {
                                                if (config.initialBalance !== undefined) {
                                                    bot.VALUES_TO_USE.initialBalanceA = config.initialBalance;
                                                    bot.VALUES_TO_USE.initialBalanceB = 0
                                                }
                                                if (config.minimumBalance !== undefined) {
                                                    bot.VALUES_TO_USE.minimumBalanceA = config.minimumBalance;
                                                    bot.VALUES_TO_USE.minimumBalanceB = 0
                                                }
                                                if (config.maximumBalance !== undefined) {
                                                    bot.VALUES_TO_USE.maximumBalanceA = config.maximumBalance;
                                                    bot.VALUES_TO_USE.maximumBalanceB = 0
                                                }
                                            } else {
                                                if (config.initialBalance !== undefined) {
                                                    bot.VALUES_TO_USE.initialBalanceB = config.initialBalance;
                                                    bot.VALUES_TO_USE.initialBalanceA = 0
                                                }
                                                if (config.minimumBalance !== undefined) {
                                                    bot.VALUES_TO_USE.minimumBalanceB = config.minimumBalance;
                                                    bot.VALUES_TO_USE.minimumBalanceA = 0
                                                }
                                                if (config.maximumBalance !== undefined) {
                                                    bot.VALUES_TO_USE.maximumBalanceB = config.maximumBalance;
                                                    bot.VALUES_TO_USE.maximumBalanceA = 0
                                                }
                                            }

                                            /* Solve when values are missing. */
                                            if (bot.VALUES_TO_USE.minimumBalanceA === undefined) {
                                                bot.VALUES_TO_USE.minimumBalanceA = 0
                                            }

                                            if (bot.VALUES_TO_USE.minimumBalanceB === undefined) {
                                                bot.VALUES_TO_USE.minimumBalanceB = 0
                                            }

                                            if (bot.VALUES_TO_USE.maximumBalanceA === undefined) {
                                                bot.VALUES_TO_USE.maximumBalanceA = 10000000000000000
                                            }

                                            if (bot.VALUES_TO_USE.maximumBalanceB === undefined) {
                                                bot.VALUES_TO_USE.maximumBalanceB = 10000000000000000
                                            }
                                        }
                                    }
                                }
                            }

                            /* Quoted Asset. */
                            {
                                if (bot.SESSION.parameters.quotedAsset !== undefined) {
                                    if (bot.SESSION.parameters.quotedAsset.referenceParent !== undefined) {
                                        if (bot.SESSION.parameters.quotedAsset.referenceParent.referenceParent !== undefined) {

                                            let config = bot.SESSION.parameters.quotedAsset.referenceParent.referenceParent.config

                                            if (config.codeName !== undefined) {
                                                bot.VALUES_TO_USE.quotedAsset = config.codeName;
                                            }
                                        }
                                    }
                                }
                            }

                            /* Time Frame */
                            if (bot.SESSION.parameters.timeFrame !== undefined) {
                                bot.VALUES_TO_USE.timeFrame = bot.SESSION.parameters.timeFrame.config.value
                            }

                            /* Slippage */
                            if (bot.SESSION.parameters.slippage !== undefined) {
                                if (bot.SESSION.parameters.slippage.config !== undefined) {

                                    let config = bot.SESSION.parameters.slippage.config

                                    if (config.positionRate !== undefined) {
                                        bot.VALUES_TO_USE.slippage.positionRate = config.positionRate
                                    }
                                    if (config.stopLoss !== undefined) {
                                        bot.VALUES_TO_USE.slippage.stopLoss = config.stopLoss
                                    }
                                    if (config.takeProfit !== undefined) {
                                        bot.VALUES_TO_USE.slippage.takeProfit = config.takeProfit
                                    }
                                }
                            }

                            /* Fee Structure */
                            if (bot.SESSION.parameters.feeStructure !== undefined) {
                                if (bot.SESSION.parameters.feeStructure.config !== undefined) {

                                    let config = bot.SESSION.parameters.feeStructure.config

                                    if (config.maker !== undefined) {
                                        bot.VALUES_TO_USE.feeStructure.maker = config.maker
                                    }
                                    if (config.taker !== undefined) {
                                        bot.VALUES_TO_USE.feeStructure.taker = config.taker
                                    }
                                }
                            }

                            /* Time Range */
                            if (bot.SESSION.parameters.timeRange !== undefined) {
                                if (bot.SESSION.parameters.timeRange.config !== undefined) {

                                    let config = bot.SESSION.parameters.timeRange.config
                                    if (config.initialDatetime !== undefined) {
                                        if (isNaN(Date.parse(config.initialDatetime)) === true) {
                                            parentLogger.write(MODULE_NAME, "[WARN] initialize -> runSession -> setValuesToUse -> Cannot use initialDatatime provided at Session Parameters because it is not a valid Date.");
                                        } else {
                                            bot.SESSION.parameters.timeRange.config.initialDatetime = new Date(config.initialDatetime)
                                        }
                                    }
                                    if (config.finalDatetime !== undefined) {
                                        if (isNaN(Date.parse(config.finalDatetime)) === true) {
                                            parentLogger.write(MODULE_NAME, "[WARN] initialize -> runSession -> setValuesToUse -> Cannot use finalDatetime provided at Session Parameters because it is not a valid Date.");
                                        } else {
                                            bot.SESSION.parameters.timeRange.config.finalDatetime = new Date(config.finalDatetime)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            function initializeSocialBots() {

                if (bot.SESSION.socialBots !== undefined) {
                    if (bot.SESSION.socialBots.bots !== undefined) {
                        for (let i = 0; i < bot.SESSION.socialBots.bots.length; i++) {
                            let socialBot = bot.SESSION.socialBots.bots[i]
                            if (socialBot.type === "Telegram Bot") {
                                let config = socialBot.config
                                socialBot.botInstance = initializeTelegramBot(config.botToken, config.chatId)
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
                                    parentLogger.write(MODULE_NAME, "[WARN] initialize -> initializeSocialBots -> announce -> err = " + err.stack);
                                }
                            }
                        }
                    }

                    bot.SESSION.socialBots.announce = announce
                }
            }

            function finalizeSocialBots() {
                if (bot.SESSION.socialBots === undefined) { return }
                if (bot.SESSION.socialBots.bots !== undefined) {
                    for (let i = 0; i < bot.SESSION.socialBots.bots.length; i++) {
                        let socialBot = bot.SESSION.socialBots.bots[i]
                        if (socialBot.type === "Telegram Bot") {
                            let config = socialBot.config
                            socialBot.botInstance = finalizeTelegramBot(config.chatId)
                        }
                    }
                }
            }

            function initializeTelegramBot(botToken, chatId) {
                /* Telegram Bot Initialization */
                try {
                    const Telegraf = require('telegraf')
                    let telegramBot
                    telegramBot = new Telegraf(botToken)
                    telegramBot.start((ctx) => ctx.reply('Hi! I am the Telegram Bot that will tell you what happens with your trading session.'))
                    telegramBot.help((ctx) => ctx.reply('I can stop the session if you say STOP.'))
                    telegramBot.hears('STOP', (ctx) => stopSession())
                    telegramBot.launch()

                    const Telegram = require('telegraf/telegram')

                    telegramAPI = new Telegram(botToken)

                    const messge = bot.SESSION.type + " '" + bot.SESSION.name + "' was started with an initial balance of " + " " + bot.VALUES_TO_USE.initialBalanceA + " " + bot.VALUES_TO_USE.baseAsset + "."
                    telegramAPI.sendMessage(chatId, messge).catch(err => parentLogger.write(MODULE_NAME, "[WARN] initialize -> initializeTelegramBot -> Telegram API error -> err = " + err))

                    let botInstance = {
                        telegramBot: telegramBot,
                        telegramAPI: telegramAPI,
                        chatId: chatId
                    }
                    return botInstance
                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[WARN] initialize -> initializeTelegramBot -> err = " + err.stack);
                }

            }

            function finalizeTelegramBot(chatId) {
                const messge = bot.SESSION.type + " '" + bot.SESSION.name + "' was stopped."
                telegramAPI.sendMessage(chatId, messge).catch(err => parentLogger.write(MODULE_NAME, "[WARN] initialize -> initializeTelegramBot -> Telegram API error -> err = " + err))
            }

        } catch (err) {
            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
