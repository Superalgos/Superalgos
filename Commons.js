exports.newCommons = function newCommons(bot, logger, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Commons";

    const GMT_SECONDS = ':00.000 GMT+0000';

    let thisObject = {
        initializeStorage: initializeStorage
    };

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

    return thisObject;

    function initializeStorage(oliviaStorage, tomStorage, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initializeStorage -> Entering function."); }

            initializetomStorage();

            function initializetomStorage() {

                tomStorage.initialize(bot.devTeam, onBruceInizialized);

                function onBruceInizialized(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        initializeOliviaStorage();

                    } else {
                        logger.write(MODULE_NAME, "[ERROR] initializeStorage -> initializetomStorage -> onBruceInizialized -> err = " + err.message);
                        callBackFunction(err);
                    }
                }
            }

            function initializeOliviaStorage() {

                oliviaStorage.initialize(bot.devTeam, onOliviaInizialized);

                function onOliviaInizialized(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        callBackFunction(global.DEFAULT_OK_RESPONSE);

                    } else {
                        logger.write(MODULE_NAME, "[ERROR] initializeStorage -> initializeOliviaStorage -> onOliviaInizialized -> err = " + err.message);
                        callBackFunction(err);
                    }
                }
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initializeStorage -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};