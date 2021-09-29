exports.newFoundationsBotModulesLearningSession = function (processIndex) {

    const MODULE_NAME = "Learning Session"

    let thisObject = {
        initialize: initialize
    }

    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SOCIAL_BOTS_MODULE =
        TS.projects.foundations.botModules.socialBots.newFoundationsBotModulesSocialBots(processIndex)

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
                'Learning Session Status',
                undefined,
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                undefined,
                onSessionStatus)
            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                'Run Learning Session',
                undefined,
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                undefined,
                onSessionRun)
            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                'Stop Learning Session',
                undefined,
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                undefined,
                onSessionStop)
            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                'Resume Learning Session',
                undefined,
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
                undefined,
                onSessionResume)

            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
            return

            function onSessionStatus() {
                if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_STATUS === 'Running') {
                    let event = {
                        status: 'Learning Session Runnning'
                    }
                    TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY, 'Status Response', event)
                } else {
                    let event = {
                        status: 'Learning Session Not Runnning'
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
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_SYSTEM_NODE = JSON.parse(message.event.learningSystem)
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_NODE = JSON.parse(message.event.learningEngine)
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE = JSON.parse(message.event.session)
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).DEPENDENCY_FILTER = JSON.parse(message.event.dependencyFilter)
                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_RESUMING = false
                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_FIRST_LOOP = true

                    setUpSessionFolderName()

                    /* We validate all parameters received and complete some that might be missing if needed. */
                    if (checkParemeters() === false) { return }

                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SOCIAL_BOTS_MODULE.initialize()

                    let allGood
                    switch (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
                        case 'Back Learning Session': {
                            allGood = startBackLearning(message)
                            break
                        }
                        case 'Live Learning Session': {
                            allGood = startLiveLearning(message)
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

                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters === undefined) {
                    let errorMessage = "Parameters Node Missing"
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> checkParemeters -> " + errorMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS Learning Session Error - ' + errorMessage,
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
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange === undefined) { // if the Time Range is missing we create a default one.
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange = {
                        name: 'Missing Time Range',
                        type: 'Time Range',
                        config: {
                            initialDatetime: (new Date()).valueOf(),
                            finalDatetime: (new Date()).valueOf() + SA.projects.foundations.globals.timeConstants.ONE_YEAR_IN_MILISECONDS
                        }
                    }
                } else {
                    /* Check that we received valid dates */
                    if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type === 'Back Learning Session') {
                        if (isNaN(new Date(TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.initialDatetime)).valueOf()) {
                            let errorMessage = "Invalid Initial Datetime Property Value"
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] initialize -> checkParemeters -> " + errorMessage)

                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS Learning Session Error - ' + errorMessage,
                                placeholder: {
                                    currentValue: {
                                        style: "Json",
                                        text: TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.initialDatetime
                                    }
                                }
                            }

                            TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange, errorMessage, docs)
                            return false
                        }
                    }
                    if (isNaN(new Date(TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.finalDatetime)).valueOf()) {
                        let errorMessage = "Invalid Initial Datetime Property Value"
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] initialize -> checkParemeters -> " + errorMessage)

                        let docs = {
                            project: 'Foundations',
                            category: 'Topic',
                            type: 'TS Learning Session Error - ' + errorMessage,
                            placeholder: {
                                currentValue: {
                                    style: "Json",
                                    text: TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.finalDatetime
                                }
                            }
                        }

                        TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange, errorMessage, docs)
                        return false
                    }
                }

                /* Session Type Forced Values */
                let today = (new Date()).valueOf()
                let aYearAgo = today - SA.projects.foundations.globals.timeConstants.ONE_YEAR_IN_MILISECONDS
                let aYearFromNow = today + SA.projects.foundations.globals.timeConstants.ONE_YEAR_IN_MILISECONDS
                switch (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
                    case 'Back Learning Session': {
                        useDefaultDatetimes(aYearAgo, today)
                        break
                    }
                    case 'Live Learning Session': {
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
                    if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type === 'Back Learning Session') {
                        if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.initialDatetime === undefined) {
                            TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.initialDatetime = initialDefault
                        } else {
                            TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.initialDatetime = (new Date(TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.initialDatetime)).valueOf()
                        }
                    } else {
                        /* Non backtest session can start from the past only if explicitly configured that way */
                        if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.initialDatetime === undefined || TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.allowStartingFromThePast !== true) {
                            TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.initialDatetime = initialDefault
                        } else {
                            TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.initialDatetime = (new Date(TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.initialDatetime)).valueOf()
                        }
                    }

                    /* Final Datetime */
                    if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.finalDatetime === undefined) {
                        TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.finalDatetime = finalDefault
                    } else {
                        TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.finalDatetime = (new Date(TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeRange.config.finalDatetime)).valueOf()
                    }
                }

                /* Time Frame */
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeFrame === undefined) {
                    let errorMessage = "Time Frame Node Missing"
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> checkParemeters -> " + errorMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS Learning Session Error - ' + errorMessage,
                        placeholder: {}
                    }

                    TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters, errorMessage, docs)
                    return false
                }
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeFrame.config.label === undefined) {
                    let errorMessage = "Label Property Missing"
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> checkParemeters -> " + errorMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS Learning Session Error - ' + errorMessage,
                        placeholder: {}
                    }

                    TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeFrame, errorMessage, docs)
                    return false
                }
                TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeFrame.config.value = getTimeFrameFromLabel(TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeFrame.config.label)
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeFrame.config.value === undefined) {
                    let errorMessage = "Invalid Label Property Value"
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] initialize -> checkParemeters -> " + errorMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS Learning Session Error - ' + errorMessage,
                        placeholder: {
                            currentValue: {
                                style: "Json",
                                text: TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeFrame.config.label
                            }
                        }
                    }

                    TS.projects.foundations.functionLibraries.sessionFunctions.sessionError(processIndex, TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters.timeFrame, errorMessage, docs)
                    return false
                }

                return true
            }

            function startBackLearning(message) {
                return true
            }

            function startLiveLearning() {
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
