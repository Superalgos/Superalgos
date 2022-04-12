exports.newTestCasesManager = function newTestCasesManager(networkCodeName) {
    /*
    This modules coordinates all Test Cases for everyone.
    */
    let thisObject = {
        testCasesArray: undefined,
        testCasesMap: undefined,
        setTestCaseResults: setTestCaseResults,
        getNextTestCase: getNextTestCase,
        run: run,
        initialize: initialize,
        finalize: finalize
    }

    const fs = require("fs")
    const REPORT_NAME = networkCodeName + '-' + (new Date()).toISOString().substring(0, 16).replace("T", "-").replace(":", "-").replace(":", "-") + '-00'

    let parametersRanges
    switch (networkCodeName) {
        case 'Testnet': {
            parametersRanges = require('./StateData/Ranges/Testnet-Parameters-Ranges')
            break
        }
        case 'Mainnet': {
            parametersRanges = require('./StateData/Ranges/Mainnet-Parameters-Ranges')
            break
        }
    }
    console.log((new Date()).toISOString(), 'Working with these Parameter Ranges:')
    console.table(parametersRanges)

    return thisObject

    async function initialize() {
        await loadTestCasesFile()
        setInterval(updateTestDatasets, 60 * 1000)

        async function updateTestDatasets() {
            await generateTestDatasets()
        }

        async function loadTestCasesFile() {
            let fileContent = TEST_SERVER.utilities.loadFile("./StateData/TestCases/Test-Cases-Array-" + networkCodeName + ".json")
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
            await generateTestDatasets()
        }

        function generateTestCases() {
            let preParameters = {}
            for (let i = 0; i < parametersRanges.LIST_OF_ASSETS.length; i++) {
                preParameters.LIST_OF_ASSETS = parametersRanges.LIST_OF_ASSETS[i]

                for (let j = 0; j < parametersRanges.LIST_OF_TIMEFRAMES.length; j++) {
                    preParameters.LIST_OF_TIMEFRAMES = parametersRanges.LIST_OF_TIMEFRAMES[j]

                    for (let k = 0; k < parametersRanges.NUMBER_OF_LAG_TIMESTEPS.length; k++) {
                        preParameters.NUMBER_OF_LAG_TIMESTEPS = parametersRanges.NUMBER_OF_LAG_TIMESTEPS[k]

                        for (let m = 0; m < parametersRanges.PERCENTAGE_OF_DATASET_FOR_TRAINING.length; m++) {
                            preParameters.PERCENTAGE_OF_DATASET_FOR_TRAINING = parametersRanges.PERCENTAGE_OF_DATASET_FOR_TRAINING[m]

                            for (let n = 0; n < parametersRanges.NUMBER_OF_EPOCHS.length; n++) {
                                preParameters.NUMBER_OF_EPOCHS = parametersRanges.NUMBER_OF_EPOCHS[n]

                                for (let p = 0; p < parametersRanges.NUMBER_OF_LSTM_NEURONS.length; p++) {
                                    preParameters.NUMBER_OF_LSTM_NEURONS = parametersRanges.NUMBER_OF_LSTM_NEURONS[p]

                                    let parameters = getTestParameters(preParameters)
                                    let parametersHash = TEST_SERVER.utilities.hash(JSON.stringify(parameters))
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
                                    }
                                }
                            }
                        }
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
                parameters.NUMBER_OF_INDICATORS_PROPERTIES = 5

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

                return parameters
            }
        }

        async function generateTestDatasets() {

            for (let i = 0; i < thisObject.testCasesArray.length; i++) {
                let testCase = thisObject.testCasesArray[i]
                getTimeSeriesFileName(testCase)
                testCase.forcastedCandle = await TEST_SERVER.dataBridge.updateDatasetFiles(testCase)
            }
            saveTestCasesFile()

            function getTimeSeriesFileName(testCase) {
                let fileName = "time-series"
                for (let i = 0; i < testCase.parameters.LIST_OF_ASSETS.length; i++) {
                    let asset = testCase.parameters.LIST_OF_ASSETS[i]
                    fileName = fileName + "-" + asset
                }
                for (let i = 0; i < testCase.parameters.LIST_OF_TIMEFRAMES.length; i++) {
                    let timeFrame = testCase.parameters.LIST_OF_TIMEFRAMES[i]
                    fileName = fileName + "-" + timeFrame
                }
                testCase.timeSeriesFileName = fileName
            }
        }
    }

    function finalize() {

    }

    function run() {

    }

    function getNextTestCase() {
        for (let i = 0; i < thisObject.testCasesArray.length; i++) {
            let testCase = thisObject.testCasesArray[i]
            if (testCase.status === 'Never Tested') {
                testCase.status = 'Being Tested'
                let nextTestCase = {
                    id: testCase.id,
                    totalCases: thisObject.testCasesArray.length,
                    parameters: testCase.parameters,
                    files: TEST_SERVER.dataBridge.getFiles(testCase)
                }
                return nextTestCase
            }
        }
    }

    function setTestCaseResults(testResult, testedBy) {

        try {
            let testCase = thisObject.testCasesArray[testResult.id - 1]
            testCase.status = 'Tested'
            testCase.predictions = testResult.predictions
            testCase.errorRMSE = testResult.errorRMSE
            testCase.percentageErrorRMSE = calculatePercentageErrorRMSE(testResult)
            testCase.enlapsedSeconds = testResult.enlapsedTime.toFixed(0)
            testCase.enlapsedMinutes = (testResult.enlapsedTime / 60).toFixed(2)
            testCase.enlapsedHours = (testResult.enlapsedTime / 3600).toFixed(2)
            testCase.testedBy = testedBy
            testCase.timestamp = (new Date()).valueOf()

            let logQueue = []
            for (let i = Math.max(0, testResult.id - 5); i < Math.min(thisObject.testCasesArray.length, testResult.id + 5); i++) {
                let testCase = thisObject.testCasesArray[i]
                if (testCase.timestamp !== undefined) {
                    testCase.when = TEST_SERVER.utilities.getHHMMSS(testCase.timestamp) + ' HH:MM:SS ago'
                }
                logQueue.push(testCase)
            }
            console.log((new Date()).toISOString(), testedBy + ' just tested Test Case Id ' + testCase.id)
            console.log((new Date()).toISOString(), 'Updated partial table of Test Cases:')
            console.table(logQueue)
            saveTestReportFile()
            saveTestCasesFile()
            TEST_SERVER.forecastCasesManager.addToforecastCases(testCase)
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
                                        arrayItem = jsObject[property][j]
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
                                    arrayItem = jsObject[property][j]
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

            fs.writeFileSync("./OutputData/TestReports/" + REPORT_NAME + ".CSV", testReportFile)
        }
    }

    function saveTestCasesFile() {
        let fileContent = JSON.stringify(thisObject.testCasesArray, undefined, 4)
        fs.writeFileSync("./StateData/TestCases/Test-Cases-Array-" + networkCodeName + ".json", fileContent)
    }
}