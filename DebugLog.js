exports.newDebugLog = function newDebugLog() {

    const ROOT_DIR = './';
    const MODULE_NAME = "DebugLog";

    let executionDatetime = "D." + global.EXECUTION_DATETIME.getUTCFullYear() +
        "." + pad(global.EXECUTION_DATETIME.getUTCMonth() + 1, 2) +
        "." + pad(global.EXECUTION_DATETIME.getUTCDate(), 2) +
        ".T." + pad(global.EXECUTION_DATETIME.getUTCHours(),2) +
        "." + pad(global.EXECUTION_DATETIME.getUTCMinutes(),2) +
        "." + pad(global.EXECUTION_DATETIME.getUTCSeconds(),2);  

    let messageId = 0;

    let thisObject = {
        bot: undefined,
        write: write,
        persist: persist,
        initialize: initialize
    };

    let blobContent = "[";

    let disableLogging;

    return thisObject;

    function initialize(pdisableLogging) {

        try {

            disableLogging = pdisableLogging

        } catch (err) {
            console.log("[ERROR] Debug Log -> initialize -> err = " + err.message);
        }
    }

    function persist() {

        /* Here we actually write the content of the in-memory log to a blob */

        try {

            if (global.CURRENT_EXECUTION_AT === "Browser") {

                //console.log("[INFO] DebugLog -> persist -> We do not persist logs while running at the Browser");
                return;

            }

            const BLOB_STORAGE = require(ROOT_DIR + 'BlobStorage');
            let cloudStorage = BLOB_STORAGE.newBlobStorage(thisObject.bot);

            cloudStorage.initialize(thisObject.bot.devTeam, onInizialized, true);

            function onInizialized(err) {

                try {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        let filePath = thisObject.bot.filePathRoot + "/Logs/" + thisObject.bot.process + "/" + executionDatetime;

                        if (thisObject.bot.debug.year !== undefined) {

                            filePath = filePath + "/" + thisObject.bot.debug.year + "/" + thisObject.bot.debug.month;
                        }

                        let fileName = "Loop." + pad(thisObject.bot.loopCounter, 8) + ".json";

                        writeLog();

                        function writeLog() {

                            cloudStorage.createTextFile(filePath, fileName, blobContent + '\r\n' + "]", onFileCreated);

                            function onFileCreated(err) {

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    console.log("[ERROR] DebugLog -> persist -> onInizialized -> onFileCreated -> err = " + err.message);
                                    console.log("[ERROR] DebugLog -> persist -> onInizialized -> onFileCreated -> filePath = " + filePath);
                                    console.log("[ERROR] DebugLog -> persist -> onInizialized -> onFileCreated -> fileName = " + fileName);

                                    setTimeout(writeLog, 10000); // Lets retry until we make it.
                                    return;
                                }

                                //blobContent = "";
                                //thisObject = {};
                            }
                        }

                    } else {

                        console.log("[ERROR] DebugLog -> persist -> onInizialized -> cloud storge failed to initialize. ");
                        console.log("[ERROR] DebugLog -> persist -> onInizialized -> err.message = " + err.message);

                    }

                } catch (err) {
                    console.log("[ERROR] DebugLog -> persist -> onInizialized -> err = " + err.message);
                }
            }

        } catch (err) {
            console.log("[ERROR] DebugLog -> persist -> err = " + err.message);
        }
    }


    function write(pModule, pMessage) {

        try {

            if (disableLogging === true) { return; }

            if (global.CURRENT_EXECUTION_AT === "Browser") {

                /* Only at the browser we send the messages to the console. At the Cloud it does not make sense. */

                console.log("AACloud" + spacePad(pModule, 50) + " : " + pMessage);
                return;
            }

            if (global.CURRENT_EXECUTION_AT === "Cloud") {

                /* Only ERRORs go to the cloud console. */

                if (pMessage.indexOf("[ERROR]") >= 0) {

                    let now = new Date;
                    console.log(now.toUTCString() + " AACloud" + spacePad(pModule, 15) + " : " + pMessage);

                }
            }
            
            if (thisObject.bot === undefined) { return; }

            let newDate = new Date();
            newDate = newDate.toISOString();

            messageId++;

            /* When writting one file for all modules we use this. */

            let logLine = '\r\n' + "['" + newDate + "'," + messageId + ",'" + pModule + "','" + pMessage + "']";

            blobContent = blobContent + logLine;
            
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

