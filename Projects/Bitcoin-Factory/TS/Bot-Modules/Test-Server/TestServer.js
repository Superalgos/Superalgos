exports.newBitcoinFactoryBotModulesTestServer = function (processIndex) {

    const MODULE_NAME = "Test-Server"

    let thisObject = {
        utilities: undefined,
        dataBridge: undefined,
        testCasesManager: undefined,
        testClientsManager: undefined,
        forecastsManager: undefined,
        run: run,
        initialize: initialize,
        finalize: finalize,
        start: start
    }

    networkCodeName = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.networkCodeName

    const UTILITIES_MODULE = require('./Utilities')
    thisObject.utilities = UTILITIES_MODULE.newUtilities()

    const DATA_BRIDGE_MODULE = require('./DataBridge')
    thisObject.dataBridge = DATA_BRIDGE_MODULE.newDataBridge()

    const TEST_CASES_MANAGER_MODULE = require('./TestCasesManager')
    thisObject.testCasesManager = TEST_CASES_MANAGER_MODULE.newTestCasesManager(networkCodeName)

    const TEST_CLIENTS_MANAGER_MODULE = require('./TestClientsManager')
    thisObject.testClientsManager = TEST_CLIENTS_MANAGER_MODULE.newTestClientsManager(networkCodeName)

    const FORECAST_CASES_MANAGER_MODULE = require('./ForecastCasesManager')
    thisObject.forecastCasesManager = FORECAST_CASES_MANAGER_MODULE.newForecastCasesManager(networkCodeName)

    const FORECAST_CLIENTS_MANAGER_MODULE = require('./ForecastClientsManager')
    thisObject.forecastClientsManager = FORECAST_CLIENTS_MANAGER_MODULE.newForecastClientsManager(networkCodeName)

    global.TEST_SERVER = thisObject
    return thisObject

    async function initialize(pStatusDependenciesModule, callBackFunction) {
        try {
            thisObject.utilities.initialize()
            thisObject.dataBridge.initialize()
            await thisObject.testCasesManager.initialize()
            await thisObject.testClientsManager.initialize()
            thisObject.forecastCasesManager.initialize()
            await thisObject.forecastClientsManager.initialize()
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] initialize -> err = " + err.stack)
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }

    function finalize() {
        thisObject.utilities.finalize()
        thisObject.dataBridge.finalize()
        thisObject.testCasesManager.finalize()
        thisObject.testClientsManager.finalize()
        thisObject.forecastCasesManager.finalize()
        thisObject.forecastClientsManager.initialize()
    }

    async function start(callBackFunction) {
        try {

            let queryMessage = {
                sender: 'Test-Server'
            }

            let messageHeader = {
                requestType: 'Query',
                networkService: 'Machine Learning',
                queryMessage: JSON.stringify(queryMessage)
            }
            while (true) {
                let response = await TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient.machineLearningNetworkServiceClient.sendMessage(messageHeader)
                console.log('Query received at Test Server: ' + JSON.stringify(response))
                // DO SOME STUFF
                if (response.data.clientData === undefined) {
                    queryMessage = {
                        sender: 'Test-Server'
                    }

                    messageHeader = {
                        requestType: 'Query',
                        networkService: 'Machine Learning',
                        queryMessage: JSON.stringify(queryMessage)
                    }
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                    break
                    //await sleep(5000)
                } else {
                    let clientData = JSON.parse(response.data.clientData)

                    queryMessage = {
                        messageId: clientData.messageId,
                        sender: 'Test-Server',
                        queryResponse: 'This is the Specific Query Response comming from the Test Server'
                    }

                    messageHeader = {
                        requestType: 'Query',
                        networkService: 'Machine Learning',
                        queryMessage: JSON.stringify(queryMessage)
                    }
                }
            }

            //callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
        }
        catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] start -> err = " + err.stack)
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }

    function run() {
        thisObject.testCasesManager.run()
        thisObject.testClientsManager.run()
        thisObject.forecastCasesManager.run()
        thisObject.forecastClientsManager.run()
    }
}
