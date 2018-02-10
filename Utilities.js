
exports.newUtilities = function newUtilities(BOT) {

    let bot = BOT;
    const ROOT_DIR = '../';

    const MODULE_NAME = "Utilities";


    const DEBUG_MODULE = require('./Debug Log');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    let utilities = {
        pad: pad,
        createFolderIfNeeded: createFolderIfNeeded,
        calculatePresicion: calculatePresicion
    };

    return utilities;


    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }

    function createFolderIfNeeded(path, azureFileStorage, callBackFunction) {

        let splittedPath = path.split("/");

        let partialPath = '';
        let separator = "";


        let i = 0;
        loop();

        function loop() {

            partialPath = partialPath + separator + splittedPath[i];
            separator = "/";

            i++;

            azureFileStorage.createFolder(partialPath, checkLoop);

            function checkLoop() {

                if (i === splittedPath.length) {

                    callBackFunction();

                } else {

                    loop();

                }


            }

        }

    }


    function calculatePresicion(number) {

        for (let i = -10; i <= 10; i++) {
            if (number < Math.pow(10, i)) {
                return Math.pow(10, i - 3);
            }
        }
    }




}