exports.newStatusReport = function newStatusReport(BOT, logger, UTILITIES) {

    /*

    A Status Report is a file that every bot reads at the begining of its execution and saves after it finishes its job.
    The purpose of the file is to record checkpoint information of what was the last thing done by the bot and helpfull enough to start the next execution.
    It usually does not include business related context data.

    */

    const MODULE_NAME = "Status Report";

    let bot = BOT;

    let thisObject = {
        mainUtility: undefined,
        file: undefined,                    // Here we have the JSON object representing the file content.
        initialize: initialize,
        load: load,
        save: save,
        status: undefined,
        verifyMarketComplete: verifyMarketComplete
    };

    let statusDependencyNode;   

    /* Utilities needed. */

    let utilities = UTILITIES.newCloudUtilities(logger);

    /* Storage account to be used here. */

    const FILE_STORAGE = require('./FileStorage.js');
    let fileStorage = FILE_STORAGE.newFileStorage(logger);

    let month;
    let year;
    let timePath = '';
    let sessionPath = ''

    return thisObject;

    function initialize(pStatusDependencyNode, pMonth, pYear, callBackFunction) {

        try {
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            statusDependencyNode = pStatusDependencyNode;
            logger.fileName = MODULE_NAME + "." + statusDependencyNode.type + "." + statusDependencyNode.name + "." + statusDependencyNode.id;

            month = pMonth;
            year = pYear;

            /* Some very basic validations that we have all the information needed. */
            if (statusDependencyNode.referenceParent === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Status Dependency without Reference Parent. Status Dependency = " + JSON.stringify(statusDependencyNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (statusDependencyNode.referenceParent.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Status Report not attached to a Process Definition. Status Report = " + JSON.stringify(statusDependencyNode.referenceParent));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (statusDependencyNode.referenceParent.parentNode.code.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Process Definition witn no codeName defined. Process Definition = " + JSON.stringify(statusDependencyNode.referenceParent.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (statusDependencyNode.referenceParent.parentNode.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Process Definition not attached to a Bot. Process Definition = " + JSON.stringify(statusDependencyNode.referenceParent.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (statusDependencyNode.referenceParent.parentNode.parentNode.code.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Bot witn no codeName defined. Bot = " + JSON.stringify(statusDependencyNode.referenceParent.parentNode.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (statusDependencyNode.referenceParent.parentNode.parentNode.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Bot not attached to a Data Mine. Bot = " + JSON.stringify(statusDependencyNode.referenceParent.parentNode.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (statusDependencyNode.referenceParent.parentNode.parentNode.parentNode.code.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Data Mine witn no codeName defined. Data Mine = " + JSON.stringify(statusDependencyNode.referenceParent.parentNode.parentNode.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            /* Simplifying the access to basic info */
            statusDependencyNode.bot = statusDependencyNode.referenceParent.parentNode.parentNode.code.codeName
            statusDependencyNode.process = statusDependencyNode.referenceParent.parentNode.code.codeName
            statusDependencyNode.bottype = statusDependencyNode.referenceParent.parentNode.parentNode.type
            statusDependencyNode.dataMine = statusDependencyNode.referenceParent.parentNode.parentNode.parentNode.code.codeName

            /* Let's see if the process is run monthly or not. */
            if (statusDependencyNode.referenceParent.parentNode.code.startMode !== undefined) {
                if (statusDependencyNode.referenceParent.parentNode.code.startMode.allMonths !== undefined) {
                    if (statusDependencyNode.referenceParent.parentNode.code.startMode.oneMonth !== undefined) {
                        if (statusDependencyNode.referenceParent.parentNode.code.startMode.allMonths.run === "true" || statusDependencyNode.referenceParent.parentNode.code.startMode.oneMonth.run === "true") {
                            statusDependencyNode.processRunMonthly = true
                        }
                    }
                }
            }

            /* We retrieve the report main utility */
            if (statusDependencyNode.code !== undefined) {
                if (statusDependencyNode.code.mainUtility !== undefined) {
                    thisObject.mainUtility = statusDependencyNode.code.mainUtility
                }
            }

            /* This stuff is still hardcoded and unresolved. */
            statusDependencyNode.botVersion = {
                "major": 1,
                "minor": 0
            }
            statusDependencyNode.dataSetVersion = "dataSet.V1"

            if (bot.SESSION !== undefined && statusDependencyNode.bottype === "Trading Bot") {
                sessionPath = bot.SESSION.folderName + "/"
            }
 
            if (statusDependencyNode.processRunMonthly === true && month !== undefined && year !== undefined) {
                logger.fileName = MODULE_NAME + "." + statusDependencyNode.bot + "." + statusDependencyNode.process + "." + year + "." + month;
                timePath = "/" + year + "/" + month;
            }

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = "+ err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function load(callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] load -> Entering function."); }

            let fileName = "Status.Report." + bot.market.baseAsset + '_' + bot.market.quotedAsset + ".json";
            let filePath;

            let ownerId = statusDependencyNode.dataMine + "-" + statusDependencyNode.bot + "-" + statusDependencyNode.botVersion.major + "-" + statusDependencyNode.botVersion.minor + "-" + statusDependencyNode.process + "-" + statusDependencyNode.dataSetVersion;
            let botId = bot.dataMine + "-" + bot.codeName + "-" + bot.version.major + "-" + bot.version.minor + "-" + bot.process + "-" + bot.dataSetVersion;

            if (ownerId !== botId) {
                let rootPath = statusDependencyNode.dataMine + "/" + statusDependencyNode.bot + "." + statusDependencyNode.botVersion.major + "." + statusDependencyNode.botVersion.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + bot.exchange + "/" + statusDependencyNode.dataSetVersion;
                filePath = rootPath + "/Reports/" + sessionPath + statusDependencyNode.process + timePath;
            } else {
                filePath = bot.filePathRoot + "/Reports/" + sessionPath + statusDependencyNode.process + timePath;
            }

            filePath += '/' + fileName

            fileStorage.getTextFile(statusDependencyNode.dataMine, filePath, onFileReceived);

            function onFileReceived(err, text) {

                if ( err.result === global.CUSTOM_FAIL_RESPONSE.result && (err.message === 'Folder does not exist.' || err.message === 'File does not exist.')
                    || err.code === "The specified key does not exist.") {

                    logger.write(MODULE_NAME, "[INFO] load -> onFileReceived -> err = "+ err.stack);

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
                    logger.write(MODULE_NAME, "[ERROR] load -> onFileReceived -> err = "+ err.stack);
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
            logger.write(MODULE_NAME, "[ERROR] load -> err = "+ err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function save(callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] save -> Entering function."); }

            let ownerId = statusDependencyNode.dataMine + "-" + statusDependencyNode.bot + "-" + statusDependencyNode.botVersion.major + "-" + statusDependencyNode.botVersion.minor + "-" + statusDependencyNode.process + "-" + statusDependencyNode.dataSetVersion;
            let botId = bot.dataMine + "-" + bot.codeName + "-" + bot.version.major + "-" + bot.version.minor + "-" + bot.process + "-" + bot.dataSetVersion;

            if (ownerId !== botId && statusDependencyNode.process !== "Context") { // Context is a special case where the report is created by the Context.js module itself.

                let customErr = {
                    result: global.CUSTOM_FAIL_RESPONSE.result,
                    message: "Only bots owners of a Status Report can save them."
                };
                logger.write(MODULE_NAME, "[ERROR] save -> customErr = " + customErr.message);
                callBackFunction(customErr);
                return;
            }

            let fileName = "Status.Report." + bot.market.baseAsset + '_' + bot.market.quotedAsset + ".json";
            let filePath = bot.filePathRoot + "/Reports/" + sessionPath + statusDependencyNode.process + timePath;

            filePath += '/' + fileName
            let fileContent = JSON.stringify(thisObject.file);

            fileStorage.createTextFile(statusDependencyNode.dataMine, filePath, fileContent + '\n', onFileCreated);

            function onFileCreated(err) {

                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] save -> onFileCreated -> Entering function."); }

                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                    logger.write(MODULE_NAME, "[ERROR] save -> onFileCreated -> err = "+ err.stack);
                    callBackFunction(err);
                    return;
                }

                if (global.LOG_CONTROL[MODULE_NAME].logContent === true) {
                    logger.write(MODULE_NAME, "[INFO] save -> onFileCreated ->  Content written = " + fileContent);
                }

                callBackFunction(global.DEFAULT_OK_RESPONSE);
                return;
            }

        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] save -> err = "+ err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function verifyMarketComplete(callBackFunction) {

        /*
        The mission of this function is to update the main status report on a scheme where there are monthly sub reports.
        This report contains the date of the last file sucessfully checked but in a consecutive way.

        For example: if the market starts in March, and March, April and June are checked, then the file will be the last of June even if September is also checked.

        IMPORTANT NOTE: Once executed, this function will leave thisObject in an inconsistant state, so you need to re-initialize it if you wish to use it again.

        */

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] verifyMarketComplete -> Entering function."); }

            let initialYear;
            let initialMonth;

            let finalYear = (new Date()).getUTCFullYear();
            let finalMonth = (new Date()).getUTCMonth() + 1;

            /* Lets load again this main status report as it might have changed since its initialization and first load. */

            load(onLoad);

            function onLoad(err) {

                try {

                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] verifyMarketComplete -> onLoad -> Entering function."); }

                    if (
                        err.result === global.CUSTOM_FAIL_RESPONSE.result &&
                        (err.message === 'Status Report was never created.')
                    ) {
                        logger.write(MODULE_NAME, "[INFO] verifyMarketComplete -> onLoad -> err = "+ err.stack);

                        /* The first month of the market didnt create the main report yet. Aborting verification. */

                        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] verifyMarketComplete -> onLoad -> Verification ABORTED since the main status report does not exist."); }

                        callBackFunction(global.DEFAULT_OK_RESPONSE);
                        return;
                    }

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write(MODULE_NAME, "[ERROR] verifyMarketComplete -> onLoad -> err = "+ err.stack);
                        callBackFunction(err);
                        return;
                    }

                    /* Here we get the initial month and year from where our verification process will start. */

                    initialYear = thisObject.file.lastFile.year;
                    initialMonth = thisObject.file.lastFile.month;

                    loopCycle();

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] verifyMarketComplete -> onLoad -> err = "+ err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

            function loopCycle() {

                try {

                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] verifyMarketComplete -> loopCycle -> Entering function."); }

                    /* Here we read the status report file of each month / year to verify if it is complete or not. */

                    let paddedInitialMonth = utilities.pad(initialMonth, 2);

                    timePath = "/" + initialYear + "/" + paddedInitialMonth;

                    load(onLoad);

                    function onLoad(err) {

                        try {

                            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] verifyMarketComplete -> loopCycle -> onLoad -> Entering function."); }

                            if (
                                err.result === global.CUSTOM_FAIL_RESPONSE.result &&
                                (err.message === 'Status Report was never created.')
                            ) {
                                logger.write(MODULE_NAME, "[INFO] verifyMarketComplete -> loopCycle -> onLoad -> err = "+ err.stack);

                                /* The first month of the market didnt create the main report yet. Aborting verification. */

                                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] verifyMarketComplete -> loopCycle -> onLoad -> Verification ABORTED  since the status report for year  " + initialYear + " and month " + initialMonth + " did not exist. "); }

                                callBackFunction(global.DEFAULT_OK_RESPONSE);
                                return;
                            }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write(MODULE_NAME, "[ERROR] verifyMarketComplete -> loopCycle -> onLoad -> err = "+ err.stack);
                                callBackFunction(err);
                                return;
                            }

                            if (thisObject.file.monthChecked === true) {

                                readAndWriteNewReport(JSON.stringify(thisObject.file));

                            } else {

                                /* If any of the files says that month is not checked then it is enough to know the market continuity is broken. */

                                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] verifyMarketComplete -> loopCycle -> onLoad -> Verification ABORTED since the status report for year  " + initialYear + " and month " + initialMonth + " is not marked as complete."); }

                                callBackFunction(global.DEFAULT_OK_RESPONSE);
                                return;
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] verifyMarketComplete -> loopCycle -> onLoad -> err = "+ err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                    }
                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] verifyMarketComplete -> loopCycle -> err = "+ err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

            function readAndWriteNewReport(monthlyStatusReport) {

                try {

                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] verifyMarketComplete -> readAndWriteNewReport -> Entering function."); }

                    /* We will read the current file to preserve its data, and save it again with the new lastFile */

                    monthlyStatusReport = JSON.parse(monthlyStatusReport);

                    timePath = "";

                    load(onLoad);

                    function onLoad(err) {

                        try {

                            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] verifyMarketComplete -> readAndWriteNewReport -> onLoad -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write(MODULE_NAME, "[ERROR] verifyMarketComplete -> readAndWriteNewReport -> onLoad -> err = "+ err.stack);
                                callBackFunction(err);
                                return;
                            }

                            if (monthlyStatusReport.lastTrade.id > thisObject.file.lastTrade.id) {

                                thisObject.file.lastFile = monthlyStatusReport.lastFile;
                                thisObject.file.lastTrade = monthlyStatusReport.lastTrade;
                                thisObject.file.lastTrade.counter = undefined;

                                save(onSave);

                                function onSave(err) {

                                    try {

                                        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] verifyMarketComplete -> readAndWriteNewReport -> onLoad -> onSave -> Entering function."); }

                                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                            logger.write(MODULE_NAME, "[ERROR] verifyMarketComplete -> readAndWriteNewReport -> onLoad -> onSave -> err = "+ err.stack);
                                            callBackFunction(err);
                                            return;
                                        }

                                        loop();  // Lets see the next month.

                                    } catch (err) {
                                        logger.write(MODULE_NAME, "[ERROR] verifyMarketComplete -> readAndWriteNewReport -> onLoad -> onSave -> err = "+ err.stack);
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        return;
                                    }
                                }

                            } else {

                                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] verifyMarketComplete -> readAndWriteNewReport -> onLoad -> Main Status Report Not Updated."); }
                                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] verifyMarketComplete -> readAndWriteNewReport -> onLoad -> Current Trade Id (" + monthlyStatusReport.lastTrade.id + ") is <= than Id at main status report file. (" + thisObject.file.lastTrade.id + ")"); }

                                loop();  // Lets see the next month.
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] verifyMarketComplete -> readAndWriteNewReport -> onLoad -> err = "+ err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                    }
                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] verifyMarketComplete -> loopCycle -> err = "+ err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

            function loop() {

                try {

                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] verifyMarketComplete -> loop -> Entering function."); }

                    initialMonth++;

                    if (initialMonth > 12) {

                        initialMonth = 1;
                        initialYear++;

                    }

                    if ((initialYear === finalYear && initialMonth > finalMonth) || (initialYear > finalYear)) {

                        /* We arrived to the point where we have checked all the status reports of every month and they are all complete. */

                        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] verifyMarketComplete -> loop -> Verification Finished. Success."); }

                        callBackFunction(global.DEFAULT_OK_RESPONSE);
                        return;
                    }

                    loopCycle();

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] verifyMarketComplete -> loop -> err = "+ err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] verifyMarketComplete -> err = "+ err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            return;
        }
    }
};
