exports.newCommons = function newCommons(bot, logger, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Commons";

    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;
    const GMT_SECONDS = ':00.000 GMT+0000';

    let thisObject = {
        initializeStorage: initializeStorage
    };

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

    return thisObject;

    function initializeStorage(charlyStorage, bruceStorage, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initializeStorage -> Entering function."); }

            initializeBruceStorage();

            function initializeBruceStorage() {

                bruceStorage.initialize(bot.dataMine, onBruceInizialized);

                function onBruceInizialized(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        initializeCharlyStorage();

                    } else {
                        logger.write(MODULE_NAME, "[ERROR] initializeStorage -> initializeBruceStorage -> onBruceInizialized -> err = " + err.stack);
                        callBackFunction(err);
                    }
                }
            }

            function initializeCharlyStorage() {

                charlyStorage.initialize(bot.dataMine, onCharlyInizialized);

                function onCharlyInizialized(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        callBackFunction(global.DEFAULT_OK_RESPONSE);

                    } else {
                        logger.write(MODULE_NAME, "[ERROR] initializeStorage -> initializeCharlyStorage -> onCharlyInizialized -> err = " + err.stack);
                        callBackFunction(err);
                    }
                }
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initializeStorage -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};