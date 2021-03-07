exports.newSuperalgosTaskModulesDebugLog = function (processIndex) {

    const MODULE_NAME = "DebugLog";

    let executionDatetime = "D." + TS.projects.superalgos.globals.nodeJSConstants.EXECUTION_DATETIME.getUTCFullYear() +
        "." + pad(TS.projects.superalgos.globals.nodeJSConstants.EXECUTION_DATETIME.getUTCMonth() + 1, 2) +
        "." + pad(TS.projects.superalgos.globals.nodeJSConstants.EXECUTION_DATETIME.getUTCDate(), 2) +
        ".T." + pad(TS.projects.superalgos.globals.nodeJSConstants.EXECUTION_DATETIME.getUTCHours(), 2) +
        "." + pad(TS.projects.superalgos.globals.nodeJSConstants.EXECUTION_DATETIME.getUTCMinutes(), 2) +
        "." + pad(TS.projects.superalgos.globals.nodeJSConstants.EXECUTION_DATETIME.getUTCSeconds(), 2);

    let messageId = 0;

    let thisObject = {
        write: write,
        newMainLoop: newMainLoop,
        newInternalLoop: newInternalLoop,
        persist: persist,           // This method is executed at the end of each Main Loop.
        finalize: finalize
    };

    let accumulatedLog = "[";
    let internalLoopCounter = -1;

    return thisObject;

    function finalize() {
        persist()
    }

    function strPad(str, max, fill) {
        if (fill === undefined) { fill = " " }
        str = str.toString();
        return str.length < max ? strPad(fill + str, max) : str;
    }

    function logLoop(date, percentage, loopType) {
        console.log(
            new Date().toISOString() +
            " " +
            strPad(
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name
                , 20) +
            " " +
            strPad(
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName +
                '/' +
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                , 10) +
            " " +
            strPad(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName, 20) +
            " " +
            strPad(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName, 30) +
            " " +
            strPad(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName, 30) +
            loopType +
            strPad(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).MAIN_LOOP_COUNTER, 8) +
            " " +
            strPad(date, 30) +
            " " +
            strPad(percentage, 10)
        )
    }

    function newMainLoop() {
        logLoop('', '', "          Main Loop # ")
    }

    function newInternalLoop(date, percentage) {
        if (percentage === undefined) {
            percentage = ""
        } else {
            percentage = percentage.toFixed(2) + " %"
        }

        if (date === undefined) { date = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME }
        date = date.getUTCFullYear() + '-' + strPad(date.getUTCMonth() + 1, 2, "0") + '-' + strPad(date.getUTCDate(), 2, "0");

        logLoop(date, percentage, "      Internal Loop # ")

        persist();
    }

    function persist() {

        /* Here we actually write the content of the in-memory log to a file */

        try {
            if (accumulatedLog === "[") { return } // nothing to persist at the moment.

            internalLoopCounter++;

            let contentToPersist = accumulatedLog;
            accumulatedLog = "[";

            
            let fileStorage = TS.projects.superalgos.taskModules.fileStorage.newFileStorage(processIndex);

            let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Logs/" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName + "/"

            if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME !== undefined) {
                filePath = filePath + TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME + "/" + executionDatetime;
            } else {
                filePath = filePath + executionDatetime;
            }

            let fileName;
            if (internalLoopCounter >= 0) {
                fileName = "Loop." + pad(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).MAIN_LOOP_COUNTER, 8) + "." + pad(internalLoopCounter, 4) + ".json";
            } else {
                fileName = "Loop." + pad(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).MAIN_LOOP_COUNTER, 8) + ".json";
            }

            writeLog();

            /* This is the implementation of the mechanism to auto-mantain logs. */
            if (contentToPersist.indexOf('[ERROR]') < 0 && contentToPersist.indexOf('[PERSIST]') < 0 && contentToPersist.indexOf('[IMPORTANT]') < 0) {
                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).LOGS_TO_DELETE_QUEUE.push(filePath + '/' + fileName)
            }
            if (TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).LOGS_TO_DELETE_QUEUE.length > TS.projects.superalgos.globals.loggerVariables.DELETE_QUEUE_SIZE) {
                let fileToDelete = TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).LOGS_TO_DELETE_QUEUE[0]
                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).LOGS_TO_DELETE_QUEUE.splice(0, 1)
                /* Will delete this file only if it does not contains ERROR inside. */
                let fileContent = fileStorage.getTextFile(fileToDelete, onGetFile, true)
                function onGetFile(err, fileContent) {
                    if (err.result === TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
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

                fileStorage.createTextFile(filePath + '/' + fileName, contentToPersist + '\r\n' + "]", onFileCreated, undefined, true);
                function onFileCreated(err) {
                    if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                        console.log("[ERROR] DebugLog -> persist -> onInizialized -> onFileCreated -> err = " + err.message);
                        setTimeout(writeLog, 10000); // Lets retry until we make it.
                        return;
                    }
                    contentToPersist = "";
                }
            }
        } catch (err) {
            console.log("[ERROR] DebugLog -> persist -> err = " + err.stack);
            console.log("[ERROR] DebugLog -> persist -> onInizialized -> contentToPersist = " + contentToPersist);
        }
    }


    function write(pModule, pMessage) {
        try {
            if (pModule === "") { // For debugging purposes
                console.log(pMessage)
            }

            let newDate = new Date();
            newDate = newDate.toISOString();

            messageId++;

            /* When writting one file for all modules we use this. */

            let message = "['" + newDate + "'," + messageId + ",'" + pModule + "','" + pMessage + "']"
            let logLine = '\r\n' + message;

            if (message.indexOf("ERROR") > 0) {
                let key = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + '-' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + '-' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName
                console.log('*********** ' + message + ' @ ' + key)
            }

            accumulatedLog = accumulatedLog + logLine;

        } catch (err) {
            console.log("[ERROR] DebugLog -> write -> err = " + err.stack);
        }
    }

    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }

};

