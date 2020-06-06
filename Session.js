exports.newSession = function newSession(bot, parentLogger) {

    const MODULE_NAME = "Session"
    const FULL_LOG = true;
    const ONE_YEAR_IN_MILISECONDS = 365 * 24 * 60 * 60 * 1000

    let thisObject = {
        initialize: initialize
    }

    const SOCIAL_BOTS_MODULE = require('./SocialBots.js')
    let socialBotsModule = SOCIAL_BOTS_MODULE.newSocialBots(bot, logger)

    return thisObject;

    function initialize(pProcessConfig, callBackFunction) {
        try {
            if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

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
                    bot.SESSION.stop = sessionStop // stop function

                    setUpAppSchema()
                    setUpSessionFolderName()

                    if (checkParemeters() === false) { return }

                    socialBotsModule.initialize()

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

                    socialBotsModule.sendMessage(bot.SESSION.type + " '" + bot.SESSION.name + "' was started.")
                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> runSession -> err = " + err.stack);
                }
            }

            function stopSession(commandOrigin) {
                try {
                    if (reason === undefined) { commandOrigin = ' from the User Interface.' }
                    socialBotsModule.sendMessage(bot.SESSION.type + " '" + bot.SESSION.name + "' was stopped " + commandOrigin)
                    bot.STOP_SESSION = true
                    socialBotsModule.finalize()
                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> stopSession -> err = " + err.stack);
                }
            }

            function setUpAppSchema() {
                /* Setup the APP_SCHEMA_MAP based on the APP_SCHEMA_ARRAY */
                bot.APP_SCHEMA_MAP = new Map()
                for (let i = 0; i < bot.APP_SCHEMA_ARRAY.length; i++) {
                    let nodeDefinition = bot.APP_SCHEMA_ARRAY[i]
                    let key = nodeDefinition.type
                    bot.APP_SCHEMA_MAP.set(key, nodeDefinition)
                }
            }

            function setUpSessionFolderName() {
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
                /* Session Type Forced Values */
                switch (bot.SESSION.type) {
                    case 'Live Trading Session': {
                        if (bot.SESSION.parameters.timeRange.config.finalDatetime.valueOf() > (new Date()).valueOf()) {
                            bot.SESSION.parameters.timeRange.config.finalDatetime = new Date()
                        }
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

            function startBackTesting(message) {
                bot.resumeExecution = false; // TODO change this for the new way of handling resuming
                bot.hasTheBotJustStarted = true // TODO see if this is necesary
                bot.multiPeriodProcessDatetime = new Date(bot.SESSION.parameters.timeRange.config.initialDatetime.valueOf()) //  TODO see if this is necesary
                return true
            }

            function startLiveTrading(message) {

                if (process.env.KEY === undefined || process.env.SECRET === undefined) { // TODO Remove this from Process .env
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[ERROR] initialize -> startLiveTrading -> Key 'codeName' or 'secret' not provided. Plese check that and try again."); }
                    return false
                }

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
                    return false
                }

                bot.resumeExecution = false;
                bot.multiPeriodProcessDatetime = new Date(bot.SESSION.parameters.timeRange.config.initialDatetime.valueOf())
                bot.hasTheBotJustStarted = true

                /* Reduce the balance */

                let balancePercentage = 1 // This is the default value

                if (bot.SESSION.config.balancePercentage !== undefined) {
                    balancePercentage = bot.SESSION.config.balancePercentage
                }

                bot.SESSION.parameters.sessionBaseAsset.config.initialBalance = bot.SESSION.parameters.sessionBaseAsset.config.initialBalance * balancePercentage / 100
                bot.SESSION.parameters.sessionQuotedAsset.config.initialBalance = bot.SESSION.parameters.sessionQuotedAsset.config.initialBalance * balancePercentage / 100

                bot.SESSION.parameters.sessionBaseAsset.config.minimumBalance = bot.SESSION.parameters.sessionBaseAsset.config.minimumBalance * balancePercentage / 100
                bot.SESSION.parameters.sessionQuotedAsset.config.minimumBalance = bot.SESSION.parameters.sessionQuotedAsset.config.minimumBalance * balancePercentage / 100

                bot.SESSION.parameters.sessionBaseAsset.config.maximumBalance = bot.SESSION.parameters.sessionBaseAsset.config.maximumBalance * balancePercentage / 100
                bot.SESSION.parameters.sessionQuotedAsset.config.maximumBalance = bot.SESSION.parameters.sessionQuotedAsset.config.maximumBalance * balancePercentage / 100

                pProcessConfig.normalWaitTime = getTimeFrameFromLabel(bot.VALUES_TO_USE.timeFrame)

                return true
            }

            function startPaperTrading(message) {

                bot.resumeExecution = false;
                bot.hasTheBotJustStarted = true
                bot.multiPeriodProcessDatetime = new Date(bot.SESSION.parameters.timeRange.config.initialDatetime.valueOf())
                pProcessConfig.normalWaitTime = getTimeFrameFromLabel(bot.SESSION.parameters.timeFrame.label)
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

        } catch (err) {
            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
