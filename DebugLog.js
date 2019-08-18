exports.newDebugLog = function newDebugLog() {

    const ROOT_DIR = './';
    const MODULE_NAME = "DebugLog";

    let executionDatetime = "D." + global.EXECUTION_DATETIME.getUTCFullYear() +
        "." + pad(global.EXECUTION_DATETIME.getUTCMonth() + 1, 2) +
        "." + pad(global.EXECUTION_DATETIME.getUTCDate(), 2) +
        ".T." + pad(global.EXECUTION_DATETIME.getUTCHours(), 2) +
        "." + pad(global.EXECUTION_DATETIME.getUTCMinutes(), 2) +
        "." + pad(global.EXECUTION_DATETIME.getUTCSeconds(), 2);

    let messageId = 0;

    let thisObject = {
        bot: undefined,
        write: write,
        newInternalLoop: newInternalLoop,
        persist: persist,           // This method is executed at the end of each Main Loop.
        initialize: initialize
    };

    let accumulatedLog = "[";

    let disableLogging;

    let internalLoopCounter = -1;

    return thisObject;

    function initialize(pdisableLogging) {

        try {

            disableLogging = pdisableLogging

        } catch (err) {
            console.log("[ERROR] Debug Log -> initialize -> err = "+ err.stack);
        }
    }

    function newInternalLoop(pBot, pProcess) {


        console.log(new Date().toISOString() + " " + strPad(pBot, 20) + " " + strPad(pProcess, 30) + " Entered into Internal Loop # " + strPad(internalLoopCounter + 1, 4) + " bot.processDatetime = " + thisObject.bot.processDatetime.toISOString());

        persist();

        function strPad(str, max) {
            str = str.toString();
            return str.length < max ? strPad(" " + str, max) : str;
        }
    }

    function persist() {

        /* Here we actually write the content of the in-memory log to a blob */

        try {

            internalLoopCounter++;

            let contentToPersist = accumulatedLog;
            accumulatedLog = "[";

            const FILE_STORAGE = require('./Integrations/FileStorage.js');
            let fileStorage = FILE_STORAGE.newFileStorage();

            let filePath = thisObject.bot.filePathRoot + "/Logs/" + thisObject.bot.process + "/" + executionDatetime;

            if (thisObject.bot.debug.year !== undefined) {

                filePath = filePath + "/" + thisObject.bot.debug.year + "/" + thisObject.bot.debug.month;
            }

            let fileName;

            if (internalLoopCounter >= 0) {

                fileName = "Loop." + pad(thisObject.bot.loopCounter, 8) + "." + pad(internalLoopCounter, 4) + ".json";

            } else {

                fileName = "Loop." + pad(thisObject.bot.loopCounter, 8) + ".json";

            }

            writeLog();

            function writeLog() {

                fileStorage.createTextFile(global.DEV_TEAM, filePath + '/' + fileName, contentToPersist + '\r\n' + "]", onFileCreated);

                function onFileCreated(err) {

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        console.log("[ERROR] DebugLog -> persist -> onInizialized -> onFileCreated -> err = "+ err.stack);

                        setTimeout(writeLog, 10000); // Lets retry until we make it.
                        return;
                    }

                    contentToPersist = "";
                    //thisObject = {};
                }
            }
        } catch (err) {
            console.log("[ERROR] DebugLog -> persist -> err = "+ err.stack);
            console.log("[ERROR] DebugLog -> persist -> onInizialized -> contentToPersist = " + contentToPersist);
        }
    }


    function write(pModule, pMessage) {

        try {

            if (disableLogging === true) { return; }

            if (thisObject.bot === undefined) { return; }

            let newDate = new Date();
            newDate = newDate.toISOString();

            messageId++;

            /* When writting one file for all modules we use this. */

            let message = "['" + newDate + "'," + messageId + ",'" + pModule + "','" + pMessage + "']"
            let logLine = '\r\n' + message;

            if (process.env.CONSOLE_LOG === "true" || message.indexOf("ERROR") > 0) {
                console.log(message)
            }

            accumulatedLog = accumulatedLog + logLine;

        } catch (err) {
            console.log("[ERROR] DebugLog -> write -> err = "+ err.stack);
        }
    }

    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }

};

