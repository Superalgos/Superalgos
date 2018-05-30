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
        downloadBot: downloadBot,
        downloadCommons: downloadCommons
    };

    return thisObject;

    function downloadBot(pCloudStorage, pProcessConfig, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] downloadBot -> Entering function."); }

            let filePath;

            switch (global.CURRENT_EXECUTION_AT) {
                case "Cloud": {
                    filePath = global.DEV_TEAM + "/" + "bots" + "/" + bot.repo + "/" + pProcessConfig.name; // DevTeams bots only are run at the cloud.
                    break;
                }
                case "Browser": {
                    filePath = global.DEV_TEAM + "/" + "members" + "/" + global.USER_LOGGED_IN + "/" + bot.repo + "/" + pProcessConfig.name; // DevTeam Members bots only are run at the browser.
                    break;
                }
                default: {
                    console.log(logDisplace + "Root : [ERROR] start -> getBotConfig -> onInizialized -> CURRENT_EXECUTION_AT must be either 'Cloud' or 'Browser' ");
                }
            }

            let fileName = "User.Bot.js";

            pCloudStorage.getTextFile(filePath, fileName, onFileReceived);

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

    function downloadCommons(pCloudStorage, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] downloadCommons -> Entering function."); }

            let filePath;

            switch (global.CURRENT_EXECUTION_AT) {
                case "Cloud": {
                    filePath = global.DEV_TEAM + "/" + "bots" + "/" + bot.repo; // DevTeams bots only are run at the cloud.
                    break;
                }
                case "Browser": {
                    filePath = global.DEV_TEAM + "/" + "members" + "/" + global.USER_LOGGED_IN + "/" + bot.repo; // DevTeam Members bots only are run at the browser.
                    break;
                }
                default: {
                    console.log(logDisplace + "Root : [ERROR] start -> getBotConfig -> onInizialized -> CURRENT_EXECUTION_AT must be either 'Cloud' or 'Browser' ");
                }
            }

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