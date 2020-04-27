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
            if (bot.processNode.session.code.folderName === undefined) {
                bot.SESSION.folderName = bot.SESSION.id
            } else {
                bot.SESSION.folderName = bot.processNode.session.code.folderName + "-" + bot.SESSION.id
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
                    bot.TRADING_SYSTEM = JSON.parse(message.event.tradingSystem)
                    bot.SESSION = JSON.parse(message.event.session)
                    bot.DEPENDENCY_FILTER = JSON.parse(message.event.dependencyFilter)

                    /* Set the folderName for logging, reports, context and data output */
                    let code
                    if (bot.SESSION.code !== undefined) {
                        code = bot.SESSION.code
                        if (code.folderName === undefined) {
                            bot.SESSION.folderName = bot.SESSION.id
                        } else {
                            bot.SESSION.folderName = code.folderName + "-" + bot.SESSION.id
                        }
                    }

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
                if (bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf() < (new Date()).valueOf()) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[WARN] initialize -> checkDatetimes -> Overriding initialDatetime with present datetime because " + bot.VALUES_TO_USE.timeRange.initialDatetime + " is in the past."); }
                    bot.VALUES_TO_USE.timeRange.initialDatetime = new Date()
                }
                if (bot.VALUES_TO_USE.timeRange.finalDatetime.valueOf() < (new Date()).valueOf()) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[WARN] initialize -> checkDatetimes -> Overriding finalDatetime with present datetime plus one year because " + bot.VALUES_TO_USE.timeRange.finalDatetime + " is in the past."); }
                    bot.VALUES_TO_USE.timeRange.finalDatetime = new Date() + ONE_YEAR_IN_MILISECONDS
                }
            }

            function startBackTesting(message) {
                bot.startMode = "Backtest"
                if (bot.VALUES_TO_USE.timeRange.finalDatetime.valueOf() > (new Date()).valueOf()) {
                    bot.VALUES_TO_USE.timeRange.finalDatetime = new Date()
                }
                bot.resumeExecution = false;
                bot.hasTheBotJustStarted = true
                bot.multiPeriodProcessDatetime = new Date(bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf()) 
                return true
            }

            function startLiveTrading(message) {

                if (process.env.KEY === undefined || process.env.SECRET === undefined) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[WARN] initialize -> startLiveTrading -> Key name or Secret not provided, not possible to run the process in Live mode."); }
                    console.log("Key 'codeName' or 'secret' not provided. Plese check that and try again.")
                    return
                }

                bot.startMode = "Live"
                checkDatetimes()
                bot.resumeExecution = false;
                bot.multiPeriodProcessDatetime = new Date(bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf()) 
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
                bot.multiPeriodProcessDatetime = new Date(bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf()) 
                bot.hasTheBotJustStarted = true

                /* Reduce the balance */

                let balancePercentage = 1 // This is the default value
              
                if (bot.SESSION.code.balancePercentage !== undefined) {
                    balancePercentage = bot.SESSION.code.balancePercentage
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
                bot.multiPeriodProcessDatetime = new Date(bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf()) 
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
                /*
                    Base on the information received we will determined which values ultimatelly are going to be used,
                    and once we do, they will become constants across the multiple loops executions.
                */

                /* Set all default values */
                bot.VALUES_TO_USE = {
                    slippage: {
                        positionRate: 0,
                        stopLoss: 0,
                        takeProfit: 0
                    },
                    feeStructure: {
                        maker: 0,
                        taker: 0
                    },
                    timeRange: {
                        initialDatetime: new Date(),
                        finalDatetime: new Date()
                    }
                }

                /* Session Type Dependant Default Values */

                switch (bot.SESSION.type) {
                    case 'Backtesting Session': {
                        bot.VALUES_TO_USE.timeRange.initialDatetime = new Date((new Date()).valueOf() - ONE_YEAR_IN_MILISECONDS)
                        bot.VALUES_TO_USE.timeRange.finalDatetime = new Date()
                        break
                    }
                    case 'Live Trading Session': {
                        bot.VALUES_TO_USE.timeRange.initialDatetime = new Date()
                        bot.VALUES_TO_USE.timeRange.finalDatetime = new Date((new Date()).valueOf() + ONE_YEAR_IN_MILISECONDS)
                        break
                    }
                    case 'Fordward Testing Session': {
                        bot.VALUES_TO_USE.timeRange.initialDatetime = new Date()
                        bot.VALUES_TO_USE.timeRange.finalDatetime = new Date((new Date()).valueOf() + ONE_YEAR_IN_MILISECONDS)
                        break
                    }
                    case 'Paper Trading Session': {
                        bot.VALUES_TO_USE.timeRange.initialDatetime = new Date()
                        bot.VALUES_TO_USE.timeRange.finalDatetime = new Date((new Date()).valueOf() + ONE_YEAR_IN_MILISECONDS)
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

                                            let code = bot.SESSION.parameters.baseAsset.referenceParent.referenceParent.code

                                            if (code.codeName !== undefined) {
                                                bot.VALUES_TO_USE.baseAsset = code.codeName;
                                            }

                                            code = bot.SESSION.parameters.baseAsset.code

                                            if (bot.VALUES_TO_USE.baseAsset === bot.market.baseAsset) {
                                                if (code.initialBalance !== undefined) {
                                                    bot.VALUES_TO_USE.initialBalanceA = code.initialBalance;
                                                    bot.VALUES_TO_USE.initialBalanceB = 0
                                                }
                                                if (code.minimumBalance !== undefined) {
                                                    bot.VALUES_TO_USE.minimumBalanceA = code.minimumBalance;
                                                    bot.VALUES_TO_USE.minimumBalanceB = 0
                                                }
                                                if (code.maximumBalance !== undefined) {
                                                    bot.VALUES_TO_USE.maximumBalanceA = code.maximumBalance;
                                                    bot.VALUES_TO_USE.maximumBalanceB = 0
                                                }
                                            } else {
                                                if (code.initialBalance !== undefined) {
                                                    bot.VALUES_TO_USE.initialBalanceB = code.initialBalance;
                                                    bot.VALUES_TO_USE.initialBalanceA = 0
                                                }
                                                if (code.minimumBalance !== undefined) {
                                                    bot.VALUES_TO_USE.minimumBalanceB = code.minimumBalance;
                                                    bot.VALUES_TO_USE.minimumBalanceA = 0
                                                }
                                                if (code.maximumBalance !== undefined) {
                                                    bot.VALUES_TO_USE.maximumBalanceB = code.maximumBalance;
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

                                            let code = bot.SESSION.parameters.quotedAsset.referenceParent.referenceParent.code

                                            if (code.codeName !== undefined) {
                                                bot.VALUES_TO_USE.quotedAsset = code.codeName;
                                            }
                                        }
                                    }
                                }
                            }

                            /* Time Frame */
                            if (bot.SESSION.parameters.timeFrame !== undefined) {
                                bot.VALUES_TO_USE.timeFrame = bot.SESSION.parameters.timeFrame.code.value
                            }

                            /* Slippage */
                            if (bot.SESSION.parameters.slippage !== undefined) {
                                if (bot.SESSION.parameters.slippage.code !== undefined) {

                                    let code = bot.SESSION.parameters.slippage.code

                                    if (code.positionRate !== undefined) {
                                        bot.VALUES_TO_USE.slippage.positionRate = code.positionRate
                                    }
                                    if (code.stopLoss !== undefined) {
                                        bot.VALUES_TO_USE.slippage.stopLoss = code.stopLoss
                                    }
                                    if (code.takeProfit !== undefined) {
                                        bot.VALUES_TO_USE.slippage.takeProfit = code.takeProfit
                                    }
                                }
                            }

                            /* Fee Structure */
                            if (bot.SESSION.parameters.feeStructure !== undefined) {
                                if (bot.SESSION.parameters.feeStructure.code !== undefined) {

                                    let code = bot.SESSION.parameters.feeStructure.code

                                    if (code.maker !== undefined) {
                                        bot.VALUES_TO_USE.feeStructure.maker = code.maker
                                    }
                                    if (code.taker !== undefined) {
                                        bot.VALUES_TO_USE.feeStructure.taker = code.taker
                                    }
                                }
                            }

                            /* Time Range */
                            if (bot.SESSION.parameters.timeRange !== undefined) {
                                if (bot.SESSION.parameters.timeRange.code !== undefined) {

                                    let code = bot.SESSION.parameters.timeRange.code
                                    if (code.initialDatetime !== undefined) {
                                        if (isNaN(Date.parse(code.initialDatetime)) === true) {
                                            parentLogger.write(MODULE_NAME, "[WARN] initialize -> runSession -> setValuesToUse -> Cannot use initialDatatime provided at Session Parameters because it is not a valid Date.");
                                        } else {
                                            bot.VALUES_TO_USE.timeRange.initialDatetime = new Date(code.initialDatetime)
                                        }
                                    }
                                    if (code.finalDatetime !== undefined) {
                                        if (isNaN(Date.parse(code.finalDatetime)) === true) {
                                            parentLogger.write(MODULE_NAME, "[WARN] initialize -> runSession -> setValuesToUse -> Cannot use finalDatetime provided at Session Parameters because it is not a valid Date.");
                                        } else {
                                            bot.VALUES_TO_USE.timeRange.finalDatetime = new Date(code.finalDatetime)
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
                                let code = socialBot.code
                                socialBot.botInstance = initializeTelegramBot(code.botToken, code.chatId)                                    
                            }
                        }
                    }

                    function announce(announcement) {
                        if (bot.SESSION.socialBots.bots !== undefined) {
                            for (let i = 0; i < bot.SESSION.socialBots.bots.length; i++) {
                                let socialBot = bot.SESSION.socialBots.bots[i]
                                try {
                                    let code = announcement.code
                                     
                                    if (socialBot.type === "Telegram Bot") {
                                        if (announcement.formulaValue !== undefined) {
                                            socialBot.botInstance.telegramAPI.sendMessage(socialBot.botInstance.chatId, announcement.formulaValue).catch(err => parentLogger.write(MODULE_NAME, "[WARN] initialize -> initializeSocialBots -> announce -> Telegram API error -> err = " + err))
                                        } else {
                                            socialBot.botInstance.telegramAPI.sendMessage(socialBot.botInstance.chatId, code.text).catch(err => parentLogger.write(MODULE_NAME, "[WARN] initialize -> initializeSocialBots -> announce -> Telegram API error -> err = " + err))
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
                if (bot.SESSION.socialBots === undefined) {return}
                if (bot.SESSION.socialBots.bots !== undefined) {
                    for (let i = 0; i < bot.SESSION.socialBots.bots.length; i++) {
                        let socialBot = bot.SESSION.socialBots.bots[i]
                        if (socialBot.type === "Telegram Bot") {
                            let code = socialBot.code
                            socialBot.botInstance = finalizeTelegramBot(code.chatId)
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
                    telegramAPI.sendMessage(chatId, messge ).catch(err => parentLogger.write(MODULE_NAME, "[WARN] initialize -> initializeTelegramBot -> Telegram API error -> err = " + err))

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
