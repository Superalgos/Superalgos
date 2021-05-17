
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
            let processNode         // This hold the node Process Definition
            let lastPage = {}       // This holds the last page fetched for each endpoint

            getContextVariables()
            startProcess()

            function getContextVariables() {
                try {
                    processNode = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent
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

            async function startProcess() {
                try {
                    processNode = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent

                    if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].apiMapReference === undefined) {
                        // TODO Error Handling
                        return
                    }

                    let apiMap = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].apiMapReference.referenceParent
                    if (apiMap === undefined) {
                        // TODO Error Handling
                        return
                    }

                    let hostName
                    let portNumber = ""
                    let path = ""
                    let protocol = "https" // default value

                    if (apiMap.config.hostName === undefined || apiMap.config.hostName === "") {
                        // TODO Error Handling
                        return
                    } else {
                        hostName = apiMap.config.hostName
                    }

                    if (apiMap.config.portNumber !== undefined && apiMap.config.portNumber !== "") {
                        portNumber = ":" + apiMap.config.portNumber
                    }

                    if (apiMap.config.protocol !== undefined && apiMap.config.protocol !== "") {
                        protocol = apiMap.config.protocol
                    }

                    if (apiMap.config.path !== undefined && apiMap.config.path !== "") {
                        path = "/" + apiMap.config.path
                    }

                    if (apiMap.apiVersions.length === 0) {
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
                        let pathString = ""                                                 // This holds the path string to be sent at the API call.
                        let apiResponseReceivedText                                         // This hold the whole text received from the latest API call.
                        let apiResponseReceivedObject                                       // This is the whole response received turned into a JSON object.
                        let apiData                                                         // This holds the specific object containing the data -to be stored- inside the structure received by the API call.
                        let dataReceivedArray = []                                          // This hold the cumulative data received from all calls to the API (multiple pages of data).
                        let dataReceivedObject                                              // This hold a single data object when there is no pagination. The Data object is a node within the whole response received from the API.
                        let pageNumberParameter                                             // This holds the node that represents a Page Number parameter.
                        let pageQueryString = ""                                            // This holds the node part of query sting that deals with page numbers 
                        let recordPropertiesNodePathMap = new Map()                         // This holds the calculated nodePath for each record property, in order to help find the property value on the data received.

                        getApiEndpointAndSchema()
                        calculateRecordPropertiesNodePathMap()
                        getEndpointQueryParameters()
                        getEndpointPathParameters()
                        await fetchAllPages()
                        await readDatasetFile()
                        appendToExistingDataset()
                        await saveDatasetFile()

                        function getApiEndpointAndSchema() {
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
                                        let endpointNodeFound = TS.projects.superalgos.utilities.nodeFunctions.findNodeInNodeMesh(apiResponseField, 'API Endpoint')
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

                        function calculateRecordPropertiesNodePathMap() {
                            /*
                            Each record property references an API Response Field, which can be deep into the
                            data structure received from the API call. What we need to do, is to find for each
                            record proeprty the nodePath that will help us later retrieve the value of that 
                            particular proeprty.
                            
                            To do so, we will have to recursivelly climb the API Map until reaching the API Response
                            Schema node, which is the one from where we will get the root object of the response data
                            structure.
                            */
                            for (let j = 0; j < productDefinition.record.properties.length; j++) {
                                let recordProperty = productDefinition.record.properties[j]
                                if (recordProperty.apiResponseFieldReference !== undefined) {
                                    if (recordProperty.apiResponseFieldReference.referenceParent !== undefined) {
                                        let apiResponseField = recordProperty.apiResponseFieldReference.referenceParent
                                        let nodePath = getPath(apiResponseField)
                                        recordPropertiesNodePathMap.set(recordProperty.config.codeName, nodePath)

                                        function getPath(node, path) {

                                            if (node.parentNode === undefined || node.parentNode.type !== "API Response Field" || node.parentNode.config.fieldType === 'array') {
                                                if (path === undefined) {
                                                    path = 'recordReceived' + '.' + node.config.codeName
                                                } else {
                                                    path = 'recordReceived' + '.' + node.config.codeName + '.' + path
                                                }
                                                return path
                                            } else {
                                                if (path === undefined) {
                                                    path = node.config.codeName
                                                } else {
                                                    path = node.config.codeName + '.' + path
                                                }
                                                return getPath(node.parentNode, path)
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        function getEndpointQueryParameters() {
                            /*
                            Parameters to the query of the API are all optional. Here we will see if
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

                        function getEndpointPathParameters() {
                            /*
                            Parameters to the path of the API are all optional. Here we will see if
                            we need to place the API call with Parameters...
                            */
                            let separator = ""
                            if (productDefinition.apiPathParameters !== undefined) {
                                pathString = '/'
                                for (let j = 0; j < productDefinition.apiPathParameters.apiPathParameters.length; j++) {
                                    let apiPathParameter = productDefinition.apiPathParameters.apiPathParameters[j]

                                    let parameterValue = apiPathParameter.config.codeName // This is the default value
                                    if (apiPathParameter.config.replaceBy !== undefined) {
                                        switch (apiPathParameter.config.replaceBy) {
                                            case '@BaseAsset': {
                                                parameterValue = TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName
                                                break
                                            }
                                            case '@QuotedAsset': {
                                                parameterValue = TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                                                break
                                            }
                                        }
                                    }
                                    pathString = pathString + separator + parameterValue
                                    separator = "/"
                                }
                            }
                        }

                        async function fetchAllPages() {

                            if (pageNumberParameter === undefined) {
                                /* 
                                There is no paging mechanism at this Endpoint, so we will just make an
                                Async call to the API Server 
                                */
                                await sleep(apiMap.config.millisecondsBetweenCalls)
                                await fetchAPIData()
                                dataReceivedObject = apiData
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
                                let finalPage = 1 // Number.MAX_SAFE_INTEGER
                                if (thisReport.file.lastPage !== undefined) {
                                    initialPage = thisReport.file.lastPage[endpointNode.config.codeName]
                                }

                                for (let page = initialPage; page <= finalPage; page++) {
                                    if (queryString === "") {
                                        pageQueryString = "?" + pageNumberParameter.config.codeName + "=" + page
                                    } else {
                                        pageQueryString = "&" + pageNumberParameter.config.codeName + "=" + page
                                    }
                                    lastPage[endpointNode.config.codeName] = page

                                    await sleep(apiMap.config.millisecondsBetweenCalls)
                                    let fetchResult = await fetchAPIData()

                                    switch (fetchResult) {
                                        case 'UNEXPECTED_API_RESPONSE': {
                                            /*
                                            Any unexpected response will abort this loop and allow the process to continue,
                                            possibly saving accumulated data.
                                            */
                                            page = finalPage
                                            break
                                        }
                                        case 'ERROR_CODE_RECEIVED': {
                                            /*
                                            An error code at the response will abort this loop and allow the process to continue,
                                            possibly saving accumulated data.
                                            */
                                            page = finalPage
                                            break
                                        }
                                        case 'NO_MORE_PAGES': {
                                            /*
                                            We will just abort this loop and continue.
                                            */
                                            page = finalPage
                                            break
                                        }
                                        case 'PAGE_FETCHED': {
                                            /*
                                            Just stay at the current loop and try to fetch more pages.
                                            This is how we accumulate the data from multiple pages into a single array.
                                            */
                                            dataReceivedArray = dataReceivedArray.concat(apiData)
                                            break
                                        }
                                    }
                                }
                            }

                            function sleep(ms) {
                                return new Promise((resolve) => {
                                    setTimeout(resolve, ms);
                                });
                            }
                        }

                        async function fetchAPIData() {
                            let promise = new Promise((resolve, reject) => {
                                /* 
                                Now that we have the endpointNode, the parameters and all the information 
                                needed to place the call to the API.
                                */
                                let httpClient = require('https');
                                let url = protocol + '://' +
                                    hostName +
                                    portNumber +
                                    path +
                                    '/' + endpointNode.parentNode.config.codeName +
                                    '/' + endpointNode.config.codeName +
                                    pathString +
                                    queryString +
                                    pageQueryString

                                /*
                                This is how we call the API.
                                */
                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[INFO] start -> startProcess -> fetchAPIData -> httpClient.get ->  url = " + url)

                                httpClient.get(url, onResponse)

                                function onResponse(response) {
                                    const chunks = []
                                    response.on('data', onDataArrived)
                                    response.on('end', onEnd)

                                    let apiResponseSchemaNode
                                    let errorCodeReceived

                                    /*
                                    At this point we have received the first http reponse from the API server, 
                                    and from it we can extract the status code, which is the html code of the 
                                    response of our request.
                                    
                                    With that code we can get the API Response Schema, which will tell us how 
                                    to extract data from the response.
                                    */
                                    getApiResponseSchema(response.statusCode)

                                    if (apiResponseSchemaNode === undefined) {
                                        // TODO Error Handling
                                        console.log('The response code ' + response.statusCode + ' received is not associated with any API Response Schema.')
                                        errorCodeReceived = true
                                        return
                                    }

                                    function onDataArrived(chunk) {
                                        chunks.push(chunk)
                                    }

                                    function getApiResponseSchema(responseCode) {
                                        /*
                                        The API Response Schema we will depend on the response code received from the
                                        API server. Here we will locate the right Api Response Schema.
                                        */
                                        for (let j = 0; j < apiMap.apiVersions.length; j++) {
                                            let version = apiMap.apiVersions[j]
                                            for (let k = 0; k < version.apiEndpoints.length; k++) {
                                                let endpoint = version.apiEndpoints[k]
                                                if (endpointNode.id === endpoint.id) {
                                                    for (let i = 0; i < endpoint.apiQueryResponses.apiQueryResponses.length; i++) {
                                                        let apiQueryResponse = endpoint.apiQueryResponses.apiQueryResponses[i]

                                                        if (Number(apiQueryResponse.config.codeName) === responseCode) {
                                                            apiResponseSchemaNode = apiQueryResponse.apiResponseSchema

                                                            /*
                                                            We will check that what we received is not an error code.
                                                            */
                                                            if (apiQueryResponse.config.isError === true) {
                                                                errorCodeReceived = true
                                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                                    "[WARN] start -> startProcess -> fetchAllPages -> fetchAPIData -> onResponse -> getApiResponseSchema -> API Response is an Error ->  responseCode = " + responseCode);
                                                            }
                                                            return
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    function onEnd() {
                                        apiResponseReceivedText = Buffer.concat(chunks).toString('utf8')
                                        /*
                                        If we received an errror code, we abort the processing at this point.
                                        */
                                        if (errorCodeReceived === true) {
                                            resolve('ERROR_CODE_RECEIVED')
                                            return
                                        }
                                        /*
                                        Here we will validate that the overall format is what we are expecting.
                                        */
                                        switch (apiResponseSchemaNode.apiResponseFields.config.fieldType) {
                                            case 'object': {
                                                /*
                                                If we did not received an object, that probably means something is not 
                                                good, and we got an HTML with the reason inside.
                                                */
                                                if (apiResponseReceivedText.substring(0, 1) !== "{") {
                                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                        "[WARN] start -> startProcess -> fetchAllPages -> fetchAPIData -> onResponse -> onEnd -> Unexpected Response. Not an JSON Object. ->  apiResponseReceivedText = " + apiResponseReceivedText);
                                                    resolve('UNEXPECTED_API_RESPONSE')
                                                    return
                                                }
                                                break
                                            }
                                            case 'array': {
                                                /*
                                                If we did not received an array, that probably means something is not 
                                                good, and we got an HTML with the reason inside.
                                                */
                                                if (apiResponseReceivedText.substring(0, 1) !== "[") {
                                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                        "[WARN] start -> startProcess -> fetchAllPages -> fetchAPIData -> onResponse -> onEnd -> Unexpected Response. Not an Array with Data. ->  apiResponseReceivedText = " + apiResponseReceivedText);
                                                    resolve('UNEXPECTED_API_RESPONSE')
                                                    return
                                                }
                                                break
                                            }
                                        }
                                        /*
                                        The actual data we need could be anywhere within the data structure received.
                                        The exact place is configured at the apiResponseSchemaNode property nodePath.
                                        We will eval the nodePath property (this assumes that the apiResponseReceivedObject is defined)
                                        */
                                        apiResponseReceivedObject = JSON.parse(apiResponseReceivedText)
                                        apiData = eval(apiResponseSchemaNode.config.nodePath)
                                        /*
                                        We will expect the apiData to be an Array.  Depending if it has data or not we will return
                                        NO_MORE_PAGES or PAGE_FETCHED so that pagination procedure knows when to stop.
                                        */
                                        if (apiData.length === 0) {
                                            resolve('NO_MORE_PAGES')
                                        } else {
                                            resolve('PAGE_FETCHED')
                                        }
                                    }
                                }
                            }
                            )

                            return promise
                        }

                        async function readDatasetFile() {
                            /*
                            If this process already ran before, then we are going to load the data stored so as to append
                            information to it later.
                            */
                            if (thisReport.file.lastRun !== undefined) {

                                let fileName = 'Data.json'
                                let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + productDefinition.config.codeName + "/" + outputDataset.referenceParent.config.codeName
                                let response = await fileStorage.asyncGetTextFile(filePath + '/' + fileName)
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
                            /* 
                            We are going to append the curernt apiResponseReceivedText to the existing file.
                            */
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
                                let record = {
                                    values: existingFileArray[i],
                                    map: new Map()
                                }
                                /*
                                Building the record map...
                                */
                                for (let j = 0; j < productDefinition.record.properties.length; j++) {
                                    let recordProperty = productDefinition.record.properties[j]
                                    record.map.set(recordProperty.config.codeName, record.values[j])
                                }
                                /*
                                Building the current key...
                                */
                                let key = ""
                                for (j = 0; j < primaryKeys.length; j++) {
                                    let keyValue = record.map.get(primaryKeys[j])
                                    key = key + '->' + keyValue
                                }
                                existingKeys.set(key, record)
                            }
                            /*
                            If we received an array of data then we will try to append it to the current file.
                            */
                            if (dataReceivedArray.length > 0) {
                                /*
                                Scan the dataReceivedArray array and insert records into
                                the existingFileArray array only when they are not going to
                                duplicate a primary key.
                                */
                                for (let i = 0; i < dataReceivedArray.length; i++) {
                                    let record = getRecord(dataReceivedArray[i])

                                    let key = ""
                                    for (j = 0; j < primaryKeys.length; j++) {
                                        let keyValue = record.map.get(primaryKeys[j])
                                        key = key + '->' + keyValue
                                    }
                                    if (existingKeys.get(key) === undefined) {
                                        existingFileArray.push(record.values)
                                        existingKeys.set(key, record.values)
                                    }
                                }
                            }
                            /*
                            If we received a data object then we will try to add it to the current existing file.
                            */
                            if (dataReceivedObject !== undefined) {
                                let record = getRecord(dataReceivedObject)
                                existingFileArray.push(record.values)
                            }

                            existingFileContent = JSON.stringify(existingFileArray)

                            function getRecord(recordReceived) {
                                /*
                                The record to be stored is not directly the record received. The record
                                structure depends on the list of record properties and the data fields each one is referencing.
                                */
                                let record = {
                                    values: [],
                                    headers: [],
                                    map: new Map()
                                }
                                for (let j = 0; j < productDefinition.record.properties.length; j++) {
                                    let recordProperty = productDefinition.record.properties[j]
                                    if (recordProperty.apiResponseFieldReference !== undefined) {
                                        if (recordProperty.apiResponseFieldReference.referenceParent !== undefined) {
                                            let apiResponseField = recordProperty.apiResponseFieldReference.referenceParent
                                            /*
                                            We will need to get the nodePath for this property, representing the path
                                            to the value on the received data. There are 2 ways to get this nodePath.

                                            1) It is explicitly declared at the node. If this exists then we will use it.
                                            2) It was calculated automatically.
                                            */

                                            let nodePath = recordProperty.config.nodePath

                                            if (nodePath === undefined) {
                                                nodePath = recordPropertiesNodePathMap.get(recordProperty.config.codeName)
                                            }

                                            let value = eval(nodePath)

                                            if (recordProperty.config.isDate === true) {
                                                value = (new Date(value)).valueOf()
                                            }

                                            /*
                                            Check that we do not accept values that will break the JSON format of the file.
                                            */
                                            if (recordProperty.config.isString !== true && recordProperty.config.isBoolean !== true) {
                                                /*
                                                At this point Dates have been converted to numbers, so if the Record Property is not a string
                                                then it must be a number.
                                                */
                                                if (isNaN(value)) { value = 0 }
                                            }
                                            
                                            if (value === null || value === undefined) { value = 0 }
                                            record.values.push(value)
                                            record.headers.push(recordProperty.config.codeName)
                                            record.map.set(recordProperty.config.codeName, value)
                                        }
                                    }
                                }
                                return record
                            }
                        }

                        async function saveDatasetFile() {

                            let fileName = 'Data.json'
                            let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + productDefinition.config.codeName + "/" + outputDataset.referenceParent.config.codeName
                            let response = await fileStorage.asyncCreateTextFile(filePath + '/' + fileName, existingFileContent + '\n');

                            if (response.err !== undefined && response.err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] start -> startProcess -> saveDatasetFile -> Could not save file. ->  filePath = " + filePath + "/" + fileName);
                                throw (response.err)
                            }
                        }
                    }

                    /*
                    When all Output Datasets have been succesfully written, we can go and write
                    the Status Report.
                    */
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
