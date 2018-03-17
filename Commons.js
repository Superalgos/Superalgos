exports.newCommons = function newCommons(BOT, DEBUG_MODULE, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Commons";

    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;
    const GMT_SECONDS = ':00.000 GMT+0000';

    let thisObject = {
        initializeStorage: initializeStorage
    };

    let bot = BOT;

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    let utilities = UTILITIES.newUtilities(bot);

    return thisObject;

    function initializeStorage(oliviaFileStorage, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] initializeStorage -> Entering function."); }

            initializeCharlyStorage();

            function initializeCharlyStorage() {

                oliviaFileStorage.initialize("AAOlivia", onOliviaInizialized);

                function onOliviaInizialized(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        callBackFunction(global.DEFAULT_OK_RESPONSE);

                    } else {
                        logger.write("[ERROR] initializeStorage -> initializeOliviaStorage -> onOliviaInizialized -> err = " + err.message);
                        callBackFunction(err);
                    }
                }
            }
        }
        catch (err) {
            logger.write("[ERROR] initializeStorage -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};