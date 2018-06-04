exports.newDebugLog = function newDebugLog() {

    const ROOT_DIR = './';
    const MODULE_NAME = "DebugLog";

    let executionDatetime = "Y." + global.EXECUTION_DATETIME.getUTCFullYear() +
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

    let disableLogging;

    return thisObject;

    function initialize(pdisableLogging) {

        disableLogging = pdisableLogging

        if (disableLogging !== true) {
            thisObject.bot.eventHandler.listenToEvent("Close Log File", onLoopFinished);
        }
    }

    function onLoopFinished(event) {

        try {

            const BLOB_STORAGE = require(ROOT_DIR + 'BlobStorage');
            let cloudStorage = BLOB_STORAGE.newBlobStorage(thisObject.bot);

            cloudStorage.initialize(thisObject.bot.devTeam, onInizialized, true);

            function onInizialized(err) {

                try {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        /* We save a file for the module doing the logging at this instance of DebugLog. */

                        let filePath = thisObject.bot.filePathRoot + "/Logs/" + thisObject.bot.process + "/" + executionDatetime;

                        if (thisObject.bot.debug.year !== undefined) {

                            filePath = filePath + "/" + thisObject.bot.debug.year + "/" + thisObject.bot.debug.month;
                        }

                        if (loopCounter === undefined) { loopCounter = 0 };

                        filePath = filePath + "/Loop." + pad(loopCounter, 5);

                        cloudStorage.createTextFile(filePath, thisObject.fileName + ".json", blobContent + '\r\n' + "]", onFileCreated);

                        function onFileCreated(err) {

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                console.log("[ERROR] DebugLog -> onLoopFinished -> onInizialized -> onFileCreated -> err = " + err.message);
                                return;
                            }
                        }

                        /* We save a single file for the whole Process of the bot, inlcuding AACloud modules. */

                        if (thisObject.bot.sharedLogFileMap !== undefined) {

                            let fileSaved = thisObject.bot.sharedLogFileMap.get(loopCounter);

                            if (fileSaved !== true) {

                                thisObject.bot.sharedLogFileMap.set(loopCounter, true);

                                let sharedFileContent = "[";

                                for (let i = 0; i < thisObject.bot.blobContent.length; i++) {

                                    sharedFileContent = sharedFileContent + thisObject.bot.blobContent[i];
                                }

                                thisObject.bot.blobContent = [];

                                sharedFileContent = sharedFileContent + '\r\n' + "]";

                                cloudStorage.createTextFile(filePath, "AllModules" + ".json", sharedFileContent, onSharedFileCreated);

                                function onSharedFileCreated(err) {

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                        console.log("[ERROR] DebugLog -> onLoopFinished -> onInizialized -> onSharedFileCreated -> err = " + err.message);
                                        return;
                                    }
                                }
                            }

                        } else {
                            console.log("[ERROR] DebugLog -> onLoopFinished -> onInizialized -> err = " + err.message);
                        }

                    } else {
                        console.log("[ERROR] DebugLog -> onLoopFinished -> onInizialized -> sharedLogFileMap is undefined. ");
                    }

                } catch (err) {
                    console.log("[ERROR] DebugLog -> onLoopFinished -> onInizialized -> err = " + err.message);
                }
            }

        } catch (err) {
            console.log("[ERROR] DebugLog -> onLoopFinished -> err = " + err.message);
        }
    }

    function write(Message) {

        try {

            if (disableLogging === true) { return; }

            console.log("AACloud" + spacePad(thisObject.fileName, 50) + " : " + Message);

            if (thisObject.bot === undefined) { return; }

            if (thisObject.bot.loopCounter !== loopCounter) {

                if (thisObject.forceLoopSplit === false) {

                    if (loopIncremented === false) {

                        loopIncremented = true;

                        loopCounter = thisObject.bot.loopCounter;

                        blobContent = "[";                  // Local version
                    }
                } else {

                    loopIncremented = true;

                    loopCounter = thisObject.bot.loopCounter;

                }
            }

            let newDate = new Date();
            newDate = newDate.toISOString();

            messageId++;

            /* When writing one file pero module we need this. */

            let fileLine = '\r\n' + "['" + newDate + "'," + messageId + ",'" + Message + "']";

            if (blobContent === "[") {

                blobContent = blobContent + fileLine;

            } else {

                blobContent = blobContent + "," + fileLine;
            }

            /* When writting one file for all modules we use this. */

            let sharedFileLine;

            if (thisObject.bot.blobContent === undefined || thisObject.bot.blobContent.length === 0) {

                thisObject.bot.blobContent = [];
                sharedFileLine = '\r\n' + "['" + newDate + "'," + (thisObject.bot.blobContent.length + 1) + ",'" + thisObject.fileName + "','" + Message + "']";
                thisObject.bot.blobContent.push(sharedFileLine.toString());

            } else {
                sharedFileLine = '\r\n' + "['" + newDate + "'," + (thisObject.bot.blobContent.length + 1) + ",'" + thisObject.fileName + "','" + Message + "']";
                thisObject.bot.blobContent.push("," + sharedFileLine.toString());
            }
            

        } catch (err) {
            console.log("[ERROR] DebugLog -> write -> err = " + err.message);
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

