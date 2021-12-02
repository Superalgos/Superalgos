exports.newFoundationsProcessModulesStatusReport = function (processIndex) {

    /*

    A Status Report is a file that every bot reads at the beginning of its execution
    and saves after it finishes its job. The purpose of the file is to record checkpoint information 
    of what was the last thing done by the bot and helpful enough to start the next execution.
    It usually does not include business related context data.

    */

    const MODULE_NAME = "Status Report"

    let thisObject = {
        lanNetworkNode: undefined,
        mainUtility: undefined,
        file: undefined,                    // Here we have the JSON object representing the file content.
        initialize: initialize,
        finalize: finalize,
        load: load,
        save: save,
        asyncSave: asyncSave,
        status: undefined
    }

    let statusDependencyNode

    /* Storage account to be used here. */

    let fileStorage
    let sessionPath = ''

    return thisObject

    function initialize(pStatusDependencyNode, callBackFunction) {
        try {
            statusDependencyNode = pStatusDependencyNode

            /* Some very basic validations that we have all the information needed. */
            if (statusDependencyNode.referenceParent === undefined) {
                validationFailed(statusDependencyNode, "Status Dependency without Reference Parent.")
                return
            }

            if (statusDependencyNode.referenceParent.parentNode === undefined) {
                validationFailed(statusDependencyNode.referenceParent, "Status Report not attached to a Process Definition.")
                return
            }

            if (statusDependencyNode.referenceParent.parentNode.config.codeName === undefined) {
                validationFailed(statusDependencyNode.referenceParent.parentNode, "Process Definition witn no codeName defined.")
                return
            }

            if (statusDependencyNode.referenceParent.parentNode.parentNode === undefined) {
                validationFailed(statusDependencyNode.referenceParent.parentNode, "Process Definition not attached to a Bot.")
                return
            }

            if (statusDependencyNode.referenceParent.parentNode.parentNode.config.codeName === undefined) {
                validationFailed(statusDependencyNode.referenceParent.parentNode.parentNode, "Bot with no codeName defined.")
                return
            }

            if (statusDependencyNode.referenceParent.parentNode.parentNode.parentNode === undefined) {
                validationFailed(statusDependencyNode.referenceParent.parentNode.parentNode, "Bot not attached to a Data Mine.")
                return
            }

            if (statusDependencyNode.referenceParent.parentNode.parentNode.parentNode.config.codeName === undefined) {
                validationFailed(statusDependencyNode.referenceParent.parentNode.parentNode.parentNode, "Data Mine witn no codeName defined.")
                return
            }

            function validationFailed(errorInNode, errorMessage) {
                let nodeString = JSON.stringify(errorInNode)
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                    MODULE_NAME, "[ERROR] initialize -> " + errorMessage + ' -> nodeString = ' + nodeString
                )
                TS.projects.foundations.functionLibraries.processFunctions.processError(
                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_KEY, errorInNode, errorMessage
                )
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
            }

            /* Simplifying the access to basic info */
            statusDependencyNode.bot = statusDependencyNode.referenceParent.parentNode.parentNode.config.codeName
            statusDependencyNode.process = statusDependencyNode.referenceParent.parentNode.config.codeName
            statusDependencyNode.bottype = statusDependencyNode.referenceParent.parentNode.parentNode.type
            statusDependencyNode.dataMine = statusDependencyNode.referenceParent.parentNode.parentNode.parentNode.config.codeName
            statusDependencyNode.mineType = statusDependencyNode.referenceParent.parentNode.parentNode.parentNode.type.replace(' ', '-')
            statusDependencyNode.project = statusDependencyNode.referenceParent.parentNode.parentNode.parentNode.project

            /* We retrieve the report main utility */
            if (statusDependencyNode.config !== undefined) {
                if (statusDependencyNode.config.mainUtility !== undefined) {
                    thisObject.mainUtility = statusDependencyNode.config.mainUtility
                }
            }

            if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE !== undefined &&
                (statusDependencyNode.bottype === "Trading Bot" || statusDependencyNode.bottype === "Portfolio Bot") ) {
                sessionPath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME + "/"
            }

            /* Now we will see where do we need to fetch this status report from. */
            let network = TS.projects.foundations.globals.taskConstants.NETWORK_NODE
            let processThisDependsOn = statusDependencyNode.referenceParent.parentNode

            for (let i = 0; i < network.lanNetworkNodes.length; i++) {
                let lanNetworkNode = network.lanNetworkNodes[i]

                if (checkThisDataBranch(lanNetworkNode.dataTasks) === true) { return }
                if (checkThisTradingBranch(lanNetworkNode.testingTradingTasks) === true) { return }
                if (checkThisTradingBranch(lanNetworkNode.productionTradingTasks) === true) { return }
                if (checkThisPortfolioBranch(lanNetworkNode.productionPortfolioTasks) === true) { return }
                if (checkThisLearningBranch(lanNetworkNode.learningTasks) === true) { return }

                function checkThisDataBranch(branch) {
                    if (branch === undefined) { return }
                    for (let z = 0; z < branch.projectDataTasks.length; z++) {
                        let projectDataTasks = branch.projectDataTasks[z]
                        if (projectDataTasks.exchangeDataTasks === undefined) { continue }
                        for (let j = 0; j < projectDataTasks.exchangeDataTasks.length; j++) {
                            let exchangeTasks = projectDataTasks.exchangeDataTasks[j]
                            for (let p = 0; p < exchangeTasks.marketDataTasks.length; p++) {
                                let marketTasks = exchangeTasks.marketDataTasks[p]
                                if (marketTasks.referenceParent === undefined) { continue }
                                if (marketTasks.referenceParent.id !== TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.id) { continue }
                                for (let q = 0; q < marketTasks.dataMineTasks.length; q++) {
                                    let mineTasks = marketTasks.dataMineTasks[q]
                                    for (let k = 0; k < mineTasks.taskManagers.length; k++) {
                                        let taskManager = mineTasks.taskManagers[k]
                                        for (let m = 0; m < taskManager.tasks.length; m++) {
                                            let task = taskManager.tasks[m]
                                            if (task.bot === undefined) { continue }
                                            if (task.bot.processes === undefined) { continue }
                                            for (let n = 0; n < task.bot.processes.length; n++) {
                                                let process = task.bot.processes[n]
                                                if (process.referenceParent === undefined) { continue }
                                                let processDefinition = process.referenceParent
                                                if (processThisDependsOn.id === processDefinition.id) {
                                                    if (process.type === 'Trading Process Instance') {
                                                        if (process.session !== undefined) {
                                                            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.id !== process.session.id) {
                                                                continue
                                                            }
                                                        } else {
                                                            continue
                                                        }
                                                    }
                                                    /* 
                                                    We found where the task that runs the process definition this status report depends on 
                                                    and where it is located on the network. 
                                                    */
                                                    thisObject.lanNetworkNode = lanNetworkNode
                                                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] initialize -> Retrieving status report from " + lanNetworkNode.name + " -> host = " + lanNetworkNode.config.host + ' -> port = ' + lanNetworkNode.config.webPort + '.')

                                                    fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex, lanNetworkNode.config.host, lanNetworkNode.config.webPort)
                                                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                                                    return true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                function checkThisTradingBranch(branch) {
                    if (branch === undefined) { return }
                    for (let z = 0; z < branch.projectTradingTasks.length; z++) {
                        let projectTradingTasks = branch.projectTradingTasks[z]
                        for (let j = 0; j < projectTradingTasks.exchangeTradingTasks.length; j++) {
                            let exchangeTasks = projectTradingTasks.exchangeTradingTasks[j]
                            for (let p = 0; p < exchangeTasks.marketTradingTasks.length; p++) {
                                let marketTasks = exchangeTasks.marketTradingTasks[p]
                                if (marketTasks.referenceParent === undefined) { continue }
                                if (marketTasks.referenceParent.id !== TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.id) { continue }
                                for (let q = 0; q < marketTasks.tradingMineTasks.length; q++) {
                                    let mineTasks = marketTasks.tradingMineTasks[q]
                                    for (let k = 0; k < mineTasks.taskManagers.length; k++) {
                                        let taskManager = mineTasks.taskManagers[k]
                                        for (let m = 0; m < taskManager.tasks.length; m++) {
                                            let task = taskManager.tasks[m]
                                            if (task.bot === undefined) { continue }
                                            if (task.bot.processes === undefined) { continue }
                                            for (let n = 0; n < task.bot.processes.length; n++) {
                                                let process = task.bot.processes[n]
                                                if (process.referenceParent === undefined) { continue }
                                                let processDefinition = process.referenceParent
                                                if (processThisDependsOn.id === processDefinition.id) {
                                                    if (process.type === 'Trading Process Instance') {
                                                        if (process.session !== undefined) {
                                                            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.id !== process.session.id) {
                                                                continue
                                                            }
                                                        } else {
                                                            continue
                                                        }
                                                    }
                                                    /* 
                                                    We found where the task that runs the process definition this status report depends on 
                                                    and where it is located on the network. 
                                                    */
                                                    thisObject.lanNetworkNode = lanNetworkNode
                                                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] initialize -> Retrieving status report from " + lanNetworkNode.name + " -> host = " + lanNetworkNode.config.host + ' -> port = ' + lanNetworkNode.config.webPort + '.')

                                                    fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex, lanNetworkNode.config.host, lanNetworkNode.config.webPort)
                                                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                                                    return true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                function checkThisPortfolioBranch(branch) {
                    if (branch === undefined) { return }
                    for (let z = 0; z < branch.projectPortfolioTasks.length; z++) {
                        let projectPortfolioTasks = branch.projectPortfolioTasks[z]
                        for (let j = 0; j < projectPortfolioTasks.exchangePortfolioTasks.length; j++) {
                            let exchangeTasks = projectPortfolioTasks.exchangePortfolioTasks[j]
                            for (let p = 0; p < exchangeTasks.marketPortfolioTasks.length; p++) {
                                let marketTasks = exchangeTasks.marketPortfolioTasks[p]
                                if (marketTasks.referenceParent === undefined) { continue }
                                if (marketTasks.referenceParent.id !== TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.id) { continue }
                                for (let q = 0; q < marketTasks.portfolioMineTasks.length; q++) {
                                    let mineTasks = marketTasks.portfolioMineTasks[q]
                                    for (let k = 0; k < mineTasks.taskManagers.length; k++) {
                                        let taskManager = mineTasks.taskManagers[k]
                                        for (let m = 0; m < taskManager.tasks.length; m++) {
                                            let task = taskManager.tasks[m]
                                            if (task.bot === undefined) { continue }
                                            if (task.bot.processes === undefined) { continue }
                                            for (let n = 0; n < task.bot.processes.length; n++) {
                                                let process = task.bot.processes[n]
                                                if (process.referenceParent === undefined) { continue }
                                                let processDefinition = process.referenceParent
                                                if (processThisDependsOn.id === processDefinition.id) {
                                                    if (process.type === 'Portfolio Process Instance') {
                                                        if (process.session !== undefined) {
                                                            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.id !== process.session.id) {
                                                                continue
                                                            }
                                                        } else {
                                                            continue
                                                        }
                                                    }
                                                    /* 
                                                    We found where the task that runs the process definition this status report depends on 
                                                    and where it is located on the network. 
                                                    */
                                                    thisObject.lanNetworkNode = lanNetworkNode
                                                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] initialize -> Retrieving status report from " + lanNetworkNode.name + " -> host = " + lanNetworkNode.config.host + ' -> port = ' + lanNetworkNode.config.webPort + '.')

                                                    fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex, lanNetworkNode.config.host, lanNetworkNode.config.webPort)
                                                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                                                    return true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                function checkThisLearningBranch(branch) {
                    if (branch === undefined) { return }
                    for (let z = 0; z < branch.projectLearningTasks.length; z++) {
                        let projectLearningTasks = branch.projectLearningTasks[z]
                        for (let j = 0; j < projectLearningTasks.exchangeLearningTasks.length; j++) {
                            let exchangeTasks = projectLearningTasks.exchangeLearningTasks[j]
                            for (let p = 0; p < exchangeTasks.marketLearningTasks.length; p++) {
                                let marketTasks = exchangeTasks.marketLearningTasks[p]
                                if (marketTasks.referenceParent === undefined) { continue }
                                if (marketTasks.referenceParent.id !== TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.id) { continue }
                                for (let q = 0; q < marketTasks.learningMineTasks.length; q++) {
                                    let mineTasks = marketTasks.learningMineTasks[q]
                                    for (let k = 0; k < mineTasks.taskManagers.length; k++) {
                                        let taskManager = mineTasks.taskManagers[k]
                                        for (let m = 0; m < taskManager.tasks.length; m++) {
                                            let task = taskManager.tasks[m]
                                            if (task.bot === undefined) { continue }
                                            if (task.bot.processes === undefined) { continue }
                                            for (let n = 0; n < task.bot.processes.length; n++) {
                                                let process = task.bot.processes[n]
                                                if (process.referenceParent === undefined) { continue }
                                                let processDefinition = process.referenceParent
                                                if (processThisDependsOn.id === processDefinition.id) {
                                                    if (process.type === 'Learning Process Instance') {
                                                        if (process.session !== undefined) {
                                                            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.id !== process.session.id) {
                                                                continue
                                                            }
                                                        } else {
                                                            continue
                                                        }
                                                    }
                                                    /* 
                                                    We found where the task that runs the process definition this status report depends on 
                                                    and where it is located on the network. 
                                                    */
                                                    thisObject.lanNetworkNode = lanNetworkNode
                                                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] initialize -> Retrieving status report from " + lanNetworkNode.name + " -> host = " + lanNetworkNode.config.host + ' -> port = ' + lanNetworkNode.config.webPort + '.')

                                                    fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex, lanNetworkNode.config.host, lanNetworkNode.config.webPort)
                                                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                                                    return true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                MODULE_NAME, "[ERROR] initialize -> Initialization Failed because we could not find where the data of this status report is located within the network. Check the logs for more info.")
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                MODULE_NAME, "[ERROR] initialize -> bot = " + statusDependencyNode.bot)
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                MODULE_NAME, "[ERROR] initialize -> process = " + statusDependencyNode.process)
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                MODULE_NAME, "[ERROR] initialize -> bottype = " + statusDependencyNode.bottype)
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                MODULE_NAME, "[ERROR] initialize -> dataMine = " + statusDependencyNode.dataMine)

            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack)
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }

    function finalize() {
        fileStorage = undefined
        thisObject.lanNetworkNode = undefined
        bot = undefined
        thisObject = undefined
    }

    function load(callBackFunction) {

        try {

            let fileName = "Status.Report.json"
            let filePath

            let ownerId = statusDependencyNode.dataMine + "-" + statusDependencyNode.bot + "-" + statusDependencyNode.process
            let botId =
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" +
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "-" +
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName

            if (ownerId !== botId) {
                let filePathRoot =
                    'Project/' +
                    statusDependencyNode.referenceParent.parentNode.parentNode.parentNode.project + "/" +
                    statusDependencyNode.mineType + "/" +
                    statusDependencyNode.dataMine + "/" +
                    statusDependencyNode.bot + '/' +
                    TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "/" +
                    TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "-" +
                    TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName

                filePath = filePathRoot + "/Reports/" + sessionPath + statusDependencyNode.process
            } else {
                filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Reports/" + sessionPath + statusDependencyNode.process
            }

            filePath += '/' + fileName

            let canUserPrevious
            /*
            If we are running Trading Engines, we can not allow ourselves to use a Status Report that is not
            the latest one, because it might contain transactional information related to the context of the
            operations the trading engine is doing.

            On the contrary, if we are running a Sensor bot, API Data Fetcher, or an Indicator we might, if necessary,
            use a previous version of a Status Report since there will be no big impact, just some reprocessing.
            */
            if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE !== undefined) {
                canUserPrevious = false
            } else {
                canUserPrevious = true
            }

            fileStorage.getTextFile(filePath, onFileReceived, undefined, canUserPrevious)

            function onFileReceived(err, text) {

                if (err.result === TS.projects.foundations.globals.standardResponses.CUSTOM_FAIL_RESPONSE.result && (err.message === 'Folder does not exist.' || err.message === 'File does not exist.')
                    || err.code === "The specified key does not exist.") {

                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                        MODULE_NAME, "[WARN] load -> onFileReceived -> err = " + err.message)

                    /* In this case we can assume that this is the first execution ever of this bot.*/

                    thisObject.file = JSON.parse('{}')

                    let customOK = {
                        result: TS.projects.foundations.globals.standardResponses.CUSTOM_OK_RESPONSE.result,
                        message: "Status Report was never created."
                    }
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                        MODULE_NAME, "[WARN] load -> onFileReceived -> customOK = " + customOK.message)
                    callBackFunction(customOK)
                    return
                }

                if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                        MODULE_NAME, "[ERROR] load -> onFileReceived -> err = " + err.message)
                    callBackFunction(err)
                    return
                }

                try {
                    thisObject.file = JSON.parse(text)
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                } catch (err) {
                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    /*
                    It might happen that the file content is corrupt. We will consider this as a temporary situation, 
                    since sometimes the file is being updated at the moment of the read. The bot can not run without a 
                    valid Status Report but we can request the platform to retry later.
                    */
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                        MODULE_NAME, "[ERROR] load -> onFileReceived -> Error Parsing the Status report. -> Err = " + err.message)
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                        MODULE_NAME, "[WARN] load -> onFileReceived -> Error Parsing the Status report. -> text = " + text)

                    let customFail = {
                        result: TS.projects.foundations.globals.standardResponses.CUSTOM_FAIL_RESPONSE.result,
                        message: "Status Report is corrupt."
                    }
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                        MODULE_NAME, "[WARN] load -> onFileReceived -> customFail = " + customFail.message)
                    callBackFunction(customFail)
                    return
                }
            }

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                MODULE_NAME, "[ERROR] load -> err = " + err.stack)
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }

    function save(callBackFunction) {

        try {

            let ownerId = statusDependencyNode.dataMine + "-" + statusDependencyNode.bot + "-" + statusDependencyNode.process
            let botId =
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" +
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "-" +
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName

            /*
            Context is a special case where the report is created by the Context.js module itself.
            */
            if (ownerId !== botId && statusDependencyNode.process !== "Context") {

                let customErr = {
                    result: TS.projects.foundations.globals.standardResponses.CUSTOM_FAIL_RESPONSE.result,
                    message: "Only bots owners of a Status Report can save them."
                }
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                    MODULE_NAME, "[ERROR] save -> customErr = " + customErr.message)
                callBackFunction(customErr)
                return
            }

            let fileName = "Status.Report.json"
            let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Reports/" + sessionPath + statusDependencyNode.process

            filePath += '/' + fileName
            let fileContent = JSON.stringify(thisObject.file)

            fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated, true)

            function onFileCreated(err) {
                if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                        MODULE_NAME, "[ERROR] save -> onFileCreated -> err = " + err.stack)
                    callBackFunction(err)
                    return
                }

                /* All good, lets emit the event that means data has been updated. */

                let processOutput = TS.projects.foundations.processModules.processOutput.newFoundationsProcessModulesProcessOutput(processIndex)
                processOutput.raiseEvents(thisObject.file.lastFile, thisObject.file.timeFrames, callBackFunction)
                return
            }

        }
        catch (err) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                MODULE_NAME, "[ERROR] save -> err = " + err.stack)
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }

    async function asyncSave() {

        let fileName = "Status.Report.json"
        let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Reports/" + sessionPath + statusDependencyNode.process

        filePath += '/' + fileName
        let fileContent = JSON.stringify(thisObject.file)

        let response = await fileStorage.asyncCreateTextFile(filePath, fileContent + '\n', true)

        if (response.err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
            throw (response.err)
        }

        /* All good, lets emit the event that means data has been updated. */
        let processOutput = TS.projects.foundations.processModules.processOutput.newFoundationsProcessModulesProcessOutput(processIndex)
        processOutput.asyncRaiseEvents(thisObject.file.lastFile, thisObject.file.timeFrames)
    }
}
