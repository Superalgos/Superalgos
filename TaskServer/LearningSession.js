exports.newLearningSession = function newLearningSession(bot, parentLogger) {

    const MODULE_NAME = "Learning Session"
    const FULL_LOG = true;

    let thisObject = {
        initialize: initialize
    }

    const SOCIAL_BOTS_MODULE = require('./SocialBots.js')
    let socialBotsModule = SOCIAL_BOTS_MODULE.newSocialBots(bot, parentLogger)

    return thisObject;

    function initialize(pProcessConfig, callBackFunction) {
        try {
            /* Initialize this info so that everything is logged propeerly */
            bot.LEARNING_SESSION = {
                name: bot.processNode.session.name,
                id: bot.processNode.session.id
            }

            /* Set the folderName for early logging */
            if (bot.processNode.session.config.folderName === undefined) {
                bot.LEARNING_SESSION.folderName = bot.processNode.session.type.replace(' ', '-').replace(' ', '-') + '-' + bot.LEARNING_SESSION.id
            } else {
                bot.LEARNING_SESSION.folderName = bot.processNode.session.type.replace(' ', '-').replace(' ', '-') + '-' + bot.processNode.session.config.folderName
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

            global.EVENT_SERVER_CLIENT.listenToEvent(bot.sessionKey, 'Learning Session Status', undefined, bot.sessionKey, undefined, onSessionStatus)
            global.EVENT_SERVER_CLIENT.listenToEvent(bot.sessionKey, 'Run Learning Session', undefined, bot.sessionKey, undefined, onSessionRun)
            global.EVENT_SERVER_CLIENT.listenToEvent(bot.sessionKey, 'Stop Learning Session', undefined, bot.sessionKey, undefined, onSessionStop)
            global.EVENT_SERVER_CLIENT.listenToEvent(bot.sessionKey, 'Resume Learning Session', undefined, bot.sessionKey, undefined, onSessionResume)

            /* Connect this here so that it is accesible from other places */
            bot.sessionError = sessionError
            bot.sessionWarning = sessionWarning
            bot.sessionInfo = sessionInfo

            /* Heartbeats sent to the UI */
            bot.sessionHeartBeat = sessionHeartBeat

            callBackFunction(global.DEFAULT_OK_RESPONSE)
            return

            function onSessionStatus() {
                if (bot.SESSION_STATUS === 'Running') {
                    let event = {
                        status: 'Learning Session Runnning' 
                    }
                    global.EVENT_SERVER_CLIENT.raiseEvent(bot.sessionKey, 'Status Response', event)
                } else {
                    let event = {
                        status: 'Learning Session Not Runnning' 
                    }
                    global.EVENT_SERVER_CLIENT.raiseEvent(bot.sessionKey, 'Status Response', event)
                }
            }

            function onSessionRun(message) {
                try {
                    /* This happens when the UI is reloaded, the session was running and tries to run it again. */
                    if (bot.SESSION_STATUS === 'Idle' || bot.SESSION_STATUS === 'Running') { 
                        parentLogger.write(MODULE_NAME, "[WARN] onSessionRun -> Event received to run the Session while it was already running. ")
                        return 
                    } 

                    /* We are going to run the Definition comming at the event. */
                    bot.TRADING_SYSTEM = JSON.parse(message.event.tradingSystem)
                    bot.TRADING_ENGINE = JSON.parse(message.event.tradingEngine)
                    bot.LEARNING_SESSION = JSON.parse(message.event.session)
                    bot.DEPENDENCY_FILTER = JSON.parse(message.event.dependencyFilter)
                    bot.RESUME = false
                    bot.FIRST_EXECUTION = true
                    bot.LEARNING_SESSION.stop = stopSession // stop function

                    setUpSessionFolderName()

                    /* We validate all parameters received and complete some that might be missing if needed. */
                    if (checkParemeters() === false) { return }

                    socialBotsModule.initialize()

                    let allGood
                    switch (bot.LEARNING_SESSION.type) {
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
                        if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, '[IMPORTANT] onSessionRun -> Stopping the Session now. ') }
                    }

                    socialBotsModule.sendMessage(bot.LEARNING_SESSION.type + " '" + bot.LEARNING_SESSION.name + "' is starting.")
                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onSessionRun -> err = " + err.stack);
                }
            }

            function onSessionStop() {
                stopSession('Session Stopped From the User Interface.')
            }

            function onSessionResume(message) {
                try {
                    if (bot.LEARNING_SESSION.stop === undefined) { 
                        parentLogger.write(MODULE_NAME, "[WARN] onSessionResume -> Event received to resume the Session that have never be ran before. ")
                        return 
                    }

                    /* This happens when the UI is reloaded, the session was running and tries to run it again. */
                    if (bot.SESSION_STATUS === 'Idle' || bot.SESSION_STATUS === 'Running') { 
                        parentLogger.write(MODULE_NAME, "[WARN] onSessionResume -> Event received to resume the Session while it was already running. ")
                        return 
                    } 

                    bot.RESUME = true
                    bot.STOP_SESSION = false

                    socialBotsModule.sendMessage(bot.LEARNING_SESSION.type + " '" + bot.LEARNING_SESSION.name + "' is resuming.")
                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onSessionResume -> err = " + err.stack);
                }
            }

            function stopSession(commandOrigin) {

                socialBotsModule.sendMessage(bot.LEARNING_SESSION.type + " '" + bot.LEARNING_SESSION.name + "' is stopping " + commandOrigin)
                socialBotsModule.finalize()
                bot.STOP_SESSION = true
                if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, '[IMPORTANT] stopSession -> Stopping the Session now. ') }
                sessionInfo(bot.LEARNING_SESSION, commandOrigin)
            }

            function setUpSessionFolderName() {
                /* 
                The session object is overwritten when the session is run. For that reason we 
                need to setup again the folder name at the Session level.
                Set the folderName for logging, reports, context and data output 
                */
                let config
                if (bot.LEARNING_SESSION.config !== undefined) {
                    config = bot.LEARNING_SESSION.config
                    if (config.folderName === undefined) {
                        bot.LEARNING_SESSION.folderName = bot.processNode.session.type.replace(' ', '-').replace(' ', '-') + '-' + bot.LEARNING_SESSION.id
                    } else {
                        bot.LEARNING_SESSION.folderName = bot.processNode.session.type.replace(' ', '-').replace(' ', '-') + '-' + bot.processNode.session.config.folderName
                    }
                }
            }

            function checkParemeters() {
                /*
                Here we check all the Session Parameters received. If something critical is missing we abort returning false. If something
                non critical is missing, we complete it with a default value.
                */

                if (bot.LEARNING_SESSION.learningParameters === undefined) {
                    let errorMessage = "Session Node with no Parameters."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.sessionError(bot.LEARNING_SESSION, errorMessage)
                    return false
                }

                /* Time Range */
                if (bot.LEARNING_SESSION.learningParameters.timeRange === undefined) { // if the Time Range is missing we create a default one.
                    bot.LEARNING_SESSION.learningParameters.timeRange = {
                        name: 'Missing Time Range',
                        type: 'Time Range',
                        config: {
                            initialDatetime: (new Date()).valueOf(),
                            finalDatetime: (new Date()).valueOf() + global.ONE_YEAR_IN_MILISECONDS
                        }
                    }
                } else {
                    /* Check that we received valid dates */
                    if (bot.LEARNING_SESSION.type === 'Backtesting Session') {
                        if (isNaN(new Date(bot.LEARNING_SESSION.learningParameters.timeRange.config.initialDatetime)).valueOf()) {
                            let errorMessage = "sessionParameters.timeRange.config.initialDatetime is not a valid date."
                            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                            bot.sessionError(bot.LEARNING_SESSION.learningParameters, errorMessage)
                            return false
                        }
                    }
                    if (isNaN(new Date(bot.LEARNING_SESSION.learningParameters.timeRange.config.finalDatetime)).valueOf()) {
                        let errorMessage = "sessionParameters.timeRange.config.initialDatetime is not a valid date."
                        parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                        bot.sessionError(bot.LEARNING_SESSION.learningParameters, errorMessage)
                        return false
                    }
                }

                /* Session Type Forced Values */
                let today = (new Date()).valueOf()
                let aYearAgo = today - global.ONE_YEAR_IN_MILISECONDS
                let aYearFromNow = today + global.ONE_YEAR_IN_MILISECONDS
                switch (bot.LEARNING_SESSION.type) {
                    case 'Backtesting Session': {
                        useDefaultDatetimes(aYearAgo, today)
                        break
                    }
                    case 'Live Trading Session': {
                        useDefaultDatetimes(today, aYearFromNow)
                        break
                    }
                    case 'Fordward Testing Session': {
                        useDefaultDatetimes(today, aYearFromNow)
                        break
                    }
                    case 'Paper Trading Session': {
                        useDefaultDatetimes(today, aYearFromNow)
                        break
                    }
                }

                function useDefaultDatetimes(initialDefault, finalDefault) {
                    /* 
                    Note that inside the system, we are going to deal with these
                    dates in their numeric value representation.
                    */

                    /* Initial Datetime */
                    if (bot.LEARNING_SESSION.type === 'Backtesting Session') {
                        if (bot.LEARNING_SESSION.learningParameters.timeRange.config.initialDatetime === undefined) {
                            bot.LEARNING_SESSION.learningParameters.timeRange.config.initialDatetime = initialDefault
                        } else {
                            bot.LEARNING_SESSION.learningParameters.timeRange.config.initialDatetime = (new Date(bot.LEARNING_SESSION.learningParameters.timeRange.config.initialDatetime)).valueOf()
                        }
                    } else {
                        /* Non backtest session can start from the past only if explicitly configured that way */
                        if (bot.LEARNING_SESSION.learningParameters.timeRange.config.initialDatetime === undefined || bot.LEARNING_SESSION.learningParameters.timeRange.config.allowStartingFromThePast !== true) {
                            bot.LEARNING_SESSION.learningParameters.timeRange.config.initialDatetime = initialDefault
                        } else {
                            bot.LEARNING_SESSION.learningParameters.timeRange.config.initialDatetime = (new Date(bot.LEARNING_SESSION.learningParameters.timeRange.config.initialDatetime)).valueOf()
                        }
                    }

                    /* Final Datetime */
                    if (bot.LEARNING_SESSION.learningParameters.timeRange.config.finalDatetime === undefined) {
                        bot.LEARNING_SESSION.learningParameters.timeRange.config.finalDatetime = finalDefault
                    } else {
                        bot.LEARNING_SESSION.learningParameters.timeRange.config.finalDatetime = (new Date(bot.LEARNING_SESSION.learningParameters.timeRange.config.finalDatetime)).valueOf()
                    }
                }

                /* Time Frame */
                if (bot.LEARNING_SESSION.learningParameters.timeFrame === undefined) {
                    let errorMessage = "Session Parameters Node with no Time Frame."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.sessionError(bot.LEARNING_SESSION.learningParameters, errorMessage)
                    return false
                }
                if (bot.LEARNING_SESSION.learningParameters.timeFrame.config.label === undefined) {
                    let errorMessage = "Session Parameters Node with no Time Frame Label configuration."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.sessionError(bot.LEARNING_SESSION.learningParameters.timeFrame, errorMessage)
                    return false
                }
                bot.LEARNING_SESSION.learningParameters.timeFrame.config.value = getTimeFrameFromLabel(bot.LEARNING_SESSION.learningParameters.timeFrame.config.label)
                if (bot.LEARNING_SESSION.learningParameters.timeFrame.config.value === undefined) {
                    let errorMessage = "Config error: label value not recognized. Try 01-min or 01-hs for example."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.sessionError(bot.LEARNING_SESSION.learningParameters.timeFrame, errorMessage)
                    return false
                }

                /* Session Base Asset */
                if (bot.LEARNING_SESSION.learningParameters.sessionBaseAsset === undefined) {
                    let errorMessage = "Session Parameters Node with no Session Base Asset."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.sessionError(bot.LEARNING_SESSION.learningParameters, errorMessage)
                    return false
                }
                if (bot.LEARNING_SESSION.learningParameters.sessionBaseAsset.config.initialBalance === undefined) {
                    let errorMessage = "Session Parameters Session Base Asset with no initialBalance configuration."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.sessionError(bot.LEARNING_SESSION.learningParameters.sessionBaseAsset, errorMessage)
                    return false
                }

                /* Session Quoted Asset */
                if (bot.LEARNING_SESSION.learningParameters.sessionQuotedAsset === undefined) {
                    let errorMessage = "Session Parameters Node with no Session Quoted Asset."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.sessionError(bot.LEARNING_SESSION.learningParameters, errorMessage)
                    return false
                }
                if (bot.LEARNING_SESSION.learningParameters.sessionQuotedAsset.config.initialBalance === undefined) {
                    let errorMessage = "Session Parameters Session Quoted Asset with no initialBalance configuration."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.sessionError(bot.LEARNING_SESSION.learningParameters.sessionQuotedAsset, errorMessage)
                    return false
                }

                /* Slippage */
                if (bot.LEARNING_SESSION.learningParameters.slippage === undefined) { // if the Slippage is missing we create a default one.
                    bot.LEARNING_SESSION.learningParameters.slippage = {
                        name: 'Missing Slippage',
                        type: 'Slippage',
                        config: {
                            marketOrderRate: 0,
                            stopLoss: 0,
                            takeProfit: 0
                        }
                    }
                }
                if (bot.LEARNING_SESSION.learningParameters.slippage.config.marketOrderRate === undefined) { // if the marketOrderRate is missing we create a default one.
                    bot.LEARNING_SESSION.learningParameters.slippage.config.marketOrderRate = 0
                }
                if (bot.LEARNING_SESSION.learningParameters.slippage.config.stopLoss === undefined) { // if the stopLoss is missing we create a default one.
                    bot.LEARNING_SESSION.learningParameters.slippage.config.stopLoss = 0
                }
                if (bot.LEARNING_SESSION.learningParameters.slippage.config.takeProfit === undefined) { // if the takeProfit is missing we create a default one.
                    bot.LEARNING_SESSION.learningParameters.slippage.config.takeProfit = 0
                }

                /* Fee Structure */
                if (bot.LEARNING_SESSION.learningParameters.feeStructure === undefined) { // if the Fee Structure is missing we create a default one.
                    bot.LEARNING_SESSION.learningParameters.feeStructure = {
                        name: 'Missing Fee Structure',
                        type: 'Fee Structure',
                        config: {
                            maker: 0,
                            taker: 0
                        }
                    }
                }
                if (bot.LEARNING_SESSION.learningParameters.feeStructure.config.maker === undefined) { // if the maker is missing we create a default one.
                    bot.LEARNING_SESSION.learningParameters.feeStructure.config.maker = 0
                }
                if (bot.LEARNING_SESSION.learningParameters.feeStructure.config.taker === undefined) { // if the taker is missing we create a default one.
                    bot.LEARNING_SESSION.learningParameters.feeStructure.config.taker = 0
                }

                return true
            }

            function startBackTesting(message) {
                return true
            }

            function startLiveTrading(message) {
                if (bot.KEY === undefined || bot.SECRET === undefined) {
                    let errorMessage = "Key 'codeName' or 'secret' not provided. Plese check that and try again."
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[ERROR] initialize -> startLiveTrading -> " + errorMessage); }
                    bot.sessionError(bot.LEARNING_SESSION, errorMessage)
                    return false
                }
                return true
            }

            function startFordwardTesting(message) {
                if (bot.KEY === undefined || bot.SECRET === undefined) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[WARN] initialize -> startFordwardTesting -> Key name or Secret not provided, not possible to run the process in Forward Testing mode."); }
                    console.log("Key 'codeName' or 'secret' not provided. Plese check that and try again.")
                    return false
                }

                /* Reduce the balance */
                let balancePercentage = 1 // This is the default value

                if (bot.LEARNING_SESSION.config.balancePercentage !== undefined) {
                    balancePercentage = bot.LEARNING_SESSION.config.balancePercentage
                }

                bot.LEARNING_SESSION.learningParameters.sessionBaseAsset.config.initialBalance = bot.LEARNING_SESSION.learningParameters.sessionBaseAsset.config.initialBalance * balancePercentage / 100
                bot.LEARNING_SESSION.learningParameters.sessionQuotedAsset.config.initialBalance = bot.LEARNING_SESSION.learningParameters.sessionQuotedAsset.config.initialBalance * balancePercentage / 100

                bot.LEARNING_SESSION.learningParameters.sessionBaseAsset.config.minimumBalance = bot.LEARNING_SESSION.learningParameters.sessionBaseAsset.config.minimumBalance * balancePercentage / 100
                bot.LEARNING_SESSION.learningParameters.sessionQuotedAsset.config.minimumBalance = bot.LEARNING_SESSION.learningParameters.sessionQuotedAsset.config.minimumBalance * balancePercentage / 100

                bot.LEARNING_SESSION.learningParameters.sessionBaseAsset.config.maximumBalance = bot.LEARNING_SESSION.learningParameters.sessionBaseAsset.config.maximumBalance * balancePercentage / 100
                bot.LEARNING_SESSION.learningParameters.sessionQuotedAsset.config.maximumBalance = bot.LEARNING_SESSION.learningParameters.sessionQuotedAsset.config.maximumBalance * balancePercentage / 100

                pProcessConfig.normalWaitTime = bot.LEARNING_SESSION.learningParameters.timeFrame.config.value

                return true
            }

            function startPaperTrading(message) {
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

            function sessionHeartBeat(processingDate, percentage, status) {
                let event = {
                    seconds: (new Date()).getSeconds(),
                    processingDate: processingDate,
                    percentage: percentage,
                    status: status
                }
                global.EVENT_SERVER_CLIENT.raiseEvent(bot.sessionKey, 'Heartbeat', event)

                if (global.STOP_TASK_GRACEFULLY === true) {
                    bot.STOP_SESSION = true
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, '[IMPORTANT] sessionHeartBeat -> Stopping the Session now. ') }
                }
            }

            function sessionError(node, errorMessage) {
                let event
                if (node !== undefined) {
                    event = {
                        nodeName: node.name,
                        nodeType: node.type,
                        nodeId: node.id,
                        errorMessage: errorMessage
                    }
                } else {
                    event = {
                        errorMessage: errorMessage
                    }
                }
                global.EVENT_SERVER_CLIENT.raiseEvent(bot.sessionKey, 'Error', event)

                if (global.STOP_TASK_GRACEFULLY === true) {
                    bot.STOP_SESSION = true
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, '[IMPORTANT] sessionError -> Stopping the Session now. ') }
                }
            }

            function sessionWarning(node, warningMessage) {
                let event
                if (node !== undefined) {
                    event = {
                        nodeName: node.name,
                        nodeType: node.type,
                        nodeId: node.id,
                        warningMessage: warningMessage
                    }
                } else {
                    event = {
                        warningMessage: warningMessage
                    }
                }
                global.EVENT_SERVER_CLIENT.raiseEvent(bot.sessionKey, 'Warning', event)

                if (global.STOP_TASK_GRACEFULLY === true) {
                    bot.STOP_SESSION = true
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, '[IMPORTANT] sessionWarning -> Stopping the Session now. ') }
                }
            }

            function sessionInfo(node, infoMessage) {
                let event
                if (node !== undefined) {
                    event = {
                        nodeName: node.name,
                        nodeType: node.type,
                        nodeId: node.id,
                        infoMessage: infoMessage
                    }
                } else {
                    event = {
                        infoMessage: infoMessage
                    }
                }
                global.EVENT_SERVER_CLIENT.raiseEvent(bot.sessionKey, 'Info', event)

                if (global.STOP_TASK_GRACEFULLY === true) {
                    bot.STOP_SESSION = true
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, '[IMPORTANT] sessionInfo -> Stopping the Session now. ') }
                }
            }

        } catch (err) {
            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
