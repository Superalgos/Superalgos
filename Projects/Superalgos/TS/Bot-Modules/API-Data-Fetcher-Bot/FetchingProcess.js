
exports.newSuperalgosBotModulesFetchingProcess = function (processIndex) {

    const MODULE_NAME = "Fetching Process";
    const FOLDER_NAME = "API-Data";

    thisObject = {
        initialize: initialize,
        start: start
    };

    let fileStorage = TS.projects.superalgos.taskModules.fileStorage.newFileStorage(processIndex);
    let statusDependencies

    return thisObject;

    function initialize(pStatusDependencies, callBackFunction) {
        try {
            statusDependencies = pStatusDependencies;
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
        } catch (err) {
            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(callBackFunction) {
        try {
            if (TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING === true) {
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                return
            }

            let fileContent
            getContextVariables(fetchData)

            function getContextVariables(callBack) {
                try {
                    let processNode = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent
                    let reportKey = processNode.parentNode.parentNode.config.codeName + "-" + processNode.parentNode.config.codeName + "-" + processNode.config.codeName

                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[INFO] start -> getContextVariables -> reportKey = " + reportKey)

                    if (statusDependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey)

                    if (thisReport.file.lastRun !== undefined) {
                        /*
                        If this process already ran before, then we are going to load the data stored so as to append
                        information to it later.
                        */
                        let fileName = 'Data.json'
                        let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + FOLDER_NAME + "/" + 'Single-File'
                        fileStorage.getTextFile(filePath + '/' + fileName, onFileReceived);

                        function onFileReceived(err, text) {
                            if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] start -> getContextVariables -> onFileReceived -> Could read file. ->  filePath = " + filePath + "/" + fileName);
                                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                            } else {

                                fileContent = text
                                callBack()
                            }
                        }
                    } else {
                        /*
                        If there is no status report, we assume there is no previous file or that if there is we will override it.
                        */
                        callBack()
                    }
                } catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> getContextVariables -> err = " + err.stack);
                    if (err.message === "Cannot read property 'file' of undefined") {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> Check the bot Status Dependencies. ");
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys));
                    }
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                    abort = true
                }
            }

            function fetchData() {
                try {
                    let processNode = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent

                    if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].apiMapReference === undefined) {
                        // TODO Error Handling
                        return
                    }

                    let apiMAP = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].apiMapReference.referenceParent
                    if (apiMAP === undefined) {
                        // TODO Error Handling
                        return
                    }

                    let hostName
                    let portNumber = ""
                    let path = ""
                    let protocol = "https" // default value

                    if (apiMAP.config.hostName === undefined || apiMAP.config.hostName === "") {
                        // TODO Error Handling
                        return
                    }

                    if (apiMAP.config.portNumber !== undefined && apiMAP.config.portNumber !== "") {
                        portNumber = ":" + apiMAP.config.portNumber
                    }

                    if (apiMAP.config.protocol !== undefined && apiMAP.config.protocol !== "") {
                        protocol = apiMAP.config.protocol
                    }

                    if (apiMAP.config.path !== undefined && apiMAP.config.path !== "") {
                        path = "/" + apiMAP.config.path
                    }

                    if (apiMAP.apiVersions.length === 0) {
                        // TODO Error Handling
                        return
                    }
                    if (processNode.processOutput === undefined) {
                        // TODO Error Handling
                        return
                    }

                    for (let i = 0; i < processNode.processOutput.outputDatasets.length; i++) {
                        let outputDataset = processNode.processOutput.outputDatasets[i]
                        if (outputDataset.referenceParent === undefined) {
                            continue
                        }
                        if (outputDataset.referenceParent.parentNode === undefined) {
                            continue
                        }
                        let productDefinition = outputDataset.referenceParent.parentNode
                        let endpoint
                        /*
                        To get the endpoint node, we will go through the references at the Record Definition. 
                        We will check that all references are pointing to fields belonging to the same Endpoint node.                    
                        */
                        for (let j = 0; j < productDefinition.record.properties.length; j++) {
                            let recordProperty = productDefinition.record.properties[j]
                            if (recordProperty.apiResponseFieldReference !== undefined) {
                                if (recordProperty.apiResponseFieldReference.referenceParent !== undefined) {
                                    let apiResponseField = recordProperty.apiResponseFieldReference.referenceParent
                                    let endpointFound = TS.projects.superalgos.utilities.nodeFunctions.findNodeInNodeMesh(apiResponseField, 'API Endpoint')

                                    if (endpointFound === undefined) {
                                        // TODO Error Handling
                                        return
                                    }

                                    if (endpoint === undefined) {
                                        /* The first enpoint found will be our endpoint */
                                        endpoint = endpointFound
                                    }

                                    if (endpointFound.id !== endpoint.id) {
                                        // TODO Error Handling - we can not reference fields from different enpoints.
                                        return
                                    }
                                }
                            }
                        }
                        /*
                        Let's see if we need to place the API call with Parameters...
                        */
                        let queryString = ""
                        let separator = ""
                        if (productDefinition.apiQueryParameters !== undefined) {
                            queryString = '?'
                            for (j = 0; j < productDefinition.apiQueryParameters.length; j++) {
                                let apiQueryParameter = productDefinition.apiQueryParameters[j]
                                queryString = queryString + separator + apiQueryParameter.config.codeName + '=' + apiQueryParameter.config.value
                                separator = "&"
                            }
                        }
                        /* 
                        Now that we have the Endpoint, we can call the API.
                        */
                        let http = require('http');
                        let url = protocol + '://' +
                            hostName +
                            portNumber +
                            path +
                            '/' + endpoint.config.codeName +
                            queryString

                        http.get(url, onResponse);

                        function onResponse(response) {
                            const chunks = []
                            response.on('data', onDataArrived)
                            response.on('end', onEnd)

                            function onDataArrived(chunk) {
                                chunks.push(chunk)
                            }

                            function onEnd() {
                                let dataReceived = Buffer.concat(chunks).toString('utf8')

                                if (fileContent !== undefined) {
                                    // we are going to append the curernt dataReceived to the existing file.
                                    let fileContentArray = JSON.parse(fileContent)
                                    let dataReceivedArray = JSON.parse(dataReceived)

                                    for (let i = 0; i < dataReceivedArray.length; i++) {
                                        let message = dataReceivedArray[i]
                                        fileContentArray.push(message)
                                    }

                                    fileContent = JSON.stringify(fileContentArray)
                                } else {
                                    // we are going to save the current dataReceived.
                                    fileContent = dataReceived
                                }

                                let fileName = 'Data.json'
                                let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + FOLDER_NAME + "/" + 'Single-File'
                                fileStorage.createTextFile(filePath + '/' + fileName, fileContent + '\n', onFileCreated);

                                function onFileCreated(err) {
                                    if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] start -> fetchData -> onResponse -> onEnd -> onFileCreated -> Could not save file. ->  filePath = " + filePath + "/" + fileName);
                                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                    } else {
                                        writeStatusReport()
                                    }
                                }
                            }
                        }
                    }
                } catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> fetchData -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                    abort = true
                }
            }

            function writeStatusReport() {
                try {
                    thisReport.file = {
                        lastRun: (new Date()).toISOString()
                    };
                    thisReport.save(onSaved);

                    function onSaved(err) {
                        if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> writeStatusReport -> onSaved -> err = " + err.stack);
                            callBackFunction(err);
                            return;
                        }
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                    }
                } catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> writeStatusReport -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }
        } catch (err) {
            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] start -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }
};
