exports.newSession = function newSession(bot, parentLogger) {

    const MODULE_NAME = "Session"
    const FULL_LOG = true;

    let thisObject = {
        initialize: initialize 
    }

    return thisObject;

    function initialize(callBackFunction) {
        try {
            if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            /* Initialize this info so that everything is logged propeerly */
             
            bot.SESSION = {
                name: bot.processNode.session.name,
                id: bot.processNode.session.id 
            }

            /* Set the folderName for early logging */
            if (bot.processNode.session.code.folderName === undefined) {
                bot.SESSION.folderName = bot.SESSION.id
            } else {
                bot.SESSION.folderName = bot.processNode.session.code.folderName
            }
 
            /* Check if there is a session */
            if (bot.processNode.session === undefined) {
                parentLogger.write(MODULE_NAME, "[ERROR] initialize -> Cannot run without a Session.");
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return;
            }

            /* Listen to event to start or stop the session. */
            bot.sessionKey = bot.processNode.session.name + '-' + bot.processNode.session.type + '-' + bot.processNode.session.id
 
            global.SYSTEM_EVENT_HANDLER.listenToEvent(bot.sessionKey, 'Run Session', undefined, undefined, undefined, runSession)
            global.SYSTEM_EVENT_HANDLER.listenToEvent(bot.sessionKey, 'Stop Session', undefined, undefined, undefined, stopSession)

            callBackFunction(global.DEFAULT_OK_RESPONSE)
            return

            function runSession(message) {
                console.log("runSession")
                /* We are going to run the Definition comming at the event. */
                bot.DEFINITION = JSON.parse(message.event.definition)
                bot.SESSION = JSON.parse(message.event.session)
                bot.UI_CURRENT_VALUES = message.event.uiCurrentValues

                /* Set the folderName for logging, reports, context and data output */
                let code
                if (bot.SESSION.code !== undefined) {
                    try {
                        code = JSON.parse(bot.SESSION.code) 
                        if (code.folderName === undefined) {
                            bot.SESSION.folderName = bot.SESSION.id
                        } else {
                            bot.SESSION.folderName = code.folderName
                        }
                    } catch (err) {
                        bot.SESSION.folderName = bot.SESSION.id 
                    }
                }

                /* Set up Social Bots */
                setUpSocialBots()

                /* Extract values from different sources and consolidate them under one structure that is going to be used later on. */
                setValuesToUse(message)

                switch (bot.SESSION.type) {
                    case 'Backtesting Session': {
                        startBackTesting(message)
                        break
                    }
                    case 'Live Trading Session': {
                        startLiveTrading(message)
                        break
                    }
                    case 'Fordward Testing Session': {
                        startFordwardTesting(message)
                        break
                    }
                    case 'Paper Trading Session': {
                        startPaperTrading(message)
                        break
                    }
                }
                bot.SESSION_STATUS = 'Idle'
                bot.STOP_SESSION = false
            }

            function stopSession(message) {
                bot.STOP_SESSION = true
            }

            function startBackTesting(message) {
                bot.startMode = "Backtest"
                if (bot.VALUES_TO_USE.timeRange.finalDatetime.valueOf() > (new Date()).valueOf()) {
                    bot.VALUES_TO_USE.timeRange.finalDatetime = new Date()
                }
                bot.resumeExecution = false;
                bot.hasTheBotJustStarted = true
                bot.multiPeriodProcessDatetime = new Date(bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf()) 
            }

            function startLiveTrading(message) {

                setKeyToUse()

                if (process.env.KEY === undefined || process.env.SECRET === undefined) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[WARN] initialize -> startLiveTrading -> Key name or Secret not provided, not possible to run the process in Live mode."); }
                    return
                }

                bot.startMode = "Live"
                if (bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf() < (new Date()).valueOf()) {
                    bot.VALUES_TO_USE.timeRange.initialDatetime = new Date()
                }
                bot.resumeExecution = false;
                bot.multiPeriodProcessDatetime = new Date(bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf()) 
                bot.hasTheBotJustStarted = true

            }

            function startFordwardTesting(message) {

                setKeyToUse()

                if (process.env.KEY === undefined || process.env.SECRET === undefined) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[WARN] initialize -> startLiveTrading -> Key name or Secret not provided, not possible to run the process in Forward Testing mode."); }
                    return
                }

                bot.startMode = "Live"
                if (bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf() < (new Date()).valueOf()) {
                    bot.VALUES_TO_USE.timeRange.initialDatetime = new Date()
                }
                bot.resumeExecution = false;
                bot.multiPeriodProcessDatetime = new Date(bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf()) 
                bot.hasTheBotJustStarted = true

                /* Reduce the balance */

                let balancePercentage = 1 // This is the default value
                try {
                    let code = JSON.parse(bot.SESSION.code)

                    if (code.balancePercentage !== undefined) {
                        balancePercentage = code.balancePercentage
                    }

                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[WARN] initialize -> startFordwardTesting -> Invalid value por balancePercentage. Using Default.");
                }

                bot.VALUES_TO_USE.initialBalanceA = bot.VALUES_TO_USE.initialBalanceA * balancePercentage / 100
                bot.VALUES_TO_USE.initialBalanceB = bot.VALUES_TO_USE.initialBalanceB * balancePercentage / 100
                       
                bot.VALUES_TO_USE.minimumBalanceA = bot.VALUES_TO_USE.minimumBalanceA * balancePercentage / 100
                bot.VALUES_TO_USE.minimumBalanceB = bot.VALUES_TO_USE.minimumBalanceB * balancePercentage / 100
               
                bot.VALUES_TO_USE.maximumBalanceA = bot.VALUES_TO_USE.maximumBalanceA * balancePercentage / 100
                bot.VALUES_TO_USE.maximumBalanceB = bot.VALUES_TO_USE.maximumBalanceB * balancePercentage / 100
            }

            function startPaperTrading(message) {
                bot.startMode = "Backtest"
                console.log("startPaperTrading")
                if (bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf() < (new Date()).valueOf()) {
                    bot.VALUES_TO_USE.timeRange.initialDatetime = new Date()
                }
                bot.resumeExecution = false;
                bot.hasTheBotJustStarted = true
                bot.multiPeriodProcessDatetime = new Date(bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf()) 

            }

            function setKeyToUse() {
                /* The last place where we can find a key to use is the key pool at the exchange account. */
                if (bot.DEFINITION.personalData) {
                    if (bot.DEFINITION.personalData.exchangeAccounts) {
                        if (bot.DEFINITION.personalData.exchangeAccounts.length > 0) {
                            let exchangeAccount = bot.DEFINITION.personalData.exchangeAccounts[0]
                            if (exchangeAccount.keys) {
                                if (exchangeAccount.keys.length > 0) {
                                    let key = exchangeAccount.keys[0]

                                    process.env.KEY = key.name
                                    process.env.SECRET = key.code

                                }
                            }
                        }
                    }
                }

                /* This is the primary fallback, when there is no key defined at the parameters at the session level. */
                if (bot.DEFINITION.tradingSystem) {
                    if (bot.DEFINITION.tradingSystem.parameters) {
                        if (bot.DEFINITION.tradingSystem.parameters.key !== undefined) {
                            let key = bot.DEFINITION.tradingSystem.parameters.key

                            process.env.KEY = key.name
                            process.env.SECRET = key.code
                        }
                    }
                }

                /* Key defined at the parameters at the session level. */
                if (bot.SESSION.parameters) {
                    if (bot.SESSION.parameters.key !== undefined) {
                        let key = bot.SESSION.parameters.key

                        process.env.KEY = key.name
                        process.env.SECRET = key.code
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
                    baseAsset: "BTC",
                    initialBalanceA: 0.001,
                    initialBalanceB: 0,
                    minimumBalanceA: 0.0005,
                    minimumBalanceB: 0,
                    maximumBalanceA: 0.002,
                    maximumBalanceB: 0,
                    timePeriod: bot.UI_CURRENT_VALUES.timePeriod,
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
                const ONE_YEAR_IN_MILISECONDS = 365 * 24 * 60 * 60 * 1000
                switch (bot.SESSION.type) {
                    case 'Backtesting Session': {
                        bot.VALUES_TO_USE.timeRange.initialDatetime = new Date(bot.UI_CURRENT_VALUES.initialDatetime)
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

                let tradingSystem = bot.DEFINITION.tradingSystem

                if (tradingSystem !== undefined) {

                    /* Applying Trading System Level Parameters */
                    if (tradingSystem.parameters !== undefined) {

                        /* Base Asset and Initial Balances. */
                        {
                            if (tradingSystem.parameters.baseAsset !== undefined) {
                                let code
                                try {
                                    code = JSON.parse(tradingSystem.parameters.baseAsset.code);

                                    if (code.name !== undefined) {
                                        bot.VALUES_TO_USE.baseAsset = code.name;
                                    }

                                    if (bot.VALUES_TO_USE.baseAsset === 'BTC') { 
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
                                } catch (err) {
                                    tradingSystem.parameters.baseAsset.error = err.message
                                }
                            }
                        }

                        /* Time Period */
                        if (tradingSystem.parameters.timePeriod !== undefined) {
                            bot.VALUES_TO_USE.timePeriod = tradingSystem.parameters.timePeriod.code
                        }

                        /* Slippage */
                        if (tradingSystem.parameters.slippage !== undefined) {
                            if (tradingSystem.parameters.slippage.code !== undefined) {
                                try {
                                    let code = JSON.parse(tradingSystem.parameters.slippage.code)

                                    if (code.positionRate !== undefined) {
                                        bot.VALUES_TO_USE.slippage.positionRate = code.positionRate
                                    }
                                    if (code.stopLoss !== undefined) {
                                        bot.VALUES_TO_USE.slippage.stopLoss = code.stopLoss
                                    }
                                    if (code.takeProfit !== undefined) {
                                        bot.VALUES_TO_USE.slippage.takeProfit = code.takeProfit
                                    }

                                } catch (err) {
                                    tradingSystem.parameters.slippage.error = err.message
                                }
                            }
                        }

                        /* Fee Structure */
                        if (tradingSystem.parameters.feeStructure !== undefined) {
                            if (tradingSystem.parameters.feeStructure.code !== undefined) {
                                try {
                                    let code = JSON.parse(tradingSystem.parameters.feeStructure.code)

                                    if (code.maker !== undefined) {
                                        bot.VALUES_TO_USE.feeStructure.maker = code.maker
                                    }
                                    if (code.taker !== undefined) {
                                        bot.VALUES_TO_USE.feeStructure.taker = code.taker
                                    }

                                } catch (err) {
                                    tradingSystem.parameters.feeStructure.error = err.message
                                }
                            }
                        }

                        /* Time Range */
                        if (tradingSystem.parameters.timeRange !== undefined) {
                            if (tradingSystem.parameters.timeRange.code !== undefined) {
                                try {
                                    let code = JSON.parse(tradingSystem.parameters.timeRange.code)
                                    if (code.initialDatetime !== undefined) {
                                        bot.VALUES_TO_USE.timeRange.initialDatetime = new Date(code.initialDatetime)
                                    }
                                    if (code.finalDatetime !== undefined) {
                                        bot.VALUES_TO_USE.timeRange.finalDatetime = new Date(code.finalDatetime)
                                    }
                                } catch (err) {
                                    tradingSystem.parameters.timeRange.error = err.message
                                }
                            }
                        }
                    }

                    /* Applying Session Level Parameters */
                    if (bot.SESSION !== undefined) {
                        if (bot.SESSION.parameters !== undefined) {

                            /* Base Asset and Initial Balances. */
                            {
                                if (bot.SESSION.parameters.baseAsset !== undefined) {
                                    let code
                                    try {
                                        code = JSON.parse(bot.SESSION.parameters.baseAsset.code);

                                        if (code.name !== undefined) {
                                            bot.VALUES_TO_USE.baseAsset = code.name;
                                        }

                                        if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
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
                                    } catch (err) {
                                        parentLogger.write(MODULE_NAME, "[WARN] initialize -> startLiveTrading -> Invalid Base Asset Value -> err = " + err.stack);
                                    }
                                }
                            }

                            /* Time Period */
                            if (bot.SESSION.parameters.timePeriod !== undefined) {
                                bot.VALUES_TO_USE.timePeriod = bot.SESSION.parameters.timePeriod.code
                            }

                            /* Slippage */
                            if (bot.SESSION.parameters.slippage !== undefined) {
                                if (bot.SESSION.parameters.slippage.code !== undefined) {
                                    try {
                                        let code = JSON.parse(bot.SESSION.parameters.slippage.code)

                                        if (code.positionRate !== undefined) {
                                            bot.VALUES_TO_USE.slippage.positionRate = code.positionRate
                                        }
                                        if (code.stopLoss !== undefined) {
                                            bot.VALUES_TO_USE.slippage.stopLoss = code.stopLoss
                                        }
                                        if (code.takeProfit !== undefined) {
                                            bot.VALUES_TO_USE.slippage.takeProfit = code.takeProfit
                                        }

                                    } catch (err) {
                                        parentLogger.write(MODULE_NAME, "[WARN] initialize -> startLiveTrading -> Invalid Slippage Value -> err = " + err.stack);
                                    }
                                }
                            }

                            /* Fee Structure */
                            if (bot.SESSION.parameters.feeStructure !== undefined) {
                                if (bot.SESSION.parameters.feeStructure.code !== undefined) {
                                    try {
                                        let code = JSON.parse(bot.SESSION.parameters.feeStructure.code)

                                        if (code.maker !== undefined) {
                                            bot.VALUES_TO_USE.feeStructure.maker = code.maker
                                        }
                                        if (code.taker !== undefined) {
                                            bot.VALUES_TO_USE.feeStructure.taker = code.taker
                                        }

                                    } catch (err) {
                                        parentLogger.write(MODULE_NAME, "[WARN] initialize -> startLiveTrading -> Invalid Fee Structure Value -> err = " + err.stack);
                                    }
                                }
                            }

                            /* Time Range */
                            if (bot.SESSION.parameters.timeRange !== undefined) {
                                if (bot.SESSION.parameters.timeRange.code !== undefined) {
                                    try {
                                        let code = JSON.parse(bot.SESSION.parameters.timeRange.code)
                                        if (code.initialDatetime !== undefined) {
                                            bot.VALUES_TO_USE.timeRange.initialDatetime = new Date(code.initialDatetime)
                                        }
                                        if (code.finalDatetime !== undefined) {
                                            bot.VALUES_TO_USE.timeRange.finalDatetime = new Date(code.finalDatetime)
                                        }
                                    } catch (err) {
                                        parentLogger.write(MODULE_NAME, "[WARN] initialize -> startLiveTrading -> Invalid Time Range Value -> err = " + err.stack);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            function setUpSocialBots() {

                if (bot.SESSION.socialBots !== undefined) {
                    if (bot.SESSION.socialBots.bots !== undefined) {
                        for (let i = 0; i < bot.SESSION.socialBots.bots.length; i++) {
                            let socialBot = bot.SESSION.socialBots.bots[i]
                            if (socialBot.type === "Telegram Bot") {
                                try {
                                    let code = JSON.parse(socialBot.code)
                                    socialBot.botInstance = setUpTelegramBot(code.botToken, code.chatId)                                    
                                } catch (err) {
                                    parentLogger.write(MODULE_NAME, "[WARN] initialize -> setUpSocialBots -> err = " + err.stack);
                                }
                            }
                        }
                    }

                    function announce(announcement) {
                        if (bot.SESSION.socialBots.bots !== undefined) {
                            for (let i = 0; i < bot.SESSION.socialBots.bots.length; i++) {
                                let socialBot = bot.SESSION.socialBots.bots[i]
                                try {
                                    let code = JSON.parse(announcement.code)
                                    if (code.botId === undefined) {
                                        code.botId = socialBot.id
                                    }
                                    if (socialBot.type === code.botType && socialBot.id === code.botId) {
                                        if (socialBot.type === "Telegram Bot") {
                                            socialBot.botInstance.telegramAPI.sendMessage(socialBot.botInstance.chatId, code.text)
                                        }
                                    }
                                } catch (err) {
                                    parentLogger.write(MODULE_NAME, "[WARN] initialize -> setUpSocialBots -> announce -> err = " + err.stack);
                                }
                            }
                        }
                    }

                    bot.SESSION.socialBots.announce = announce
                }
            }

            function setUpTelegramBot(botToken, chatId) {
                /* Telegram Bot Initialization */
                try {
                    const Telegraf = require('telegraf')
                    let telegramBot
                    telegramBot = new Telegraf(botToken)
                    telegramBot.start((ctx) => ctx.reply('Hi! I am a Telegram Bot powered by Superalgos'))
                    telegramBot.help((ctx) => ctx.reply('Send me a sticker'))
                    telegramBot.on('sticker', (ctx) => ctx.reply('??'))
                    telegramBot.hears('hi', (ctx) => ctx.reply('Hey there'))
                    telegramBot.launch()

                    const Telegram = require('telegraf/telegram')
                    let telegramAPI
                    telegramAPI = new Telegram(botToken)
                    telegramAPI.sendMessage(chatId, bot.SESSION.type + " '" + bot.SESSION.name + "' was Started.")

                    let botInstance = {
                        telegramBot: telegramBot,
                        telegramAPI: telegramAPI,
                        chatId: chatId
                    }
                    return botInstance
                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[WARN] initialize -> setUpTelegramBot -> err = " + err.stack);
                }

            }
 
        } catch (err) {
            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
