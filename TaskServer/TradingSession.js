exports.newTradingSession = function (processIndex, bot, parentLogger) {

    const MODULE_NAME = "Trading Session"

    let thisObject = {
        initialize: initialize
    }

    const SOCIAL_BOTS_MODULE = require('./SocialBots.js')
    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SOCIAL_BOTS_MODULE = SOCIAL_BOTS_MODULE.newSocialBots(processIndex, bot, parentLogger)

    return thisObject;

    function initialize(pProcessConfig, callBackFunction) {
        try {
            /* Check if there is a session */
            if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session === undefined) {
                parentLogger.write(MODULE_NAME, "[ERROR] initialize -> Cannot run without a Session.");
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return;
            }
            /* 
            We will store here the session key, which we will need everytine
            we need to emit an event related to the session itself.
            */
            let VARIABLES_BY_PROCESS_INDEX = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex)
            VARIABLES_BY_PROCESS_INDEX.SESSION_KEY =
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.name +
                '-' +
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.type +
                '-' +
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.id

            /*
            We will also store the session folder name, to be used for debug logging and session output.
            */
            if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.config.folderName === undefined) {
                VARIABLES_BY_PROCESS_INDEX.SESSION_FOLDER_NAME = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.type.replace(' ', '-').replace(' ', '-') + '-' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.id
            } else {
                VARIABLES_BY_PROCESS_INDEX.SESSION_FOLDER_NAME = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.type.replace(' ', '-').replace(' ', '-') + '-' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.config.folderName
            }
            /* 
            We will store all session keys on a map so as to be able to send an event to all 
            of them when the task stops. 
            */
            TS.projects.superalgos.globals.taskVariables.SESSION_MAP.set(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY)

            /* Listen to event to start or stop the session. */
            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Trading Session Status', undefined, TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, undefined, onSessionStatus)
            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Run Trading Session', undefined, TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, undefined, onSessionRun)
            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Stop Trading Session', undefined, TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, undefined, onSessionStop)
            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Resume Trading Session', undefined, TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, undefined, onSessionResume)

            /* Heartbeats sent to the UI */
            bot.TRADING_SESSIONHeartBeat = sessionHeartBeat

            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
            return

            function onSessionStatus() {
                if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_STATUS === 'Running') {
                    let event = {
                        status: 'Trading Session Runnning'
                    }
                    global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Status Response', event)
                } else {
                    let event = {
                        status: 'Trading Session Not Runnning'
                    }
                    global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Status Response', event)
                }
            }

            function onSessionRun(message) {
                try {
                    /* This happens when the UI is reloaded, the session was running and tries to run it again. */
                    if (
                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_STATUS === 'Idle' ||
                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_STATUS === 'Running'
                    ) {
                        parentLogger.write(MODULE_NAME, "[WARN] onSessionRun -> Event received to run the Session while it was already running. ")
                        return
                    }

                    /* We are going to initialize here these constants whose values are comming at the event. */
                    TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_SYSTEM_NODE = JSON.parse(message.event.tradingSystem)
                    TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_NODE = JSON.parse(message.event.tradingEngine)
                    TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE = JSON.parse(message.event.session)
                    bot.DEPENDENCY_FILTER = JSON.parse(message.event.dependencyFilter)
                    bot.RESUME = false
                    bot.FIRST_EXECUTION = true

                    setUpSessionFolderName()

                    /* We validate all parameters received and complete some that might be missing if needed. */
                    if (checkParemeters() === false) { return }

                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SOCIAL_BOTS_MODULE.initialize()

                    let allGood
                    switch (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
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
                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_STATUS = 'Idle'
                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING = false
                    } else {
                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING = true
                        parentLogger.write(MODULE_NAME, '[IMPORTANT] onSessionRun -> Stopping the Session now. ')
                    }

                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SOCIAL_BOTS_MODULE.sendMessage(TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type + " '" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.name + "' is starting.")
                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onSessionRun -> err = " + err.stack);
                }
            }

            function onSessionStop() {
                TS.projects.superalgos.functionLibraries.sessionFunctions.stopSession(processIndex, 'Session Stopped From the User Interface.')
            }

            function onSessionResume(message) {
                try {
                    if (TS.projects.superalgos.functionLibraries.sessionFunctions.stopSession === undefined) {
                        parentLogger.write(MODULE_NAME, "[WARN] onSessionResume -> Event received to resume the Session that have never be ran before. ")
                        return
                    }

                    /* This happens when the UI is reloaded, the session was running and tries to run it again. */
                    if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_STATUS === 'Idle' || TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_STATUS === 'Running') {
                        parentLogger.write(MODULE_NAME, "[WARN] onSessionResume -> Event received to resume the Session while it was already running. ")
                        return
                    }

                    bot.RESUME = true
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING = false

                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SOCIAL_BOTS_MODULE.sendMessage(TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type + " '" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.name + "' is resuming.")
                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onSessionResume -> err = " + err.stack);
                }
            }

            function setUpSessionFolderName() {
                /* 
                The session object is overwritten when the session is run. For that reason we 
                need to setup again the folder name at the Session level.
                Set the folderName for logging, reports, context and data output 
                */
                let config
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.config !== undefined) {
                    config = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.config
                    if (config.folderName === undefined) {
                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME =
                            TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.type.replace(' ', '-').replace(' ', '-') + '-' +
                            TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.id
                    } else {
                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME =
                            TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.type.replace(' ', '-').replace(' ', '-') + '-' +
                            TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.config.folderName
                    }
                }
            }

            function checkParemeters() {
                /*
                Here we check all the Session Parameters received. If something critical is missing we abort returning false. If something
                non critical is missing, we complete it with a default value.
                */

                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters === undefined) {
                    let errorMessage = "Session Node with no Parameters."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(
                        processIndex,
                        TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE,
                        errorMessage,
                        parentLogger
                    )
                    return false
                }

                /* Time Range */
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange === undefined) { // if the Time Range is missing we create a default one.
                    TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange = {
                        name: 'Missing Time Range',
                        type: 'Time Range',
                        config: {
                            initialDatetime: (new Date()).valueOf(),
                            finalDatetime: (new Date()).valueOf() + TS.projects.superalgos.globals.timeConstants.ONE_YEAR_IN_MILISECONDS
                        }
                    }
                } else {
                    /* Check that we received valid dates */
                    if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type === 'Backtesting Session') {
                        if (isNaN(new Date(TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.initialDatetime)).valueOf()) {
                            let errorMessage = "sessionParameters.timeRange.config.initialDatetime is not a valid date."
                            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                            TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters, errorMessage, parentLogger)
                            return false
                        }
                    }
                    if (isNaN(new Date(TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.finalDatetime)).valueOf()) {
                        let errorMessage = "sessionParameters.timeRange.config.initialDatetime is not a valid date."
                        parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                        TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters, errorMessage, parentLogger)
                        return false
                    }
                }

                /* Session Type Forced Values */
                let today = (new Date()).valueOf()
                let aYearAgo = today - TS.projects.superalgos.globals.timeConstants.ONE_YEAR_IN_MILISECONDS
                let aYearFromNow = today + TS.projects.superalgos.globals.timeConstants.ONE_YEAR_IN_MILISECONDS
                switch (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
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
                    if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type === 'Backtesting Session') {
                        if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.initialDatetime === undefined) {
                            TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.initialDatetime = initialDefault
                        } else {
                            TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.initialDatetime = (new Date(TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.initialDatetime)).valueOf()
                        }
                    } else {
                        /* Non backtest session can start from the past only if explicitly configured that way */
                        if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.initialDatetime === undefined || TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.allowStartingFromThePast !== true) {
                            TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.initialDatetime = initialDefault
                        } else {
                            TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.initialDatetime = (new Date(TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.initialDatetime)).valueOf()
                        }
                    }

                    /* Final Datetime */
                    if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.finalDatetime === undefined) {
                        TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.finalDatetime = finalDefault
                    } else {
                        TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.finalDatetime = (new Date(TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeRange.config.finalDatetime)).valueOf()
                    }
                }

                /* Time Frame */
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeFrame === undefined) {
                    let errorMessage = "Session Parameters Node with no Time Frame."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters, errorMessage, parentLogger)
                    return false
                }
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeFrame.config.label === undefined) {
                    let errorMessage = "Session Parameters Node with no Time Frame Label configuration."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeFrame, errorMessage, parentLogger)
                    return false
                }
                TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeFrame.config.value = getTimeFrameFromLabel(TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeFrame.config.label)
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeFrame.config.value === undefined) {
                    let errorMessage = "Config error: label value not recognized. Try 01-min or 01-hs for example."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeFrame, errorMessage, parentLogger)
                    return false
                }

                /* Session Base Asset */
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionBaseAsset === undefined) {
                    let errorMessage = "Session Parameters Node with no Session Base Asset."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters, errorMessage, parentLogger)
                    return false
                }
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionBaseAsset.config.initialBalance === undefined) {
                    let errorMessage = "Session Parameters Session Base Asset with no initialBalance configuration."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionBaseAsset, errorMessage, parentLogger)
                    return false
                }

                /* Session Quoted Asset */
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionQuotedAsset === undefined) {
                    let errorMessage = "Session Parameters Node with no Session Quoted Asset."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters, errorMessage, parentLogger)
                    return false
                }
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionQuotedAsset.config.initialBalance === undefined) {
                    let errorMessage = "Session Parameters Session Quoted Asset with no initialBalance configuration."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionQuotedAsset, errorMessage, parentLogger)
                    return false
                }

                /* Slippage */
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.slippage === undefined) { // if the Slippage is missing we create a default one.
                    TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.slippage = {
                        name: 'Missing Slippage',
                        type: 'Slippage',
                        config: {
                            marketOrderRate: 0,
                            stopLoss: 0,
                            takeProfit: 0
                        }
                    }
                }
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.slippage.config.marketOrderRate === undefined) { // if the marketOrderRate is missing we create a default one.
                    TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.slippage.config.marketOrderRate = 0
                }
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.slippage.config.stopLoss === undefined) { // if the stopLoss is missing we create a default one.
                    TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.slippage.config.stopLoss = 0
                }
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.slippage.config.takeProfit === undefined) { // if the takeProfit is missing we create a default one.
                    TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.slippage.config.takeProfit = 0
                }

                /* Fee Structure */
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.feeStructure === undefined) { // if the Fee Structure is missing we create a default one.
                    TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.feeStructure = {
                        name: 'Missing Fee Structure',
                        type: 'Fee Structure',
                        config: {
                            maker: 0,
                            taker: 0
                        }
                    }
                }
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.feeStructure.config.maker === undefined) { // if the maker is missing we create a default one.
                    TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.feeStructure.config.maker = 0
                }
                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.feeStructure.config.taker === undefined) { // if the taker is missing we create a default one.
                    TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.feeStructure.config.taker = 0
                }

                return true
            }

            function startBackTesting(message) {
                return true
            }

            function checkKey() {
                if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.keyReference === undefined) {
                    let errorMessage = "Key Reference not defined. Please check that and try again."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkKey -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, bot.LEARNING_SESSION, errorMessage, parentLogger)
                    return false
                }
                if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.keyReference.referenceParent === undefined) {
                    let errorMessage = "Key Reference not referencing an Exchange Account Key. Please check that and try again."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkKey -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, bot.LEARNING_SESSION, errorMessage, parentLogger)
                    return false
                }
                if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.keyReference.referenceParent.config.codeName === undefined) {
                    let errorMessage = "Key 'codeName' undefined. Paste there you key. Please check that and try again."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkKey -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, bot.LEARNING_SESSION, errorMessage, parentLogger)
                    return false
                }
                if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.keyReference.referenceParent.config.secret === undefined) {
                    let errorMessage = "Key 'secret' undefined. Paste there you key secret. Please check that and try again."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkKey -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, bot.LEARNING_SESSION, errorMessage, parentLogger)
                    return false
                }
                return true
            }

            function startLiveTrading() {
                return checkKey()
            }

            function startFordwardTesting(message) {
                if (checkKey() === false) { return false }

                /* Reduce the balance */
                let balancePercentage = 1 // This is the default value

                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.config.balancePercentage !== undefined) {
                    balancePercentage = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.config.balancePercentage
                }

                TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionBaseAsset.config.initialBalance = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionBaseAsset.config.initialBalance * balancePercentage / 100
                TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionQuotedAsset.config.initialBalance = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionQuotedAsset.config.initialBalance * balancePercentage / 100

                TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionBaseAsset.config.minimumBalance = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionBaseAsset.config.minimumBalance * balancePercentage / 100
                TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionQuotedAsset.config.minimumBalance = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionQuotedAsset.config.minimumBalance * balancePercentage / 100

                TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionBaseAsset.config.maximumBalance = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionBaseAsset.config.maximumBalance * balancePercentage / 100
                TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionQuotedAsset.config.maximumBalance = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.sessionQuotedAsset.config.maximumBalance * balancePercentage / 100

                pProcessConfig.normalWaitTime = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters.timeFrame.config.value

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
                global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Heartbeat', event)

                if (TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING === true) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING = true
                    parentLogger.write(MODULE_NAME, '[IMPORTANT] sessionHeartBeat -> Stopping the Session now. ')
                }
            }

        } catch (err) {
            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }
};
