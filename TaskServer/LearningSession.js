exports.newLearningSession = function (processIndex, bot, parentLogger) {

    const MODULE_NAME = "Learning Session"

    let thisObject = {
        initialize: initialize
    }

    const SOCIAL_BOTS_MODULE = require('./SocialBots.js')
    let socialBotsModule = SOCIAL_BOTS_MODULE.newSocialBots(bot, parentLogger)

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
            We will also store the session folder name, to be used for debug logging.
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
            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Learning Session Status', undefined, TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, undefined, onSessionStatus)
            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Run Learning Session', undefined, TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, undefined, onSessionRun)
            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Stop Learning Session', undefined, TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, undefined, onSessionStop)
            global.EVENT_SERVER_CLIENT_MODULE.listenToEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Resume Learning Session', undefined, TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, undefined, onSessionResume)

            /* Heartbeats sent to the UI */
            bot.sessionHeartBeat = sessionHeartBeat

            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
            return

            function onSessionStatus() {
                if (bot.SESSION_STATUS === 'Running') {
                    let event = {
                        status: 'Learning Session Runnning'
                    }
                    global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Status Response', event)
                } else {
                    let event = {
                        status: 'Learning Session Not Runnning'
                    }
                    global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Status Response', event)
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
                        parentLogger.write(MODULE_NAME, '[IMPORTANT] onSessionRun -> Stopping the Session now. ')
                    }

                    socialBotsModule.sendMessage(bot.LEARNING_SESSION.type + " '" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.name + "' is starting.")
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

                    socialBotsModule.sendMessage(bot.LEARNING_SESSION.type + " '" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.name + "' is resuming.")
                } catch (err) {
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> onSessionResume -> err = " + err.stack);
                }
            }

            function stopSession(commandOrigin) {

                socialBotsModule.sendMessage(bot.LEARNING_SESSION.type + " '" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.name + "' is stopping " + commandOrigin)
                socialBotsModule.finalize()
                bot.STOP_SESSION = true
                parentLogger.write(MODULE_NAME, '[IMPORTANT] stopSession -> Stopping the Session now. ')
                TS.projects.superalgos.functionLibraries.sessionFunctions.sessionInfo(processIndex, bot.LEARNING_SESSION, commandOrigin, parentLogger)
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
                        bot.LEARNING_SESSION.folderName = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.type.replace(' ', '-').replace(' ', '-') + '-' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.id
                    } else {
                        bot.LEARNING_SESSION.folderName = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.type.replace(' ', '-').replace(' ', '-') + '-' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.config.folderName
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
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, bot.LEARNING_SESSION, errorMessage, parentLogger)
                    return false
                }

                /* Time Range */
                if (bot.LEARNING_SESSION.learningParameters.timeRange === undefined) { // if the Time Range is missing we create a default one.
                    bot.LEARNING_SESSION.learningParameters.timeRange = {
                        name: 'Missing Time Range',
                        type: 'Time Range',
                        config: {
                            initialDatetime: (new Date()).valueOf(),
                            finalDatetime: (new Date()).valueOf() + TS.projects.superalgos.globals.timeConstants.ONE_YEAR_IN_MILISECONDS
                        }
                    }
                } else {
                    /* Check that we received valid dates */
                    if (bot.LEARNING_SESSION.type === 'Backtesting Session') {
                        if (isNaN(new Date(bot.LEARNING_SESSION.learningParameters.timeRange.config.initialDatetime)).valueOf()) {
                            let errorMessage = "sessionParameters.timeRange.config.initialDatetime is not a valid date."
                            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                            TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, bot.LEARNING_SESSION.learningParameters, errorMessage, parentLogger)
                            return false
                        }
                    }
                    if (isNaN(new Date(bot.LEARNING_SESSION.learningParameters.timeRange.config.finalDatetime)).valueOf()) {
                        let errorMessage = "sessionParameters.timeRange.config.initialDatetime is not a valid date."
                        parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                        TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, bot.LEARNING_SESSION.learningParameters, errorMessage, parentLogger)
                        return false
                    }
                }

                /* Session Type Forced Values */
                let today = (new Date()).valueOf()
                let aYearAgo = today - TS.projects.superalgos.globals.timeConstants.ONE_YEAR_IN_MILISECONDS
                let aYearFromNow = today + TS.projects.superalgos.globals.timeConstants.ONE_YEAR_IN_MILISECONDS
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
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, bot.LEARNING_SESSION.learningParameters, errorMessage, parentLogger)
                    return false
                }
                if (bot.LEARNING_SESSION.learningParameters.timeFrame.config.label === undefined) {
                    let errorMessage = "Session Parameters Node with no Time Frame Label configuration."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, bot.LEARNING_SESSION.learningParameters.timeFrame, errorMessage, parentLogger)
                    return false
                }
                bot.LEARNING_SESSION.learningParameters.timeFrame.config.value = getTimeFrameFromLabel(bot.LEARNING_SESSION.learningParameters.timeFrame.config.label)
                if (bot.LEARNING_SESSION.learningParameters.timeFrame.config.value === undefined) {
                    let errorMessage = "Config error: label value not recognized. Try 01-min or 01-hs for example."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, bot.LEARNING_SESSION.learningParameters.timeFrame, errorMessage, parentLogger)
                    return false
                }

                /* Session Base Asset */
                if (bot.LEARNING_SESSION.learningParameters.sessionBaseAsset === undefined) {
                    let errorMessage = "Session Parameters Node with no Session Base Asset."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, bot.LEARNING_SESSION.learningParameters, errorMessage, parentLogger)
                    return false
                }
                if (bot.LEARNING_SESSION.learningParameters.sessionBaseAsset.config.initialBalance === undefined) {
                    let errorMessage = "Session Parameters Session Base Asset with no initialBalance configuration."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, bot.LEARNING_SESSION.learningParameters.sessionBaseAsset, errorMessage, parentLogger)
                    return false
                }

                /* Session Quoted Asset */
                if (bot.LEARNING_SESSION.learningParameters.sessionQuotedAsset === undefined) {
                    let errorMessage = "Session Parameters Node with no Session Quoted Asset."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, bot.LEARNING_SESSION.learningParameters, errorMessage, parentLogger)
                    return false
                }
                if (bot.LEARNING_SESSION.learningParameters.sessionQuotedAsset.config.initialBalance === undefined) {
                    let errorMessage = "Session Parameters Session Quoted Asset with no initialBalance configuration."
                    parentLogger.write(MODULE_NAME, "[ERROR] initialize -> checkParemeters -> " + errorMessage)
                    TS.projects.superalgos.functionLibraries.sessionFunctions.sessionError(processIndex, bot.LEARNING_SESSION.learningParameters.sessionQuotedAsset, errorMessage, parentLogger)
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

            function startFordwardTesting() {
                if (checkKey() === false) { return false }

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
                    bot.STOP_SESSION = true
                    parentLogger.write(MODULE_NAME, '[IMPORTANT] sessionHeartBeat -> Stopping the Session now. ')
                }
            }

        } catch (err) {
            parentLogger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }
};
