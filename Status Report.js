exports.newStatusReport = function newStatusReport(BOT, DEBUG_MODULE, FILE_STORAGE, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    /* 

    A Status Report is a file that every bot reads at the begining of its execution and saves after it finishes its job.
    The purpose of the file is to record checkpoint information of what was the last thing done by the bot and helpfull enough to start the next execution.
    It usually does not include business related context data.

    */

    const MODULE_NAME = "Status Report";

    let thisObject = {
        file: undefined,                    // Here we have the JSON object representing the file content.
        initialize: initialize,
        save: save
    };

    /*

    During the process we will create a new History Record. This will go to the Context History file which essentially mantains an
    index of all the bots executions. This file will later be plotted by the bot s plotter on the timeline, allowing end users to
    know where there is information related to the actions taken by the bot.

    */

    let bot = BOT;
    let ownerBot;                       // This is the bot owner of the Status Report. Only owners can save the report and override the existing content.

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    /* Utilities needed. */

    let utilities = UTILITIES.newUtilities(bot);

    /* Storage account to be used here. */

    let cloudStorage = FILE_STORAGE.newAzureFileStorage(bot);

    return thisObject;

    function initialize(pOwnerBot, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            /*

            Here we get the positions the bot did and that are recorded at the bot storage account. We will use them through out the rest
            of the process.

            */

            ownerBot = pOwnerBot;

            initializeStorage();

            function initializeStorage() {

                cloudStorage.initialize(bot.codeName, onInizialized);

                function onInizialized(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        getFile(onDone);

                    } else {
                        logger.write("[ERROR] initialize -> initializeStorage -> onInizialized -> err = " + err.message);
                        callBackFunction(err);
                    }
                }
            }

            function onDone(err) {
                try {

                    switch (err.result) {
                        case global.DEFAULT_OK_RESPONSE.result: {
                            logger.write("[INFO] initialize -> onDone -> Execution finished well. :-)");
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;
                        }
                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] initialize -> onDone -> Retry Later. Requesting Execution Retry.");
                            callBackFunction(err);
                            return;
                        }
                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] initialize -> onDone -> Operation Failed. Aborting the process.");
                            callBackFunction(err);
                            return;
                        }
                        case global.CUSTOM_FAIL_RESPONSE.result: {
                            logger.write("[INFO] initialize -> onDone -> Execution finished with some expected issue.");
                            callBackFunction(err);
                            return;
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] initialize -> onDone -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function getFile(callBack) {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getFile -> Entering function."); }

                    let fileName = "Status.Report.json"
                    let filePath = ownerBot.devTeam + "/" + ownerBot.codeName + "." + ownerBot.version.major + "." + ownerBot.version.minor + "/" + ownerBot.dataSetVersion + "/Processes/" + ownerBot.process + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor;

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getFile -> fileName = " + fileName); }
                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getFile -> filePath = " + filePath); }

                    cloudStorage.getTextFile(filePath, fileName, onFileReceived);

                    function onFileReceived(err, text) {

                        if (err.result === global.CUSTOM_FAIL_RESPONSE.result && err.message === 'Folder does not exist.') {
                            logger.write("[INFO] initialize -> getFile -> onFileReceived -> err = " + err.message);

                            /* In this case we can assume that this is the first execution ever of this bot.*/

                            thisObject.statusReport = JSON.parse('{}');

                            let customErr = {
                                result: global.CUSTOM_FAIL_RESPONSE.result,
                                message: "Status Report was never created."
                            }
                            logger.write("[ERROR] save -> err = " + err.message);
                            callBack(customErr);
                            return;
                        }

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write("[ERROR] initialize -> getFile -> onFileReceived -> err = " + err.message);
                            callBack(err);
                            return;
                        }

                        if (FULL_LOG === true) {
                            logger.write("[INFO] initialize -> getFile -> onFileReceived -> Content received = " + text);
                        }

                        try {

                            thisObject.statusReport = JSON.parse(text);
                            callBack(global.DEFAULT_OK_RESPONSE);

                        } catch (err) {

                            /*
                            It might happen that the file content is corrupt. We will consider this as a temporary situation, since sometimes the file
                            is being updated at the moment of the read. The bot can not run without a valid Status Report but we can request the platform to retry later.
                            */

                            logger.write("[ERROR] initialize -> getFile -> onFileReceived -> Bot cannot execute without a valid Status report. -> Err = " + err.message);
                            callBack(global.DEFAULT_RETRY_RESPONSE);
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] initialize -> getFile -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            logger.write("[ERROR] initialize -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function save(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] save -> Entering function."); }

            let ownerId = ownerBot.devTeam + "-" + ownerBot.codeName;
            let botId = bot.devTeam + "-" + bot.codeName;

            if (ownerId !== botId) {

                let customErr = {
                    result: global.CUSTOM_FAIL_RESPONSE.result,
                    message: "Only bots owners of a Status Report can save them."
                }
                logger.write("[ERROR] save -> err = " + err.message);
                callBackFunction(customErr);
                return;
            }

            let fileName = "Status.Report.json"
            let filePath = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + bot.dataSetVersion + "/Processes/" + bot.process + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor;

            if (FULL_LOG === true) { logger.write("[INFO] save -> fileName = " + fileName); }
            if (FULL_LOG === true) { logger.write("[INFO] save -> filePath = " + filePath); }

            utilities.createFolderIfNeeded(filePath, cloudStorage, onFolderCreated);

            function onFolderCreated(err) {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] save -> onFolderCreated -> Entering function."); }

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write("[ERROR] save -> onFolderCreated -> err = " + err.message);
                        callBackFunction(err);
                        return;
                    }

                    let fileContent = JSON.stringify(thisObject.statusReport);

                    cloudStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        if (FULL_LOG === true) { logger.write("[INFO] save -> onFolderCreated -> onFileCreated -> Entering function."); }

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write("[ERROR] save -> onFolderCreated -> onFileCreated -> err = " + err.message);
                            callBackFunction(err);
                            return;
                        }

                        if (FULL_LOG === true) {
                            logger.write("[INFO] save -> onFolderCreated -> onFileCreated ->  Content written = " + fileContent);
                        }

                        callBackFunction(global.DEFAULT_OK_RESPONSE);
                        return;
                    }
                }
                catch (err) {
                    logger.write("[ERROR] save -> onFolderCreated -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        }
        catch (err) {
            logger.write("[ERROR] save -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};