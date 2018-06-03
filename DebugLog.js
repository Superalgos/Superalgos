exports.newDebugLog = function newDebugLog() {

    const ROOT_DIR = './';
    const MODULE_NAME = "DebugLog";

    let executionDatetime = ".Y." + global.EXECUTION_DATETIME.getUTCFullYear() +
        ".M." + pad(global.EXECUTION_DATETIME.getUTCMonth() + 1, 2) +
        ".D." + pad(global.EXECUTION_DATETIME.getUTCDate(), 2) +
        ".H." + pad(global.EXECUTION_DATETIME.getUTCHours(),2) +
        ".M." + pad(global.EXECUTION_DATETIME.getUTCMinutes(),2) +
        ".S." + pad(global.EXECUTION_DATETIME.getUTCSeconds(),2);  

    let messageId = 0;
    let loopCounter;
    let loopIncremented = false;

    let thisObject = {
        bot: undefined,
        fileName: undefined,
        forceLoopSplit: false,          // When set to 'true' this will force that the logs of the current module are split in many different Loop folders.
        write: write,
        initialize: initialize
    };

    let blobContent = "[";

    let disableCloudLogging;

    return thisObject;

    function initialize(pDisableCloudLogging) {

        disableCloudLogging = pDisableCloudLogging

        if (disableCloudLogging !== true) {
            thisObject.bot.eventHandler.listenToEvent("Loop Finished", onLoopFinished);
        }
    }

    function onLoopFinished(event) {

        try {

            const BLOB_STORAGE = require(ROOT_DIR + 'BlobStorage');
            let cloudStorage = BLOB_STORAGE.newBlobStorage(thisObject.bot);

            cloudStorage.initialize(thisObject.bot.devTeam, onInizialized, true);

            function onInizialized(err) {

                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                    let filePath = thisObject.bot.filePathRoot + "/Logs/" + thisObject.bot.process + "/" + executionDatetime;

                    if (thisObject.bot.debug.year !== undefined) {

                        filePath = filePath + "/" + thisObject.bot.debug.year + "/" + thisObject.bot.debug.month;
                    }

                    if (loopCounter === undefined) { loopCounter = 0 };

                    filePath = filePath + "/Loop." + pad(loopCounter, 5);

                    cloudStorage.createTextFile(filePath, thisObject.fileName + ".json", blobContent + '\n' + "]", onFileCreated);

                    function onFileCreated(err) {

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            console.log("[ERROR] Debug-Log -> onLoopFinished -> onInizialized -> onFileCreated -> err = " + err.message);
                            return;
                        }
                    }

                } else {
                    console.log("[ERROR] Debug-Log -> onLoopFinished -> onInizialized -> err = " + err.message);
                }
            }

        } catch (err) {
            console.log("[ERROR] Debug-Log -> onLoopFinished -> err = " + err.message);
        }
    }

    function write(Message) {

        try {

            console.log("AACloud" + spacePad(thisObject.fileName, 50) + " : " + Message);

            if (thisObject.bot === undefined) { return; }

            if (thisObject.bot.loopCounter !== loopCounter) {

                if (thisObject.forceLoopSplit === false) {

                    if (loopIncremented === false) {

                        loopIncremented = true;

                        loopCounter = thisObject.bot.loopCounter;

                        blobContent = "[";
                    }
                } else {

                    loopIncremented = true;

                    loopCounter = thisObject.bot.loopCounter;

                }
            }

            let newDate = new Date();
            newDate = newDate.toISOString();

            messageId++;

            let line = {
                date: newDate,
                sec: messageId,
                data: Message
            };

            let fileLine = '\r\n' + JSON.stringify(line);

            if (blobContent === "[") {

                blobContent = blobContent + fileLine;

            } else {

                blobContent = blobContent + "," + fileLine;
            }
        } catch (err) {
            console.log("[ERROR] Debug-Log -> write -> err = " + err.message);
        }
    }

    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }

    function spacePad(str, max) {
        str = str.toString();
        return str.length < max ? spacePad(" " + str, max) : str;
    }

};

