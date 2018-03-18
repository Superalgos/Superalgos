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
        load: load,
        save: save
    };

    let bot = BOT;
    let owner;                       // This is the bot owner of the Status Report. Only owners can save the report and override the existing content.

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    /* Utilities needed. */

    let utilities = UTILITIES.newUtilities(bot);

    /* Storage account to be used here. */

    let cloudStorage = FILE_STORAGE.newFileStorage(bot);

    let month;
    let year;
    let timePath = '';

    return thisObject;

    function initialize(pOwner, pMonth, pYear, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME + "." + pOwner.bot;

            owner = pOwner;
            month = pMonth;
            year = pYear;

            if (owner.dataSetSection === "Month") {

                logger.fileName = MODULE_NAME + "." + pOwner.bot + "." + year + "." + month;

                timePath = "/" + year + "/" + month; 
            }

            if (FULL_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }


            initializeStorage();

            function initializeStorage() {

                cloudStorage.initialize(owner.bot, onInizialized);

                function onInizialized(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        if (FULL_LOG === true) { logger.write("[INFO] initialize -> initializeStorage -> onInizialized -> Entering function."); }
                        callBackFunction(global.DEFAULT_OK_RESPONSE);

                    } else {
                        logger.write("[ERROR] initialize -> initializeStorage -> onInizialized -> err = " + err.message);
                        callBackFunction(err);
                    }
                }
            }
        } catch (err) {
            logger.write("[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function load(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] initialize -> load -> Entering function."); }

            let rootPath = owner.devTeam + "/" + owner.bot + "." + owner.botVersion.major + "." + owner.botVersion.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + owner.dataSetVersion;
            let fileName = "Status.Report.json"
            let filePath = rootPath + "/Reports/" + owner.process + timePath;

            if (FULL_LOG === true) { logger.write("[INFO] initialize -> load -> fileName = " + fileName); }
            if (FULL_LOG === true) { logger.write("[INFO] initialize -> load -> filePath = " + filePath); }

            cloudStorage.getTextFile(filePath, fileName, onFileReceived);

            function onFileReceived(err, text) {

                if (
                    err.result === global.CUSTOM_FAIL_RESPONSE.result &&
                    (err.message === 'Folder does not exist.' || err.message === 'File does not exist.')
                ) {
                    logger.write("[INFO] initialize -> load -> onFileReceived -> err = " + err.message);

                    /* In this case we can assume that this is the first execution ever of this bot.*/

                    thisObject.file = JSON.parse('{}');

                    let customOK = {
                        result: global.CUSTOM_OK_RESPONSE.result,
                        message: "Status Report was never created."
                    }
                    logger.write("[WARN] initialize -> load -> onFileReceived -> customOK = " + customOK.message);
                    callBackFunction(customOK);
                    return;
                }

                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                    logger.write("[ERROR] initialize -> load -> onFileReceived -> err = " + err.message);
                    callBackFunction(err);
                    return;
                }

                if (FULL_LOG === true) {
                    logger.write("[INFO] initialize -> load -> onFileReceived -> Content received = " + text);
                }

                try {

                    thisObject.file = JSON.parse(text);
                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                } catch (err) {

                    /*
                    It might happen that the file content is corrupt. We will consider this as a temporary situation, since sometimes the file
                    is being updated at the moment of the read. The bot can not run without a valid Status Report but we can request the platform to retry later.
                    */

                    logger.write("[ERROR] initialize -> load -> onFileReceived -> Bot cannot execute without a valid Status report. -> Err = " + err.message);
                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                }
            }

        } catch (err) {
            logger.write("[ERROR] initialize -> load -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function save(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] save -> Entering function."); }

            let ownerId = owner.devTeam + "-" + owner.bot + "-" + owner.botVersion.major + "-" + owner.botVersion.minor + "-" + owner.process + "-" + owner.dataSetVersion;
            let botId = bot.devTeam + "-" + bot.codeName + "-" + bot.version.major + "-" + bot.version.minor + "-" + bot.process + "-" + bot.dataSetVersion;

            if (ownerId !== botId) {

                let customErr = {
                    result: global.CUSTOM_FAIL_RESPONSE.result,
                    message: "Only bots owners of a Status Report can save them."
                }
                logger.write("[ERROR] save -> customErr = " + customErr.message);
                callBackFunction(customErr);
                return;
            }

            let fileName = "Status.Report.json"
            let filePath = bot.filePathRoot + "/Reports/" + owner.process + timePath;

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

                    let fileContent = JSON.stringify(thisObject.file);

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