
exports.newSuperalgosBotModulesFetchingProcess = function (processIndex) {

    const MODULE_NAME = "Fetching Process";

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

            let thisReport          // This holds the status report.

            getContextVariables()
            startProcess()

            function getContextVariables() {
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
                }
            }

            function startProcess() {
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
                    } else {
                        hostName = apiMAP.config.hostName
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
                    /*
                    Process Output Datasets determine which Datasets are going to be built by 
                    this process. We will loop though all of them and build a file for each.
                    If the file already exists, we will add new information to it.
                    */
                    for (let i = 0; i < processNode.processOutput.outputDatasets.length; i++) {
                        let outputDataset = processNode.processOutput.outputDatasets[i]
                        if (outputDataset.referenceParent === undefined) {
                            continue
                        }
                        if (outputDataset.referenceParent.parentNode === undefined) {
                            continue
                        }
                        let productDefinition = outputDataset.referenceParent.parentNode    // This is the Product Definition Node related to the current Output Dataset.
                        let endpointNode                                                    // This holds the Endpoint Node at the API Map 
                        let existingFileContent                                             // This holds the data of the existing dataset file.
                        let queryString = ""                                                // This holds the query string to be sent at the API call.
                        let apiDataReceived                                                 // This hold the data received from the latest API call.
                        let dataReceivedArray = []                                          // This hold the cumulative data received from all calls to the API (multiple pages of data).
                        let pageNumberParameter                                             // This holds the node that represents a Page Number parameter.
                        let pageQueryString                                                 // This holds the node part of query sting that deals with page numbers 
                        let lastPage = {}                                                   // This holds the last page fetched for each endpoint

                        getApiEndpoint()
                        getEndpointQueryParameters()
                        fetchAllPages()
                        readDatasetFile()
                        appendToExistingDataset()
                        saveDatasetFile()

                        function getApiEndpoint() {
                            /*
                            We will assume that each Dataset is built fetching data from a single endpointNode at the target API.                        
                            To get the endpointNode node, we will go through the references at the Record Definition. 
                            We will check that all references are pointing to fields belonging to the same endpointNode node.
                            If they are not, we will consider the user did not define well the relationaships between nodes
                            and abort the process.                    
                            */
                            for (let j = 0; j < productDefinition.record.properties.length; j++) {
                                let recordProperty = productDefinition.record.properties[j]
                                if (recordProperty.apiResponseFieldReference !== undefined) {
                                    if (recordProperty.apiResponseFieldReference.referenceParent !== undefined) {
                                        let apiResponseField = recordProperty.apiResponseFieldReference.referenceParent
                                        let endpointNodeFound = TS.projects.superalgos.utilities.nodeFunctions.findNodeInNodeMesh(apiResponseField, 'API endpoint')

                                        /*
                                        Every Record Property with an apiResponseFieldReference must be on the path 
                                        to a certain enpoint.
                                        */
                                        if (endpointNodeFound === undefined) {
                                            // TODO Error Handling
                                            return
                                        }

                                        if (endpointNode === undefined) {
                                            /* The first endpointNode found will be our endpointNode */
                                            endpointNode = endpointNodeFound
                                        }

                                        /*
                                        Here we check all enpoints are actually the same endpoiht.
                                        */
                                        if (endpointNodeFound.id !== endpointNode.id) {
                                            // TODO Error Handling - we can not reference fields from different enpoints.
                                            return
                                        }
                                    }
                                }
                            }
                        }

                        function getEndpointQueryParameters() {
                            /*
                            Parameters to tue query of the API are all optional. Here we will see if
                            we need to place the API call with Parameters...
                            */
                            let separator = ""
                            if (productDefinition.apiQueryParameters !== undefined) {
                                queryString = '?'
                                for (j = 0; j < productDefinition.apiQueryParameters.apiQueryParameters.length; j++) {
                                    let apiQueryParameter = productDefinition.apiQueryParameters.apiQueryParameters[j]

                                    /*
                                    There is a special parameter which has a flag to indicate is a Page Number.
                                    This will be treated differently since we will need to iterate to get each possible page.
                                    The page number will no be added here to the query string.
                                    */
                                    if (apiQueryParameter.config.isPageNumber === true) {
                                        pageNumberParameter = apiQueryParameter
                                    } else {
                                        queryString = queryString + separator + apiQueryParameter.config.codeName + '=' + apiQueryParameter.config.value
                                        separator = "&"
                                    }
                                }
                            }
                        }

                        async function fetchAllPages() {

                            if (pageNumberParameter === undefined) {
                                /* 
                                There is no paging mechanism at this Endpoint, so we will just make an
                                Async call to the API Server 
                                */
                                await fetchAPIData()
                                dataReceivedArray = JSON.parse(apiDataReceived)
                            } else {
                                /*
                                There is a paging mechanism at this Endpoint, so we will iterate through all
                                the available pages. If this process was ran before, we will have at the Status
                                Report the latest page fetched. We will fetch that one again, since it might have 
                                been not full the last time we fetched it. We will assume there will be a huge amount
                                of pages available to fetch, and we will also assume that once we get an empty array
                                that will mean that we have requested already the last page with data.
                                */
                                let initialPage = 1
                                let finalPage = MAX_SAFE_INTEGER
                                if (thisReport.file.lastPage !== undefined) {
                                    initialPage = thisReport.file.lastPage[endpointNode.config.codeName]
                                }
                                for (let page = initialPage; page < finalPage; page++) {
                                    if (queryString === "") {
                                        queryString = "?" + pageNumberParameter.config.codeName + "=" + page
                                    } else {
                                        queryString = queryString + "&" + pageNumberParameter.config.codeName + "=" + page
                                    }
                                    lastPage[endpointNode.config.codeName] = page
                                    await fetchAPIData()
                                    /*
                                    This is how we accumulate the data from multiple pages into a single array.
                                    */
                                    let latestDataReceivedArray = JSON.parse(apiDataReceived)
                                    dataReceivedArray = dataReceivedArray.concat(latestDataReceivedArray)
                                }
                            }
                        }

                        async function fetchAPIData() {
                            let promise = new Promise((resolve, reject) => {
                                /* 
                                Now that we have the endpointNode, the parameters and all the information 
                                needed to place the call to the API.
                                */
                                let http = require('http');
                                let url = protocol + '://' +
                                    hostName +
                                    portNumber +
                                    path +
                                    '/' + endpointNode.config.codeName +
                                    queryString +
                                    pageQueryString

                                /*
                                This is how we call the API.
                                */
                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[INFO] start -> startProcess -> fetchAPIData -> http.get ->  url = " + url)

                                http.get(url, onResponse)

                                function onResponse(response) {
                                    const chunks = []
                                    response.on('data', onDataArrived)
                                    response.on('end', onEnd)

                                    function onDataArrived(chunk) {
                                        chunks.push(chunk)
                                    }
                                }

                                function onEnd() {
                                    apiDataReceived = Buffer.concat(chunks).toString('utf8')
                                    resolve()
                                }
                            })

                            return promise
                        }

                        function readDatasetFile() {
                            /*
                            If this process already ran before, then we are going to load the data stored so as to append
                            information to it later.
                            */
                            if (thisReport.file.lastRun !== undefined) {

                                let fileName = 'Data.json'
                                let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + productDefinition.config.codeName + "/" + outputDataset.config.codeName
                                let response = fileStorage.asyncGetTextFile(filePath + '/' + fileName)
                                let text = response.text

                                if (response.err !== undefined && response.err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> startProcess -> readDatasetFile -> Could read file. ->  filePath = " + filePath + "/" + fileName);
                                    throw (response.err)
                                } else {
                                    existingFileContent = text
                                }

                            } else {
                                /*
                                If there is no status report, we assume there is no previous file or that if there is we will override it.
                                */
                                existingFileContent = "[]"
                            }
                        }

                        function appendToExistingDataset() {
                            if (existingFileContent !== undefined) {
                                // we are going to append the curernt apiDataReceived to the existing file.
                                let existingFileArray = JSON.parse(existingFileContent)

                                /*
                                We will create a map with all the existing record primary keys, so as to use it
                                later to avoid appending records that already exists. The first step is to 
                                build an array with the primary keys of the file. After that we will populate 
                                the existingKeys map.
                                */
                                let primaryKeys = []
                                let existingKeys = new Map()

                                /*
                                Setup the primaryKeys array.
                                */
                                for (let j = 0; j < productDefinition.record.properties.length; j++) {
                                    let recordProperty = productDefinition.record.properties[j]
                                    if (recordProperty.config.primaryKey === true) {
                                        primaryKeys.push(recordProperty.config.codeName)
                                    }
                                }

                                /*
                                Setup the existingKeys map.
                                */
                                for (let i = 0; i < existingFileArray.length; i++) {
                                    let record = existingFileArray[i]
                                    let key = ""
                                    for (j = 0; j < primaryKeys.length; j++) {
                                        let keyValue = record[primaryKeys[j]]
                                        key = key + '->' + keyValue
                                    }
                                    existingKeys.set(key, record)
                                }

                                /*
                                Scan the dataReceivedArray array and insert records into
                                the existingFileArray array only when they are not going to
                                duplicate a primary key.
                                */
                                for (let i = 0; i < dataReceivedArray.length; i++) {
                                    let record = dataReceivedArray[i]

                                    let key = ""
                                    for (j = 0; j < primaryKeys.length; j++) {
                                        let keyValue = record[primaryKeys[j]]
                                        key = key + '->' + keyValue
                                    }
                                    if (existingKeys.get(key) === undefined) {
                                        existingFileArray.push(record)
                                        existingKeys.set(key, record)
                                    }

                                }

                                existingFileContent = JSON.stringify(existingFileArray)
                            } else {
                                // we are going to save the current apiDataReceived.
                                existingFileContent = apiDataReceived
                            }
                        }

                        function saveDatasetFile() {

                            let fileName = 'Data.json'
                            let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + productDefinition.config.codeName + "/" + outputDataset.config.codeName
                            let response = fileStorage.asyncCreateTextFile(filePath + '/' + fileName, existingFileContent + '\n');

                            if (response.err !== undefined && err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] start -> startProcess -> saveDatasetFile -> Could not save file. ->  filePath = " + filePath + "/" + fileName);
                                throw (response.err)
                            }
                        }
                    }
                    writeStatusReport()

                } catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> startProcess -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStatusReport() {
                try {
                    thisReport.file = {
                        lastRun: (new Date()).toISOString(),
                        lastPage: lastPage
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
