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
    let Test_Server_BOT_CONFIG = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config

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
        try {
            SA.logger.debug('{ForecastCaseManager} Length forecastCasesArray: ' + thisObject.forecastCasesArray.length)
            if (testCase.ratio_validate !== undefined) SA.logger.debug('{ForecastCaseManager} testCase.id: ' + testCase.id + ' / ratio_validate: ' + testCase.ratio_validate)
            SA.logger.debug('{ForecastCaseManager} testCase.mainAsset: ' + testCase.mainAsset + ' / mainTimeFrame: ' + testCase.mainTimeFrame)
            for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
                let forecastCase = thisObject.forecastCasesArray[i]
                SA.logger.debug('{ForecastCaseManager} i: ' + i + ' / forecastCase.id: ' + forecastCase.id + ' / ratio_validate: ' + forecastCase.ratio_validate)

                // check if testCase has same mainAsset and TimeFrame as current forecastCase, ifso compare if testCase is better
                if (forecastCase.mainAsset === testCase.mainAsset && forecastCase.mainTimeFrame === testCase.mainTimeFrame) {
                    //LSTM
                    if (testCase.percentageErrorRMSE !== undefined) {
                        if (Number(testCase.percentageErrorRMSE) < Number(forecastCase.percentageErrorRMSE) && Number(testCase.percentageErrorRMSE) >= 0) {
                            thisObject.forecastCasesArray.splice(i, 1)
                            thisObject.forecastCasesMap.delete(forecastCase.id)
                            addForecastCase(testCase)
                            return
                        }
                    //RL     
                    } else if (testCase.ratio_validate !== undefined) {
                        SA.logger.info('Number(testCase.ratio_validate): ' + Number(testCase.ratio_validate) + " / Number(forecastCase.ratio_validate): " + Number(forecastCase.ratio_validate))
                        if ((Number(testCase.ratio_validate) > Number(forecastCase.ratio_validate)) || (forecastCase.ratio_validate == undefined)) {
                            SA.logger.debug('{ForecastCaseManager} new testCase is better as existing forecastCase')
                            thisObject.forecastCasesArray.splice(i, 1)
                            thisObject.forecastCasesMap.delete(forecastCase.id)
                            addForecastCase(testCase)
                            return
                        }
                    }
                } else {
                    if (!findForecastCaseWithSameAssetTimeframe(testCase.mainAsset, testCase.mainTimeFrame)) {
                        addForecastCase(testCase)
                        return
                    }
                }
            }
            if (thisObject.forecastCasesArray.length == 0) addForecastCase(testCase)    
        } finally {
            saveForecastCasesFile()

            SA.logger.info('Testserver: Current Forecast table:')
            console.table(thisObject.forecastCasesArray)    
        }

        function findForecastCaseWithSameAssetTimeframe(mainAsset,mainTimeFrame) {
            for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
                if ((thisObject.forecastCasesArray[i].mainAsset == mainAsset) &&
                (thisObject.forecastCasesArray[i].mainTimeFrame == mainTimeFrame)) {
                    return true
                }
            }
            return false
        }

        function addForecastCase(testCase) {
            let testServer
            let parameters  
            let predictions     
            let forecastedCandle     
            try {
                testServer = JSON.parse(JSON.stringify(testCase.testServer))
            } catch (err) {}                    
            try {
                parameters = JSON.parse(JSON.stringify(testCase.parameters))
            } catch (err) {}                    
            try {
                predictions = JSON.parse(JSON.stringify(testCase.predictions))
            } catch (err) {}                    
            try {
                forecastedCandle = JSON.parse(JSON.stringify(testCase.forecastedCandle))
            } catch (err) {}                    
            let forecastCase = {
                id: testCase.id,
                caseIndex: thisObject.forecastCasesArray.length,
                testServer: testServer,
                mainAsset: testCase.mainAsset,
                mainTimeFrame: testCase.mainTimeFrame,
                percentageErrorRMSE: testCase.percentageErrorRMSE,
                parameters: parameters,
                parametersHash: testCase.parametersHash,
                predictions: predictions,
                forecastedCandle: forecastedCandle,
                ratio_train : testCase.ratio_train,
                ratio_test : testCase.ratio_test,
                ratio_validate : testCase.ratio_validate,
                std_train : testCase.std_train,
                std_test : testCase.std_test,
                std_validate : testCase.std_validate,                
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
            forecastCase.forecastedCandle = await TS.projects.foundations.globals.taskConstants.TEST_SERVER.dataBridge.updateDatasetFiles(testCase)
            saveForecastCasesFile()

            let nextForecastCase = {
                id: forecastCase.id,
                caseIndex: forecastCase.caseIndex,
                totalCases: thisObject.forecastCasesArray.length,
                parameters: forecastCase.parameters,
                pythonScriptName: forecastCase.pythonScriptName,
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
                forecastCase.forecastedCandle = await TS.projects.foundations.globals.taskConstants.TEST_SERVER.dataBridge.updateDatasetFiles(testCase)

                let thisForecastCase = {
                    id: forecastCase.id,
                    caseIndex: forecastCase.caseIndex,
                    parameters: forecastCase.parameters,
                    pythonScriptName: forecastCase.pythonScriptName,
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
                SA.logger.info('' + forecastedBy + ' produced a new Forecast for the Case Id ' + forecastResult.id)
                SA.logger.info('This Case id is unkown or outdated. Testserver did receive a better result in the meantime of Forecastclient processing.')
            } 
            if (forecastCase != undefined) {
                forecastCase.status = 'Forecasted'
                forecastCase.elapsedSeconds = forecastResult.elapsedTime.toFixed(0)
                forecastCase.elapsedMinutes = (forecastResult.elapsedTime / 60).toFixed(2)
                forecastCase.elapsedHours = (forecastResult.elapsedTime / 3600).toFixed(2)
                forecastCase.forecastedBy = forecastedBy
                forecastCase.testServer = forecastResult.testServer
                forecastCase.pythonScriptName = forecastResult.pythonScriptName     
                forecastCase.timestamp = (new Date()).valueOf()
                //LSTM
                if (forecastResult.errorRMSE != undefined) {       
                    forecastCase.predictions = forecastResult.predictions
                    forecastCase.errorRMSE = forecastResult.errorRMSE
                    forecastCase.percentageErrorRMSE = calculatePercentageErrorRMSE(forecastResult)
                //RL      
                } else if (forecastResult["0"] != undefined) {      
                    forecastCase.predictions = forecastResult["2"].current_action
                    forecastCase.ratio_train = (forecastResult["0"].meanNetWorthAtEnd / forecastResult["0"].NetWorthAtBegin).toFixed(2)
                    forecastCase.ratio_test = (forecastResult["1"].meanNetWorthAtEnd / forecastResult["1"].NetWorthAtBegin).toFixed(2)
                    forecastCase.ratio_validate = (forecastResult["2"].meanNetWorthAtEnd / forecastResult["2"].NetWorthAtBegin).toFixed(2)
                    forecastCase.std_train = (forecastResult["0"].stdNetWorthAtEnd / forecastResult["0"].NetWorthAtBegin).toFixed(4)
                    forecastCase.std_test = (forecastResult["1"].stdNetWorthAtEnd / forecastResult["1"].NetWorthAtBegin).toFixed(4)
                    forecastCase.std_validate = (forecastResult["2"].stdNetWorthAtEnd  / forecastResult["2"].NetWorthAtBegin).toFixed(4)   
                }
                
                updateSuperalgos(forecastCase)

                //update forecastCasesArray
                for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
                    if (thisObject.forecastCasesArray[i].id == forecastCase.id) {
                        thisObject.forecastCasesArray[i] = forecastCase
                    }
                }
                let logQueue = []
                for (let i = Math.max(0, forecastResult.caseIndex - 5); i < Math.min(thisObject.forecastCasesArray.length, forecastResult.caseIndex + 5); i++) {
                    let forecastCase = thisObject.forecastCasesArray[i]
                    if (forecastCase.timestamp !== undefined) {
                        forecastCase.when = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getHHMMSS(forecastCase.timestamp) + ' HH:MM:SS ago'
                    }
                    logQueue.push(forecastCase)
                }
                SA.logger.info('{Test-Server} ' + forecastedBy + ' produced a new Forecast for the Case Id ' + forecastResult.id)
                SA.logger.info('{Test-Server} Updated partial table of Forecast Cases:')
                console.table(logQueue)
                saveForecastReportFile()
                saveForecastCasesFile()    
            }
        } catch (err) {
            SA.logger.error('{Test-Server} Error processing forecast results. Err = ' + err.stack)
            SA.logger.error('{Test-Server} forecastResult = ' + JSON.stringify(forecastResult))
        }

        function calculatePercentageErrorRMSE(forecastResult) {
            let percentageErrorRMSE = forecastResult.errorRMSE / forecastResult.predictions[0] * 100
            return percentageErrorRMSE.toFixed(2)
        }

        function updateSuperalgos(bestPredictions) {

            for (let i = 0; i < bestPredictions.length; i++) {
                let prediction = bestPredictions[i]
                prediction.parameters = {}
            }
    
            let params = {
                method: 'updateForecastedCandles',
                forecastedCandles: JSON.stringify(bestPredictions)
            }
    
            const axios = require("axios")
            axios
                .post('http://' + Test_Server_BOT_CONFIG.targetSuperalgosHost + ':' + Test_Server_BOT_CONFIG.targetSuperalgosHttpPort + '/Bitcoin-Factory', params)
                .then(res => {
                    SA.logger.info('Updating Superalgos...', 'Response from Superalgos Bitcoin Factory Server: ' + JSON.stringify(res.data))
                })
                .catch(error => {
                    SA.logger.error('Updating Superalgos...', 'Could not update Superalgos. Had this error: ' + error)
                })
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