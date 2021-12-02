exports.newPortfolioManagementBotModulesPortfolioSession = function (processIndex) {

    const MODULE_NAME = "Portfolio Session"

    let thisObject = {
        initialize: initialize
    }

    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SOCIAL_BOTS_MODULE =
        TS.projects.socialBots.botModules.socialBots.newSocialBotsBotModulesSocialBots(processIndex)

    return thisObject;

    function initialize(callBackFunction) {
        try {
            /* Check if there is a session */
            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[ERROR] initialize -> Cannot run without a Session.");
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return;
            }
            /* 
            We will store here the session key, which we will need everytine
            we need to emit an event related to the session itself.
            */
            let VARIABLES_BY_PROCESS_INDEX = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex)
            VARIABLES_BY_PROCESS_INDEX.SESSION_KEY =
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.name +
                '-' +
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.type +
                '-' +
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.id

            /*
            We will also store the session folder name, to be used for debug logging and session output.
            */
            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.config.folderName === undefined) {
                VARIABLES_BY_PROCESS_INDEX.SESSION_FOLDER_NAME = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.type.replace(' ', '-').replace(' ', '-') + '-' + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.id
            } else {
                VARIABLES_BY_PROCESS_INDEX.SESSION_FOLDER_NAME = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.type.replace(' ', '-').replace(' ', '-') + '-' + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.config.folderName
            }

            /* 
            We will store all session keys on a map so as to be able to send an event to all 
            of them when the task stops. 
            */
            TS.projects.foundations.globals.taskVariables.SESSION_MAP.set(
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY)

            /* Listen to event to start or stop the session. */
            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                'Portfolio Session Status',
                undefined,
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                undefined,
                onSessionStatus)
            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                'Run Portfolio Session',
                undefined,
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                undefined,
                onSessionRun)
            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                'Stop Portfolio Session',
                undefined,
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                undefined,
                onSessionStop)
            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                'Resume Portfolio Session',
                undefined,
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                undefined,
                onSessionResume)

            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
            return

            function onSessionStatus() {
                if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_STATUS === 'Running') {
                    let event = {
                        status: 'Portfolio Session Runnning'
                    }
                    TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Status Response', event)
                } else {
                    let event = {
                        status: 'Portfolio Session Not Runnning'
                    }
                    TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Status Response', event)
                }
            }

            function onSessionRun(message) {
                try {
                    /* This happens when the UI is reloaded, the session was running and tries to run it again. */
                    if (
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_STATUS === 'Idle' ||
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_STATUS === 'Running'
                    ) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] onSessionRun -> Event received to run the Session while it was already running. ")
                        return
                    }

                    /* We are going to initialize here these constants whose values are comming at the event. */
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_SYSTEM_NODE = JSON.parse(message.event.portfolioSystem)
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_NODE = JSON.parse(message.event.portfolioEngine)
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE = JSON.parse(message.event.session)
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).DEPENDENCY_FILTER = JSON.parse(message.event.dependencyFilter)
                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_RESUMING = false
                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_FIRST_LOOP = true

                    setUpSessionFolderName();

                    /* We validate all parameters received and complete some that might be missing if needed. */
                    if (checkParemeters() === false) { return }

                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SOCIAL_BOTS_MODULE.initialize();

                    let allGood
                    switch (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
                        case 'Backtesting Session': {
                            allGood = startBackTesting(message)
                            break
                        }
                        case 'Live Portfolio Session': {
                            allGood = startLivePortfolio(message)
                            break
                        }
                        case 'Fordward Testing Session': {
                            allGood = startFordwardTesting(message)
                            break
                        }
                        case 'Paper Portfolio Session': {
                            allGood = startPaperPortfolio(message)
                            break
                        }
                    }
                    if (allGood === true) {
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_STATUS = 'Idle'
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING = false
                    } else {
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING = true
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            '[IMPORTANT] onSessionRun -> Stopping the Session now. ')
                    }

                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SOCIAL_BOTS_MODULE.sendMessage(
                        TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type + " '" +
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.name + "' is starting.")
                } catch (err) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> onSessionRun -> err = " + err.stack);
                }
            }

            function onSessionStop() {
                TS.projects.foundations.functionLibraries.sessionFunctions.stopSession(processIndex, 'Session Stopped From the User Interface.')
            }

            function onSessionResume(message) {
                try {
                    if (TS.projects.foundations.functionLibraries.sessionFunctions.stopSession === undefined) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] onSessionResume -> Event received to resume the Session that have never be ran before. ")
                        return
                    }

                    /* This happens when the UI is reloaded, the session was running and tries to run it again. */
                    if (
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_STATUS === 'Idle' ||
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_STATUS === 'Running') {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] onSessionResume -> Event received to resume the Session while it was already running. ")
                        return
                    }

                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_RESUMING = true
                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING = false

                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SOCIAL_BOTS_MODULE.sendMessage(
                        TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type + " '" +
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.name + "' is resuming.")
                } catch (err) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> onSessionResume -> err = " + err.stack);
                }
            }

            function setUpSessionFolderName() {
                /* 
                The session object is overwritten when the session is run. For that reason we 
                need to setup again the folder name at the Session level.
                Set the folderName for logging, reports, context and data output 
                */
                let config
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.config !== undefined) {
                    config = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.config
                    if (config.folderName === undefined) {
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME =
                            TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.type.replace(' ', '-').replace(' ', '-') + '-' +
                            TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.id
                    } else {
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME =
                            TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.type.replace(' ', '-').replace(' ', '-') + '-' +
                            TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.config.folderName
                    }
                }
            }

            function checkParemeters() {
                /*
                Here we check all the Session Parameters received. If something critical is missing we abort returning false. If something
                non critical is missing, we complete it with a default value.
                */

                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters === undefined) {
                    let errorMessage = "Parameters Node Missing"
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> checkParemeters -> " + errorMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS Portfolio Session Error - ' + errorMessage,
                        placeholder: {}
                    }

                    TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(
                        processIndex,
                        TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE,
                        errorMessage,
                        docs
                    )
                    return false
                }

                /* Time Range */
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange === undefined) { // if the Time Range is missing we create a default one.
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange = {
                        name: 'Missing Time Range',
                        type: 'Time Range',
                        config: {
                            initialDatetime: (new Date()).valueOf(),
                            finalDatetime: (new Date()).valueOf() + SA.projects.foundations.globals.timeConstants.ONE_YEAR_IN_MILISECONDS
                        }
                    }
                } else {
                    /* Check that we received valid dates */
                    if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type === 'Backtesting Session') {
                        if (isNaN(new Date(TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.initialDatetime)).valueOf()) {
                            let errorMessage = "Invalid Initial Datetime Property Value"
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] initialize -> checkParemeters -> " + errorMessage)

                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS Portfolio Session Error - ' + errorMessage,
                                placeholder: {
                                    currentValue: {
                                        style: "Json",
                                        text: TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.initialDatetime
                                    }
                                }
                            }

                            TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange, errorMessage, docs)
                            return false
                        }
                    }
                    if (isNaN(new Date(TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.finalDatetime)).valueOf()) {
                        let errorMessage = "Invalid Initial Datetime Property Value"
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] initialize -> checkParemeters -> " + errorMessage)

                        let docs = {
                            project: 'Foundations',
                            category: 'Topic',
                            type: 'TS Portfolio Session Error - ' + errorMessage,
                            placeholder: {
                                currentValue: {
                                    style: "Json",
                                    text: TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.finalDatetime
                                }
                            }
                        }

                        TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange, errorMessage, docs)
                        return false
                    }
                }

                /* Session Type Forced Values */
                let today = (new Date()).valueOf()
                let aYearAgo = today - SA.projects.foundations.globals.timeConstants.ONE_YEAR_IN_MILISECONDS
                let aYearFromNow = today + SA.projects.foundations.globals.timeConstants.ONE_YEAR_IN_MILISECONDS
                switch (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
                    case 'Backtesting Session': {
                        useDefaultDatetimes(aYearAgo, today)
                        break
                    }
                    case 'Live Portfolio Session': {
                        useDefaultDatetimes(today, aYearFromNow)
                        break
                    }
                    case 'Fordward Testing Session': {
                        useDefaultDatetimes(today, aYearFromNow)
                        break
                    }
                    case 'Paper Portfolio Session': {
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
                    if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type === 'Backtesting Session') {
                        if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.initialDatetime === undefined) {
                            TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.initialDatetime = initialDefault
                        } else {
                            TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.initialDatetime = (new Date(TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.initialDatetime)).valueOf()
                        }
                    } else {
                        /* Non backtest session can start from the past only if explicitly configured that way */
                        if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.initialDatetime === undefined || TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.allowStartingFromThePast !== true) {
                            TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.initialDatetime = initialDefault
                        } else {
                            TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.initialDatetime = (new Date(TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.initialDatetime)).valueOf()
                        }
                    }

                    /* Final Datetime */
                    if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.finalDatetime === undefined) {
                        TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.finalDatetime = finalDefault
                    } else {
                        TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.finalDatetime = (new Date(TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeRange.config.finalDatetime)).valueOf()
                    }
                }

                /* Time Frame */
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeFrame === undefined) {
                    let errorMessage = "Time Frame Node Missing"
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> checkParemeters -> " + errorMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS Portfolio Session Error - ' + errorMessage,
                        placeholder: {}
                    }

                    TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters, errorMessage, docs)
                    return false
                }
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeFrame.config.label === undefined) {
                    let errorMessage = "Label Property Missing"
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> checkParemeters -> " + errorMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS Portfolio Session Error - ' + errorMessage,
                        placeholder: {}
                    }

                    TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeFrame, errorMessage, docs)
                    return false
                }
                TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeFrame.config.value = getTimeFrameFromLabel(TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeFrame.config.label)
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeFrame.config.value === undefined) {
                    let errorMessage = "Invalid Label Property Value"
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> checkParemeters -> " + errorMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS Portfolio Session Error - ' + errorMessage,
                        placeholder: {
                            currentValue: {
                                style: "Json",
                                text: TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeFrame.config.label
                            }
                        }
                    }

                    TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeFrame, errorMessage, docs)
                    return false
                }

                /* Session Base Asset */
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionBaseAsset === undefined) {
                    let errorMessage = "Session Base Asset Node Missing"
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> checkParemeters -> " + errorMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS Portfolio Session Error - ' + errorMessage,
                        placeholder: {}
                    }

                    TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters, errorMessage, docs)
                    return false
                }
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionBaseAsset.config.initialBalance === undefined) {
                    let errorMessage = "Initial Balance Property Missing"
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> checkParemeters -> " + errorMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS Portfolio Session Error - ' + errorMessage,
                        placeholder: {}
                    }

                    TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionBaseAsset, errorMessage, docs)
                    return false
                }

                /* Session Quoted Asset */
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionQuotedAsset === undefined) {
                    let errorMessage = "Session Quoted Asset Node Missing"
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> checkParemeters -> " + errorMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS Portfolio Session Error - ' + errorMessage,
                        placeholder: {}
                    }

                    TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters, errorMessage, docs)
                    return false
                }
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionQuotedAsset.config.initialBalance === undefined) {
                    let errorMessage = "Initial Balance Property Missing"
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> checkParemeters -> " + errorMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS Portfolio Session Error - ' + errorMessage,
                        placeholder: {}
                    }

                    TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionQuotedAsset, errorMessage, docs)
                    return false
                }

                /* Slippage */
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.slippage === undefined) { // if the Slippage is missing we create a default one.
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.slippage = {
                        name: 'Missing Slippage',
                        type: 'Slippage',
                        config: {
                            marketOrderRate: 0,
                            stopLoss: 0,
                            takeProfit: 0
                        }
                    }
                }
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.slippage.config.marketOrderRate === undefined) { // if the marketOrderRate is missing we create a default one.
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.slippage.config.marketOrderRate = 0
                }
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.slippage.config.stopLoss === undefined) { // if the stopLoss is missing we create a default one.
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.slippage.config.stopLoss = 0
                }
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.slippage.config.takeProfit === undefined) { // if the takeProfit is missing we create a default one.
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.slippage.config.takeProfit = 0
                }

                /* Fee Structure */
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.feeStructure === undefined) { // if the Fee Structure is missing we create a default one.
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.feeStructure = {
                        name: 'Missing Fee Structure',
                        type: 'Fee Structure',
                        config: {
                            maker: 0,
                            taker: 0
                        }
                    }
                }
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.feeStructure.config.maker === undefined) { // if the maker is missing we create a default one.
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.feeStructure.config.maker = 0
                }
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.feeStructure.config.taker === undefined) { // if the taker is missing we create a default one.
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.feeStructure.config.taker = 0
                }

                return true
            }

            function startBackTesting(message) {
                return true
            }

            function checkKey() {
                if (TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference === undefined) {
                    let errorMessage = "Key Reference Node Missing"
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> checkKey -> " + errorMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS Portfolio Session Error - ' + errorMessage,
                        placeholder: {}
                    }

                    TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.taskConstants.TASK_NODE, errorMessage, docs)
                    return false
                }
                if (TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent === undefined) {
                    let errorMessage = "Exchange Account Key Node Missing"
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> checkKey -> " + errorMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS Portfolio Session Error - ' + errorMessage,
                        placeholder: {}
                    }

                    TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference, errorMessage, docs)
                    return false
                }
                if (TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent.config.codeName === undefined) {
                    let errorMessage = "Codename Property Missing"
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> checkKey -> " + errorMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS Portfolio Session Error - ' + errorMessage,
                        placeholder: {}
                    }

                    TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent, errorMessage, docs)
                    return false
                }
                if (TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent.config.secret === undefined) {
                    let errorMessage = "Secret Property Missing"
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> checkKey -> " + errorMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS Portfolio Session Error - ' + errorMessage,
                        placeholder: {}
                    }

                    TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent, errorMessage, docs)
                    return false
                }
                return true
            }

            function startLivePortfolio() {
                /* Testing to be removed:  @PLUV */
                /*for (let key of TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_MAP.keys()) {
                    TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_MAP.get(key).beginListening();
                }*/
                /* End Testing */
                return checkKey()
            }

            function startFordwardTesting(message) {
                if (checkKey() === false) { return false }

                /* Reduce the balance */
                let balancePercentage = 1 // This is the default value

                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.config.balancePercentage !== undefined) {
                    balancePercentage = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.config.balancePercentage
                }

                TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionBaseAsset.config.initialBalance = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionBaseAsset.config.initialBalance * balancePercentage / 100
                TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionQuotedAsset.config.initialBalance = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionQuotedAsset.config.initialBalance * balancePercentage / 100

                TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionBaseAsset.config.minimumBalance = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionBaseAsset.config.minimumBalance * balancePercentage / 100
                TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionQuotedAsset.config.minimumBalance = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionQuotedAsset.config.minimumBalance * balancePercentage / 100

                TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionBaseAsset.config.maximumBalance = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionBaseAsset.config.maximumBalance * balancePercentage / 100
                TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionQuotedAsset.config.maximumBalance = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.sessionQuotedAsset.config.maximumBalance * balancePercentage / 100

                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.normalWaitTime = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters.timeFrame.config.value

                return true
            }

            function startPaperPortfolio(message) {
                return true
            }

            function getTimeFrameFromLabel(timeFrameLabel) {

                for (let i = 0; i < TS.projects.foundations.globals.timeFrames.marketTimeFramesArray().length; i++) {
                    let value = TS.projects.foundations.globals.timeFrames.marketTimeFramesArray()[i][0]
                    let label = TS.projects.foundations.globals.timeFrames.marketTimeFramesArray()[i][1]

                    if (timeFrameLabel === label) {
                        return value
                    }
                }

                for (let i = 0; i < TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray().length; i++) {
                    let value = TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray()[i][0]
                    let label = TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray()[i][1]

                    if (timeFrameLabel === label) {
                        return value
                    }
                }
            }

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }
};
