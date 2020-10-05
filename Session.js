exports.newSession = function newSession(bot, parentLogger) {

    const MODULE_NAME = "Session"
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
            bot.SESSION = {
                name: bot.processNode.session.name,
                id: bot.processNode.session.id
            }

            /* Set the folderName for early logging */
            if (bot.processNode.session.config.folderName === undefined) {
                bot.SESSION.folderName = bot.processNode.session.type.replace(' ', '-').replace(' ', '-') + '-' + bot.SESSION.id
            } else {
                bot.SESSION.folderName = bot.processNode.session.type.replace(' ', '-').replace(' ', '-') + '-' + bot.processNode.session.config.folderName
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

            global.EVENT_SERVER_CLIENT.listenToEvent(bot.sessionKey, 'Session Status', undefined, bot.sessionKey, undefined, onSessionStatus)
            global.EVENT_SERVER_CLIENT.listenToEvent(bot.sessionKey, 'Run Session', undefined, bot.sessionKey, undefined, onSessionRun)
            global.EVENT_SERVER_CLIENT.listenToEvent(bot.sessionKey, 'Stop Session', undefined, bot.sessionKey, undefined, onSessionStop)
            global.EVENT_SERVER_CLIENT.listenToEvent(bot.sessionKey, 'Resume Session', undefined, bot.sessionKey, undefined, onSessionResume)

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
                        status: 'Session Runnning' 
                    }
                    global.EVENT_SERVER_CLIENT.raiseEvent(bot.sessionKey, 'Status Response', event)
                } else {
                    let event = {
                        status: 'Not Session Runnning' 
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
                    bot.SESSION = JSON.parse(message.event.session)
                    bot.DEPENDENCY_FILTER = JSON.parse(message.event.dependencyFilter)
                    bot.RESUME = false
                    bot.FIRST_EXECUTION = true
                    bot.SESSION.stop = stopSession // stop function

                    setUpSessionFolderName()

                    /* We validate all parameters received and complete some that might be missing if needed. */
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
                        if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, '[IMPORTANT] onSessionRun -> Stopping the Session now. ') }
                    }

                    socialBotsModule.sendMessage(bot.SESSION.type + " '" + bot.SESSION.name + "' is starting.")
                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onSessionRun -> err = " + err.stack);
                }
            }

            function onSessionStop() {
                stopSession('Session Stopped From the User Interface.')
            }

            function onSessionResume(message) {
                try {
                    if (bot.SESSION.stop === undefined) { 
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

                    socialBotsModule.sendMessage(bot.SESSION.type + " '" + bot.SESSION.name + "' is resuming.")
                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onSessionResume -> err = " + err.stack);
                }
            }

            function stopSession(commandOrigin) {

                socialBotsModule.sendMessage(bot.SESSION.type + " '" + bot.SESSION.name + "' is stopping " + commandOrigin)
                socialBotsModule.finalize()
                bot.STOP_SESSION = true
                if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, '[IMPORTANT] stopSession -> Stopping the Session now. ') }
                sessionInfo(bot.SESSION, commandOrigin)
            }

            function setUpSessionFolderName() {
                /* 
                The session object is overwritten when the session is run. For that reason we 
                need to setup again the folder name at the Session level.
                Set the folderName for logging, reports, context and data output 
                */
                let config
                if (bot.SESSION.config !== undefined) {
                    config = bot.SESSION.config
                    if (config.folderName === undefined) {
                        bot.SESSION.folderName = bot.processNode.session.type.replace(' ', '-').replace(' ', '-') + '-' + bot.SESSION.id
                    } else {
                        bot.SESSION.folderName = bot.processNode.session.type.replace(' ', '-').replace(' ', '-') + '-' + bot.processNode.session.config.folderName
                    }
                }
            }

            function checkParemeters() {
                /*
                Here we check all the Session Parameters received. If something critical is missing we abort returning false. If something
                non critical is missing, we complete it with a default value.
                */

                if (bot.SESSION.parameters === undefined) {
                    let errorMessage = "Session Node with no Parameters."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.sessionError(bot.SESSION, errorMessage)
                    return false
                }

                /* Time Range */
                if (bot.SESSION.parameters.timeRange === undefined) { // if the Time Range is missing we create a default one.
                    bot.SESSION.parameters.timeRange = {
                        name: 'Missing Time Range',
                        type: 'Time Range',
                        config: {
                            initialDatetime: (new Date()).valueOf(),
                            finalDatetime: (new Date()).valueOf() + global.ONE_YEAR_IN_MILISECONDS
                        }
                    }
                } else {
                    /* Check that we received valid dates */
                    if (bot.SESSION.type === 'Backtesting Session') {
                        if (isNaN(new Date(bot.SESSION.parameters.timeRange.config.initialDatetime)).valueOf()) {
                            let errorMessage = "sessionParameters.timeRange.config.initialDatetime is not a valid date."
                            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                            bot.sessionError(bot.SESSION.parameters, errorMessage)
                            return false
                        }
                    }
                    if (isNaN(new Date(bot.SESSION.parameters.timeRange.config.finalDatetime)).valueOf()) {
                        let errorMessage = "sessionParameters.timeRange.config.initialDatetime is not a valid date."
                        parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                        bot.sessionError(bot.SESSION.parameters, errorMessage)
                        return false
                    }
                }

                /* Session Type Forced Values */
                let today = (new Date()).valueOf()
                let aYearAgo = today - global.ONE_YEAR_IN_MILISECONDS
                let aYearFromNow = today + global.ONE_YEAR_IN_MILISECONDS
                switch (bot.SESSION.type) {
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
                    if (bot.SESSION.type === 'Backtesting Session') {
                        if (bot.SESSION.parameters.timeRange.config.initialDatetime === undefined) {
                            bot.SESSION.parameters.timeRange.config.initialDatetime = initialDefault
                        } else {
                            bot.SESSION.parameters.timeRange.config.initialDatetime = (new Date(bot.SESSION.parameters.timeRange.config.initialDatetime)).valueOf()
                        }
                    } else {
                        /* Non backtest session can start from the past only if explicitly configured that way */
                        if (bot.SESSION.parameters.timeRange.config.initialDatetime === undefined || bot.SESSION.parameters.timeRange.config.allowStartingFromThePast !== true) {
                            bot.SESSION.parameters.timeRange.config.initialDatetime = initialDefault
                        } else {
                            bot.SESSION.parameters.timeRange.config.initialDatetime = (new Date(bot.SESSION.parameters.timeRange.config.initialDatetime)).valueOf()
                        }
                    }

                    /* Final Datetime */
                    if (bot.SESSION.parameters.timeRange.config.finalDatetime === undefined) {
                        bot.SESSION.parameters.timeRange.config.finalDatetime = finalDefault
                    } else {
                        bot.SESSION.parameters.timeRange.config.finalDatetime = (new Date(bot.SESSION.parameters.timeRange.config.finalDatetime)).valueOf()
                    }
                }

                /* Time Frame */
                if (bot.SESSION.parameters.timeFrame === undefined) {
                    let errorMessage = "Session Parameters Node with no Time Frame."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.sessionError(bot.SESSION.parameters, errorMessage)
                    return false
                }
                if (bot.SESSION.parameters.timeFrame.config.label === undefined) {
                    let errorMessage = "Session Parameters Node with no Time Frame Label configuration."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.sessionError(bot.SESSION.parameters.timeFrame, errorMessage)
                    return false
                }
                bot.SESSION.parameters.timeFrame.config.value = getTimeFrameFromLabel(bot.SESSION.parameters.timeFrame.config.label)
                if (bot.SESSION.parameters.timeFrame.config.value === undefined) {
                    let errorMessage = "Config error: label value not recognized. Try 01-min or 01-hs for example."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.sessionError(bot.SESSION.parameters.timeFrame, errorMessage)
                    return false
                }

                /* Session Base Asset */
                if (bot.SESSION.parameters.sessionBaseAsset === undefined) {
                    let errorMessage = "Session Parameters Node with no Session Base Asset."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.sessionError(bot.SESSION.parameters, errorMessage)
                    return false
                }
                if (bot.SESSION.parameters.sessionBaseAsset.config.initialBalance === undefined) {
                    let errorMessage = "Session Parameters Session Base Asset with no initialBalance configuration."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.sessionError(bot.SESSION.parameters.sessionBaseAsset, errorMessage)
                    return false
                }

                /* Session Quoted Asset */
                if (bot.SESSION.parameters.sessionQuotedAsset === undefined) {
                    let errorMessage = "Session Parameters Node with no Session Quoted Asset."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.sessionError(bot.SESSION.parameters, errorMessage)
                    return false
                }
                if (bot.SESSION.parameters.sessionQuotedAsset.config.initialBalance === undefined) {
                    let errorMessage = "Session Parameters Session Quoted Asset with no initialBalance configuration."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.sessionError(bot.SESSION.parameters.sessionQuotedAsset, errorMessage)
                    return false
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
                return true
            }

            function startLiveTrading(message) {
                if (bot.KEY === undefined || bot.SECRET === undefined) {
                    if (FULL_LOG === true) { parentLogger.write(MODULE_NAME, "[ERROR] initialize -> startLiveTrading -> Key 'codeName' or 'secret' not provided. Plese check that and try again."); }
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

                if (bot.SESSION.config.balancePercentage !== undefined) {
                    balancePercentage = bot.SESSION.config.balancePercentage
                }

                bot.SESSION.parameters.sessionBaseAsset.config.initialBalance = bot.SESSION.parameters.sessionBaseAsset.config.initialBalance * balancePercentage / 100
                bot.SESSION.parameters.sessionQuotedAsset.config.initialBalance = bot.SESSION.parameters.sessionQuotedAsset.config.initialBalance * balancePercentage / 100

                bot.SESSION.parameters.sessionBaseAsset.config.minimumBalance = bot.SESSION.parameters.sessionBaseAsset.config.minimumBalance * balancePercentage / 100
                bot.SESSION.parameters.sessionQuotedAsset.config.minimumBalance = bot.SESSION.parameters.sessionQuotedAsset.config.minimumBalance * balancePercentage / 100

                bot.SESSION.parameters.sessionBaseAsset.config.maximumBalance = bot.SESSION.parameters.sessionBaseAsset.config.maximumBalance * balancePercentage / 100
                bot.SESSION.parameters.sessionQuotedAsset.config.maximumBalance = bot.SESSION.parameters.sessionQuotedAsset.config.maximumBalance * balancePercentage / 100

                pProcessConfig.normalWaitTime = bot.SESSION.parameters.timeFrame.config.value

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
