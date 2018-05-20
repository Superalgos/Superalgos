
exports.newUtilities = function newUtilities(BOT) {

    const FULL_LOG = true;

    let bot = BOT;
    const ROOT_DIR = '../';

    const MODULE_NAME = "Utilities";


    const DEBUG_MODULE = require('./Debug Log');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;
    logger.initialize();

    let utilities = {
        pad: pad,
        createFolderIfNeeded: createFolderIfNeeded,
        calculatePresicion: calculatePresicion
    };

    return utilities;

    function createFolderIfNeeded(path, azureFileStorage, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] createFolderIfNeeded -> Entering function."); }
            if (FULL_LOG === true) { logger.write("[INFO] createFolderIfNeeded -> path = " + path); }

            let splittedPath = path.split("/");

            let partialPath = '';
            let separator = "";

            let i = 0;
            loop();

            function loop() {

                if (FULL_LOG === true) { logger.write("[INFO] createFolderIfNeeded -> path = " + path); }

                partialPath = partialPath + separator + splittedPath[i];
                separator = "/";

                i++;

                if (FULL_LOG === true) { logger.write("[INFO] createFolderIfNeeded -> partialPath = " + partialPath); }

                azureFileStorage.createFolder(partialPath, checkLoop);

                function checkLoop(err) {

                    if (FULL_LOG === true) { logger.write("[INFO] createFolderIfNeeded -> loop -> checkLoop -> Entering function."); }

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write("[ERROR] createFolderIfNeeded -> loop -> checkLoop -> err = " + err.message);
                        callBackFunction(err);
                        return;
                    }

                    if (i === splittedPath.length) {

                        callBackFunction(global.DEFAULT_OK_RESPONSE);

                    } else {

                        loop();

                    }
                }
            }
        } catch (err) {
            logger.write("[ERROR] createFolderIfNeeded -> Error = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }


    function calculatePresicion(number) {

        for (let i = -10; i <= 10; i++) {
            if (number < Math.pow(10, i)) {
                return Math.pow(10, i - 3);
            }
        }
    }

    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }
}