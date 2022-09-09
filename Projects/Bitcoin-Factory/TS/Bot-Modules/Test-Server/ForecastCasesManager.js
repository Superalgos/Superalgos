exports.newForecastCasesManager = function newForecastCasesManager(processIndex, networkCodeName) {
    /*
    This modules manages the best models that produce the best forecasts.
    */
    let thisObject = {
        forecastCasesArray: undefined,
        forecastCasesMap: undefined,
        getForecasts: getForecasts,
        addToforecastCases: addToforecastCases,
        getNextForecastCase: getNextForecastCase,
        getThisForecastCase: getThisForecastCase,
        setForecastCaseResults: setForecastCaseResults,
        run: run,
        initialize: initialize,
        finalize: finalize
    }
    const REPORT_NAME = networkCodeName + '-' + 'Forecaster' + '-' + (new Date()).toISOString().substring(0, 16).replace("T", "-").replace(":", "-").replace(":", "-") + '-00'

    return thisObject

    function initialize() {

        loadForecastCasesFile()

        function loadForecastCasesFile() {
            let fileContent = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.loadFile(global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName + "/StateData/ForecastCases/Forecast-Cases-Array-" + networkCodeName + ".json")
            if (fileContent !== undefined) {
                thisObject.forecastCasesArray = JSON.parse(fileContent)
                thisObject.forecastCasesMap = new Map()
                for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
                    let forecastCase = thisObject.forecastCasesArray[i]
                    thisObject.forecastCasesMap.set(forecastCase.id, forecastCase)
                }
            } else {
                thisObject.forecastCasesArray = []
                thisObject.forecastCasesMap = new Map()
            }
        }
    }

    function finalize() {

    }

    function run() {

    }

    function getForecasts() {
        updateWhen()
        return thisObject.forecastCasesArray
    }

    function updateWhen() {
        for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
            let forecastCase = thisObject.forecastCasesArray[i]
            if (forecastCase.timestamp !== undefined) {
                forecastCase.when = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getHHMMSS(forecastCase.timestamp) + ' HH:MM:SS ago'
            }
        }
    }

    function addToforecastCases(testCase) {
        for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
            let forecastCase = thisObject.forecastCasesArray[i]
            if (forecastCase.mainAsset === testCase.mainAsset && forecastCase.mainTimeFrame === testCase.mainTimeFrame) {
                if (Number(testCase.percentageErrorRMSE) < Number(forecastCase.percentageErrorRMSE) && Number(testCase.percentageErrorRMSE) >= 0) {
                    thisObject.forecastCasesArray.splice(i, 1)
                    thisObject.forecastCasesMap.delete(testCase.id)
                    addForcastCase(testCase)
                    return
                } else {
                    return
                }
            }
        }
        addForcastCase(testCase)
        saveForecastCasesFile()

        function addForcastCase(testCase) {
            if (testCase.forcastedCandle === undefined) { testCase.forcastedCandle = {} }
            let forecastCase = {
                id: testCase.id,
                caseIndex: thisObject.forecastCasesArray.length,
                testServer: JSON.parse(JSON.stringify(testCase.testServer)),
                mainAsset: testCase.mainAsset,
                mainTimeFrame: testCase.mainTimeFrame,
                percentageErrorRMSE: testCase.percentageErrorRMSE,
                parameters: JSON.parse(JSON.stringify(testCase.parameters)),
                parametersHash: testCase.parametersHash,
                predictions: JSON.parse(JSON.stringify(testCase.predictions)),
                forcastedCandle: JSON.parse(JSON.stringify(testCase.forcastedCandle)),
                timeSeriesFileName: testCase.timeSeriesFileName,
                timestamp: testCase.timestamp,
                when: testCase.when,
                testedBy: testCase.testedBy,
                status: 'Never Forecasted'
            }
            thisObject.forecastCasesArray.push(forecastCase)
            thisObject.forecastCasesMap.set(forecastCase.id, forecastCase)
        }
    }

    async function getNextForecastCase(currentClientInstance) {
        /*
        The first thing we will try to do is to see if this Forecast Client Instance was not already assigned a Forecast case for which it never 
        reported back. This is a common situation when some kind of error occured and the whole cycle was not closed.
        */
        for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
            let forecastCase = thisObject.forecastCasesArray[i]
            if (forecastCase.status === 'Being Forecasted' && forecastCase.assignedTo === currentClientInstance) {
                return await assignForecastCase(forecastCase)
            }
        }
        /*
        The second thing we will try to do is to see if there are assigned forecast cases that have not been tested in more than 24 hours. 
        If we find one of those, we will re assign them.
        */
        for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
            let forecastCase = thisObject.forecastCasesArray[i]
            let assignedTimestamp = forecastCase.assignedTimestamp
            if (assignedTimestamp === undefined) { assignedTimestamp = 0 }
            let now = (new Date()).valueOf()
            let diff = now - assignedTimestamp
            if (forecastCase.status === 'Being Forecasted' && diff > SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS) {
                return await assignForecastCase(forecastCase)
            }
        }
        /*
        If we could not re assing an already assiged forecast case, then we will just find the next one.
        */
        for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
            let forecastCase = thisObject.forecastCasesArray[i]
            if (forecastCase.status === 'Never Forecasted') {
                return await assignForecastCase(forecastCase)
            }
        }

        async function assignForecastCase(forecastCase) {
            forecastCase.status = 'Being Forecasted'
            forecastCase.assignedTo = currentClientInstance
            forecastCase.assignedTimestamp = (new Date()).valueOf()

            let testCase = TS.projects.foundations.globals.taskConstants.TEST_SERVER.testCasesManager.testCasesMap.get(forecastCase.parametersHash)
            forecastCase.forcastedCandle = await TS.projects.foundations.globals.taskConstants.TEST_SERVER.dataBridge.updateDatasetFiles(testCase)
            saveForecastCasesFile()

            let nextForecastCase = {
                id: forecastCase.id,
                caseIndex: forecastCase.caseIndex,
                totalCases: thisObject.forecastCasesArray.length,
                parameters: forecastCase.parameters,
                testServer: {
                    userProfile: ((forecastCase.testServer != undefined) && (forecastCase.testServer.userProfile != undefined) ? forecastCase.testServer.userProfile : ''),
                    instance: ((forecastCase.testServer != undefined) && (forecastCase.testServer.instance != undefined) ? forecastCase.testServer.instance : TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName)
                },
                files: TS.projects.foundations.globals.taskConstants.TEST_SERVER.dataBridge.getFiles(testCase)
            }
            return nextForecastCase
        }
    }

    async function getThisForecastCase(forecastCaseId) {
        for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
            let forecastCase = thisObject.forecastCasesArray[i]
            if (forecastCase.status === 'Forecasted' && forecastCase.id === forecastCaseId) {

                let testCase = TS.projects.foundations.globals.taskConstants.TEST_SERVER.testCasesManager.testCasesMap.get(forecastCase.parametersHash)
                forecastCase.forcastedCandle = await TS.projects.foundations.globals.taskConstants.TEST_SERVER.dataBridge.updateDatasetFiles(testCase)

                let thisForecastCase = {
                    id: forecastCase.id,
                    caseIndex: forecastCase.caseIndex,
                    parameters: forecastCase.parameters,
                    testServer: {
                        userProfile: ((forecastCase.testServer != undefined) && (forecastCase.testServer.userProfile != undefined) ? forecastCase.testServer.userProfile : ''),
                        instance: ((forecastCase.testServer != undefined) && (forecastCase.testServer.instance != undefined) ? forecastCase.testServer.instance : TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName)
                    },
                    files: TS.projects.foundations.globals.taskConstants.TEST_SERVER.dataBridge.getFiles(testCase)
                }
                return thisForecastCase
            }
        }
    }

    function setForecastCaseResults(forecastResult, forecastedBy) {

        try {
            let forecastCase = thisObject.forecastCasesMap.get(forecastResult.id)
            if ((forecastCase == undefined) && (forecastResult.id != undefined) && (forecastResult.id > 0) ) {
                console.log((new Date()).toISOString(), '[INFO] ' + forecastedBy + ' produced a new Forecast for the Case Id ' + forecastResult.id)
                console.log((new Date()).toISOString(), '[INFO] This Case id is unkown or outdated. Testserver did receive a better result in the meantime of Forecastclient processing.')
            } 
            if (forecastCase != undefined) {
                forecastCase.status = 'Forecasted'
                forecastCase.predictions = forecastResult.predictions
                forecastCase.errorRMSE = forecastResult.errorRMSE
                forecastCase.percentageErrorRMSE = calculatePercentageErrorRMSE(forecastResult)
                forecastCase.enlapsedSeconds = forecastResult.enlapsedTime.toFixed(0)
                forecastCase.enlapsedMinutes = (forecastResult.enlapsedTime / 60).toFixed(2)
                forecastCase.enlapsedHours = (forecastResult.enlapsedTime / 3600).toFixed(2)
                forecastCase.forecastedBy = forecastedBy
                forecastCase.testServer = forecastResult.testServer
                forecastCase.timestamp = (new Date()).valueOf()
    
                let logQueue = []
                for (let i = Math.max(0, forecastResult.caseIndex - 5); i < Math.min(thisObject.forecastCasesArray.length, forecastResult.caseIndex + 5); i++) {
                    let forecastCase = thisObject.forecastCasesArray[i]
                    if (forecastCase.timestamp !== undefined) {
                        forecastCase.when = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getHHMMSS(forecastCase.timestamp) + ' HH:MM:SS ago'
                    }
                    logQueue.push(forecastCase)
                }
                console.log((new Date()).toISOString(), forecastedBy + ' produced a new Forecast for the Case Id ' + forecastResult.id)
                console.log((new Date()).toISOString(), 'Updated partial table of Forecast Cases:')
                console.table(logQueue)
                saveForecastReportFile()
                saveForecastCasesFile()    
            }
        } catch (err) {
            console.log((new Date()).toISOString(), '[ERROR] Error processing forecast results. Err = ' + err.stack)
            console.log((new Date()).toISOString(), '[ERROR] forecastResult = ' + JSON.stringify(forecastResult))
        }

        function calculatePercentageErrorRMSE(forecastResult) {
            let percentageErrorRMSE = forecastResult.errorRMSE / forecastResult.predictions[0] * 100
            return percentageErrorRMSE.toFixed(2)
        }

        function saveForecastReportFile() {
            let forecastReportFile = ""
            //read existing report file, if it's not empty append new data
            let fileContent = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.loadFile(global.env.PATH_TO_BITCOIN_FACTORY + "/OutputData/ForecastReports/" + REPORT_NAME + ".CSV")
            if (fileContent !== undefined) {
                forecastReportFile = fileContent
            }            

            for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
                let forecastCase = thisObject.forecastCasesArray[i]
                if (forecastCase.status === 'Forecasted') {
                    let forecastReportFileRow = ""
                    /* Header */
                    if (forecastReportFile === "") {
                        addHeaderFromObject(forecastCase)
                        function addHeaderFromObject(jsObject) {
                            for (const property in jsObject) {
                                if (
                                    property === "testedBy" ||
                                    property === "timestamp" ||
                                    property === "when"
                                ) {
                                    continue
                                }
                                let label = property.replace('NUMBER_OF_', '').replace('LIST_OF_', '')
                                if (forecastReportFileRow !== "") {
                                    forecastReportFileRow = forecastReportFileRow + ","
                                }
                                if (Array.isArray(jsObject[property]) === true) {
                                    forecastReportFileRow = forecastReportFileRow + label
                                    for (let j = 0; j < jsObject[property].length; j++) {
                                        forecastReportFileRow = forecastReportFileRow + ","
                                        forecastReportFileRow = forecastReportFileRow + label + ' ' + (j + 1)
                                    }
                                } else {
                                    if (typeof jsObject[property] === 'object') {
                                        forecastReportFileRow = forecastReportFileRow + label
                                        addHeaderFromObject(jsObject[property])
                                    } else {
                                        forecastReportFileRow = forecastReportFileRow + label
                                    }
                                }
                            }
                        }                        
                        forecastReportFileRow = forecastReportFileRow + "\r\n"
                        forecastReportFile = forecastReportFile + forecastReportFileRow
                        forecastReportFileRow = ""
                    }
                    /* Data */
                    addDataFromObject(forecastCase)
                    function addDataFromObject(jsObject) {
                        for (const property in jsObject) {
                            if (
                                property === "testedBy" ||
                                property === "timestamp" ||
                                property === "when"
                            ) {
                                continue
                            }
                            if (forecastReportFileRow !== "") {
                                forecastReportFileRow = forecastReportFileRow + ","
                            }
                            if (Array.isArray(jsObject[property]) === true) {
                                forecastReportFileRow = forecastReportFileRow + jsObject[property].length
                                for (let j = 0; j < jsObject[property].length; j++) {
                                    forecastReportFileRow = forecastReportFileRow + ","
                                    let arrayItem = jsObject[property][j]
                                    forecastReportFileRow = forecastReportFileRow + arrayItem
                                }
                            } else {
                                if (typeof jsObject[property] === 'object') {
                                    forecastReportFileRow = forecastReportFileRow + Object.keys(jsObject[property]).length
                                    addDataFromObject(jsObject[property])
                                } else {
                                    forecastReportFileRow = forecastReportFileRow + jsObject[property]
                                }
                            }
                        }
                    }                    
                    forecastReportFileRow = forecastReportFileRow + "\r\n"
                    forecastReportFile = forecastReportFile + forecastReportFileRow                    
                }
            }
            if (forecastReportFile != "" ) {
                SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName + "/OutputData/ForecastReports/" + REPORT_NAME + ".CSV", forecastReportFile)
            }
        }
    }

    function saveForecastCasesFile() {
        let fileContent = JSON.stringify(thisObject.forecastCasesArray, undefined, 4)
        SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName + "/StateData/ForecastCases/Forecast-Cases-Array-" + networkCodeName + ".json", fileContent)
    }
}