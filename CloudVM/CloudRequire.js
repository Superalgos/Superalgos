function newCloudRequire(BOT, DEBUG_MODULE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Cloud Require";

    let bot = BOT;

    const logger = DEBUG_MODULE.newDebugLog();
    logger.bot = bot;
    logger.fileName = MODULE_NAME;
    logger.initialize();

    let thisObject = {
        requireBot: requireBot,
        requireCommons: requireCommons
    };

    return thisObject;

    function requireBot(pCloudStorage, pProcessConfig, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] requireBot -> Entering function."); }

            let filePath = "Bots" + "/" + bot.devTeam + "/" + bot.repo + "/" + pProcessConfig.name + "/" + "User.Bot.js";

            downloadModule(filePath, onDownloaded)

            function onDownloaded(pModule) {

                callBackFunction(global.DEFAULT_OK_RESPONSE, pModule);
                return;

            }

        } catch (err) {
            logger.write("[ERROR] requireBot -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function requireCommons(pCloudStorage, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] requireCommons -> Entering function."); }

            let filePath = bot.devTeam + "/" + bot.repo + "/" + "Commons.js";

            downloadModule(filePath, onDownloaded)

            function onDownloaded(pModule) {

                callBackFunction(global.DEFAULT_OK_RESPONSE, pModule);
                return;

            }

        } catch (err) {
            logger.write("[ERROR] requireCommons -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};