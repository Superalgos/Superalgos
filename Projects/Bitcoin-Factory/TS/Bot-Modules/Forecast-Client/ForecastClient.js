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
    }

    async function start(callBackFunction) {
        //only start once
        if (!forecasting) {
            try {
                await getNextForecastCase()
                    .then(onSuccessgetNextForecastCase)
                    .catch(onErrorgetNextForecastCase)
                async function onSuccessgetNextForecastCase(nextForecastCase) {
                    if (nextForecastCase !== undefined) {
                        forecasting = true
                        SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Forecast-Client/notebooks/parameters.csv", nextForecastCase.files.parameters)
                        SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Forecast-Client/notebooks/time-series.csv", nextForecastCase.files.timeSeries)
    
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
    
                            await publishResult(forecastResult)
                                .then(onSuccessPublish)
                                .catch(onErrorPublish)                            
                            async function publishResult(forecastResult) {
                                let forecastResultAccepted = false
                                let maxSendTries = 10
                                let curSendTries = 1
                                while ((forecastResultAccepted === false) && (forecastResult !== undefined) && (curSendTries<=maxSendTries)) {
                                    await setForecastCaseResults(forecastResult, 'clientInstanceBuilder', forecastResult.testServer)
                                        .then(onSuccess)
                                        .catch(onError)
                                    async function onSuccess(response) {
                                        forecastResultAccepted = true
                                        console.log((new Date()).toISOString(), '[INFO] Got response on TrialNo: ', curSendTries)    
                                        
                                        let bestPredictions = JSON.parse(response.data.serverData.response)
                                        checkSetForecastCaseResultsResponse(bestPredictions)
    
                                        console.log(' ')
                                        console.log((new Date()).toISOString(), '[INFO] Result on Forecasting: Best Crowd-Sourced Predictions:')
                                        console.table(bestPredictions)
    
                                        let statusText = 'Published Forecast Case ' + forecastResult.id + ' to ' + forecastResult.testServer.instance
                                        TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, '', '', statusText)
        
                                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
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
                            async function onSuccessPublish(result) {
                                console.log((new Date()).toISOString(), '1')
                            }
                            async function onErrorPublish(err) {
                                console.log((new Date()).toISOString(), '2')
                            }
                            
                            forecasting = false
                        }
    
                        async function onError(err) {
                            forecasting = false            
                            if (err === 'DUPLICATE FORECAST CASE') {
                                //(re)send result, maybe server didnt store it for whatever reasons
                                await publishResult(nextForecastCase)
                                    .then(onSuccessRePublish)
                                    .catch(onErrorRePublish)
                                async function onSuccessRePublish(result) {
                                    console.log((new Date()).toISOString(), '3')
                                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                                }
                                async function onErrorRePublish(err) {
                                    console.log((new Date()).toISOString(), '4')
                                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                                }                                    
                            }  else {
                                console.log((new Date()).toISOString(), 'Failed to Build the Model for this Forecast Case. Err:', err, 'Aborting the processing of this case and retrying the main loop in 30 seconds...')
                            }             
                            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        }
                    } else {
                        console.log((new Date()).toISOString(), '[INFO] Nothing to Forecast', 'Retrying in 30 seconds...')
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                    }
                }
                async function onErrorgetNextForecastCase(err) {
                    console.log((new Date()).toISOString(), '[INFO] getNextForecastCase: Failed to get a new Forecast Case. Err:', err)
                    await getAllForecastCase()
                        .then(onSuccessgetAllForecastCase)
                        .catch(onErrorgetAllForecastCase)
                    async function onSuccessgetAllForecastCase(response) {
                        if ((response != undefined) && (response !== 'No response')) {
                            if ((response.data != undefined) && (response.data.serverData != undefined) && (response.data.serverData.response != undefined)) {
                                try {
                                    let bestPredictions = JSON.parse(response.data.serverData.response)
                                    for (let i=0; i<bestPredictions.length;i++) {
                                        if (bestPredictions[i].testServer == undefined) {
                                            bestPredictions[i].testServer = {
                                                userProfile: response.data.serverData.userProfile,
                                                instance: response.data.serverData.instance
                                            }        
                                        }
                                    }
                                    checkSetForecastCaseResultsResponse(bestPredictions)
                                    //console.table(bestPredictions)    
                                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)    
                                    
                                } catch (err) {
                                    console.log("response.data.serverData.response:" + response.data.serverData.response)
                                    console.log("err: " + err)
                                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                               }
                            } else {
                                console.log((new Date()).toISOString(), '[WARN] getAllForecastCase: Failed to get any Forecast Case. No Data ' + (((response.data != undefined) && (response.data.serverData != undefined) && (response.data.serverData.instance != undefined)) ? 'from ' + response.data.serverData.instance + '.': '.'))
                                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                            }
                        } else {
                            console.log((new Date()).toISOString(), '[WARN] getAllForecastCase: Failed to get any Forecast Case. No response.')
                            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        }
                    }
                    async function onErrorgetAllForecastCase(err) {
                        console.log((new Date()).toISOString(), '[WARN] Failed to get a any Forecast Case. Err:', err, 'Retrying in 30 seconds...')
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                    }
                }
            }
            catch (err) {
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[ERROR] start -> err = " + err.stack)
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
            }
        }
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
                            reject('DUPLICATE FORECAST CASE')
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

    async function setForecastCaseResults(forecastResult, clientInstanceConfigPropertyName, testServer) {
        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {

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
                testServer: testServer,
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
                resolve(response)
            }
            async function onError(err) {
                reject(err)
            }
        }
    }

    function writePhytonInstructionsFile(instruction, nextForecastCase) {
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
        if (nextForecastCase.pythonScriptName === undefined) { nextForecastCase.pythonScriptName = "Bitcoin_Factory_LSTM_Forecasting.py" }

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
            writePhytonInstructionsFile("BUILD_AND_SAVE_MODEL", nextForecastCase)
        } else {
            writePhytonInstructionsFile("LOAD_MODEL_AND_PREDICT", nextForecastCase)
        }

        return new Promise(executeThePythonScript)

        async function executeThePythonScript(resolve, reject) {
            /*
            Set default script name.
            */
            if (nextForecastCase.pythonScriptName === undefined) { nextForecastCase.pythonScriptName = "Bitcoin_Factory_LSTM_Forecasting.py" }
    
            let processExecutionResult
            let startingTimestamp = (new Date()).valueOf()
    
            const { spawn } = require('child_process');
            const dockerProc = spawn('docker', ['exec', 'Bitcoin-Factory-ML-Forecasting', 'python', '-u', '/tf/notebooks/' + nextForecastCase.pythonScriptName ]);
            let dataReceived = ''
            dockerPID = dockerProc.pid
            dockerProc.stdout.on('data', (data) => {
                data = data.toString()
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
                    console.log((new Date()).toISOString(), '[INFO] Forecaster: Docker Python Script exited with code ' + code);
                    onFinished(dataReceived)
                } else {
                    console.log((new Date()).toISOString(), '[ERROR] Forecaster: Docker Python Script exited with code ' + code);
                    console.log((new Date()).toISOString(), '[ERROR] Unexpected error trying to execute a Python script inside the Docker container. ')
                    console.log((new Date()).toISOString(), '[ERROR] Check at a console if you can run this command: ')
                    console.log((new Date()).toISOString(), '[ERROR] docker exec -it Bitcoin-Factory-ML-Forecasting python /tf/notebooks/Bitcoin_Factory_LSTM_Forecasting.py')
                    console.log((new Date()).toISOString(), '[ERROR] Once you can sucessfully run it at the console you might want to try to run this App again. ')
                    reject('Unexpected Error.')
                }
            });
    
            function onError(err) {
                err = err.toString()
                // ACTIVATE THIS ONLY FOR DEBUGGING console.log((new Date()).toISOString(), '[ERROR] Unexpected error trying to execute a Python script: ' + err)
            }
    
            function onFinished(dataReceived) {
                try {
    
                    let index = dataReceived.indexOf('{')
                    dataReceived = dataReceived.substring(index)
                    //just for debug: console.log(dataReceived)
                    processExecutionResult = JSON.parse(fixJSON(dataReceived))
    
                    console.log('Prediction RMSE Error: ' + processExecutionResult.errorRMSE)
                    console.log('Predictions [candle.max, candle.min, candle.close]: ' + processExecutionResult.predictions)
    
                    let endingTimestamp = (new Date()).valueOf()
                    processExecutionResult.enlapsedTime = (endingTimestamp - startingTimestamp) / 1000
                    console.log('Enlapsed Time (HH:MM:SS): ' + (new Date(processExecutionResult.enlapsedTime * 1000).toISOString().substr(14, 5)) + ' ')
    
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
    
                resolve(processExecutionResult)
            }
        }        
    }


    async function updateForcasts() {
        if (reforecasting === true) {
            console.log((new Date()).toISOString(), 'Already Working on Reforcasting', 'Retrying in 60 seconds...')
            return
        }
        if (forecasting === true) {
            // timeseries and instructions file are shared between fore an reforecasting, prevent overwritting them
            console.log((new Date()).toISOString(), 'Already Working on Forcasting', 'Retrying in 60 seconds...')
            return
        }
        reforecasting = true
        console.log((new Date()).toISOString(), '[DEBUG] Length forecastCasesArray: ' + thisObject.forecastCasesArray.length)
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

    function removeForecastCase(id, testServer) {
        for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
            if (id == thisObject.forecastCasesArray[i].id) {
                thisObject.forecastCasesArray.splice(i, 1)
                return true
            }
        }
        return false
    }

    function logQueue(forecastCase) {
        let logQueue = []
        for (let i = Math.max(0, forecastCase.caseIndex - 5); i < Math.min(thisObject.forecastCasesArray.length, forecastCase.caseIndex + 5); i++) {
            let forecastCase = thisObject.forecastCasesArray[i]
            forecastCase.when = thisObject.utilities.getHHMMSS(forecastCase.timestamp) + ' HH:MM:SS ago'
            logQueue.push(forecastCase)
        }
        console.log()
        console.log((new Date()).toISOString(), 'A new Forecast for the Case Id ' + forecastCase.id + ' was produced / attemped.')
        console.table(logQueue)
    }

    async function reforecast(forecastCase, index) {
        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {
            await getThisForecastCase(forecastCase)
                .then(onSuccess)
                .catch(onError)
            async function onSuccess(thisForecastCase) {
                if (thisForecastCase !== undefined) {
                    SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Forecast-Client/notebooks/parameters.csv", thisForecastCase.files.parameters)
                    SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Forecast-Client/notebooks/time-series.csv", thisForecastCase.files.timeSeries)

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
                            await setForecastCaseResults(forecastResult, 'clientInstanceForecaster', forecastResult.testServer)
                                .then(onSuccess)
                                .catch(onError)
                            async function onSuccess(response) {
                                forecastResultAccepted = true
                                console.log((new Date()).toISOString(), '[INFO] Got response on TrialNo: ', curSendTries)

                                let bestPredictions = JSON.parse(response.data.serverData.response)
                                index += checkSetForecastCaseResultsResponse(bestPredictions)

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
                    async function onError(err) {
                        console.log((new Date()).toISOString(), 'Failed to produce a Forecast for Case Id ' + forecastCase.id + '. Err:', err)
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
                //console.log((new Date()).toISOString(), '[DEBUG] Look for local id ' + thisObject.forecastCasesArray[j].id + ' from ' + thisObject.forecastCasesArray[j].testServer.instance)
                let foundForecastId = false
                let otherTestServer = false
                for (let i = 0; i < forecastCasesArrayfromTestserver.length; i++) {
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
}
