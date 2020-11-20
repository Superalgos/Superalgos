exports.newStatusReport = function newStatusReport(BOT, logger, UTILITIES, PROCESS_OUTPUT) {

    /*

    A Status Report is a file that every bot reads at the begining of its execution and saves after it finishes its job.
    The purpose of the file is to record checkpoint information of what was the last thing done by the bot and helpfull enough to start the next execution.
    It usually does not include business related context data.

    */

    const MODULE_NAME = "Status Report";

    let bot = BOT;

    let thisObject = {
        networkNode: undefined,
        mainUtility: undefined,
        file: undefined,                    // Here we have the JSON object representing the file content.
        initialize: initialize,
        finalize: finalize,
        load: load,
        save: save,
        asyncSave: asyncSave,
        status: undefined
    };

    let statusDependencyNode;

    /* Utilities needed. */

    let utilities = UTILITIES.newCloudUtilities(logger);

    /* Storage account to be used here. */

    const FILE_STORAGE = require('./FileStorage.js');
    let fileStorage

    let sessionPath = ''

    return thisObject;

    function initialize(pStatusDependencyNode, callBackFunction) {
        try {
            statusDependencyNode = pStatusDependencyNode;
            logger.fileName = MODULE_NAME + "." + statusDependencyNode.type + "." + statusDependencyNode.name + "." + statusDependencyNode.id;

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
                logger.write(MODULE_NAME, "[ERROR] initialize -> " + errorMessage + ' -> nodeString = ' + nodeString)
                global.PROCESS_ERROR(bot.processKey, errorInNode, errorMessage)
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
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

            if (bot.TRADING_SESSION !== undefined && statusDependencyNode.bottype === "Trading Bot") {
                sessionPath = bot.TRADING_SESSION.folderName + "/"
            }

            if (bot.LEARNING_SESSION !== undefined && statusDependencyNode.bottype === "Learning Bot") {
                sessionPath = bot.LEARNING_SESSION.folderName + "/"
            }

            /* Now we will see where do we need to fetch this status report from. */
            let network = global.TASK_NETWORK
            let processThisDependsOn = statusDependencyNode.referenceParent.parentNode

            for (let i = 0; i < network.networkNodes.length; i++) {
                let networkNode = network.networkNodes[i]

                if (checkThisDataBranch(networkNode.dataMining) === true) { return }
                if (checkThisTradingBranch(networkNode.testingEnvironment) === true) { return }
                if (checkThisTradingBranch(networkNode.productionEnvironment) === true) { return }

                function checkThisDataBranch(branch) {
                    if (branch === undefined) { return }
                    for (let j = 0; j < branch.exchangeDataTasks.length; j++) {
                        let exchangeTasks = branch.exchangeDataTasks[j]
                        for (let p = 0; p < exchangeTasks.marketDataTasks.length; p++) {
                            let marketTasks = exchangeTasks.marketDataTasks[p]
                            if (marketTasks.referenceParent === undefined) { continue }
                            if (marketTasks.referenceParent.id !== global.MARKET_NODE.id) { continue }
                            for (let q = 0; q < marketTasks.dataMineTasks.length; q++) {
                                let mineTasks = marketTasks.dataMineTasks[q]
                                for (let k = 0; k < mineTasks.taskManagers.length; k++) {
                                    let taskManager = mineTasks.taskManagers[k]
                                    for (let m = 0; m < taskManager.tasks.length; m++) {
                                        let task = taskManager.tasks[m]
                                        if (task.bot === undefined) { continue }
                                        for (let n = 0; n < task.bot.processes.length; n++) {
                                            let process = task.bot.processes[n]
                                            if (process.referenceParent === undefined) { continue }
                                            let processDefinition = process.referenceParent
                                            if (processThisDependsOn.id === processDefinition.id) {
                                                if (process.type === 'Trading Process Instance') {
                                                    if (process.session !== undefined) {
                                                        if (bot.processNode.session.id !== process.session.id) {
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
                                                thisObject.networkNode = networkNode
                                                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Retrieving status report from " + networkNode.name + " -> host = " + networkNode.config.host + ' -> port = ' + networkNode.config.webPort + '.'); }

                                                fileStorage = FILE_STORAGE.newFileStorage(logger, networkNode.config.host, networkNode.config.webPort);
                                                callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                return true
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
                    for (let j = 0; j < branch.exchangeTradingTasks.length; j++) {
                        let exchangeTasks = branch.exchangeTradingTasks[j]
                        for (let p = 0; p < exchangeTasks.marketTradingTasks.length; p++) {
                            let marketTasks = exchangeTasks.marketTradingTasks[p]
                            if (marketTasks.referenceParent === undefined) { continue }
                            if (marketTasks.referenceParent.id !== global.MARKET_NODE.id) { continue }
                            for (let q = 0; q < marketTasks.tradingMineTasks.length; q++) {
                                let mineTasks = marketTasks.tradingMineTasks[q]
                                for (let k = 0; k < mineTasks.taskManagers.length; k++) {
                                    let taskManager = mineTasks.taskManagers[k]
                                    for (let m = 0; m < taskManager.tasks.length; m++) {
                                        let task = taskManager.tasks[m]
                                        if (task.bot === undefined) { continue }
                                        for (let n = 0; n < task.bot.processes.length; n++) {
                                            let process = task.bot.processes[n]
                                            if (process.referenceParent === undefined) { continue }
                                            let processDefinition = process.referenceParent
                                            if (processThisDependsOn.id === processDefinition.id) {
                                                if (process.type === 'Trading Process Instance') {
                                                    if (process.session !== undefined) {
                                                        if (bot.processNode.session.id !== process.session.id) {
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
                                                thisObject.networkNode = networkNode
                                                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Retrieving status report from " + networkNode.name + " -> host = " + networkNode.config.host + ' -> port = ' + networkNode.config.webPort + '.'); }

                                                fileStorage = FILE_STORAGE.newFileStorage(logger, networkNode.config.host, networkNode.config.webPort);
                                                callBackFunction(global.DEFAULT_OK_RESPONSE);
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

            logger.write(MODULE_NAME, "[ERROR] initialize -> Initialization Failed because we could not find where the data of this status report is located within the network. Check the logs for more info.");
            logger.write(MODULE_NAME, "[ERROR] initialize -> bot = " + statusDependencyNode.bot);
            logger.write(MODULE_NAME, "[ERROR] initialize -> process = " + statusDependencyNode.process);
            logger.write(MODULE_NAME, "[ERROR] initialize -> bottype = " + statusDependencyNode.bottype);
            logger.write(MODULE_NAME, "[ERROR] initialize -> dataMine = " + statusDependencyNode.dataMine);

            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function finalize() {
        fileStorage = undefined
        thisObject.networkNode = undefined
        bot = undefined
        thisObject = undefined
    }

    function load(callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] load -> Entering function."); }

            let fileName = "Status.Report.json";
            let filePath;

            let ownerId = statusDependencyNode.dataMine + "-" + statusDependencyNode.bot + "-" + statusDependencyNode.process
            let botId = bot.dataMine + "-" + bot.codeName + "-" + bot.process

            if (ownerId !== botId) {

                let filePathRoot = 'Project/' + statusDependencyNode.project + "/" + statusDependencyNode.mineType + "/" + statusDependencyNode.dataMine + "/" + statusDependencyNode.bot + '/' + bot.exchange + "/" + bot.market.baseAsset + "-" + bot.market.quotedAsset
                filePath = filePathRoot + "/Reports/" + sessionPath + statusDependencyNode.process;
            } else {
                filePath = bot.filePathRoot + "/Reports/" + sessionPath + statusDependencyNode.process;
            }

            filePath += '/' + fileName

            let canUserPrevious
            /*
            If we are funning Trading Engines, we can not allow ourselves to use a Status Report that is not the latest one, because it might contain
            transactioinal information related to the context of the operations the trading engine is doing.

            On the contraty, if we are running a Sensor bot or an Indicator bot, we might, if necesary, use a previous version of a Status Report since
            there will be no big impact, just some reprocessing.
            */
            if (bot.TRADING_SESSION !== undefined || bot.LEARNING_SESSION !== undefined) {
                canUserPrevious = false
            } else {
                canUserPrevious = true
            }

            fileStorage.getTextFile(filePath, onFileReceived, undefined, canUserPrevious);

            function onFileReceived(err, text) {

                if (err.result === global.CUSTOM_FAIL_RESPONSE.result && (err.message === 'Folder does not exist.' || err.message === 'File does not exist.')
                    || err.code === "The specified key does not exist.") {

                    logger.write(MODULE_NAME, "[INFO] load -> onFileReceived -> err = " + err.message);

                    /* In this case we can assume that this is the first execution ever of this bot.*/

                    thisObject.file = JSON.parse('{}');

                    let customOK = {
                        result: global.CUSTOM_OK_RESPONSE.result,
                        message: "Status Report was never created."
                    };
                    logger.write(MODULE_NAME, "[WARN] load -> onFileReceived -> customOK = " + customOK.message);
                    callBackFunction(customOK);
                    return;
                }

                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                    logger.write(MODULE_NAME, "[ERROR] load -> onFileReceived -> err = " + err.message);
                    callBackFunction(err);
                    return;
                }

                if (global.LOG_CONTROL[MODULE_NAME].logContent === true) {
                    logger.write(MODULE_NAME, "[INFO] load -> onFileReceived -> Content received = " + text);
                }

                try {

                    thisObject.file = JSON.parse(text);
                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                } catch (err) {

                    /*
                    It might happen that the file content is corrupt. We will consider this as a temporary situation, since sometimes the file
                    is being updated at the moment of the read. The bot can not run without a valid Status Report but we can request the platform to retry later.
                    */

                    logger.write(MODULE_NAME, "[ERROR] load -> onFileReceived -> Error Parsing the Status report. -> Err = " + err.message);
                    logger.write(MODULE_NAME, "[WARN] load -> onFileReceived -> Error Parsing the Status report. -> text = " + text);

                    let customFail = {
                        result: global.CUSTOM_FAIL_RESPONSE.result,
                        message: "Status Report is corrupt."
                    };
                    logger.write(MODULE_NAME, "[WARN] load -> onFileReceived -> customFail = " + customFail.message);
                    callBackFunction(customFail);
                    return;
                }
            }

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] load -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function save(callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] save -> Entering function."); }

            let ownerId = statusDependencyNode.dataMine + "-" + statusDependencyNode.bot + "-" + statusDependencyNode.process
            let botId = bot.dataMine + "-" + bot.codeName + "-" + bot.process

            if (ownerId !== botId && statusDependencyNode.process !== "Context") { // Context is a special case where the report is created by the Context.js module itself.

                let customErr = {
                    result: global.CUSTOM_FAIL_RESPONSE.result,
                    message: "Only bots owners of a Status Report can save them."
                };
                logger.write(MODULE_NAME, "[ERROR] save -> customErr = " + customErr.message);
                callBackFunction(customErr);
                return;
            }

            let fileName = "Status.Report.json";
            let filePath = bot.filePathRoot + "/Reports/" + sessionPath + statusDependencyNode.process;

            filePath += '/' + fileName
            let fileContent = JSON.stringify(thisObject.file);

            fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated, true);

            function onFileCreated(err) {

                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] save -> onFileCreated -> Entering function."); }

                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                    logger.write(MODULE_NAME, "[ERROR] save -> onFileCreated -> err = " + err.stack);
                    callBackFunction(err);
                    return;
                }

                if (global.LOG_CONTROL[MODULE_NAME].logContent === true) {
                    logger.write(MODULE_NAME, "[INFO] save -> onFileCreated ->  Content written = " + fileContent);
                }

                /* All good, lets emit the event that means data has been updated. */

                let processOutput = PROCESS_OUTPUT.newProcessOutput(bot, logger)

                processOutput.raiseEvents(thisObject.file.lastFile, thisObject.file.timeFrames, callBackFunction);

                return;
            }

        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] save -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    async function asyncSave() {

        let fileName = "Status.Report.json";
        let filePath = bot.filePathRoot + "/Reports/" + sessionPath + statusDependencyNode.process;

        filePath += '/' + fileName
        let fileContent = JSON.stringify(thisObject.file);

        let response = await fileStorage.asyncCreateTextFile(filePath, fileContent + '\n', true)

        if (response.err.result !== global.DEFAULT_OK_RESPONSE.result) {
            throw (response.err)
        }

        /* All good, lets emit the event that means data has been updated. */
        let processOutput = PROCESS_OUTPUT.newProcessOutput(bot, logger)
        processOutput.asyncRaiseEvents(thisObject.file.lastFile, thisObject.file.timeFrames)
    }
}
