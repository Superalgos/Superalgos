exports.newBitcoinFactoryBotModulesForecastClient = function (processIndex) {

    const MODULE_NAME = "Forecast-Client"

    let thisObject = {
        forecastCasesArray: undefined,
        utilities: undefined,
        initialize: initialize,
        start: start
    }

    thisObject.utilities = TS.projects.bitcoinFactory.utilities.miscellaneous
    let BOT_CONFIG = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config
    let reforecasting = false

    return thisObject

    function initialize(pStatusDependenciesModule, callBackFunction) {
        try {
            /*
            Create Missing Folders, if needed.
            */
            let dir
            dir = global.env.PATH_TO_BITCOIN_FACTORY + '/StateData/ForecastCases'
            if (!SA.nodeModules.fs.existsSync(dir)) {
                SA.nodeModules.fs.mkdirSync(dir, { recursive: true });
            }

            thisObject.utilities.initialize()

            loadForecastCasesFile()

            // setInterval(updateForcasts, 60 * 1000)

            function loadForecastCasesFile() {
                let fileContent = thisObject.utilities.loadFile(global.env.PATH_TO_BITCOIN_FACTORY + "/StateData/ForecastCases/Forecast-Cases-Array-" + BOT_CONFIG.networkCodeName + ".json")
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

    async function start(callBackFunction) {
        try {
            await getNextForecastCase()
                .then(onSuccess)
                .catch(onError)
            async function onSuccess(nextForecastCase) {
                if (nextForecastCase !== undefined) {
                    SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/notebooks/parameters.csv", nextForecastCase.files.parameters)
                    SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/notebooks/time-series.csv", nextForecastCase.files.timeSeries)

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

                        thisObject.forecastCasesArray.push(nextForecastCase)
                        saveForecastCasesFile()
                        logQueue(nextForecastCase)

                        if (forecastResult !== undefined) {
                            forecastResult.id = nextForecastCase.id
                            forecastResult.caseIndex = nextForecastCase.caseIndex
                            await setForecastCaseResults(forecastResult, 'clientInstanceBuilder')
                                .then(onSuccess)
                                .catch(onError)
                            async function onSuccess(response) {
                                let bestPredictions = JSON.parse(response.data.serverData.response)
                                console.log(' ')
                                console.log('Best Crowd-Sourced Predictions:')
                                console.table(bestPredictions)

                                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                            }
                            async function onError(err) {
                                console.log((new Date()).toISOString(), 'Failed to send a Report to the Test Server with the Forecast Case Results and get a Reward for that. Err:', err, 'Aborting the processing of this case and retrying the main loop in 30 seconds...')
                                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                            }
                        }
                    }

                    async function onError(err) {
                        console.log((new Date()).toISOString(), 'Failed to Build the Model for this Forecast Case. Err:', err, 'Aborting the processing of this case and retrying the main loop in 30 seconds...')
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                    }
                } else {
                    console.log((new Date()).toISOString(), 'Nothing to Test', 'Retrying in 30 seconds...')
                }
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
            }
            async function onError(err) {
                console.log((new Date()).toISOString(), 'Failed to get a Forecast Case. Err:', err, 'Retrying in 30 seconds...')
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
            }
        }
        catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] start -> err = " + err.stack)
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
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
                clientInstanceName: TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.clientInstanceBuilder,
                recipient: 'Forecast Client Manager',
                message: message
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
                if (response.data.serverData.response !== 'NO FORECAST CASES AVAILABLE AT THE MOMENT') {
                    let nextForecastCase = response.data.serverData.response
                    resolve(nextForecastCase)
                } else {
                    reject('No more forecast cases at the Test Server')
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
                forecastCaseId: forecastCase.id
            }

            let queryMessage = {
                messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                sender: 'Forecast-Client',
                clientInstanceName: TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.clientInstanceForecaster,
                recipient: 'Forecast Client Manager',
                message: message
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
                    resolve(thisForecastCase)
                } else {
                    reject('This Forecast Case is not available.')
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
            let message = {
                type: 'Set Forecast Case Results',
                payload: JSON.stringify(forecastResult)
            }

            let queryMessage = {
                messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                sender: 'Forecast-Client',
                clientInstanceName: TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config[clientInstanceConfigPropertyName],
                recipient: 'Forecast Client Manager',
                message: message
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
        Here we will instruct the Phyton Script to Build the model.
        */
        let instructionsFile = ""

        instructionsFile = instructionsFile +
            /* Headers */
            "INSTRUCTION" + "   " + "VALUE" + "\r\n" +
            /* Values */
            "ACTION_TO_TAKE" + "   " + instruction + "\r\n" +
            "MODEL_FILE_NAME" + "   " + nextForecastCase.modelName + "\r\n"
        SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/notebooks/instructions.csv", instructionsFile)
    }

    async function buildModel(nextForecastCase) {
        console.log('')
        console.log('------------------------------------------- Building Forecast Case # ' + nextForecastCase.id + ' ---- ' + (nextForecastCase.caseIndex + 1) + ' / ' + nextForecastCase.totalCases + ' --------------------------------------------------------')
        console.log('')
        console.log((new Date()).toISOString(), 'Starting processing this Case')
        console.log('')
        console.log('Parameters Received for this Forecast:')
        console.table(nextForecastCase.parameters)
        console.log('')

        writePhytonInstructionsFile("BUILD_AND_SAVE_MODEL", nextForecastCase)

        return new Promise(executeThePythonScript)
    }

    async function useModel(nextForecastCase) {
        console.log('')
        console.log('------------------------------------------------------- Reforcasting Case # ' + nextForecastCase.id + ' ------------------------------------------------------------')
        console.log('')
        console.log((new Date()).toISOString(), 'Starting processing this Case')
        console.log('')
        console.log('Parameters Received for this Forecast:')
        console.table(nextForecastCase.parameters)
        console.log('')


        writePhytonInstructionsFile("LOAD_MODEL_AND_PREDICT", nextForecastCase)

        return new Promise(executeThePythonScript)
    }

    async function executeThePythonScript(resolve, reject) {
        let processExecutionResult
        let startingTimestamp = (new Date()).valueOf()

        const { spawn } = require('child_process');
        const ls = spawn('docker', ['exec', 'Bitcoin-Factory-ML-Forecasting', 'python', '/tf/notebooks/Bitcoin_Factory_LSTM_Forecasting.py']);
        let dataReceived = ''
        ls.stdout.on('data', (data) => {
            data = data.toString()
            /*
            Removing Carriedge Return from string.
            */
            for (let i = 0; i < 1000; i++) {
                data = data.replace(/\n/, "")
            }
            dataReceived = dataReceived + data.toString()
        });

        ls.stderr.on('data', (data) => {
            onError(data)
        });

        ls.on('close', (code) => {
            console.log(`Docker Python Script exited with code ${code}`);
            if (code === 0) {
                onFinished(dataReceived)
            } else {
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

                processExecutionResult = JSON.parse(dataReceived)
                processExecutionResult.predictions = fixJSON(processExecutionResult.predictions)
                processExecutionResult.predictions = JSON.parse(processExecutionResult.predictions)

                console.log('Prediction RMSE Error: ' + processExecutionResult.errorRMSE)
                console.log('Predictions [candle.max, candle.min, candle.close]: ' + processExecutionResult.predictions)

                let endingTimestamp = (new Date()).valueOf()
                processExecutionResult.enlapsedTime = (endingTimestamp - startingTimestamp) / 1000
                console.log('Enlapsed Time (HH:MM:SS): ' + (new Date(processExecutionResult.enlapsedTime * 1000).toISOString().substr(14, 5)) + ' ')

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

    async function updateForcasts() {
        if (reforecasting === true) {
            console.log((new Date()).toISOString(), 'Already Working on Reforcasting', 'Retrying in 60 seconds...')
            return
        }
        reforecasting = true
        for (let i = 0; i < thisObject.forecastCasesArray.length; i++) {
            let forecastCase = thisObject.forecastCasesArray[i]
            let timestamp = (new Date()).valueOf()

            if (timestamp < forecastCase.expiration) {
                console.log((new Date()).toISOString(), 'Forcast case ' + forecastCase.id + ' not expired yet. No need to Reforecast.', 'Reviewing this in 60 seconds...')
                continue
            } else {
                console.log((new Date()).toISOString(), 'Forcast case ' + forecastCase.id + ' expired.', 'Reforecasting now.')
                await reforecast(forecastCase)

                logQueue(forecastCase)
            }
        }
        reforecasting = false
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

    async function reforecast(forecastCase) {
        await getThisForecastCase(forecastCase)
            .then(onSuccess)
            .catch(onError)
        async function onSuccess(thisForecastCase) {
            if (thisForecastCase !== undefined) {
                SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/notebooks/parameters.csv", thisForecastCase.files.parameters)
                SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/notebooks/time-series.csv", thisForecastCase.files.timeSeries)

                thisForecastCase.modelName = "MODEL-" + thisForecastCase.id

                let newTimeSeriesHash = thisObject.utilities.hash(thisForecastCase.files.timeSeries)
                if (newTimeSeriesHash === forecastCase.timeSeriesHash) {
                    console.log((new Date()).toISOString(), 'The file provided by the Test Server is the same we already have.', 'Retrying the forcasting of case ' + thisForecastCase.id + ' in 10 seconds...')
                    return
                }

                await useModel(thisForecastCase)
                    .then(onSuccess)
                    .catch(onError)
                async function onSuccess(forecastResult) {
                    thisForecastCase.files = undefined

                    if (forecastResult !== undefined) {
                        forecastResult.id = thisForecastCase.id
                        forecastResult.caseIndex = thisForecastCase.caseIndex
                        await setForecastCaseResults(forecastResult, 'clientInstanceForecaster')
                            .then(onSuccess)
                            .catch(onError)
                        async function onSuccess(response) {
                            let bestPredictions = JSON.parse(response)
                            console.log(' ')
                            console.log('Best Crowd-Sourced Predictions:')
                            console.table(bestPredictions)
                            /*
                            Recalculate the expiration, timestamp, hash and save.
                            */
                            forecastCase.expiration = thisObject.utilities.getExpiration(forecastCase)
                            forecastCase.timestamp = (new Date()).valueOf()
                            forecastCase.timeSeriesHash = thisObject.utilities.hash(newTimeSeriesHash)

                            saveForecastCasesFile()

                        }
                        async function onError(err) {
                            console.log((new Date()).toISOString(), 'Failed to send a Report to the Test Server with the Forecast Case Results and get a Reward for that. Err:', err, 'Retrying in 10 seconds...')
                        }
                    }
                }
                async function onError(err) {
                    console.log((new Date()).toISOString(), 'Failed to produce a Forecast for Case Id ' + forecastCase.id + '. Err:', err)
                }
            } else {
                console.log((new Date()).toISOString(), 'Nothing to Forecast', 'Retrying in 10 seconds...')
            }
        }
        async function onError(err) {
            console.log((new Date()).toISOString(), 'Failed to get the Forecast Case Id ' + forecastCase.id + '. Err:', err)
        }
    }

    function fixJSON(text) {
        /*
        Removing Carriedge Return from string.
        */
        for (let i = 0; i < 10; i++) {
            text = text.replace(" [", "[")
            text = text.replace(" ]", "]")
            text = text.replace("  ]", "]")
            text = text.replace("   ]", "]")
            text = text.replace("    ]", "]")
            text = text.replace("     ]", "]")
            text = text.replace("      ]", "]")
            text = text.replace("] ", "]")
        }
        for (let i = 0; i < 100; i++) {
            text = text.replace("  ", ",")
        }
        for (let i = 0; i < 100; i++) {
            text = text.replace(" ", ",")
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
        SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/StateData/ForecastCases/Forecast-Cases-Array-" + BOT_CONFIG.networkCodeName + ".json", fileContent)
    }
}
