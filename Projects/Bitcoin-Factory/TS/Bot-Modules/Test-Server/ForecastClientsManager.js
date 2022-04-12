exports.newForecastClientsManager = function newForecastClientsManager(networkCodeName) {
    /*
    This modules coordinates all Forecast Clients.
    */
    let thisObject = {
        run: run,
        initialize: initialize,
        finalize: finalize
    }

    let forecastClients

    const WEBRTC_MODULE = require('./ML-Test-WebRTC/WebRTC')
    const WEBRTC_INSTANCES = []

    return thisObject

    async function initialize() {

        await scanSuperalgosUserProfiles()
        console.log((new Date()).toISOString(), 'Starting Network "' + networkCodeName + '" with these Forecast Clients:')
        console.table(forecastClients)

        for (let i = 0; i < forecastClients.length; i++) {
            let forecastClient = forecastClients[i]
            const WEBRTC = WEBRTC_MODULE.newMachineLearningWebRTC()
            WEBRTC.runningAtTestServer = true
            WEBRTC.clientInstanceName = forecastClient.name
            WEBRTC.userProfile  = forecastClient.userProfile 
            WEBRTC.initialize(forecastClient.id, i)
            WEBRTC_INSTANCES.push(WEBRTC)
        }
    }

    function finalize() {

    }

    function run() {
        for (let i = 0; i < WEBRTC_INSTANCES.length; i++) {
            let WEBRTC_INSTANCE = WEBRTC_INSTANCES[i]
            listenToForecastClients(WEBRTC_INSTANCE)
        }
    }

    async function scanSuperalgosUserProfiles() {
        forecastClients = []
        let userProfileFIleList = await TEST_SERVER.utilities.getUserProfileFilesList()
        
        for (let i = 0; i < userProfileFIleList.length; i++) {
            let fileName = userProfileFIleList[i]
            await processUserProfile(fileName)
        }

        async function processUserProfile(fileName) {
            let userProfilePluginFile = await TEST_SERVER.utilities.getUserProfileFile(fileName) 
            let userProfile = JSON.parse(userProfilePluginFile)
            if (
                userProfile.forecastsProviders !== undefined &&
                userProfile.forecastsProviders.bitcoinFactoryForecasts !== undefined
            ) {
                
                for (let i = 0; i < userProfile.forecastsProviders.bitcoinFactoryForecasts.length; i++) {
                    let network = userProfile.forecastsProviders.bitcoinFactoryForecasts[i]
                    if (network.name === networkCodeName) {

                        for (let j = 0; j < network.forecastClientInstances.length; j++) {
                            let forecastClientInstance = network.forecastClientInstances[j]
                            forecastClientInstance.savedPayload = undefined
                            forecastClientInstance.userProfile = userProfile.name
                            forecastClients.push(forecastClientInstance)
                        }
                    }
                }
            }
        }
    }

    function listenToForecastClients(WEBRTC) {
        WEBRTC.getNextMessage(onMessageReceived)

        function onMessageReceived(messageReceived) {
            let message = JSON.parse(messageReceived)

            switch (message.type) {
                case 'Get Next Forecast Case': {
                    let nextForecastCase = TEST_SERVER.forecastCasesManager.getNextForecastCase()
                    if (nextForecastCase !== undefined) {
                        /*
                        Because there is a size limit at WebRTC for messages going through
                        data channels, we will need to split the content into different 
                        messages. One will have the nextForecastCase object without the files,
                        and the other messages will be the timeseries and parameters files.
                        */
                        console.log((new Date()).toISOString(), WEBRTC.userProfile + ' / ' +  WEBRTC.clientInstanceName, 'requested a new Forecast Case')
                        WEBRTC.sendResponse('SENDING MULTIPLE MESSAGES')
                        WEBRTC.sendFile(nextForecastCase.files.timeSeries)
                        WEBRTC.sendFile(nextForecastCase.files.parameters)
                        nextForecastCase.files.timeSeries = undefined
                        nextForecastCase.files.parameters = undefined
                        WEBRTC.sendResponse(JSON.stringify(nextForecastCase))
                        WEBRTC.sendResponse('MULTIPLE MESSAGES SENT')
                        console.log((new Date()).toISOString(), 'Forecast Case Id ' + nextForecastCase.id + ' delivered to', WEBRTC.userProfile + ' / ' +  WEBRTC.clientInstanceName)
                    } else {
                        // console.log((new Date()).toISOString(), 'No more Forecast Cases to Build. Could not deliver one to ' + WEBRTC.userProfile + ' / ' +  WEBRTC.clientInstanceName)
                        WEBRTC.sendResponse('NO FORECAST CASES AVAILABLE AT THE MOMENT')
                    }
                    break
                }
                case 'Get This Forecast Case': {
                    let thisForecastCase = TEST_SERVER.forecastCasesManager.getThisForecastCase(message.forecastCaseId)
                    if (thisForecastCase !== undefined) {
                        /*
                        Because there is a size limit at WebRTC for messages going through
                        data channels, we will need to split the content into different 
                        messages. One will have the thisForecastCase object without the files,
                        and the other messages will be the timeseries and parameters files.
                        */
                        console.log((new Date()).toISOString(), WEBRTC.userProfile + ' / ' +  WEBRTC.clientInstanceName, 'requested the Forecast Case Id ' + message.forecastCaseId)
                        WEBRTC.sendResponse('SENDING MULTIPLE MESSAGES')
                        WEBRTC.sendFile(thisForecastCase.files.timeSeries)
                        WEBRTC.sendFile(thisForecastCase.files.parameters)
                        thisForecastCase.files.timeSeries = undefined
                        thisForecastCase.files.parameters = undefined
                        WEBRTC.sendResponse(JSON.stringify(thisForecastCase))
                        WEBRTC.sendResponse('MULTIPLE MESSAGES SENT')
                        console.log((new Date()).toISOString(), 'Forecast Case Id ' + thisForecastCase.id + ' delivered to', WEBRTC.userProfile + ' / ' +  WEBRTC.clientInstanceName)
                    } else {
                        console.log((new Date()).toISOString(), 'Forecast Case ' + message.forecastCaseId + ' is Not Available Anymore. Could not deliver requested Case to ' + WEBRTC.userProfile + ' / ' +  WEBRTC.clientInstanceName)
                        WEBRTC.sendResponse('THIS FORECAST CASE IS NOT AVAILABLE ANYMORE')
                    }
                    break
                }
                case 'Set Forecast Case Results': {
                    TEST_SERVER.forecastCasesManager.setForecastCaseResults(JSON.parse(message.payload), WEBRTC.userProfile + ' / ' +  WEBRTC.clientInstanceName)
                    let response = JSON.stringify(TEST_SERVER.forecastCasesManager.getForecasts())
                    WEBRTC.sendResponse(response)
                    break
                }
            }
        }
    }
}