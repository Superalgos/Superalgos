function newCloudRequire(BOT, DEBUG_MODULE) {

    const INFO_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Cloud Require";

    let bot = BOT;

    const logger = DEBUG_MODULE.newDebugLog();
    logger.bot = bot;
    logger.fileName = MODULE_NAME;
    logger.initialize();

    let thisObject = {
        downloadBot: downloadBot,
        downloadCommons: downloadCommons
    };

    return thisObject;

    function downloadBot(pCloudStorage, pFilePath, callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] downloadBot -> Entering function."); }

            let filePath = "Bots" + "/" + pFilePath + "/" + "User.Bot.js";

            downloadModule(filePath, onDownloaded)

            function onDownloaded(pModule) {

                callBackFunction(window.DEFAULT_OK_RESPONSE, pModule);
                return;

            }

        } catch (err) {
            logger.write("[ERROR] downloadBot -> err = " + err.message);
            callBackFunction(window.DEFAULT_FAIL_RESPONSE);
        }
    }

    function downloadCommons(pCloudStorage, pFilePath, callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] downloadCommons -> Entering function."); }

            let filePath = "Bots" + "/" + pFilePath + "/" + "Commons.js";

            downloadModule(filePath, onDownloaded)

            function onDownloaded(pModule) {

                callBackFunction(window.DEFAULT_OK_RESPONSE, pModule);
                return;

            }

        } catch (err) {
            logger.write("[ERROR] downloadCommons -> err = " + err.message);
            callBackFunction(window.DEFAULT_FAIL_RESPONSE);
        }
    }

};