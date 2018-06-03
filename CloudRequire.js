exports.newCloudRequire = function newCloudRequire(BOT, DEBUG_MODULE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "CloudRequire";

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

            if (FULL_LOG === true) { logger.write("[INFO] downloadBot -> Entering function."); }

            let fileName = "User.Bot.js";

            pCloudStorage.getTextFile(pFilePath, fileName, onFileReceived);

            function onFileReceived(err, text) {

                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                    logger.write("[ERROR] downloadBot -> onFileReceived -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }

                try {

                    let USER_BOT_MODULE = {};
                    USER_BOT_MODULE.newUserBot = eval(text);

                    callBackFunction(global.DEFAULT_OK_RESPONSE, USER_BOT_MODULE);

                } catch (err) {
                    logger.write("[ERROR] downloadBot -> onFileReceived -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

        } catch (err) {
            logger.write("[ERROR] downloadBot -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function downloadCommons(pCloudStorage, pFilePath, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] downloadCommons -> Entering function."); }

            let fileName = "Commons.js";

            pCloudStorage.getTextFile(pFilePath, fileName, onFileReceived);

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
                    logger.write("[ERROR] downloadCommons -> onFileReceived -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

        } catch (err) {
            logger.write("[ERROR] downloadCommons -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};