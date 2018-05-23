exports.newCloudRequire = function newCloudRequire(BOT, DEBUG_MODULE) {

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

            let filePath = bot.devTeam + "/" + bot.repo + "/" + pProcessConfig.name;
            let fileName = "User.Bot.js";

            pCloudStorage.getTextFile(filePath, fileName, onFileReceived);

            function onFileReceived(err, text) {

                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                    logger.write("[ERROR] requireBot -> onFileReceived -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }

                try {

                    let USER_BOT_MODULE = {};
                    USER_BOT_MODULE.newUserBot = eval(text);

                    callBackFunction(global.DEFAULT_OK_RESPONSE, USER_BOT_MODULE);

                } catch (err) {
                    logger.write("[ERROR] requireBot -> onFileReceived -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

        } catch (err) {
            logger.write("[ERROR] requireBot -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function requireCommons(pCloudStorage, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] requireCommons -> Entering function."); }

            let filePath = bot.devTeam + "/" + bot.repo;
            let fileName = "Commons.js";

            pCloudStorage.getTextFile(filePath, fileName, onFileReceived);

            function onFileReceived(err, text) {

                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                    // Nothing happens since COMMONS modules are optional.
                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                    return;
                }

                try {

                    let COMMONS_MODULE = {};
                    COMMONS_MODULE.newCommons = eval(text);

                    callBackFunction(global.DEFAULT_OK_RESPONSE, COMMONS_MODULE);

                } catch (err) {
                    logger.write("[ERROR] requireCommons -> onFileReceived -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

        } catch (err) {
            logger.write("[ERROR] requireCommons -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};