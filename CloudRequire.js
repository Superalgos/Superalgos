exports.newCloudRequire = function newCloudRequire(BOT, logger) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Cloud Require";

    let bot = BOT;

    let thisObject = {
        downloadBot: downloadBot,
        downloadCommons: downloadCommons
    };

    return thisObject;

    function downloadBot(pCloudStorage, pFilePath, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] downloadBot -> Entering function."); }

            let fileName = "User.Bot.js";

            pCloudStorage.getTextFile(pFilePath, fileName, onFileReceived);

            function onFileReceived(err, text) {

                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                    logger.write(MODULE_NAME, "[ERROR] downloadBot -> onFileReceived -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }

                try {

                    let USER_BOT_MODULE = {};
                    USER_BOT_MODULE.newUserBot = eval(text);

                    /*
                        This following code is to load the bot code from a file on the file system.
                        It is useful for when you are activelly changing the code and dont wont to upload it to the storage at every run
                    */

                    /*
                    let fs = require('fs');
                    try {
                        let fileName = "C:/Users/Luis/source/repos/Bots/AAMasters/AAChris-Indicator-Bot/Multi-Period-Daily/User.Bot.js";
                        fs.readFile(fileName, onFileRead);

                        function onFileRead(err, file) {
                            let fileString = file.toString();
                            USER_BOT_MODULE.newUserBot = eval(fileString);
                            callBackFunction(global.DEFAULT_OK_RESPONSE, USER_BOT_MODULE);
                        }
                    }
                    catch(err) {
                            console.log("ERROR LOADING FILE FROM FILE SYSTEM");
                    }
                    */
                    callBackFunction(global.DEFAULT_OK_RESPONSE, USER_BOT_MODULE); // Coment this when loading from file system.

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] downloadBot -> onFileReceived -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] downloadBot -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function downloadCommons(pCloudStorage, pFilePath, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] downloadCommons -> Entering function."); }

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
                    logger.write(MODULE_NAME, "[ERROR] downloadCommons -> onFileReceived -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
            }

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] downloadCommons -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};