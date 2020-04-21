
exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, FILE_STORAGE, STATUS_REPORT, EXCHANGE_API) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;
    const MODULE_NAME = "User Bot";
    const FOLDER_NAME = "External-Signals";

    thisObject = {
        initialize: initialize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(bot, logger)
    let fileStorage = FILE_STORAGE.newFileStorage(logger);
    let statusDependencies

    return thisObject;

    function initialize(pStatusDependencies, callBackFunction) {
        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            statusDependencies = pStatusDependencies;

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(callBackFunction) {
        try {

            if (global.STOP_TASK_GRACEFULLY === true) {
                callBackFunction(global.DEFAULT_OK_RESPONSE);
                return
            }

            let fileContent

            getContextVariables(saveMessages)
 
            function getContextVariables(callBack) {

                try {
                    let reportKey;

                    reportKey = "Masters" + "-" + "Webhooks" + "-" + "Check-Webhook" + "-" + "dataSet.V1";

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    if (statusDependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey)

                    if (thisReport.file.lasrRun !== undefined) {
                  
                        let fileName = 'Data.json'
                        let filePath = bot.filePathRoot + "/Output/" + FOLDER_NAME + "/" + 'Single-File'
                        fileStorage.getTextFile(filePath + '/' + fileName, onFileReceived);

                        function onFileReceived(err, text) {
                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> onFileReceived -> Could read file. ->  filePath = " + filePath + "/" + fileName);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            } else {

                                fileContent = text
                                callBack()
                            }
                        }
                    } else { // If there is no status report, we assume there is no previous file or that if there is we will override it.
                        callBack()
                    } 


                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> err = " + err.stack);
                    if (err.message === "Cannot read property 'file' of undefined") {
                        logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> Check the bot Status Dependencies. ");
                        logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys));
                    }
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    abort = true
                }
            }

            function saveMessages() {
                try {

                    let http = require('http');
                    let url =   'http://' + process.env.WEB_SERVER_URL +
                                ':' + process.env.WEB_SERVER_PORT +
                                '/Webhook/Fetch-Messages/' +
                                bot.exchange + "/" +
                                bot.market.baseAsset + "-" + bot.market.quotedAsset

                    http.get(url, onResponse);

                    function onResponse(response) {

                        const chunks = []

                        response.on('data', onMessegesArrived)
                        response.on('end', onEnd)

                        function onMessegesArrived(chunk) {
                            chunks.push(chunk)
                        }

                        function onEnd() {
                            let messages = Buffer.concat(chunks).toString('utf8')

                            if (fileContent !== undefined) {
                                // we are going to append the curernt messages to the existing file.
                                let fileContentArray = JSON.parse(fileContent)
                                let messagesArray = JSON.parse(messages) 

                                for (let i = 0; i < messagesArray.length; i++) {
                                    let message = messagesArray[i]
                                    fileContentArray.push(message)
                                }

                                fileContent = JSON.stringify(fileContentArray)
                            } else {
                                // we are going to save the current messages.
                                fileContent = messages
                            }

                            let fileName = 'Data.json'
                            let filePath = bot.filePathRoot + "/Output/" + FOLDER_NAME + "/" + 'Single-File'
                            fileStorage.createTextFile(filePath + '/' + fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated(err) {
                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> saveMessages -> onResponse -> onEnd -> onFileCreated -> Could not save file. ->  filePath = " + filePath + "/" + fileName);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                } else {
                                    writeStatusReport()
                                }
                            }
                        }
                    }

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> saveMessages -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    abort = true
                }
            }

            function writeStatusReport() {
                try {
   
                    thisReport.file = {
                        lasrRun: (new Date()).toISOString()
                    };

                    thisReport.save(onSaved);

                    function onSaved(err) {
                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> onSaved -> err = " + err.stack);
                            callBackFunction(err);
                            return;
                        }
                        callBackFunction(global.DEFAULT_OK_RESPONSE);
                    }
                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }


        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
