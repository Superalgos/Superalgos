exports.newBitcoinFactoryBotModulesTestServer = function (processIndex) {

    const MODULE_NAME = "Test-Server"

    let thisObject = {
        utilities: undefined,
        dataBridge: undefined,
        testCasesManager: undefined,
        testClientsManager: undefined,
        forecastCasesManager: undefined,
        forecastClientsManager: undefined,
        initialize: initialize,
        finalize: finalize,
        start: start
    }
    const MIN_TEST_CLIENT_VERSION = 6
    const TEST_SERVER_VERSION = 1

    let networkCodeName = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.networkCodeName
    let serverInstanceName = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName
    
    let socketClientDashboard
    let intervalIdupdateDashboard

    thisObject.utilities = TS.projects.bitcoinFactory.utilities.miscellaneous
    thisObject.dataBridge = TS.projects.bitcoinFactory.botModules.dataBridge.newDataBridge(processIndex)
    thisObject.testCasesManager = TS.projects.bitcoinFactory.botModules.testCasesManager.newTestCasesManager(processIndex, networkCodeName)
    thisObject.testClientsManager = TS.projects.bitcoinFactory.botModules.testClientsManager.newTestClientsManager(processIndex, networkCodeName)
    thisObject.forecastCasesManager = TS.projects.bitcoinFactory.botModules.forecastCasesManager.newForecastCasesManager(processIndex, networkCodeName)
    thisObject.forecastClientsManager = TS.projects.bitcoinFactory.botModules.forecastClientsManager.newForecastClientsManager(processIndex, networkCodeName)
    TS.projects.foundations.globals.taskConstants.TEST_SERVER = thisObject

    return thisObject

    async function initialize(pStatusDependenciesModule, callBackFunction) {
        try {
            thisObject.utilities.initialize()
            thisObject.dataBridge.initialize()
            await thisObject.testCasesManager.initialize()
            await thisObject.testClientsManager.initialize()
            if (thisObject.forecastCasesManager.forecastCasesArray == undefined) {
                thisObject.forecastCasesManager.initialize()
            }
            await thisObject.forecastClientsManager.initialize()
            openDashboardSocket()
            intervalIdupdateDashboard = setInterval(updateDashboard, 60 * 1000)

            SA.logger.info('Running Test Server v.' + TEST_SERVER_VERSION)
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            if (err.stack !== undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[ERROR] initialize -> err = " + err.stack)
            }

            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }

    function openDashboardSocket() {
        socketClientDashboard = new SA.nodeModules.ws.WebSocket('ws://localhost:18043')
        socketClientDashboard.on('close', function (close) {
            SA.logger.info('[INFO] {TestServer} Dashboard App has been disconnected.')
        })
        socketClientDashboard.on('error', function (error) {
            SA.logger.error('[ERROR] {TestServer} Dashboards Client error: ', error.message, error.stack)
        });
        socketClientDashboard.on('message', function (message) {
            SA.logger.info('[INFO] {TestServer} This is a message coming from the Dashboards App', message)
        });
    }

    function finalize() {
        clearInterval(intervalIdupdateDashboard)
        thisObject.utilities.finalize()
        thisObject.dataBridge.finalize()
        thisObject.testCasesManager.finalize()
        thisObject.testClientsManager.finalize()
        thisObject.forecastCasesManager.finalize()
        thisObject.forecastClientsManager.initialize()
    }

    async function start(callBackFunction) {
        try {
            SA.logger.info("Test Server is Starting Now.")
            let queryMessage = {
                sender: 'Test-Server',
                instance: serverInstanceName
            }

            let messageHeader = {
                requestType: 'Query',
                networkService: 'Machine Learning',
                queryMessage: JSON.stringify(queryMessage)
            }
            while (true) {
                if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
                    SA.logger.info("Test Server is Stopping Now.")
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                    return
                }
                if (TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient.machineLearningNetworkServiceClient === undefined) {
                    SA.logger.info("Not connected to the Superalgos Network. Retrying in 10 seconds...")
                    await SA.projects.foundations.utilities.asyncFunctions.sleep(10000)
                } else {
                    await TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient.machineLearningNetworkServiceClient.sendMessage(messageHeader)
                        .then(onSuccess)
                        .catch(onError)
                    async function onSuccess(response) {
                        if (response.data.clientData === undefined) {
                            /*
                            In this case there were no requests for the server, we will prepare for the next message and go to sleep.
                            */
                            getReadyForNewMessage()
                            if (response.result === "Ok" && response.data.result === "Ok" && response.data.message === "Next Request Already Expired.") {
                                SA.logger.info('Network Node Response: Next Request Already Expired.')
                            } else {
                                /* No request at the moment for the Test Server */
                                await SA.projects.foundations.utilities.asyncFunctions.sleep(1000)
                            }
                        } else {
                            /*
                            In this case there is a request that needs to be processed.
                            */
                            let clientData = JSON.parse(response.data.clientData)
                            let managerResponse

                            try {

                                switch (clientData.recipient) {
                                    case 'Test Client Manager': {
                                        if (clientData.testClientVersion === undefined || clientData.testClientVersion < MIN_TEST_CLIENT_VERSION) {
                                            SA.logger.info('Cound not process request from ' + clientData.userProfile + ' / ' + clientData.instance + ' becasuse is running an outdated version of the Test Client. Version = ' + clientData.testClientVersion)
                                            managerResponse = 'CLIENT VERSION IS TOO OLD'
                                        } else {
                                            managerResponse = await thisObject.testClientsManager.onMessageReceived(clientData.message, clientData.userProfile, clientData.instance)
                                        }
                                        break
                                    }
                                    case 'Forecast Client Manager': {
                                        managerResponse = await thisObject.forecastClientsManager.onMessageReceived(clientData.message, clientData.userProfile, clientData.instance)
                                        break
                                    }
                                }

                                queryMessage = {
                                    messageId: clientData.messageId,
                                    sender: 'Test-Server',
                                    instance: serverInstanceName,
                                    response: managerResponse
                                }

                                messageHeader = {
                                    requestType: 'Query',
                                    networkService: 'Machine Learning',
                                    queryMessage: JSON.stringify(queryMessage)
                                }
                            } catch (err) {
                                /*
                                If something bad happens, we wont let the server crash. We are not going to send 
                                a response to the client, we will let it timeout and try again, in other words
                                we will ignore messages that would crash the server.
                                */
                                SA.logger.error('Query that produced an error at Test Server: ' + JSON.stringify(response))
                                SA.logger.error('err: ' + err)
                                SA.logger.error('err.stack: ' + err.stack)
                                getReadyForNewMessage()
                                await SA.projects.foundations.utilities.asyncFunctions.sleep(1000)
                            }
                        }
                    }
                    async function onError(err) {
                        SA.logger.error('Error retrieving message from Network Node.')
                        SA.logger.error('err: ' + err)
                        SA.logger.error('Retrying in 10 seconds...')
                        getReadyForNewMessage()
                        await SA.projects.foundations.utilities.asyncFunctions.sleep(10000)
                    }
                }
            }
            function getReadyForNewMessage() {
                queryMessage = {
                    sender: 'Test-Server',
                    instance: serverInstanceName
                }

                messageHeader = {
                    requestType: 'Query',
                    networkService: 'Machine Learning',
                    queryMessage: JSON.stringify(queryMessage)
                }
            }
        }
        catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            if (err !== undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[ERROR] start -> err = " + err)
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[ERROR] start -> err.stack = " + err.stack)
            }
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }

    async function updateDashboard() {

        //SA.logger.debug('{TestServer} Updating Dashboard')
        let fileContent = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.loadFile(global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName + "/StateData/TestCases/Test-Cases-Array-" + networkCodeName + ".json")
        let messageToSend = (new Date()).toISOString() + '|*|Platform|*|Data|*|BitcoinFactory-Server|*|'+fileContent
        socketClientDashboard.send(messageToSend)
        //SA.logger.debug('{TestServer} ' + messageToSend)

        fileContent = TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.loadFile(global.env.PATH_TO_BITCOIN_FACTORY + "/Test-Server/" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName + "/StateData/ForecastCases/Forecast-Cases-Array-" + networkCodeName + ".json")
        messageToSend = (new Date()).toISOString() + '|*|Platform|*|Data|*|BitcoinFactory-Forecaster|*|'+fileContent
        socketClientDashboard.send(messageToSend)
    }
}
