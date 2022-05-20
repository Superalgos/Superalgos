exports.newBitcoinFactoryBotModulesTestClient = function (processIndex) {

    const MODULE_NAME = "Test-Client"
    const TEST_CLIENT_VERSION = 6

    let thisObject = {
        initialize: initialize,
        start: start
    }

    let BOT_CONFIG = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config

    return thisObject

    function initialize(pStatusDependenciesModule, callBackFunction) {
        try {
            console.log((new Date()).toISOString(), 'Running Test Client v.' + TEST_CLIENT_VERSION)
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
            await getNextTestCase()
                .then(onSuccess)
                .catch(onError)
            async function onSuccess(nextTestCase) {
                if (nextTestCase !== undefined) {
                    SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Client/notebooks/parameters.csv", nextTestCase.files.parameters)
                    SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Client/notebooks/time-series.csv", nextTestCase.files.timeSeries)

                    await buildModel(nextTestCase)
                        .then(onSuccess)
                        .catch(onError)

                    async function onSuccess(testResult) { 
                        let testResultsAccepted = false

                        while (testResultsAccepted === false) {
                            if (testResult !== undefined) {
                                testResult.id = nextTestCase.id
                                await setTestCaseResults(testResult)
                                    .then(onSuccess)
                                    .catch(onError)

                                if (testResultsAccepted === false) {
                                    await SA.projects.foundations.utilities.asyncFunctions.sleep(60000)
                                }
                                async function onSuccess(response) {
                                    testResultsAccepted = true
                                    let bestPredictions = JSON.parse(response.data.serverData.response)
                                    console.log(' ')
                                    console.log('Best Crowd-Sourced Predictions:')
                                    console.table(bestPredictions)
                                    updateSuperalgos(bestPredictions)
                                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                                }
                                async function onError(err) {
                                    console.log((new Date()).toISOString(), 'Failed to send a Report to the Test Server with the Test Case Results.')
                                    console.log((new Date()).toISOString(), 'Reason why I could not deliver the Test Report:', err)
                                    console.log((new Date()).toISOString(), 'Retrying to send the Test Report in 60 seconds...')
                                }
                            }
                        }
                    }

                    async function onError(err) {
                        console.log((new Date()).toISOString(), 'Failed to Build the Model for this Test Case. Err:', err, 'Aborting the processing of this case and retrying the main loop in 30 seconds...')
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                    }
                } else {
                    console.log((new Date()).toISOString(), 'Nothing to Test', 'Retrying in 30 seconds...')
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                }
            }
            async function onError(err) {
                console.log((new Date()).toISOString(), 'Failed to get a Test Case. Err:', err, 'Retrying in 30 seconds...')
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

    function updateSuperalgos(bestPredictions) {

        for (let i = 0; i < bestPredictions.length; i++) {
            let prediction = bestPredictions[i]
            prediction.parameters = {}
        }

        let params = {
            method: 'updateForecastedCandles',
            forcastedCandles: JSON.stringify(bestPredictions)
        }

        const axios = require("axios")
        axios
            .post('http://' + BOT_CONFIG.targetSuperalgosHost + ':' + BOT_CONFIG.targetSuperalgosHttpPort + '/Bitcoin-Factory', params)
            .then(res => {
                console.log((new Date()).toISOString(), 'Updating Superalgos...', 'Response from Superalgos Bitcoin Factory Server: ' + JSON.stringify(res.data))
            })
            .catch(error => {
                console.log((new Date()).toISOString(), 'Updating Superalgos...', 'Could not update Superalgos. Had this error: ' + error)
            })
    }

    async function getNextTestCase() {
        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {

            let message = {
                type: 'Get Next Test Case'
            }

            let queryMessage = {
                messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                sender: 'Test-Client',
                clientInstanceName: TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.clientInstanceName,
                recipient: 'Test Client Manager',
                message: message,
                testClientVersion: TEST_CLIENT_VERSION
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
                if (response.data.serverData.response === 'ALREADY SENT YOU A CASE, WAIT 10 MINUTES TO ASK AGAIN') {
                    reject('The Test Server says that it already sent me a Test Case and I need to wait for 10 minutes to request a new one.')
                    return
                }
                if (response.data.serverData.response === 'NO TEST CASES AVAILABLE AT THE MOMENT') {
                    reject('No more test cases at the Test Server.')
                    return
                }
                if (response.data.serverData.response === 'CLIENT VERSION IS TOO OLD') {
                    reject('This Client Version is too old. You need to app.update and restart your client in order for the Test Server be able to process your request.')
                    return
                }

                let nextTestCase = response.data.serverData.response
                if (nextTestCase.id === undefined) { // if it is not a Test Case, then it is a new error message that I still don't have at the current version.
                    reject(response.data.serverData.response)
                    return
                }

                resolve(nextTestCase)
            }
            async function onError(err) {
                reject(err)
            }
        }
    }

    async function setTestCaseResults(testResult) {
        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {

            testResult.trainingOutput = undefined // delete this to save bandwidth

            let message = {
                type: 'Set Test Case Results',
                payload: JSON.stringify(testResult)
            }

            let queryMessage = {
                messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                sender: 'Test-Client',
                clientInstanceName: TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.clientInstanceName,
                recipient: 'Test Client Manager',
                message: message,
                testClientVersion: TEST_CLIENT_VERSION
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

    async function buildModel(nextTestCase) {
        if (nextTestCase.pythonScriptName === undefined) { nextTestCase.pythonScriptName = "Bitcoin_Factory_LSTM.py" }
        console.log('')
        console.log('-------------------------------------------------------- Test Case # ' + nextTestCase.id + ' / ' + nextTestCase.totalCases + ' --------------------------------------------------------')
        console.log('')
        console.log((new Date()).toISOString(), 'Starting processing this Case')
        console.log('')
        console.log('Parameters Received for this Test:')
        console.table(nextTestCase.parameters)
        console.log('Ready to run this script inside the Docker Container: ' + nextTestCase.pythonScriptName)
        console.log('')

        let processExecutionResult
        let startingTimestamp = (new Date()).valueOf()
        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {

            const { spawn } = require('child_process');
            const ls = spawn('docker', ['exec', 'Bitcoin-Factory-ML', 'python', '-u', '/tf/notebooks/' + nextTestCase.pythonScriptName]);
            let dataReceived = ''
            ls.stdout.on('data', (data) => {
                data = data.toString()
                /*
                Removing Carriedge Return from string.
                Check if data contains rl output to switch reading from a file instead of parsing the output.
                */
                
                if (data.includes('RL_SCENARIO_START') || data.includes('episodeRewardMean')) {
                    // Sometimes the filecontent is broken until it's regenerated or it's not yet available, we can just ignore it and get the status from the next output.
                    try {
                        let fileContent = SA.nodeModules.fs.readFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Client/notebooks/training_results.json")

                        if (fileContent !== undefined) {
                            let percentage = 0
                            let statusText = 'Test Case: ' + nextTestCase.id + ' of ' + nextTestCase.totalCases
                            
                                data = JSON.parse(fileContent)

                                percentage = Math.round(data.timestepsExecuted / data.timestepsTotal * 100)
                                let heartbeatText = 'Episode reward mean: ' + data.episodeRewardMean + ' | Episode reward max: ' + data.episodeRewardMax + ' | Episode reward min: ' + data.episodeRewardMin
                                
                                TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, heartbeatText, percentage, statusText)

                                dataReceived = dataReceived + data.toString()
                        }
                    } catch(err) {}

                } else {
                    let percentage = 0
                    let statusText = 'Test Case: ' + nextTestCase.id + ' of ' + nextTestCase.totalCases
    
                    if (data.substring(0, 5) === 'Epoch') { 
                        let regEx = new RegExp('Epoch (\\d+)/(\\d+)', 'gim')
                        let match = regEx.exec(data)
                        let heartbeatText = match[0]
    
                        percentage = Math.round(match[1] / match[2] * 100)
    
                        TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, heartbeatText, percentage, statusText)
                    }

                    for (let i = 0; i < 1000; i++) {
                        data = data.replace(/\n/, "")
                    }
                    dataReceived = dataReceived + data.toString()
                }

                if (BOT_CONFIG.logTrainingOutput === true) {
                    console.log(data)
                }
                
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
                    console.log((new Date()).toISOString(), '[ERROR] docker exec -it Bitcoin-Factory-ML python /tf/notebooks/' + nextTestCase.pythonScriptName)
                    console.log((new Date()).toISOString(), '[ERROR] Once you can sucessfully run it at the console you might want to try to run this App again. ')
                    reject('Unexpected Error.')
                }
            });

            function onError(err) {
                err = err.toString()
                //reject('Error Building Model.')
            }

            function onFinished(dataReceived) {
                try {
                if (data.includes('RL_SCENARIO_END')) {
                    //TODO: read from the evaluation_results.json file
                } else {
                    

                        processExecutionResult = JSON.parse(dataReceived)
                        processExecutionResult.predictions = fixJSON(processExecutionResult.predictions)
                        processExecutionResult.predictions = JSON.parse(processExecutionResult.predictions)

                        console.log('Prediction RMSE Error: ' + processExecutionResult.errorRMSE)
                        console.log('Predictions [candle.max, candle.min, candle.close]: ' + processExecutionResult.predictions)

                        let endingTimestamp = (new Date()).valueOf()
                        processExecutionResult.enlapsedTime = (endingTimestamp - startingTimestamp) / 1000
                        console.log('Enlapsed Time (HH:MM:SS): ' + (new Date(processExecutionResult.enlapsedTime * 1000).toISOString().substr(14, 5)) + ' ')

                }
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
}
