
exports.newCloudUtilities = function newCloudUtilities() {

    const MODULE_NAME = "Cloud Utilities";

    let utilities = {
        pad: pad,
        createFolderIfNeeded: createFolderIfNeeded,
        calculatePresicion: calculatePresicion
    };

    return utilities;

    function createFolderIfNeeded(path, azureFileStorage, callBackFunction) {

        try {
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[INFO] createFolderIfNeeded -> path = " + path)

            let splittedPath = path.split("/");

            let partialPath = '';
            let separator = "";

            let i = 0;
            loop();

            function loop() {
                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[INFO] createFolderIfNeeded -> path = " + path)

                partialPath = partialPath + separator + splittedPath[i];
                separator = "/";
                i++;
                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[INFO] createFolderIfNeeded -> partialPath = " + partialPath)

                azureFileStorage.createFolder(partialPath, checkLoop);

                function checkLoop(err) {
                    if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] createFolderIfNeeded -> loop -> checkLoop -> err = " + err.stack);
                        callBackFunction(err);
                        return;
                    }

                    if (i === splittedPath.length) {
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                    } else {
                        loop();
                    }
                }
            }
        } catch (err) {
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] createFolderIfNeeded -> Error = " + err.message);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
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
