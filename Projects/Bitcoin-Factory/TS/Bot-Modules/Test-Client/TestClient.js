exports.newBitcoinFactoryBotModulesTestClient = function (processIndex) {

    const MODULE_NAME = "Test-Client"
    const TEST_CLIENT_VERSION = 7

    let thisObject = {
        initialize: initialize,
        start: start
    }

    let BOT_CONFIG = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config

    return thisObject

    function initialize(pStatusDependenciesModule, callBackFunction) {
        try {
            SA.logger.info('Running Test Client v.' + TEST_CLIENT_VERSION)
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

                                await setTestCaseResults(testResult, nextTestCase.testServer)
                                    .then(onSuccess)
                                    .catch(onError)

                                if (testResultsAccepted === false) {
                                    await SA.projects.foundations.utilities.asyncFunctions.sleep(60000)
                                }
                                async function onSuccess(response) {
                                    testResultsAccepted = true
                                    let bestPredictions = JSON.parse(response.data.serverData.response)
                                    SA.logger.info(' ')
                                    SA.logger.info('Best Crowd-Sourced Predictions:')
                                    console.table(bestPredictions)
                                    updateSuperalgos(bestPredictions)
                                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                                }
                                async function onError(err) {
                                    SA.logger.error('Failed to send a Report to the Test Server with the Test Case Results.')
                                    SA.logger.error('Reason why I could not deliver the Test Report: ' + err)
                                    SA.logger.error('Retrying to send the Test Report in 60 seconds...')
                                }
                            }
                        }
                    }

                    async function onError(err) {
                        SA.logger.error('Failed to Build the Model for this Test Case. Err: ' + err + '. Aborting the processing of this case and retrying the main loop in 30 seconds...')
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                    }
                } else {
                    SA.logger.info('Nothing to Test. Retrying in 30 seconds...')
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                }
            }
            async function onError(err) {
                SA.logger.error('Failed to get a Test Case. Err:' + err + 'Retrying in 30 seconds...')
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
            forecastedCandles: JSON.stringify(bestPredictions)
        }

        const axios = require("axios")
        axios
            .post('http://' + BOT_CONFIG.targetSuperalgosHost + ':' + BOT_CONFIG.targetSuperalgosHttpPort + '/Bitcoin-Factory', params)
            .then(res => {
                SA.logger.info('Updating Superalgos... Response from Superalgos Bitcoin Factory Server: ' + JSON.stringify(res.data))
            })
            .catch(error => {
                SA.logger.error('Updating Superalgos... Could not update Superalgos. Had this error: ' + error)
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
                instance: TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.clientInstanceName,
                recipient: 'Test Client Manager',
                message: message,
                testClientVersion: TEST_CLIENT_VERSION
            }

            let messageHeader = {
                requestType: 'Query',
                networkService: 'Machine Learning',
                queryMessage: JSON.stringify(queryMessage)
            }

            if (TS.projects.foundations.globals.taskConstants.P2P_NETWORK === undefined) {
                reject('Not connected to network node yet... hold on...')
                return
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
                nextTestCase.testServer = {
                    userProfile: response.data.serverData.userProfile,
                    instance: response.data.serverData.instance
                }
                resolve(nextTestCase)
            }
            async function onError(err) {
                reject(err)
            }
        }
    }

    async function setTestCaseResults(testResult, testServer) {
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
                instance: TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.clientInstanceName,
                recipient: 'Test Client Manager',
                testServer: testServer,
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
        /*
        Set default script name.
        */
        if (nextTestCase.pythonScriptName === undefined) { nextTestCase.pythonScriptName = "Bitcoin_Factory_LSTM.py" }
        if (BOT_CONFIG.dockerContainerName === undefined) { BOT_CONFIG.dockerContainerName = "Bitcoin-Factory-ML" }        
        /*
        Remove from Parameters the properties that are in OFF
        */
        let relevantParameters = {}
        for (const property in nextTestCase.parameters) {
            if (nextTestCase.parameters[property] !== 'OFF') {
                relevantParameters[property] = nextTestCase.parameters[property]
            }
        }
        /*
        Show something nice to the user.
        */
        SA.logger.info('')
        SA.logger.info('-------------------------------------------------------- Test Case # ' + nextTestCase.id + ' / ' + nextTestCase.totalCases + ' --------------------------------------------------------')
        SA.logger.info('')
        SA.logger.info('Test Server: ' + nextTestCase.testServer.userProfile + ' / ' + nextTestCase.testServer.instance)
        SA.logger.info('')
        SA.logger.info('Parameters Received for this Test:')
        console.table(relevantParameters)
        SA.logger.info('Ready to run this script inside the Docker Container: ' + nextTestCase.pythonScriptName)
        SA.logger.info('')
        SA.logger.info('Starting to process this Case')
        SA.logger.info('')
        /*
        Return Promise
        */
        let processExecutionResult
        let startingTimestamp = (new Date()).valueOf()
        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {

            const { spawn } = require('child_process');
            const ls = spawn('docker', ['exec', BOT_CONFIG.dockerContainerName, 'python', '-u', '/tf/notebooks/' + nextTestCase.pythonScriptName]);
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
                            let heartbeatText = 'Episode reward mean / max / min: ' + data.episodeRewardMean + ' | ' + data.episodeRewardMax + ' | ' + data.episodeRewardMin

                            TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, heartbeatText, percentage, statusText)

                            dataReceived = dataReceived + data.toString()
                        }
                    } catch (err) { }

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
                    SA.logger.info(data)
                }

            });

            ls.stderr.on('data', (data) => {
                onError(data)
            });

            ls.on('close', (code) => {
                SA.logger.info(`Docker Python Script exited with code ${code}`);
                if (code === 0) {
                    onFinished(dataReceived)
                } else {
                    SA.logger.error('Unexpected error trying to execute a Python script inside the Docker container. ')
                    SA.logger.error('Check at a console if you can run this command: ')
                    SA.logger.error('docker exec ' + BOT_CONFIG.dockerContainerName + ' python -u /tf/notebooks/' + nextTestCase.pythonScriptName)
                    SA.logger.error('Once you can sucessfully run it at the console you might want to try to run this App again. ')
                    reject('Unexpected Error.')
                }
            });

            function onError(err) {
                err = err.toString()
                //reject('Error Building Model.')
            }

            function onFinished(dataReceived) {
                try {
                    if (dataReceived.includes('RL_SCENARIO_END')) {
                        let fileContent = SA.nodeModules.fs.readFileSync(global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Client/notebooks/evaluation_results.json")
                        if (fileContent !== undefined) {
                            try {
                                processExecutionResult = JSON.parse(fileContent)
                                SA.logger.info(processExecutionResult)
/* example of fileContent:
 {"meanNetWorth": 721.2464292834837, "stdNetWorth": 271.8523338823371, "minNetWorth": 248.60280285744497, "maxNetWorth": 1264.2342365877673, "stdQuoteAsset": 193.18343367092214, "minQuoteAsset": 4.0065377572671893e-10, "maxQuoteAsset": 1161.3969522280302, "stdBaseAsset": 0.005149471273320009, "minBaseAsset": 0.0, "maxBaseAsset": 0.0284320291802237, "meanNetWorthAtEnd": 260.82332674553476, "stdNetWorthAtEnd": 0.0, "minNetWorthAtEnd": 260.82332674553476, "maxNetWorthAtEnd": 260.82332674553476}
*/                                
                                let endingTimestamp = (new Date()).valueOf()
                                processExecutionResult.elapsedTime = (endingTimestamp - startingTimestamp) / 1000          
                                processExecutionResult.pythonScriptName = nextTestCase.pythonScriptName                                                  
                                SA.logger.info('{Testclient} Elapsed Time: ' + timeUnits(processExecutionResult.elapsedTime * 1000) + ' ')
                                SA.logger.info('{Testclient} Mean Networth at End of Train: ' + processExecutionResult["0"].meanNetWorthAtEnd)
                                SA.logger.info('{Testclient} Mean Networth at End of Test: ' + processExecutionResult["1"].meanNetWorthAtEnd)
                                SA.logger.info('{Testclient} Mean Networth at End of Validation: ' + processExecutionResult["2"].meanNetWorthAtEnd)
                                SA.logger.info('{Testclient} Next Action/Amount/Limit: ' + processExecutionResult["2"].current_action.type + ' / ' + processExecutionResult["2"].current_action.amount+ ' / ' + processExecutionResult["2"].current_action.limit)
                            } catch (err) {
                                SA.logger.error('Error parsing the information generated at the Docker Container executing the Python script. err.stack = ' + err.stack)
                                SA.logger.error('The data that can not be parsed is = ' + fileContent)
                            }
                        } else {
                            SA.logger.error('Can not read result file: ' + global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Client/notebooks/evaluation_results.json")
                        }
                    } else {
                        try {
                            let cleanedData = filterOutput(dataReceived)
                            processExecutionResult = JSON.parse(cleanedData)
                            processExecutionResult.predictions = fixJSON(processExecutionResult.predictions)
                            processExecutionResult.predictions = JSON.parse(processExecutionResult.predictions)

                            SA.logger.info('Prediction RMSE Error: ' + processExecutionResult.errorRMSE)
                            SA.logger.info('Predictions [candle.max, candle.min, candle.close]: ' + processExecutionResult.predictions)

                            let endingTimestamp = (new Date()).valueOf()
                            processExecutionResult.elapsedTime = (endingTimestamp - startingTimestamp) / 1000
                            SA.logger.info('Elapsed Time (HH:MM:SS): ' + (new Date(processExecutionResult.elapsedTime * 1000).toISOString().substr(11, 8)) + ' ')
                        } catch (err) {
                            SA.logger.error('Error parsing the information generated at the Docker Container executing the Python script. err.stack = ' + err.stack)
                            SA.logger.error('The data that can not be parsed is = ' + cleanedData)
                        }
                    }
                } catch (err) {

                    if (processExecutionResult !== undefined && processExecutionResult.predictions !== undefined) {
                        SA.logger.error('processExecutionResult.predictions:' + processExecutionResult.predictions)
                    }

                    SA.logger.error(err.stack)
                    SA.logger.error(err)
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

    function filterOutput(text) {
        /* Discards parts of trainingOutput which break JSON syntax */
        let cleanText = ""
        let position = 0
        let startPosition = text.indexOf("Epoch")
        if (startPosition > 0) {
            position = text.indexOf('"', startPosition)
            cleanText = text.substring(0, position + 1)
        } else {
            return text
        }
        position = 0
        position = text.indexOf(',"predictions')
        if (position > 0) {
            cleanText = cleanText + text.substring(position)
        } else {
            return text
        }
        return cleanText
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
