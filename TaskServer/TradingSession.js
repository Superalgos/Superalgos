exports.newTradingSession = function newTradingSession(bot, parentLogger) {

    const MODULE_NAME = "Trading Session"

    let thisObject = {
        initialize: initialize
    }

    const SOCIAL_BOTS_MODULE = require('./SocialBots.js')
    let socialBotsModule = SOCIAL_BOTS_MODULE.newSocialBots(bot, parentLogger)

    return thisObject;

    function initialize(pProcessConfig, callBackFunction) {
        try {
            /* Initialize this info so that everything is logged propeerly */
            bot.TRADING_SESSION = {
                name: bot.processNode.session.name,
                id: bot.processNode.session.id
            }

            /* Set the folderName for early logging */
            if (bot.processNode.session.config.folderName === undefined) {
                bot.TRADING_SESSION.folderName = bot.processNode.session.type.replace(' ', '-').replace(' ', '-') + '-' + bot.TRADING_SESSION.id
            } else {
                bot.TRADING_SESSION.folderName = bot.processNode.session.type.replace(' ', '-').replace(' ', '-') + '-' + bot.processNode.session.config.folderName
            }

            /* Check if there is a session */
            if (bot.processNode.session === undefined) {
                parentLogger.write(MODULE_NAME, "[ERROR] initialize -> Cannot run without a Session.");
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return;
            }

            /* Listen to event to start or stop the session. */
            bot.TRADING_SESSIONKey = bot.processNode.session.name + '-' + bot.processNode.session.type + '-' + bot.processNode.session.id
            global.SESSION_MAP.set(bot.TRADING_SESSIONKey, bot.TRADING_SESSIONKey)

            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent(bot.TRADING_SESSIONKey, 'Trading Session Status', undefined, bot.TRADING_SESSIONKey, undefined, onSessionStatus)
            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent(bot.TRADING_SESSIONKey, 'Run Trading Session', undefined, bot.TRADING_SESSIONKey, undefined, onSessionRun)
            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent(bot.TRADING_SESSIONKey, 'Stop Trading Session', undefined, bot.TRADING_SESSIONKey, undefined, onSessionStop)
            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent(bot.TRADING_SESSIONKey, 'Resume Trading Session', undefined, bot.TRADING_SESSIONKey, undefined, onSessionResume)

            /* Connect this here so that it is accesible from other places */
            bot.TRADING_SESSIONError = sessionError
            bot.TRADING_SESSIONWarning = sessionWarning
            bot.TRADING_SESSIONInfo = sessionInfo

            /* Heartbeats sent to the UI */
            bot.TRADING_SESSIONHeartBeat = sessionHeartBeat

            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
            return

            function onSessionStatus() {
                if (bot.TRADING_SESSION_STATUS === 'Running') {
                    let event = {
                        status: 'Trading Session Runnning'
                    }
                    global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(bot.TRADING_SESSIONKey, 'Status Response', event)
                } else {
                    let event = {
                        status: 'Trading Session Not Runnning'
                    }
                    global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(bot.TRADING_SESSIONKey, 'Status Response', event)
                }
            }

            function onSessionRun(message) {
                try {
                    /* This happens when the UI is reloaded, the session was running and tries to run it again. */
                    if (bot.TRADING_SESSION_STATUS === 'Idle' || bot.TRADING_SESSION_STATUS === 'Running') {
                        parentLogger.write(MODULE_NAME, "[WARN] onSessionRun -> Event received to run the Session while it was already running. ")
                        return
                    }

                    /* We are going to run the Definition comming at the event. */
                    bot.TRADING_SYSTEM = JSON.parse(message.event.tradingSystem)
                    bot.TRADING_ENGINE = JSON.parse(message.event.tradingEngine)
                    bot.TRADING_SESSION = JSON.parse(message.event.session)
                    bot.DEPENDENCY_FILTER = JSON.parse(message.event.dependencyFilter)
                    bot.RESUME = false
                    bot.FIRST_EXECUTION = true
                    bot.TRADING_SESSION.stop = stopSession // stop function

                    setUpSessionFolderName()

                    /* We validate all parameters received and complete some that might be missing if needed. */
                    if (checkParemeters() === false) { return }

                    socialBotsModule.initialize()

                    let allGood
                    switch (bot.TRADING_SESSION.type) {
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
                        bot.TRADING_SESSION_STATUS = 'Idle'
                        bot.STOP_SESSION = false
                    } else {
                        bot.STOP_SESSION = true
                        parentLogger.write(MODULE_NAME, '[IMPORTANT] onSessionRun -> Stopping the Session now. ')
                    }

                    socialBotsModule.sendMessage(bot.TRADING_SESSION.type + " '" + bot.TRADING_SESSION.name + "' is starting.")
                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onSessionRun -> err = " + err.stack);
                }
            }

            function onSessionStop() {
                stopSession('Session Stopped From the User Interface.')
            }

            function onSessionResume(message) {
                try {
                    if (bot.TRADING_SESSION.stop === undefined) {
                        parentLogger.write(MODULE_NAME, "[WARN] onSessionResume -> Event received to resume the Session that have never be ran before. ")
                        return
                    }

                    /* This happens when the UI is reloaded, the session was running and tries to run it again. */
                    if (bot.TRADING_SESSION_STATUS === 'Idle' || bot.TRADING_SESSION_STATUS === 'Running') {
                        parentLogger.write(MODULE_NAME, "[WARN] onSessionResume -> Event received to resume the Session while it was already running. ")
                        return
                    }

                    bot.RESUME = true
                    bot.STOP_SESSION = false

                    socialBotsModule.sendMessage(bot.TRADING_SESSION.type + " '" + bot.TRADING_SESSION.name + "' is resuming.")
                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onSessionResume -> err = " + err.stack);
                }
            }

            function stopSession(commandOrigin) {

                socialBotsModule.sendMessage(bot.TRADING_SESSION.type + " '" + bot.TRADING_SESSION.name + "' is stopping " + commandOrigin)
                socialBotsModule.finalize()
                bot.STOP_SESSION = true
                parentLogger.write(MODULE_NAME, '[IMPORTANT] stopSession -> Stopping the Session now. ')
                sessionInfo(bot.TRADING_SESSION, commandOrigin)
            }

            function setUpSessionFolderName() {
                /* 
                The session object is overwritten when the session is run. For that reason we 
                need to setup again the folder name at the Session level.
                Set the folderName for logging, reports, context and data output 
                */
                let config
                if (bot.TRADING_SESSION.config !== undefined) {
                    config = bot.TRADING_SESSION.config
                    if (config.folderName === undefined) {
                        bot.TRADING_SESSION.folderName = bot.processNode.session.type.replace(' ', '-').replace(' ', '-') + '-' + bot.TRADING_SESSION.id
                    } else {
                        bot.TRADING_SESSION.folderName = bot.processNode.session.type.replace(' ', '-').replace(' ', '-') + '-' + bot.processNode.session.config.folderName
                    }
                }
            }

            function checkParemeters() {
                /*
                Here we check all the Session Parameters received. If something critical is missing we abort returning false. If something
                non critical is missing, we complete it with a default value.
                */

                if (bot.TRADING_SESSION.tradingParameters === undefined) {
                    let errorMessage = "Session Node with no Parameters."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.TRADING_SESSIONError(bot.TRADING_SESSION, errorMessage)
                    return false
                }

                /* Time Range */
                if (bot.TRADING_SESSION.tradingParameters.timeRange === undefined) { // if the Time Range is missing we create a default one.
                    bot.TRADING_SESSION.tradingParameters.timeRange = {
                        name: 'Missing Time Range',
                        type: 'Time Range',
                        config: {
                            initialDatetime: (new Date()).valueOf(),
                            finalDatetime: (new Date()).valueOf() + TS.projects.superalgos.globals.timeConstants.ONE_YEAR_IN_MILISECONDS
                        }
                    }
                } else {
                    /* Check that we received valid dates */
                    if (bot.TRADING_SESSION.type === 'Backtesting Session') {
                        if (isNaN(new Date(bot.TRADING_SESSION.tradingParameters.timeRange.config.initialDatetime)).valueOf()) {
                            let errorMessage = "sessionParameters.timeRange.config.initialDatetime is not a valid date."
                            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                            bot.TRADING_SESSIONError(bot.TRADING_SESSION.tradingParameters, errorMessage)
                            return false
                        }
                    }
                    if (isNaN(new Date(bot.TRADING_SESSION.tradingParameters.timeRange.config.finalDatetime)).valueOf()) {
                        let errorMessage = "sessionParameters.timeRange.config.initialDatetime is not a valid date."
                        parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                        bot.TRADING_SESSIONError(bot.TRADING_SESSION.tradingParameters, errorMessage)
                        return false
                    }
                }

                /* Session Type Forced Values */
                let today = (new Date()).valueOf()
                let aYearAgo = today - TS.projects.superalgos.globals.timeConstants.ONE_YEAR_IN_MILISECONDS
                let aYearFromNow = today + TS.projects.superalgos.globals.timeConstants.ONE_YEAR_IN_MILISECONDS
                switch (bot.TRADING_SESSION.type) {
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
                    if (bot.TRADING_SESSION.type === 'Backtesting Session') {
                        if (bot.TRADING_SESSION.tradingParameters.timeRange.config.initialDatetime === undefined) {
                            bot.TRADING_SESSION.tradingParameters.timeRange.config.initialDatetime = initialDefault
                        } else {
                            bot.TRADING_SESSION.tradingParameters.timeRange.config.initialDatetime = (new Date(bot.TRADING_SESSION.tradingParameters.timeRange.config.initialDatetime)).valueOf()
                        }
                    } else {
                        /* Non backtest session can start from the past only if explicitly configured that way */
                        if (bot.TRADING_SESSION.tradingParameters.timeRange.config.initialDatetime === undefined || bot.TRADING_SESSION.tradingParameters.timeRange.config.allowStartingFromThePast !== true) {
                            bot.TRADING_SESSION.tradingParameters.timeRange.config.initialDatetime = initialDefault
                        } else {
                            bot.TRADING_SESSION.tradingParameters.timeRange.config.initialDatetime = (new Date(bot.TRADING_SESSION.tradingParameters.timeRange.config.initialDatetime)).valueOf()
                        }
                    }

                    /* Final Datetime */
                    if (bot.TRADING_SESSION.tradingParameters.timeRange.config.finalDatetime === undefined) {
                        bot.TRADING_SESSION.tradingParameters.timeRange.config.finalDatetime = finalDefault
                    } else {
                        bot.TRADING_SESSION.tradingParameters.timeRange.config.finalDatetime = (new Date(bot.TRADING_SESSION.tradingParameters.timeRange.config.finalDatetime)).valueOf()
                    }
                }

                /* Time Frame */
                if (bot.TRADING_SESSION.tradingParameters.timeFrame === undefined) {
                    let errorMessage = "Session Parameters Node with no Time Frame."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.TRADING_SESSIONError(bot.TRADING_SESSION.tradingParameters, errorMessage)
                    return false
                }
                if (bot.TRADING_SESSION.tradingParameters.timeFrame.config.label === undefined) {
                    let errorMessage = "Session Parameters Node with no Time Frame Label configuration."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.TRADING_SESSIONError(bot.TRADING_SESSION.tradingParameters.timeFrame, errorMessage)
                    return false
                }
                bot.TRADING_SESSION.tradingParameters.timeFrame.config.value = getTimeFrameFromLabel(bot.TRADING_SESSION.tradingParameters.timeFrame.config.label)
                if (bot.TRADING_SESSION.tradingParameters.timeFrame.config.value === undefined) {
                    let errorMessage = "Config error: label value not recognized. Try 01-min or 01-hs for example."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.TRADING_SESSIONError(bot.TRADING_SESSION.tradingParameters.timeFrame, errorMessage)
                    return false
                }

                /* Session Base Asset */
                if (bot.TRADING_SESSION.tradingParameters.sessionBaseAsset === undefined) {
                    let errorMessage = "Session Parameters Node with no Session Base Asset."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.TRADING_SESSIONError(bot.TRADING_SESSION.tradingParameters, errorMessage)
                    return false
                }
                if (bot.TRADING_SESSION.tradingParameters.sessionBaseAsset.config.initialBalance === undefined) {
                    let errorMessage = "Session Parameters Session Base Asset with no initialBalance configuration."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.TRADING_SESSIONError(bot.TRADING_SESSION.tradingParameters.sessionBaseAsset, errorMessage)
                    return false
                }

                /* Session Quoted Asset */
                if (bot.TRADING_SESSION.tradingParameters.sessionQuotedAsset === undefined) {
                    let errorMessage = "Session Parameters Node with no Session Quoted Asset."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.TRADING_SESSIONError(bot.TRADING_SESSION.tradingParameters, errorMessage)
                    return false
                }
                if (bot.TRADING_SESSION.tradingParameters.sessionQuotedAsset.config.initialBalance === undefined) {
                    let errorMessage = "Session Parameters Session Quoted Asset with no initialBalance configuration."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    bot.TRADING_SESSIONError(bot.TRADING_SESSION.tradingParameters.sessionQuotedAsset, errorMessage)
                    return false
                }

                /* Slippage */
                if (bot.TRADING_SESSION.tradingParameters.slippage === undefined) { // if the Slippage is missing we create a default one.
                    bot.TRADING_SESSION.tradingParameters.slippage = {
                        name: 'Missing Slippage',
                        type: 'Slippage',
                        config: {
                            marketOrderRate: 0,
                            stopLoss: 0,
                            takeProfit: 0
                        }
                    }
                }
                if (bot.TRADING_SESSION.tradingParameters.slippage.config.marketOrderRate === undefined) { // if the marketOrderRate is missing we create a default one.
                    bot.TRADING_SESSION.tradingParameters.slippage.config.marketOrderRate = 0
                }
                if (bot.TRADING_SESSION.tradingParameters.slippage.config.stopLoss === undefined) { // if the stopLoss is missing we create a default one.
                    bot.TRADING_SESSION.tradingParameters.slippage.config.stopLoss = 0
                }
                if (bot.TRADING_SESSION.tradingParameters.slippage.config.takeProfit === undefined) { // if the takeProfit is missing we create a default one.
                    bot.TRADING_SESSION.tradingParameters.slippage.config.takeProfit = 0
                }

                /* Fee Structure */
                if (bot.TRADING_SESSION.tradingParameters.feeStructure === undefined) { // if the Fee Structure is missing we create a default one.
                    bot.TRADING_SESSION.tradingParameters.feeStructure = {
                        name: 'Missing Fee Structure',
                        type: 'Fee Structure',
                        config: {
                            maker: 0,
                            taker: 0
                        }
                    }
                }
                if (bot.TRADING_SESSION.tradingParameters.feeStructure.config.maker === undefined) { // if the maker is missing we create a default one.
                    bot.TRADING_SESSION.tradingParameters.feeStructure.config.maker = 0
                }
                if (bot.TRADING_SESSION.tradingParameters.feeStructure.config.taker === undefined) { // if the taker is missing we create a default one.
                    bot.TRADING_SESSION.tradingParameters.feeStructure.config.taker = 0
                }

                return true
            }

            function startBackTesting(message) {
                return true
            }

            function startLiveTrading(message) {
                if (bot.KEY === undefined || bot.SECRET === undefined) {
                    let errorMessage = "Key 'codeName' or 'secret' not provided. Plese check that and try again."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> startLiveTrading -> " + errorMessage)
                    bot.TRADING_SESSIONError(bot.TRADING_SESSION, errorMessage)
                    return false
                }
                return true
            }

            function startFordwardTesting(message) {
                if (bot.KEY === undefined || bot.SECRET === undefined) {
                    parentLogger.write(MODULE_NAME, "[WARN] initialize -> startFordwardTesting -> Key name or Secret not provided, not possible to run the process in Forward Testing mode.")
                    console.log("Key 'codeName' or 'secret' not provided. Plese check that and try again.")
                    return false
                }

                /* Reduce the balance */
                let balancePercentage = 1 // This is the default value

                if (bot.TRADING_SESSION.config.balancePercentage !== undefined) {
                    balancePercentage = bot.TRADING_SESSION.config.balancePercentage
                }

                bot.TRADING_SESSION.tradingParameters.sessionBaseAsset.config.initialBalance = bot.TRADING_SESSION.tradingParameters.sessionBaseAsset.config.initialBalance * balancePercentage / 100
                bot.TRADING_SESSION.tradingParameters.sessionQuotedAsset.config.initialBalance = bot.TRADING_SESSION.tradingParameters.sessionQuotedAsset.config.initialBalance * balancePercentage / 100

                bot.TRADING_SESSION.tradingParameters.sessionBaseAsset.config.minimumBalance = bot.TRADING_SESSION.tradingParameters.sessionBaseAsset.config.minimumBalance * balancePercentage / 100
                bot.TRADING_SESSION.tradingParameters.sessionQuotedAsset.config.minimumBalance = bot.TRADING_SESSION.tradingParameters.sessionQuotedAsset.config.minimumBalance * balancePercentage / 100

                bot.TRADING_SESSION.tradingParameters.sessionBaseAsset.config.maximumBalance = bot.TRADING_SESSION.tradingParameters.sessionBaseAsset.config.maximumBalance * balancePercentage / 100
                bot.TRADING_SESSION.tradingParameters.sessionQuotedAsset.config.maximumBalance = bot.TRADING_SESSION.tradingParameters.sessionQuotedAsset.config.maximumBalance * balancePercentage / 100

                pProcessConfig.normalWaitTime = bot.TRADING_SESSION.tradingParameters.timeFrame.config.value

                return true
            }

            function startPaperTrading(message) {
                return true
            }

            function getTimeFrameFromLabel(timeFrameLabel) {

                for (let i = 0; i < TS.projects.superalgos.globals.timeFrames.marketFilesPeriods().length; i++) {
                    let value = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[i][0]
                    let label = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[i][1]

                    if (timeFrameLabel === label) {
                        return value
                    }
                }

                for (let i = 0; i < TS.projects.superalgos.globals.timeFrames.dailyFilePeriods().length; i++) {
                    let value = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[i][0]
                    let label = TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[i][1]

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
                global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(bot.TRADING_SESSIONKey, 'Heartbeat', event)

                if (TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING === true) {
                    bot.STOP_SESSION = true
                    parentLogger.write(MODULE_NAME, '[IMPORTANT] sessionHeartBeat -> Stopping the Session now. ')
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
                global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(bot.TRADING_SESSIONKey, 'Error', event)

                if (TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING === true) {
                    bot.STOP_SESSION = true
                    parentLogger.write(MODULE_NAME, '[IMPORTANT] sessionError -> Stopping the Session now. ')
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
                global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(bot.TRADING_SESSIONKey, 'Warning', event)

                if (TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING === true) {
                    bot.STOP_SESSION = true
                    parentLogger.write(MODULE_NAME, '[IMPORTANT] sessionWarning -> Stopping the Session now. ')
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
                global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(bot.TRADING_SESSIONKey, 'Info', event)

                if (TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING === true) {
                    bot.STOP_SESSION = true
                    parentLogger.write(MODULE_NAME, '[IMPORTANT] sessionInfo -> Stopping the Session now. ')
                }
            }

        } catch (err) {
            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }
};
