
exports.newCloudUtilities = function newCloudUtilities(logger) {

    const MODULE_NAME = "Cloud Utilities";

    let utilities = {
        pad: pad,
        createFolderIfNeeded: createFolderIfNeeded,
        calculatePresicion: calculatePresicion
    };

    return utilities;

    function createFolderIfNeeded(path, azureFileStorage, callBackFunction) {

        try {
            logger.write(MODULE_NAME, "[INFO] createFolderIfNeeded -> path = " + path)

            let splittedPath = path.split("/");

            let partialPath = '';
            let separator = "";

            let i = 0;
            loop();

            function loop() {
                logger.write(MODULE_NAME, "[INFO] createFolderIfNeeded -> path = " + path)

                partialPath = partialPath + separator + splittedPath[i];
                separator = "/";
                i++;
                logger.write(MODULE_NAME, "[INFO] createFolderIfNeeded -> partialPath = " + partialPath)

                azureFileStorage.createFolder(partialPath, checkLoop);

                function checkLoop(err) {
                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write(MODULE_NAME, "[ERROR] createFolderIfNeeded -> loop -> checkLoop -> err = " + err.stack);
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
            logger.write(MODULE_NAME, "[ERROR] createFolderIfNeeded -> Error = " + err.message);
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
