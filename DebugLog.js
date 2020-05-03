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
        initialize: initialize,
        finalize: finalize
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

    function finalize() {
        persist()
    }

    function newInternalLoop(pBot, pProcess, date, percentage) {
        if (percentage === undefined) {
            percentage = ""
        } else {
            percentage = percentage.toFixed(2) + " %"
        }

        if (date === undefined) { date = thisObject.bot.processDatetime }
        date = date.getUTCFullYear() + '-' + strPad(date.getUTCMonth() + 1, 2, "0") + '-' + strPad(date.getUTCDate(), 2, "0");

        console.log(new Date().toISOString() + " " + strPad(thisObject.bot.exchange, 20) + " " + strPad(thisObject.bot.market.baseAsset + '/' + thisObject.bot.market.quotedAsset, 10) + " " + strPad(pBot, 30) + " " + strPad(pProcess, 30)
            + "      Internal Loop # " + strPad(internalLoopCounter + 1, 8) + " " + strPad(date, 30) + " " + strPad(percentage, 10)) 

        persist();

        function strPad(str, max, fill) {
            if (fill === undefined) {fill = " "}
            str = str.toString();
            return str.length < max ? strPad(fill + str, max) : str;
        }
    }

    function persist() {

        /* Here we actually write the content of the in-memory log to a file */

        try {
            if (accumulatedLog === "[") {return} // nothing to persist at the moment.

            internalLoopCounter++;

            let contentToPersist = accumulatedLog;
            accumulatedLog = "[";

            const FILE_STORAGE = require('./FileStorage.js');
            let fileStorage = FILE_STORAGE.newFileStorage();

            let filePath = thisObject.bot.filePathRoot + "/Logs/" + thisObject.bot.process + "/"

            if (thisObject.bot.SESSION !== undefined) {
                filePath = filePath + thisObject.bot.SESSION.folderName + "/" + executionDatetime;     
            } else {
                filePath = filePath + executionDatetime;
            }

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

            /* This is the implementation of the mechanism to auto-mantain logs. */
            if (contentToPersist.indexOf('[ERROR]') < 0) {
                thisObject.bot.LOGS_TO_DELETE_QUEUE.push(filePath + '/' + fileName)
            }
            if (thisObject.bot.LOGS_TO_DELETE_QUEUE.length > thisObject.bot.DELETE_QUEUE_SIZE) {
                let fileToDelete = thisObject.bot.LOGS_TO_DELETE_QUEUE[0]
                thisObject.bot.LOGS_TO_DELETE_QUEUE.splice(0, 1)
                /* Will delete this file only if it does not contains ERROR inside. */
                let fileContent = fileStorage.getTextFile(fileToDelete, onGetFile, true) 
                function onGetFile(err, fileContent) {
                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                        if (fileContent.indexOf("ERROR") < 0) {
                            /* Logs will only be deleted when they contain no ERROR in them. */
                            fileStorage.deleteTextFile(fileToDelete);
                        } 
                    } else {
                        fileStorage.deleteTextFile(fileToDelete);
                    }
                }
            }
             
            function writeLog() {

                fileStorage.createTextFile(filePath + '/' + fileName, contentToPersist + '\r\n' + "]", onFileCreated);
                function onFileCreated(err) {
                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        console.log("[ERROR] DebugLog -> persist -> onInizialized -> onFileCreated -> err = "+ err.message);
                        setTimeout(writeLog, 10000); // Lets retry until we make it.
                        return;
                    }
                    contentToPersist = "";
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

            if (pModule === "") { // For debugging purposes
                console.log(pMessage)
            }

            let newDate = new Date();
            newDate = newDate.toISOString();

            messageId++;

            /* When writting one file for all modules we use this. */

            let message = "['" + newDate + "'," + messageId + ",'" + pModule + "','" + pMessage + "']"
            let logLine = '\r\n' + message;

            if (process.env.CONSOLE_LOG === "true" || message.indexOf("ERROR") > 0) {
                let key = ''
                if (thisObject.bot) {
                    key = thisObject.bot.dataMine + '-' + thisObject.bot.codeName + '-' + thisObject.bot.process
                }
                console.log('*********** ' + message + ' @ ' + key)
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

