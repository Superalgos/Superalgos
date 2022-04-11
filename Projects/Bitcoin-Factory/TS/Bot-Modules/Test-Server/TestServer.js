exports.newBitcoinFactoryBotModulesTestServer = function (processIndex) {

    const MODULE_NAME = "Test-Server"

    let thisObject = {
        initialize: initialize,
        start: start
    }

    let fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex)

    return thisObject

    function initialize(pStatusDependenciesModule, callBackFunction) {
        try {
            statusDependenciesModule = pStatusDependenciesModule;
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
                    console.log('Waiting for 5 seconds to try to get another client request.')
                    await sleep(5000)
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

    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms)
        })
    }
}
