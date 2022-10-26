exports.newBitcoinFactoryBotModulesForecastClient = function (processIndex) {

    const MODULE_NAME = "Forecast-Client"
    const FORECAST_CLIENT_VERSION = 2

    let thisObject = {
        forecastCasesArray: undefined,
        utilities: undefined,
        initialize: initialize,
        finalize: finalize,
        start: start
    }

    thisObject.utilities = TS.projects.bitcoinFactory.utilities.miscellaneous
    let BOT_CONFIG = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config
    let reforecasting = false
    let forecasting = false

    let dockerPID

    let intervalId = setInterval(updateForcasts, 60 * 1000)

    return thisObject

    function initialize(pStatusDependenciesModule, callBackFunction) {
        try {
            /*
            Create Missing Folders, if needed.
            */
            console.log((new Date()).toISOString(), 'Running Forecast Client v.' + FORECAST_CLIENT_VERSION)
            let dir
            dir = global.env.PATH_TO_BITCOIN_FACTORY + '/Forecast-Client/StateData/ForecastCases'
            if (!SA.nodeModules.fs.existsSync(dir)) {
                SA.nodeModules.fs.mkdirSync(dir, { recursive: true });
            }

            thisObject.utilities.initialize()

            loadForecastCasesFile()

            function loadForecastCasesFile() {
                let fileContent = thisObject.utilities.loadFile(global.env.PATH_TO_BITCOIN_FACTORY + "/Forecast-Client/StateData/ForecastCases/Forecast-Cases-Array-" + BOT_CONFIG.networkCodeName + ".json")
                if (fileContent !== undefined) {
                    thisObject.forecastCasesArray = JSON.parse(fileContent)
                } else {
                    thisObject.forecastCasesArray = []
                }
            }

            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] initialize -> err = " + err.stack)
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }

    //ToDo finalize is NOT triggered if client is stopped from UI
    function finalize() {
        clearInterval(intervalId)
        if (dockerPID != undefined) {
            console.log('Try 1 to kill')
            const kill = require("tree-kill");
            kill(dockerPID)
        }
        console.log('Try 2 to kill')
        const { spawn } = require('child_process');
        const dockerProc = spawn('docker', ['stop', 'Bitcoin-Factory-ML-Forecasting']);

        dockerProc.stdout.on('data', (data) => {
        });

        dockerProc.stderr.on('data', (data) => {
        });

        dockerProc.on('close', (code) => {
        });
    }

    async function start(callBackFunction) {
        //only start once
        if (!forecasting) {
            forecasting = true
            try {
                await getNextForecastCase()
                    .then(onSuccessgetNextForecastCase)
                    .catch(onErrorgetNextForecastCase)
                async function onSuccessgetNextForecastCase(nextForecastCase) {
                    if (nextForecastCase !== undefined) {
                        SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Forecast-Client/notebooks/parameters_forecast.csv", nextForecastCase.files.parameters)
                        SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Forecast-Client/notebooks/time-series_forecast.csv", nextForecastCase.files.timeSeries)
    
                        nextForecastCase.modelName = "MODEL-" + nextForecastCase.id
    
                        await buildModel(nextForecastCase)
                            .then(onSuccess)
                            .catch(onError)
    
                        async function onSuccess(forecastResult) {
    
                            nextForecastCase.expiration = thisObject.utilities.getExpiration(nextForecastCase)
                            nextForecastCase.timestamp = (new Date()).valueOf()
                            nextForecastCase.timeSeriesHash = thisObject.utilities.hash(nextForecastCase.files.timeSeries)
                            nextForecastCase.files = undefined
                            nextForecastCase.caseIndex = thisObject.forecastCasesArray.length
                            nextForecastCase.predictions = forecastResult.predictions
    
                            thisObject.forecastCasesArray.push(nextForecastCase)
                            saveForecastCasesFile()
                            logQueue(nextForecastCase)
    
                            await publishResult(forecastResult,callBackFunction)
                                .then(onSuccessPublish)
                                .catch(onErrorPublish)
                        }
    
                        async function onError(err) {
                                forecasting = false
                                console.log((new Date()).toISOString(), 'Failed to Build the Model for this Forecast Case. Err:', err, 'Aborting the processing of this case and retrying the main loop in 30 seconds...')
                                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        }
                    } else {
                        forecasting = false
                        console.log((new Date()).toISOString(), '[INFO] Nothing to Forecast', 'Retrying in 30 seconds...')
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                    }
                }
                async function onErrorgetNextForecastCase(err) {                    
                    console.log((new Date()).toISOString(), '[INFO] getNextForecastCase: Failed to get a new Forecast Case. Err:', err)    
                    if (err === 'DUPLICATE FORECAST CASE') {
                        console.log((new Date()).toISOString(), '[INFO] Resending result from local DB.')    
                        //(re)send result, maybe server didnt store it for whatever reasons

/*
                        nextForecastCase undefined

                        await publishResult(nextForecastCase,callBackFunction)
                            .then(onSuccessRePublish)
                            .catch(onErrorRePublish)
                        async function onSuccessRePublish(result) {
                            forecasting = false
                            console.log((new Date()).toISOString(), '3')
                            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                        }
                        async function onErrorRePublish(err) {
                            forecasting = false
                            console.log((new Date()).toISOString(), '4')
                            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        }   
                        */                                 
                    }  else {
                        await getAllForecastCase()
                            .then(onSuccessgetAllForecastCase)
                            .catch(onErrorgetAllForecastCase)
                        async function onSuccessgetAllForecastCase(response) {
                            if ((response != undefined) && (response !== 'No response')) {
                                if ((response.data != undefined) && (response.data.serverData != undefined) && (response.data.serverData.response != undefined)) {
                                    try {
                                        let bestPredictions = JSON.parse(response.data.serverData.response)
                                        for (let i = 0; i < bestPredictions.length; i++) {
                                            if (bestPredictions[i].testServer == undefined) {
                                                bestPredictions[i].testServer = {
                                                    userProfile: response.data.serverData.userProfile,
                                                    instance: response.data.serverData.instance
                                                }
                                            }
                                        }
                                        //console.table(bestPredictions)    
                                        let changeArrayLength = checkSetForecastCaseResultsResponse(bestPredictions)
                                        console.log((new Date()).toISOString(), '[INFO] Size of local forecast array did change by ', changeArrayLength)
                                        if (changeArrayLength > 0) {
                                            await getThisForecastCase(thisObject.forecastCasesArray[thisObject.forecastCasesArray.length - 1])
                                                .then(onSuccess)
                                                .catch(onError)
                                            async function onSuccess(thisForecastCase) {
                                                await onSuccessgetNextForecastCase(thisForecastCase)
                                            }
                                            async function onError(err) {
                                                forecasting = false
                                                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                                            }
                                        } else {
                                            forecasting = false
                                            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                                        }

                                    } catch (err) {
                                        forecasting = false
                                        console.log("response.data.serverData.response:" + response.data.serverData.response)
                                        console.log("err: " + err)
                                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                                    }
                                } else {
                                    forecasting = false
                                    console.log((new Date()).toISOString(), '[WARN] getAllForecastCase: Failed to get any Forecast Case. No Data' + (((response.data != undefined) && (response.data.serverData != undefined) && (response.data.serverData.instance != undefined)) ? ' from ' + response.data.serverData.instance + '.' : '.'))
                                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                                }
                            } else {
                                forecasting = false
                                console.log((new Date()).toISOString(), '[WARN] getAllForecastCase: Failed to get any Forecast Case. No response.')
                                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                            }
                        }
                        async function onErrorgetAllForecastCase(err) {
                            forecasting = false
                            console.log((new Date()).toISOString(), '[WARN] Failed to get a any Forecast Case. Err:', err, 'Retrying in 30 seconds...')
                            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        }                        
                    }
                }
            }
            catch (err) {
                forecasting = false
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[ERROR] start -> err = " + err.stack)
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
            }
        } else {
            console.log((new Date()).toISOString(), 'Already Working on Forcasting', 'Retrying in 60 seconds...')
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)        
        }
    }

    async function publishResult(forecastResult,callBackFunction=undefined) {
        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {        
            let forecastResultAccepted = false
            let maxSendTries = 10
            let curSendTries = 1
            while ((forecastResultAccepted === false) && (forecastResult !== undefined) && (curSendTries<=maxSendTries)) {
                await setForecastCaseResults(forecastResult, 'clientInstanceBuilder')
                    .then(onSuccess)
                    .catch(onError)
                async function onSuccess(response) {
                    console.log((new Date()).toISOString(), '[INFO] Got response on TrialNo: ', curSendTries)    
                    if ((response != undefined) && (response !== 'No response')) {
                        if ((response.data != undefined) && (response.data.serverData != undefined) && (response.data.serverData.response != undefined)) {
                            if (response.data.serverData.response.indexOf('WRONG TESTSERVER!') == -1) {
                                try {
                                    let bestPredictions = JSON.parse(response.data.serverData.response)
                                    for (let i=0; i<bestPredictions.length;i++) {
                                        if (bestPredictions[i].testServer == undefined) {
                                            bestPredictions[i].testServer = {
                                                userProfile: response.data.serverData.userProfile,
                                                instance: response.data.serverData.instance
                                            }        
                                        } 
                                        if ((bestPredictions[i].testServer.userProfile == undefined) || (bestPredictions[i].testServer.userProfile === '')) {
                                            bestPredictions[i].testServer.userProfile = response.data.serverData.userProfile
                                        }
                                    }
                                    console.log((new Date()).toISOString(), '[INFO] Size of local forecast array did change by ', checkSetForecastCaseResultsResponse(bestPredictions))
                                    forecastResultAccepted = true
        
                                    console.log(' ')
                                    console.log((new Date()).toISOString(), '[INFO] Result on Forecasting: Best Crowd-Sourced Predictions:')
                                    console.table(bestPredictions)
        
                                    let statusText = 'Published Forecast Case ' + forecastResult.id + ' to ' + forecastResult.testServer.instance
                                    TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, '', '', statusText)
        
                                    if (typeof callBackFunction === "function") callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)    
                                } catch (jsonErr) {
                                    console.log("response.data.serverData.response:" + response.data.serverData.response)
                                    console.log("err: " + jsonErr)
                                    if (typeof callBackFunction === "function") callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                                }    
                            } else {
                                console.log((new Date()).toISOString(), '[WARN] setForecastCaseResults: Wrong server did respond.')
                                if (typeof callBackFunction === "function") callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)    
                            }
                        } else {
                            console.log((new Date()).toISOString(), '[WARN] setForecastCaseResults: Failed to get any Forecast Case. No Data' + (((response.data != undefined) && (response.data.serverData != undefined) && (response.data.serverData.instance != undefined)) ? ' from ' + response.data.serverData.instance + '.': '.'))
                            if (typeof callBackFunction === "function") callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        }
                    } else {
                        console.log((new Date()).toISOString(), '[WARN] setForecastCaseResults: Failed to get any Forecast Case. No response.')
                        if (typeof callBackFunction === "function") callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                    }               
                }
                async function onError(err) {
                    console.log((new Date()).toISOString(), '[ERROR] Failed to send a Report to the Test Server ' + forecastResult.testServer.instance + ' with the Forecast Case Results '+ forecastResult.id + ' and get a Reward for that.')
                    console.log((new Date()).toISOString(), '[ERROR] Err: ', err, ' TrialNo: ', curSendTries)
                    console.log((new Date()).toISOString(), '[ERROR] Retrying to send the Forecast Report in 60 seconds...')
                }  
                curSendTries++
            }
            if (forecastResultAccepted) resolve()
            else reject()
        }
    }
    async function onSuccessPublish(result) {
        forecasting = false
        console.log((new Date()).toISOString(), '[INFO] Result published')
    }
    async function onErrorPublish(err) {
        forecasting = false
        console.log((new Date()).toISOString(), '[ERROR] Err on publishing: ', err)
    }


    async function getAllForecastCase() {
        return new Promise(promiseWork)
        async function promiseWork(resolve, reject) {
            console.log((new Date()).toISOString(), '[INFO] getAllForecastCase: Query Testserver for all Forecast Cases')
            let message = {
                type: 'Get All Forecast Cases'
            }

            let queryMessage = {
                messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                sender: 'Forecast-Client',
                instance: TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.clientInstanceBuilder,
                recipient: 'Forecast Client Manager',
                message: message,
                forecastClientVersion: FORECAST_CLIENT_VERSION
            }

            let messageHeader = {
                requestType: 'Query',
                networkService: 'Machine Learning',
                queryMessage: JSON.stringify(queryMessage)
            }

            if (TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient.machineLearningNetworkServiceClient === undefined) {
                reject('Not connected to the Test Server yet... hold on...')
                return
            }
            await TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient.machineLearningNetworkServiceClient.sendMessage(messageHeader)
                .then(onSuccess)
                .catch(onError)
            async function onSuccess(response) {
                if (response != undefined) {
                    resolve(response)
                } else {
                    console.log((new Date()).toISOString(), '[INFO] No response from Testserver', 'Retrying in 30 seconds...')
                    resolve('No response')
                }
            }
            async function onError(err) {
                reject(err)
            }
        }
    }

    async function getNextForecastCase() {
        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {

            let message = {
                type: 'Get Next Forecast Case'
            }

            let queryMessage = {
                messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                sender: 'Forecast-Client',
                instance: TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.clientInstanceBuilder,
                recipient: 'Forecast Client Manager',
                message: message,
                forecastClientVersion: FORECAST_CLIENT_VERSION
            }

            let messageHeader = {
                requestType: 'Query',
                networkService: 'Machine Learning',
                queryMessage: JSON.stringify(queryMessage)
            }

            if (TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient.machineLearningNetworkServiceClient === undefined) {
                reject('Not connected to the Test Server yet... hold on...')
                return
            }

            await TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient.machineLearningNetworkServiceClient.sendMessage(messageHeader)
                .then(onSuccess)
                .catch(onError)
            async function onSuccess(response) {
                if (response.data.serverData === undefined) {
                    reject('Not connected to Test Server')
                    return
                }
                if (response.data.serverData.response !== 'NO FORECAST CASES AVAILABLE AT THE MOMENT') {
                    let nextForecastCase = response.data.serverData.response
                    nextForecastCase.testServer = {
                        userProfile: response.data.serverData.userProfile,
                        instance: response.data.serverData.instance
                    }
                    for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
                        if (thisObject.forecastCasesArray[i].id == nextForecastCase.id) {
                            console.log((new Date()).toISOString(), '[ERROR] Test Server ' + nextForecastCase.testServer.instance + ' did send me forecast case ' + nextForecastCase.id + ', which is allready in local database')
                         //   reject('DUPLICATE FORECAST CASE')
                        }
                    }
                    resolve(nextForecastCase)
                } else {
                    reject('No more forecast cases at the Test Server ' + response.data.serverData.instance)
                }
            }
            async function onError(err) {
                reject(err)
            }
        }
    }

    async function getThisForecastCase(forecastCase) {
        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {

            //debug
            console.log("DEBUG requested testserver: " + JSON.stringify(forecastCase.testServer))

            let message = {
                type: 'Get This Forecast Case',
                testServer: forecastCase.testServer,
                forecastCaseId: forecastCase.id
            }

            let queryMessage = {
                messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                sender: 'Forecast-Client',
                instance: TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.clientInstanceForecaster,
                recipient: 'Forecast Client Manager',
                testServer: forecastCase.testServer,
                message: message,
                forecastClientVersion: FORECAST_CLIENT_VERSION
            }

            let messageHeader = {
                requestType: 'Query',
                networkService: 'Machine Learning',
                queryMessage: JSON.stringify(queryMessage)
            }

            await TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient.machineLearningNetworkServiceClient.sendMessage(messageHeader)
                .then(onSuccess)
                .catch(onError)
            async function onSuccess(response) {
                if (response.data.serverData.response !== 'THIS FORECAST CASE IS NOT AVAILABLE ANYMORE') {
                    let thisForecastCase = response.data.serverData.response
                    thisForecastCase.testServer = {
                        userProfile: response.data.serverData.userProfile,
                        instance: response.data.serverData.instance
                    }
                    if (thisForecastCase.id == forecastCase.id) {
                        resolve(thisForecastCase)
                    } else {
                        console.log((new Date()).toISOString(), '[ERROR] I asked for Forecast Case id ' + forecastCase.id + ', but got Case id ' + thisForecastCase.id + ' back')
                        reject('RESPONSE WITH WRONG FORECAST CASE ID')
                    }
                } else {
                    if (response.data.serverData.instance === forecastCase.testServer.instance) {
                        reject(response.data.serverData.response)
                    } else {
                        reject('WRONG SERVER DID RESPOND')
                    } 
                }
            }
            async function onError(err) {
                reject(err)
            }
        }
    }

    async function setForecastCaseResults(forecastResult, clientInstanceConfigPropertyName) {
        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {

            if (forecastResult.testServer == undefined) {
                console.log('BUG testserver undefined')
                reject('forecastResult with undefined testserver')
            } 
            forecastResult.trainingOutput = undefined // delete this to save bandwidth

            let message = {
                type: 'Set Forecast Case Results',
                testServer: forecastResult.testServer,
                payload: JSON.stringify(forecastResult)
            }

            let queryMessage = {
                messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                sender: 'Forecast-Client',
                instance: TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config[clientInstanceConfigPropertyName],
                recipient: 'Forecast Client Manager',
                testServer: forecastResult.testServer,
                message: message,
                forecastClientVersion: FORECAST_CLIENT_VERSION
            }

            let messageHeader = {
                requestType: 'Query',
                networkService: 'Machine Learning',
                queryMessage: JSON.stringify(queryMessage)
            }

            await TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient.machineLearningNetworkServiceClient.sendMessage(messageHeader)
                .then(onSuccess)
                .catch(onError)
            async function onSuccess(response) {
                if ((forecastResult.testServer.instance === response.data.serverData.instance) && 
                (forecastResult.testServer.userProfile === response.data.serverData.userProfile)) {
                    response.data.serverData.response.testServer = {
                        userProfile: response.data.serverData.userProfile,
                        instance: response.data.serverData.instance
                    }
                    console.log('[DEBUG] ', response.data.serverData.response.testServer)
                    resolve(response)   
                } else {
                    reject('WRONG SERVER DID RESPOND')
                }
            }
            async function onError(err) {
                reject(err)
            }
        }
    }

    function writePhytonInstructionsFile(instruction, nextForecastCase, buildnewModel) {
        /*
        Here we will instruct the dockerd Phyton Script to Build and save the model or to just reforcast based on existing model.
        */
        let instructionsFile = ""

        instructionsFile = instructionsFile +
            /* Headers */
            "INSTRUCTION" + "   " + "VALUE" + "\r\n" +
            /* Values */
            "ACTION_TO_TAKE" + "   " + instruction + "\r\n" +
            "MODEL_FILE_NAME" + "   " + nextForecastCase.testServer.instance + "_" + nextForecastCase.modelName + "\r\n"
        //choose which csv-files to use    
        if (buildnewModel) {
            instructionsFile += "PARAMETERS_FILE" + "   " + "parameters_forecast.csv" + "\r\n" +
                                "TIMESERIES_FILE" + "   " + "time-series_forecast.csv" + "\r\n"
        } else {
            instructionsFile += "PARAMETERS_FILE" + "   " + "parameters_reforecast.csv" + "\r\n" +
                                "TIMESERIES_FILE" + "   " + "time-series_reforecast.csv" + "\r\n"
        }     
        SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Forecast-Client/notebooks/instructions.csv", instructionsFile)
    }

    function getRelevantParameters(parameters) {
        /*
        Remove from Parameters the properties that are in OFF
        */
        let relevantParameters = {}
        for (const property in parameters) {
            if (parameters[property] !== 'OFF') {
                relevantParameters[property] = parameters[property]
            }
        }
        return relevantParameters
    }

    async function buildModel(nextForecastCase) {
        return useModel(nextForecastCase,true)
    }

    async function useModel(nextForecastCase,buildnewModel=false) {
        /*
        Set default script name.
        */
        if (nextForecastCase.pythonScriptName === undefined) { 
            console.log("pythonScriptName undefined ... set default name")
            nextForecastCase.pythonScriptName = "Bitcoin_Factory_LSTM_Forecasting.py" 
        }
        console.log('')
        if (buildnewModel) {
            console.log('------------------------------------------------------- Forecasting Case # ' + nextForecastCase.id + ' ------------------------------------------------------------')
        } else {
            console.log('------------------------------------------------------- Reforecasting Case # ' + nextForecastCase.id + ' ------------------------------------------------------------')
        }
        console.log('')
        console.log('Test Server: ' + nextForecastCase.testServer.userProfile + ' / ' + nextForecastCase.testServer.instance)
        console.log('')
        console.log('Parameters Received for this Forecast:')
        console.table(getRelevantParameters(nextForecastCase.parameters))
        console.log('')
        console.log((new Date()).toISOString(), 'Starting to process this Case')
        console.log('')

        if (buildnewModel) {
            writePhytonInstructionsFile("BUILD_AND_SAVE_MODEL", nextForecastCase, buildnewModel)
        } else {
            writePhytonInstructionsFile("LOAD_MODEL_AND_PREDICT", nextForecastCase, buildnewModel)
        }

        return new Promise(executeThePythonScript)

        async function executeThePythonScript(resolve, reject) {
    
            let processExecutionResult
            let startingTimestamp = (new Date()).valueOf()
    
            const { spawn } = require('child_process');
            const dockerProc = spawn('docker', ['exec', 'Bitcoin-Factory-ML-Forecasting', 'python', '-u', '/tf/notebooks/' + nextForecastCase.pythonScriptName ]);
            let dataReceived = ''
            dockerPID = dockerProc.pid
            dockerProc.stdout.on('data', (data) => {
                data = data.toString()
                if (data.includes('RL_SCENARIO_START') || data.includes('episodeRewardMean')) {
                    try {
                        let fileContent = SA.nodeModules.fs.readFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Forecast-Client/notebooks/training_results.json")

                        if (fileContent !== undefined) {
                            let percentage = 0
                            let statusText = 'Forecast Case: ' + nextForecastCase.id + ' from ' + nextForecastCase.testServer.instance

                            data = JSON.parse(fileContent)

                            percentage = Math.round(data.timestepsExecuted / data.timestepsTotal * 100)
                            let heartbeatText = 'Episode reward mean / max / min: ' + data.episodeRewardMean + ' | ' + data.episodeRewardMax + ' | ' + data.episodeRewardMin

                            TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, heartbeatText, percentage, statusText)
                        }
                    } catch (err) {  }
                } else {
                    /*
                    Removing Carriedge Return from string.
                    */
                    try {
                        let percentage = ''
                        let heartbeatText = ''
                        let statusText = 'Forecast Case ' + nextForecastCase.id + ' from ' + nextForecastCase.testServer.instance
                        if (data.substring(0, 5) === 'Epoch') {
                            let regEx = new RegExp('Epoch (\\d+)/(\\d+)', 'gim')
                            let match = regEx.exec(data)
                            heartbeatText = match[0]

                            percentage = Math.round(match[1] / match[2] * 100)                    
                            TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, heartbeatText, percentage, statusText)
                        }
                    } catch (err) { 
                        console.log('Error pricessing heartbeat: ' + err)
                    }
                    for (let i = 0; i < 1000; i++) {
                        data = data.replace(/\n/, "")
                    }
                }
                dataReceived = dataReceived + data.toString()

                if (BOT_CONFIG.logTrainingOutput === true) {
                    console.log(data)
                }                
            });
    
            dockerProc.stderr.on('data', (data) => {
                onError(data)
            });
    
            dockerProc.on('close', (code) => {
                if (code === 0) {
                    dockerPID = undefined
                    console.log((new Date()).toISOString(), '[INFO] Forecaster: Docker Python Script exited with code ' + code);
                    onFinished(dataReceived)
                } else {
                    dockerPID = undefined
                    console.log((new Date()).toISOString(), '[ERROR] Forecaster: Docker Python Script exited with code ' + code);
                    console.log((new Date()).toISOString(), '[ERROR] Unexpected error trying to execute a Python script inside the Docker container. ')
                    console.log((new Date()).toISOString(), '[ERROR] Check at a console if you can run this command: ')
                    console.log((new Date()).toISOString(), '[ERROR] docker exec -it Bitcoin-Factory-ML-Forecasting python -u /tf/notebooks/' + nextForecastCase.pythonScriptName)
                    console.log((new Date()).toISOString(), '[ERROR] Once you can sucessfully run it at the console you might want to try to run this App again. ')
                    reject('Unexpected Error.')
                }
            });
    
            function onError(err) {
                err = err.toString()
                // ACTIVATE THIS ONLY FOR DEBUGGING console.log((new Date()).toISOString(), '[ERROR] Unexpected error trying to execute a Python script: ' + err)
            }
    
            function onFinished(dataReceived) {
                if (dataReceived.includes('RL_SCENARIO_END')) { //RL
                    let fileContent = SA.nodeModules.fs.readFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Forecast-Client/notebooks/evaluation_results.json")
                    if (fileContent !== undefined) {
                        try {
                            processExecutionResult = JSON.parse(fileContent)
                            console.log(processExecutionResult)                            
                            let endingTimestamp = (new Date()).valueOf()
                            processExecutionResult.elapsedTime = (endingTimestamp - startingTimestamp) / 1000          
                            processExecutionResult.pythonScriptName = nextForecastCase.pythonScriptName     
                            processExecutionResult.testServer = nextForecastCase.testServer
                            processExecutionResult.id = nextForecastCase.id
                            processExecutionResult.caseIndex = nextForecastCase.caseIndex                                                                           
                            console.log((new Date()).toISOString(), '[INFO] {Forecastclient} Elapsed Time: ' + timeUnits(processExecutionResult.elapsedTime * 1000) + ' ')
                            console.log((new Date()).toISOString(), '[INFO] {Forecastclient} Mean Networth at End of Train: ' + processExecutionResult["0"].meanNetWorthAtEnd)
                            console.log((new Date()).toISOString(), '[INFO] {Forecastclient} Mean Networth at End of Test: ' + processExecutionResult["1"].meanNetWorthAtEnd)
                            console.log((new Date()).toISOString(), '[INFO] {Forecastclient} Mean Networth at End of Validation: ' + processExecutionResult["2"].meanNetWorthAtEnd)
                            console.log((new Date()).toISOString(), '[INFO] {Forecastclient} Next Action: ' + processExecutionResult["2"].current_action.type + ' / ' + processExecutionResult["2"].current_action.amount + ' / ' + processExecutionResult["2"].current_action.limit)

                        } catch (err) {
                            console.log('Error parsing the information generated at the Docker Container executing the Python script. err.stack = ' + err.stack)
                            console.log('The data that can not be parsed is = ' + fileContent)
                        }
                    } else {
                        console.log('Can not read result file: ' + global.env.PATH_TO_BITCOIN_FACTORY + "/Forecast-Client/notebooks/evaluation_results.json")
                    }                            
                } else { //LSTM
                    try {

                        let index = dataReceived.indexOf('{')
                        dataReceived = dataReceived.substring(index)
                        //just for debug: console.log(dataReceived)
                        processExecutionResult = JSON.parse(fixJSON(dataReceived))
        
                        console.log('Prediction RMSE Error: ' + processExecutionResult.errorRMSE)
                        console.log('Predictions [candle.max, candle.min, candle.close]: ' + processExecutionResult.predictions)
        
                        let endingTimestamp = (new Date()).valueOf()
                        processExecutionResult.elapsedTime = (endingTimestamp - startingTimestamp) / 1000
                        console.log('Elapsed Time (HH:MM:SS): ' + (new Date(processExecutionResult.elapsedTime * 1000).toISOString().substr(11, 8)) + ' ')
        
                        processExecutionResult.testServer = nextForecastCase.testServer
                        processExecutionResult.id = nextForecastCase.id
                        processExecutionResult.caseIndex = nextForecastCase.caseIndex    

                    } catch (err) {
    
                        if (processExecutionResult !== undefined && processExecutionResult.predictions !== undefined) {
                            console.log('processExecutionResult.predictions:' + processExecutionResult.predictions)
                        }
                        console.log(err.stack)
                        console.error(err)
                    }    
                }
                resolve(processExecutionResult)
            }
        }        
    }


    async function updateForcasts() {
        
        logQueue()

        if (reforecasting === true) {
            console.log((new Date()).toISOString(), 'Already Working on Reforcasting', 'Retrying in 60 seconds...')
            return
        }
        reforecasting = true
        console.log((new Date()).toISOString(), '[DEBUG] Length forecastCasesArray: ' + thisObject.forecastCasesArray.length + ' forecasting: ' + forecasting + ' reforecasting: ' + reforecasting)
        for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
            let forecastCase = thisObject.forecastCasesArray[i]
            let timestamp = (new Date()).valueOf()

            if (timestamp < forecastCase.expiration) {
                console.log((new Date()).toISOString(), 'Forecast case ' + forecastCase.id + ' from ' + forecastCase.testServer.instance + ' not expired yet. No need to Reforecast.', 'Reviewing this in 60 seconds...')
                continue
            } else {
                console.log((new Date()).toISOString(), 'Forecast case ' + forecastCase.id + ' from ' + forecastCase.testServer.instance + ' expired.', 'Reforecasting now.')
                await reforecast(forecastCase, i)
                    .then(onSuccess)
                    .catch(onError)
                async function onSuccess() {
                    console.log((new Date()).toISOString(), 'Successfull Reforcasted Case Id ' + forecastCase.id + ' from ' + forecastCase.testServer.instance)
                    logQueue(forecastCase)
                }
                async function onError(err) {
                    if (err === 'THIS FORECAST CASE IS NOT AVAILABLE ANYMORE') {
                        console.log((new Date()).toISOString(), 'Removing Case Id ' + forecastCase.id + ' from ' + forecastCase.testServer.instance + ' from our records.')
                        if (removeForecastCase(forecastCase.id,forecastCase.testServer.instance)) {
                            console.log((new Date()).toISOString(), 'was removed')
                            i--
                        } else {
                            console.log((new Date()).toISOString(), 'was NOT removed -> Please report this bug')
                        }
                        saveForecastCasesFile()
                    } else {
                        console.log((new Date()).toISOString(), 'Some problem at the Test Server ' + forecastCase.testServer.instance + ' prevented to reforecast Case Id ' + forecastCase.id + ' . Server responded with: ' + err)
                    }
                }
            }
        }
        reforecasting = false
    }

    function removeForecastCase(id, testServerInstance) {
        for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
            if ((id == thisObject.forecastCasesArray[i].id) && (testServerInstance == thisObject.forecastCasesArray[i].testServer.instance)) {
                thisObject.forecastCasesArray.splice(i, 1)
                return true
            }
        }
        return false
    }

    function logQueue(forecastCase=undefined) {
        if (forecastCase == undefined) {
            forecastCase = {
                caseIndex: 0
            }
            console.log()
            console.log((new Date()).toISOString(), '[INFO] {Forecastclient} Current Forecast table')    
        } else {
            console.log()
            console.log((new Date()).toISOString(), '[INFO] {Forecastclient} A new Forecast for the Case Id ' + forecastCase.id + ' was produced / attemped.')    
        }
        let logQueue = []
        for (let i = Math.max(0, forecastCase.caseIndex - 5); i < Math.min(thisObject.forecastCasesArray.length, forecastCase.caseIndex + 5); i++) {
            let forecastCase = thisObject.forecastCasesArray[i]
            forecastCase.when = thisObject.utilities.getHHMMSS(forecastCase.timestamp) + ' HH:MM:SS ago'
            logQueue.push(forecastCase)
        }
        console.table(logQueue)
    }

    async function reforecast(forecastCase, index) {
        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {
            setTimeout(onTimeout, 5 * 60 * 1000)
            
            function onTimeout() {
                reject(new Error('Timeout Reforcasting'))                
            }
            
            await getThisForecastCase(forecastCase)
                .then(onSuccess)
                .catch(onError)
            async function onSuccess(thisForecastCase) {
                if (thisForecastCase !== undefined) {
                    SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Forecast-Client/notebooks/parameters_reforecast.csv", thisForecastCase.files.parameters)
                    SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Forecast-Client/notebooks/time-series_reforecast.csv", thisForecastCase.files.timeSeries)

                    thisForecastCase.modelName = "MODEL-" + thisForecastCase.id

                    let newTimeSeriesHash = thisObject.utilities.hash(thisForecastCase.files.timeSeries)
                    if (newTimeSeriesHash === forecastCase.timeSeriesHash) {
                        console.log((new Date()).toISOString(), 'The file provided by the Test Server is the same we already have.', 'Retrying the forcasting of case ' + thisForecastCase.id + ' in 60 seconds...')
                        reject('The same file that we already made a prediction with.')
                        return
                    }

                    await useModel(thisForecastCase)
                        .then(onSuccess)
                        .catch(onError)
                    async function onSuccess(forecastResult) {
                        thisForecastCase.files = undefined

                        let forecastResultAccepted = false
                        let maxSendTries = 10
                        let curSendTries = 1
                        while ((forecastResultAccepted === false) && (forecastResult !== undefined) && (curSendTries <= maxSendTries)) {
                            await setForecastCaseResults(forecastResult, 'clientInstanceForecaster')
                                .then(onSuccess)
                                .catch(onError)
                            async function onSuccess(response) {
                                console.log((new Date()).toISOString(), '[INFO] Got response on TrialNo: ', curSendTries)
                                if ((response != undefined) && (response !== 'No response')) {
                                    if ((response.data != undefined) && (response.data.serverData != undefined) && (response.data.serverData.response != undefined)) {
                                        try {
                                            if (response.data.serverData.response.indexOf('WRONG TESTSERVER!') == -1) {
                                                let bestPredictions = JSON.parse(response.data.serverData.response)
                                                for (let i=0; i<bestPredictions.length;i++) {
                                                    if (bestPredictions[i].testServer == undefined) {
                                                        bestPredictions[i].testServer = {
                                                            userProfile: response.data.serverData.userProfile,
                                                            instance: response.data.serverData.instance
                                                        }        
                                                    }
                                                }            
                                                index += checkSetForecastCaseResultsResponse(bestPredictions)
                                                forecastResultAccepted = true
            
                                                console.log(' ')
                                                console.log('Result on REforecasting: Best Crowd-Sourced Predictions:')
                                                console.table(bestPredictions)
            
                                                let statusText = 'Published Forecast Case ' + forecastResult.id + ' to ' + forecastResult.testServer.instance
                                                TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, '', '', statusText)
            
                                                /*
                                                Recalculate the expiration, timestamp, hash and save.
                                                */
                                                let forecastCase = thisObject.forecastCasesArray[index]
                                                forecastCase.expiration = thisObject.utilities.getExpiration(forecastCase)
                                                forecastCase.timestamp = (new Date()).valueOf()
                                                forecastCase.timeSeriesHash = newTimeSeriesHash
            
                                                saveForecastCasesFile()
                                            } else {
                                                console.log((new Date()).toISOString(), '[WARN] setForecastCaseResults: Wrong server did respond.')
                                                if (typeof callBackFunction === "function") callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)    
                                            }
                    
                                        } catch (jsonErr) {
                                            console.log("response.data.serverData.response:" + response.data.serverData.response)
                                            console.log("err reforcasting: " + jsonErr)
                                        }
                                    } else {
                                        console.log((new Date()).toISOString(), '[WARN] setForecastCaseResults: Failed to get any Forecast Case. No Data' + (((response.data != undefined) && (response.data.serverData != undefined) && (response.data.serverData.instance != undefined)) ? ' from ' + response.data.serverData.instance + '.': '.'))
                                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                                    }
                                } else {
                                    console.log((new Date()).toISOString(), '[WARN] setForecastCaseResults: Failed to get any Forecast Case. No response.')
                                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                                }
                            }
                            async function onError(err) {
                                console.log((new Date()).toISOString(), '[ERROR] Failed to send a Report to the Test Server ' + forecastResult.testServer.instance + ' with the Forecast Case Results '+ forecastResult.id + ' and get a Reward for that.')
                                console.log((new Date()).toISOString(), '[ERROR] Err: ', err, ' TrialNo: ', curSendTries)
                                console.log((new Date()).toISOString(), '[ERROR] Retrying to send the Forecast Report.')
                            }
                            curSendTries++
                        }
                        if (forecastResultAccepted) resolve()
                        else reject()
                    }
                    async function onError(err) {
                        console.log((new Date()).toISOString(), 'Failed to produce a Reforecast for Case Id ' + forecastCase.id + '. Err:', err)
                        //if reforcast didnt work, remove the case from array (looks like model is wrong) and start again new with building model
                        if (removeForecastCase(forecastCase.id,forecastCase.testServer.instance)) {
                            console.log((new Date()).toISOString(), 'was removed')
                            saveForecastCasesFile()
                        }
                        reject(err)
                    }
                } else {
                    console.log((new Date()).toISOString(), 'Nothing to Forecast', 'Retrying in 60 seconds...')
                    reject('Nothing to Forecast')
                }
            }
            async function onError(err) {
                console.log((new Date()).toISOString(), 'Failed to get the Forecast Case Id ' + forecastCase.id + '. Err:', err)
                reject(err)
            }
        }
    }

    function fixJSON(text) {
        /*
        Removing Carriedge Return from string.
        */
        for (let i = 0; i < 10; i++) {
            text = text.replace(" [", "[")
            text = text.replace("[ ", "[")
            text = text.replace(" ]", "]")
            text = text.replace("  ]", "]")
            text = text.replace("   ]", "]")
            text = text.replace("    ]", "]")
            text = text.replace("     ]", "]")
            text = text.replace("      ]", "]")
            text = text.replace("] ", "]")
        }
        for (let i = 0; i < 10; i++) {
            text = text.replace(",,", ",")
            text = text.replace(",]", "]")
            text = text.replace("[,", "[")
            text = text.replace(".,", ",")
            text = text.replace(".]", "]")
        }
        return text
    }

    function saveForecastCasesFile() {
        let fileContent = JSON.stringify(thisObject.forecastCasesArray, undefined, 4)
        SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Forecast-Client/StateData/ForecastCases/Forecast-Cases-Array-" + BOT_CONFIG.networkCodeName + ".json", fileContent)
    }

    function checkSetForecastCaseResultsResponse(forecastCasesArrayfromTestserver) {
        let counter = 0;
        if (forecastCasesArrayfromTestserver != undefined) {
            //remove local forecast cases, which aren't available on testserver anymore
            for (let j = 0; j < thisObject.forecastCasesArray.length; j++) {
                if (thisObject.forecastCasesArray[j].testServer == undefined) {
                    console.log('[DEBUG] Testserver undefined j: ', j)
                    continue
                }
                if (thisObject.forecastCasesArray[j].testServer.instance == undefined) { 
                    console.log('[DEBUG] Testserver undefined j: ', j)
                    continue 
                }
                //console.log((new Date()).toISOString(), '[DEBUG] Look for local id ' + thisObject.forecastCasesArray[j].id + ' from ' + thisObject.forecastCasesArray[j].testServer.instance)
                let foundForecastId = false
                let otherTestServer = false
                for (let i = 0; i < forecastCasesArrayfromTestserver.length; i++) {
                    if (forecastCasesArrayfromTestserver[i].testServer == undefined) {
                        console.log('[BUG] Testserver undefined')
                        continue
                    }
                    if (forecastCasesArrayfromTestserver[i].testServer.instance == undefined) { 
                        console.log('[BUG] Testserver undefined')
                        continue 
                    }
                        //console.log((new Date()).toISOString(), '[DEBUG] Found id on Test server ' + forecastCasesArrayfromTestserver[i].id + ' from ' + forecastCasesArrayfromTestserver[i].testServer.instance)
                    if ((forecastCasesArrayfromTestserver[i].id == thisObject.forecastCasesArray[j].id) &&
                    (forecastCasesArrayfromTestserver[i].testServer.instance == thisObject.forecastCasesArray[j].testServer.instance)) {
                        otherTestServer = false
                        foundForecastId = true
                    } else if (forecastCasesArrayfromTestserver[i].testServer.instance != thisObject.forecastCasesArray[j].testServer.instance) {
                        otherTestServer = true
                    }
                }
                if ((!foundForecastId) && (!otherTestServer)) {
                    //console.log((new Date()).toISOString(), '[INFO] Remove id ' + thisObject.forecastCasesArray[j].id + ' from ' + thisObject.forecastCasesArray[j].testServer.instance)
                    if (removeForecastCase(thisObject.forecastCasesArray[j].id,thisObject.forecastCasesArray[j].testServer.instance)) {
                        j--
                        saveForecastCasesFile()
                        //console.log((new Date()).toISOString(), 'was removed')
                        counter--
                    } else {
                        //console.log((new Date()).toISOString(), 'was NOT removed -> Please report this bug')                                                 
                    }
                }
            }
            //console.log((new Date()).toISOString(), '[DEBUG] Array length is now: ' + thisObject.forecastCasesArray.length)
            if (counter != 0) return counter
            //add forgein forecast cases, which we dont have in out db
            for (let i = 0; i < forecastCasesArrayfromTestserver.length; i++) {
                let foundForecastId = false
                //console.log((new Date()).toISOString(), '[DEBUG] Found id on Test server ' + forecastCasesArrayfromTestserver[i].id + ' from ' + forecastCasesArrayfromTestserver[i].testServer.instance)
                for (let j = 0; j < thisObject.forecastCasesArray.length; j++) {
                    if ((forecastCasesArrayfromTestserver[i].id == thisObject.forecastCasesArray[j].id) &&
                    (forecastCasesArrayfromTestserver[i].testServer.instance == thisObject.forecastCasesArray[j].testServer.instance)) {
                        foundForecastId = true    
                    }
                }
                if ( !foundForecastId ) {
                    thisObject.forecastCasesArray.push(forecastCasesArrayfromTestserver[i])
                    saveForecastCasesFile()
                    //console.log((new Date()).toISOString(), 'Added Forecast Case ' + forecastCasesArrayfromTestserver[i].id + ' from Testserver ' + forecastCasesArrayfromTestserver[i].testServer.instance)
                    counter++
                }
            }
            //console.log((new Date()).toISOString(), '[DEBUG] Array length is now: ' + thisObject.forecastCasesArray.length)
            if (counter != 0) return counter
        }
        return counter
    }

    /**
     * Converts milliseconds into greater time units as possible
     * @param {int} ms - Amount of time measured in milliseconds
     * @return {?Object} Reallocated time units. NULL on failure.
     */
     function timeUnits( ms ) {
        if ( !Number.isInteger(ms) ) {
            return null
        }
        /**
         * Takes as many whole units from the time pool (ms) as possible
         * @param {int} msUnit - Size of a single unit in milliseconds
         * @return {int} Number of units taken from the time pool
         */
        const allocate = msUnit => {
            const units = Math.trunc(ms / msUnit)
            ms -= units * msUnit
            return units
        }
        // Property order is important here.
        // These arguments are the respective units in ms.
        return ""+
            // weeks: allocate(604800000), // Uncomment for weeks
            // days: allocate(86400000),
            allocate(3600000) + "h:" +
            allocate(60000)+"m:" +
            allocate(1000)+"s:" 
            //ms: ms // remainder
        
    }    
}
