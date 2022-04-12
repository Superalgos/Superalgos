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

    const fs = require("fs")
    return thisObject

    function initialize() {

        loadForecastCasesFile()

        function loadForecastCasesFile() {
            let fileContent = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.loadFile(global.env.PATH_TO_BITCOIN_FACTORY + "/StateData/ForecastCases/Forecast-Cases-Array-" + networkCodeName + ".json")
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
                if (Number(testCase.percentageErrorRMSE) < Number(forecastCase.percentageErrorRMSE)) {
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
            let forecastCase = {
                id: testCase.id,
                caseIndex: thisObject.forecastCasesArray.length,
                mainAsset: testCase.mainAsset,
                mainTimeFrame: testCase.mainTimeFrame,
                percentageErrorRMSE: testCase.percentageErrorRMSE,
                parameters: JSON.parse(JSON.stringify(testCase.parameters)),
                predictions: JSON.parse(JSON.stringify(testCase.predictions)),
                forcastedCandle: JSON.parse(JSON.stringify(testCase.forcastedCandle)),
                timeSeriesFileName: testCase.timeSeriesFileName,
                timestamp: testCase.timestamp,
                when: testCase.when,
                testedBy: testCase.testedBy,
                status: 'Model Not Built Yet'
            }
            thisObject.forecastCasesArray.push(forecastCase)
            thisObject.forecastCasesMap.set(forecastCase.id, forecastCase)
        }
    }

    function getNextForecastCase() {
        for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
            let forecastCase = thisObject.forecastCasesArray[i]
            if (forecastCase.status === 'Model Not Built Yet') {
                forecastCase.status = 'Model Buing Built'
                let nextForecastCase = {
                    id: forecastCase.id,
                    caseIndex: forecastCase.caseIndex, 
                    totalCases: thisObject.forecastCasesArray.length,
                    parameters: forecastCase.parameters,
                    files: TS.projects.foundations.globals.taskConstants.TEST_SERVER.dataBridge.getFiles(forecastCase)
                }
                return nextForecastCase
            }
        }
    }

    function getThisForecastCase(forecastCaseId) {
        for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
            let forecastCase = thisObject.forecastCasesArray[i]
            if (forecastCase.status === 'Forecasted' && forecastCase.id === forecastCaseId) {
                let thisForecastCase = {
                    id: forecastCase.id,
                    caseIndex: forecastCase.caseIndex, 
                    parameters: forecastCase.parameters,
                    files: TS.projects.foundations.globals.taskConstants.TEST_SERVER.dataBridge.getFiles(forecastCase)
                }
                return thisForecastCase
            }
        }
    }

    function setForecastCaseResults(forecastResult, forecastedBy) {

        try {
            let forecastCase = thisObject.forecastCasesMap.get(forecastResult.id)
            forecastCase.status = 'Forecasted'
            forecastCase.predictions = forecastResult.predictions
            forecastCase.errorRMSE = forecastResult.errorRMSE
            forecastCase.percentageErrorRMSE = calculatePercentageErrorRMSE(forecastResult)
            forecastCase.enlapsedSeconds = forecastResult.enlapsedTime.toFixed(0)
            forecastCase.enlapsedMinutes = (forecastResult.enlapsedTime / 60).toFixed(2)
            forecastCase.enlapsedHours = (forecastResult.enlapsedTime / 3600).toFixed(2)
            forecastCase.forecastedBy = forecastedBy
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
            saveForecastCasesFile()

        } catch (err) {
            console.log((new Date()).toISOString(), '[ERROR] Error processing forecast results. Err = ' + err.stack)
            console.log((new Date()).toISOString(), '[ERROR] forecastResult = ' + JSON.stringify(forecastResult))
        }

        function calculatePercentageErrorRMSE(forecastResult) {
            let percentageErrorRMSE = forecastResult.errorRMSE / forecastResult.predictions[0] * 100
            return percentageErrorRMSE.toFixed(2)
        }
    }

    function saveForecastCasesFile() {
        let fileContent = JSON.stringify(thisObject.forecastCasesArray, undefined, 4)
        fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/StateData/ForecastCases/Forecast-Cases-Array-" + networkCodeName + ".json", fileContent)
    }
}