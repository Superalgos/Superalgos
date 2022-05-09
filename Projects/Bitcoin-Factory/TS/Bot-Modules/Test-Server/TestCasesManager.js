exports.newTestCasesManager = function newTestCasesManager(processIndex, networkCodeName) {
    /*
    This modules coordinates all Test Cases for everyone.
    */
    let thisObject = {
        testCasesArray: undefined,
        testCasesMap: undefined,
        setTestCaseResults: setTestCaseResults,
        getNextTestCase: getNextTestCase,
        initialize: initialize,
        finalize: finalize
    }

    const REPORT_NAME = networkCodeName + '-' + (new Date()).toISOString().substring(0, 16).replace("T", "-").replace(":", "-").replace(":", "-") + '-00'

    let parametersRanges = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.parametersRanges
    let timeSeriesFileFeatures = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.timeSeriesFile.features
    let timeSeriesFileLabels = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.timeSeriesFile.labels

    console.log((new Date()).toISOString(), 'Working with these Parameter Ranges:')
    console.table(parametersRanges)

    return thisObject

    async function initialize() {
        await loadTestCasesFile()

        async function loadTestCasesFile() {
            let fileContent = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.loadFile(global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/StateData/TestCases/Test-Cases-Array-" + networkCodeName + ".json")
            if (fileContent === undefined) {
                thisObject.testCasesArray = []
                thisObject.testCasesMap = new Map()
            } else {
                thisObject.testCasesArray = JSON.parse(fileContent)
                thisObject.testCasesMap = new Map()

                for (let i = 0; i < thisObject.testCasesArray.length; i++) {
                    let testCase = thisObject.testCasesArray[i]
                    thisObject.testCasesMap.set(testCase.parametersHash, testCase)
                }
            }
            generateTestCases()
            saveTestCasesFile()
        }

        function generateTestCases() {
            let preParameters = {}

            /*
            Add Labels to Param Ranges
            */
            for (let q = 0; q < timeSeriesFileLabels.length; q++) {
                let label = timeSeriesFileLabels[q].parameter
                if (label === undefined) {
                    label = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getParameterName(timeSeriesFileLabels[q])
                }
                parametersRanges[label] = timeSeriesFileLabels[q].range
            }
            /*
            Add Features to Param Ranges
            */
            for (let q = 0; q < timeSeriesFileFeatures.length; q++) {
                let feature = timeSeriesFileFeatures[q].parameter
                if (feature === undefined) {
                    feature = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getParameterName(timeSeriesFileFeatures[q])
                }
                parametersRanges[feature] = timeSeriesFileFeatures[q].range
            }
            /*
            Generate Cases based on Param Ranges
            */
            addParamRangesRecursively(0)

            function addParamRangesRecursively(index) {
                let propertyName = Object.keys(parametersRanges)[index]
                if (propertyName !== undefined) {
                    for (let i = 0; i < parametersRanges[propertyName].length; i++) {
                        preParameters[propertyName] = parametersRanges[propertyName][i]
                        addParamRangesRecursively(index + 1)
                    }
                } else {
                    let parameters = getTestParameters(preParameters)
                    let parametersHash = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.hash(JSON.stringify(parameters))
                    let testCase = {
                        id: thisObject.testCasesArray.length + 1,
                        mainAsset: preParameters.LIST_OF_ASSETS[0],
                        mainTimeFrame: preParameters.LIST_OF_TIMEFRAMES[0],
                        parameters: parameters,
                        parametersHash: parametersHash,
                        status: 'Never Tested'
                    }

                    let existingTestCase = thisObject.testCasesMap.get(parametersHash)
                    if (existingTestCase === undefined) {
                        thisObject.testCasesArray.push(testCase)
                        thisObject.testCasesMap.set(parametersHash, testCase)
                    }
                }
            }

            function getTestParameters(preParameters) {
                let parameters = {}

                //parameters.LIST_OF_TIMEFRAMES = ['24-hs', '12-hs', '08-hs', '06-hs', '04-hs', '03-hs', '02-hs', '01-hs']
                //parameters.LIST_OF_TIMEFRAMES = ['12-hs', '06-hs', '04-hs', '03-hs', '02-hs', '01-hs']

                // list of assets to include as features
                parameters.LIST_OF_ASSETS = preParameters.LIST_OF_ASSETS

                // list of time-frames to include
                parameters.LIST_OF_TIMEFRAMES = preParameters.LIST_OF_TIMEFRAMES

                // number of indicator properties that are at the raw dataset. Each set of indicators properties might be at many assets or timeframes.
                parameters.NUMBER_OF_INDICATORS_PROPERTIES = 0
                for (let q = 0; q < timeSeriesFileLabels.length; q++) {
                    let label = timeSeriesFileLabels[q].parameter
                    if (label === undefined) {
                        label = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getParameterName(timeSeriesFileLabels[q])
                    }
                    if (preParameters[label] === "ON") {
                        parameters.NUMBER_OF_INDICATORS_PROPERTIES++
                    }
                }
                for (let q = 0; q < timeSeriesFileFeatures.length; q++) {
                    let feature = timeSeriesFileFeatures[q].parameter
                    if (feature === undefined) {
                        feature = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getParameterName(timeSeriesFileFeatures[q])
                    }
                    if (preParameters[feature] === "ON") {
                        parameters.NUMBER_OF_INDICATORS_PROPERTIES++
                    }
                }

                // number of timesteps in the secuence that we are going to use to feed the model.
                parameters.NUMBER_OF_LAG_TIMESTEPS = preParameters.NUMBER_OF_LAG_TIMESTEPS

                // number of assets included at the raw dataset.
                parameters.NUMBER_OF_ASSETS = parameters.LIST_OF_ASSETS.length

                // number of things we are going to predict.
                parameters.NUMBER_OF_LABELS = 3 * parameters.NUMBER_OF_ASSETS

                // definition of how the raw dataset is going to be divided between a Traing Dataset and a Test Dataset.
                parameters.PERCENTAGE_OF_DATASET_FOR_TRAINING = preParameters.PERCENTAGE_OF_DATASET_FOR_TRAINING

                // TODO: this calculation is incomplete. If you had multiple time frames it might not work at some point. 
                parameters.NUMBER_OF_FEATURES = 0
                for (let i = 0; i < parameters.LIST_OF_TIMEFRAMES.length; i++) {
                    parameters.NUMBER_OF_FEATURES = parameters.NUMBER_OF_FEATURES + (i + 1) * parameters.NUMBER_OF_INDICATORS_PROPERTIES * parameters.NUMBER_OF_ASSETS
                }
                // NUMBER_OF_FEATURES = 1*5 + 2*5 + 3*5 + 4*5 + 6*5 + 12*5 
                // NUMBER_OF_FEATURES = 1*5 + 2*5 + 3*5 + 4*5 + 6*5 + 8*5 + 12*5 + 24*5  

                // hyper-parameters
                parameters.NUMBER_OF_EPOCHS = preParameters.NUMBER_OF_EPOCHS
                parameters.NUMBER_OF_LSTM_NEURONS = preParameters.NUMBER_OF_LSTM_NEURONS

                /*
                Add Labels  
                */
                for (let q = 0; q < timeSeriesFileLabels.length; q++) {
                    let label = timeSeriesFileLabels[q].parameter
                    if (label === undefined) {
                        label = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getParameterName(timeSeriesFileLabels[q])
                    }
                    parameters[label] = preParameters[label]
                }
                /*
                Add Features  
                */
                for (let q = 0; q < timeSeriesFileFeatures.length; q++) {
                    let feature = timeSeriesFileFeatures[q].parameter
                    if (feature === undefined) {
                        feature = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getParameterName(timeSeriesFileFeatures[q])
                    }
                    parameters[feature] = preParameters[feature]
                }

                return parameters
            }
        }
    }

    function finalize() {

    }

    async function getNextTestCase(currentClientInstance) {
        /*
        The first thing we will try to do is to see if this Test Client Instance was not already assigned a Test case for which it never 
        reported back. This is a common situation when some kind of error occured and the whole cycle was not closed.
        */
        for (let i = 0; i < thisObject.testCasesArray.length; i++) {
            let testCase = thisObject.testCasesArray[i]
            if (testCase.status === 'Being Tested' && testCase.assignedTo === currentClientInstance) {
                /*
                If this same case is being requested again by the same test client instance in a too short period of time, we will ignore it, to protect the
                server CPU usage
                */
                let assignedTimestamp = testCase.assignedTimestamp
                if (assignedTimestamp === undefined) { assignedTimestamp = 0 }
                let now = (new Date()).valueOf()
                let diff = now - assignedTimestamp
                if (diff < SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS * 10) {
                    console.log((new Date()).toISOString(), 'Test Case already delivered in the last 10 minutes. Did not deliver again to ' + currentClientInstance)
                    return 'NO CASES FOR YOU'
                } else {
                    return await assignTestCase(testCase)
                }
            }
        }
        /*
        The second thing we will try to do is to see if there are assigned test cases that have not been tested in more than 24 hours. 
        If we find one of those, we will re assign them.
        */
        for (let i = 0; i < thisObject.testCasesArray.length; i++) {
            let testCase = thisObject.testCasesArray[i]
            let assignedTimestamp = testCase.assignedTimestamp
            if (assignedTimestamp === undefined) { assignedTimestamp = 0 }
            let now = (new Date()).valueOf()
            let diff = now - assignedTimestamp
            if (testCase.status === 'Being Tested' && diff > SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS) {
                return await assignTestCase(testCase)
            }
        }
        /*
        If we could not re assing an already assiged test case, then we will just find the next one.
        */
        for (let i = 0; i < thisObject.testCasesArray.length; i++) {
            let testCase = thisObject.testCasesArray[i]
            if (testCase.status === 'Never Tested') {
                return await assignTestCase(testCase)
            }
        }

        console.log((new Date()).toISOString(), 'No more Test Cases. Could not deliver one to ' + currentClientInstance)
        return 'NO CASES FOR YOU'

        async function assignTestCase(testCase) {
            testCase.status = 'Being Tested'
            testCase.assignedTo = currentClientInstance
            testCase.assignedTimestamp = (new Date()).valueOf()

            getTimeSeriesFileName(testCase)
            testCase.forcastedCandle = await TS.projects.foundations.globals.taskConstants.TEST_SERVER.dataBridge.updateDatasetFiles(testCase)
            saveTestCasesFile()

            let nextTestCase = {
                id: testCase.id,
                totalCases: thisObject.testCasesArray.length,
                parameters: testCase.parameters,
                files: TS.projects.foundations.globals.taskConstants.TEST_SERVER.dataBridge.getFiles(testCase)
            }
            return nextTestCase
        }
    }

    function getTimeSeriesFileName(testCase) {
        let testCaseId = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.pad(testCase.id, 10)

        let fileName = "time-series"
        for (let i = 0; i < testCase.parameters.LIST_OF_ASSETS.length; i++) {
            let asset = testCase.parameters.LIST_OF_ASSETS[i]
            fileName = fileName + "-" + asset
        }
        for (let i = 0; i < testCase.parameters.LIST_OF_TIMEFRAMES.length; i++) {
            let timeFrame = testCase.parameters.LIST_OF_TIMEFRAMES[i]
            fileName = fileName + "-" + timeFrame
        }
        testCase.timeSeriesFileName = fileName + "-" + testCaseId
        testCase.parametersFileName = "parameters" + "-" + testCaseId
    }

    function setTestCaseResults(testResult, currentClientInstance, userProfile) {

        try {
            let testCase = thisObject.testCasesArray[testResult.id - 1]
            testCase.status = 'Tested'
            testCase.predictions = testResult.predictions
            testCase.errorRMSE = testResult.errorRMSE
            testCase.percentageErrorRMSE = calculatePercentageErrorRMSE(testResult)
            testCase.enlapsedSeconds = testResult.enlapsedTime.toFixed(0)
            testCase.enlapsedMinutes = (testResult.enlapsedTime / 60).toFixed(2)
            testCase.enlapsedHours = (testResult.enlapsedTime / 3600).toFixed(2)
            testCase.testedByInstance = currentClientInstance
            testCase.testedByProfile = userProfile
            testCase.timestamp = (new Date()).valueOf()

            let logQueue = []
            for (let i = Math.max(0, testResult.id - 5); i < Math.min(thisObject.testCasesArray.length, testResult.id + 5); i++) {
                let testCase = thisObject.testCasesArray[i]
                if (testCase.timestamp !== undefined) {
                    testCase.when = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getHHMMSS(testCase.timestamp) + ' HH:MM:SS ago'
                }
                logQueue.push(testCase)
            }
            console.log((new Date()).toISOString(), currentClientInstance + ' just tested Test Case Id ' + testCase.id)
            console.log((new Date()).toISOString(), 'Updated partial table of Test Cases:')
            console.table(logQueue)
            saveTestReportFile()
            saveTestCasesFile()
            TS.projects.foundations.globals.taskConstants.TEST_SERVER.forecastCasesManager.addToforecastCases(testCase)
        } catch (err) {
            console.log((new Date()).toISOString(), '[ERROR] Error processing test results. Err = ' + err.stack)
            console.log((new Date()).toISOString(), '[ERROR] testResult = ' + JSON.stringify(testResult))
        }

        function calculatePercentageErrorRMSE(testResult) {
            let percentageErrorRMSE = testResult.errorRMSE / testResult.predictions[0] * 100
            return percentageErrorRMSE.toFixed(2)
        }

        function saveTestReportFile() {
            let testReportFile = ""

            for (let i = 0; i < thisObject.testCasesArray.length; i++) {
                let testCase = thisObject.testCasesArray[i]
                if (testCase.status === 'Tested') {
                    let testReportFileRow = ""
                    /* Header */
                    if (testReportFile === "") {
                        addHeaderFromObject(testCase)
                        function addHeaderFromObject(jsObject) {
                            for (const property in jsObject) {
                                let label = property.replace('NUMBER_OF_', '').replace('LIST_OF_', '')
                                if (testReportFileRow !== "") {
                                    testReportFileRow = testReportFileRow + ","
                                }
                                if (Array.isArray(jsObject[property]) === true) {
                                    testReportFileRow = testReportFileRow + label
                                    for (let j = 0; j < jsObject[property].length; j++) {
                                        testReportFileRow = testReportFileRow + ","
                                        testReportFileRow = testReportFileRow + label + ' ' + (j + 1)
                                    }
                                } else {
                                    if (typeof jsObject[property] === 'object') {
                                        testReportFileRow = testReportFileRow + label
                                        addHeaderFromObject(jsObject[property])
                                    } else {
                                        testReportFileRow = testReportFileRow + label
                                    }
                                }
                            }
                        }

                        testReportFileRow = testReportFileRow + "\r\n"
                        testReportFile = testReportFile + testReportFileRow
                        testReportFileRow = ""
                    }
                    /* Data */
                    addDataFromObject(testCase)
                    function addDataFromObject(jsObject) {
                        for (const property in jsObject) {
                            if (testReportFileRow !== "") {
                                testReportFileRow = testReportFileRow + ","
                            }
                            if (Array.isArray(jsObject[property]) === true) {
                                testReportFileRow = testReportFileRow + jsObject[property].length
                                for (let j = 0; j < jsObject[property].length; j++) {
                                    testReportFileRow = testReportFileRow + ","
                                    let arrayItem = jsObject[property][j]
                                    testReportFileRow = testReportFileRow + arrayItem
                                }
                            } else {
                                if (typeof jsObject[property] === 'object') {
                                    testReportFileRow = testReportFileRow + Object.keys(jsObject[property]).length
                                    addDataFromObject(jsObject[property])
                                } else {
                                    testReportFileRow = testReportFileRow + jsObject[property]
                                }
                            }
                        }
                    }
                    testReportFileRow = testReportFileRow + "\r\n"
                    testReportFile = testReportFile + testReportFileRow
                }
            }

            SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/OutputData/TestReports/" + REPORT_NAME + ".CSV", testReportFile)
        }
    }

    function saveTestCasesFile() {
        /*
        Fixing the Dataset
        */
        for (let i = 0; i < thisObject.testCasesArray.length; i++) {
            let testCase = thisObject.testCasesArray[i]
            if (testCase.testedBy !== undefined) {
                testCase.testedByInstance = testCase.testedBy
                testCase.testedByProfile = testCase.testedBy.split(' / ')[0]
                testCase.testedBy = undefined
            }
            if (testCase.testedByProfile !== undefined && testCase.testedByProfile.split(' / ')[1] !== undefined) {
                testCase.testedByProfile = testCase.testedByProfile.split(' / ')[0]
            }
            testCase.testedBy = undefined
        }

        let fileContent = JSON.stringify(thisObject.testCasesArray, undefined, 4)
        SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/StateData/TestCases/Test-Cases-Array-" + networkCodeName + ".json", fileContent)
    }
}