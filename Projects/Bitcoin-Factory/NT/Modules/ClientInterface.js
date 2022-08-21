exports.newBitcoinFactoryModulesClientInterface = function newBitcoinFactoryModulesClientInterface() {
    /*
    This module represents the Interface the Machine Learning Network Service have 
    with Network Clients connected to it. 

    */
    let thisObject = {
        messageReceived: messageReceived,
        getStats: getStats,
        initialize: initialize,
        finalize: finalize,
        rememberMessagesForDashboard: rememberMessagesForDashboard
    }

    let requestsToServer = []
    let queryMemories = new Map()
    let responseFunctions = new Map()
    let statsByNetworkClients = new Map()
    let stats = {

    }

    let intervalId = setInterval(maintainMemoryStorage, 60 * 1000)

    return thisObject

    function finalize() {
        clearInterval(intervalId)
    }

    async function initialize() {

    }

    async function messageReceived(
        messageHeader,
        userProfile,
        connectedUserProfiles
    ) {

        let connectedUserProfilesLabel = SA.projects.foundations.utilities.miscellaneousFunctions.pad(connectedUserProfiles.length, 3) + ' / ' + global.env.P2P_NETWORK_NODE_MAX_INCOMING_CLIENTS
        if (messageHeader.requestType === undefined) {
            let response = {
                result: 'Error',
                message: 'Client Interface requestType Not Provided.'
            }
            return response
        }

        if (messageHeader.requestType !== 'Query') {
            let response = {
                result: 'Error',
                message: 'Client Interface requestType Not Supported.'
            }
            return response
        }

        switch (messageHeader.requestType) {
            case 'Query': {
                return await queryReceived(
                    messageHeader.queryMessage,
                    userProfile
                )
            }
        }
        async function queryReceived(
            queryMessage,
            userProfile
        ) {
            /*
    
            */
            let queryReceived
            try {
                queryReceived = JSON.parse(queryMessage)
            } catch (err) {
                let response = {
                    result: 'Error',
                    message: 'Client Interface queryMessage Not Correct JSON Format.'
                }
                return response
            }
            rememberMessagesForDashboard(queryReceived)
            switch (queryReceived.sender) {
                case 'Test-Client': {
                    queryReceived.userProfile = userProfile.name
                    return await testClientMessage(queryReceived, userProfile.name)
                }
                case 'Forecast-Client': {
                    queryReceived.userProfile = userProfile.name
                    return await forecastClientMessage(queryReceived, userProfile.name)
                }
                case 'Test-Server': {
                    queryReceived.userProfile = userProfile.name
                    return await testServerMessage(queryReceived, userProfile.name)
                }
            }
        }

        async function testClientMessage(queryReceived, userProfile) {
            /*
            Process the Request
            */
            let requestToServer = {
                queryReceived: queryReceived,
                timestamp: (new Date()).valueOf()
            }
            let testClientVersion = queryReceived.testClientVersion
            if (testClientVersion === undefined) { testClientVersion = 4 }
            requestsToServer.push(requestToServer)
            console.log((new Date()).toISOString(), '[INFO] Request From Test Client v.' + testClientVersion +
                '                 -> timestamp = ' + (new Date(requestToServer.timestamp)).toISOString() +
                ' -> Websockets Clients = ' + connectedUserProfilesLabel +
                ' -> Clients Requests Queue Size = ' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(requestsToServer.length, 3) +
                ' -> userProfile = ' + userProfile +
                ' -> instance = ' + queryReceived.instance)

            /*
            Update the Statistics
            */
            let networkClientKey = queryReceived.sender + '/' + userProfile + '/' + queryReceived.instance
            statsByNetworkClient = statsByNetworkClients.get(networkClientKey)
            if (statsByNetworkClient === undefined) {
                statsByNetworkClient = {
                    userProfile: userProfile,
                    instance: queryReceived.instance,
                    type: queryReceived.sender,
                    clientVersion: queryReceived.testClientVersion,
                    requestsCount: 0,
                    responsesCount: 0,
                    requestNextTestCaseCount: 0,
                    lastSeen: 0
                }
            }
            if (queryReceived.message.type === "Get Next Test Case") {
                statsByNetworkClient.requestNextTestCaseCount++
            }
            statsByNetworkClient.requestsCount++
            statsByNetworkClient.lastSeen = (new Date()).valueOf()
            statsByNetworkClients.set(networkClientKey, statsByNetworkClient)

            return new Promise(promiseWork)

            async function promiseWork(resolve, reject) {
                responseFunctions.set(queryReceived.messageId, onResponseFromServer)
                function onResponseFromServer(queryReceived) {
                    /*
                    Process the Response
                    */
                    let response = {
                        result: 'Ok',
                        message: 'Server Responded.',
                        serverData: queryReceived
                    }
                    /*
                    Update the Statistics
                    */
                    statsByNetworkClient = statsByNetworkClients.get(networkClientKey)
                    statsByNetworkClient.responsesCount++
                    statsByNetworkClient.lastSeen = (new Date()).valueOf()
                    resolve(response)
                }
            }
        }

        async function forecastClientMessage(queryReceived, userProfile) {
            let requestToServer = {
                queryReceived: queryReceived,
                timestamp: (new Date()).valueOf()
            }
            let forecastClientVersion = queryReceived.testClientVersion
            if (forecastClientVersion === undefined) { forecastClientVersion = 1 }
            requestsToServer.push(requestToServer)
            console.log((new Date()).toISOString(), '[INFO] Request From Forecast Client v.' + forecastClientVersion +
                '             -> timestamp = ' + (new Date(requestToServer.timestamp)).toISOString() +
                ' -> Websockets Clients = ' + connectedUserProfilesLabel +
                ' -> Clients Requests Queue Size = ' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(requestsToServer.length, 3) +
                ' -> userProfile = ' + userProfile +
                ' -> instance = ' + queryReceived.instance)
            return new Promise(promiseWork)

            async function promiseWork(resolve, reject) {
                responseFunctions.set(queryReceived.messageId, onResponseFromServer)
                function onResponseFromServer(queryReceived) {
                    let response = {
                        result: 'Ok',
                        message: 'Server Responded.',
                        serverData: queryReceived
                    }
                    resolve(response)
                }
            }
        }

        async function testServerMessage(queryReceived, userProfile) {
            if (queryReceived.messageId !== undefined) {
                let onResponseFromServer = responseFunctions.get(queryReceived.messageId)
                onResponseFromServer(queryReceived)
                responseFunctions.delete(queryReceived.messageId)
            }
            return new Promise(promiseWork)

            async function promiseWork(resolve, reject) {
                if (requestsToServer.length === 0) {
                    let response = {
                        result: 'Ok',
                        message: 'No Requests at the Moment.'
                    }
                    resolve(response)
                    return
                } else {
                    /*
                    First we will try to find a request sent specifically to the Test Server Instance sending this message.
                    If there is none, we will give it a generic request.
                    */
                    for (let i = 0; i < requestsToServer.length; i++) {
                        let requestToServer = requestsToServer[i]
                        if (
                            requestToServer.queryReceived.testServer !== undefined &&
                            requestToServer.queryReceived.testServer.userProfile === userProfile &&
                            requestToServer.queryReceived.testServer.instance === queryReceived.instance
                        ) {
                            requestsToServer.splice(i, 1)
                            checkExpiration(requestToServer)
                            return
                        }
                    }
                    /*
                    There are not request specific for this Test Server Instance, so we can assing the next generic one.
                    */
                    for (let i = 0; i < requestsToServer.length; i++) {
                        let requestToServer = requestsToServer[i]
                        if (
                            requestToServer.testServer === undefined
                        ) {
                            requestsToServer.splice(i, 1)
                            checkExpiration(requestToServer)
                            return
                        }
                    }
                    /*
                    For this Test Server Instance there are no requests at all.
                    */
                    let response = {
                        result: 'Ok',
                        message: 'No Requests at the Moment.'
                    }
                    resolve(response)
                    return

                    function checkExpiration(requestToServer) {
                        let now = (new Date()).valueOf()
                        if (now - requestToServer.timestamp < 2 * 60 * 1000) {
                            let response = {
                                result: 'Ok',
                                message: 'Request Found.',
                                clientData: JSON.stringify(requestToServer.queryReceived)
                            }

                            console.log((new Date()).toISOString(), '[INFO] Request Sent to Server                       -> timestamp = ' + (new Date(requestToServer.timestamp)).toISOString() +
                                ' -> Websockets Clients = ' + connectedUserProfilesLabel +
                                ' -> Clients Requests Queue Size = ' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(requestsToServer.length, 3) +
                                ' -> userProfile = ' + userProfile +
                                ' -> instance = ' + queryReceived.instance)
                            resolve(response)
                        } else {
                            console.log((new Date()).toISOString(), '[WARN] Request Expired                              -> timestamp = ' + (new Date(requestToServer.timestamp)).toISOString() +
                                ' -> Websockets Clients = ' + connectedUserProfilesLabel +
                                ' -> Clients Requests Queue Size = ' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(requestsToServer.length, 3) +
                                ' -> userProfile = ' + userProfile +
                                ' -> instance = ' + queryReceived.instance +
                                ' -> requestToServer.queryReceived = ' + JSON.stringify(requestToServer.queryReceived))
                            let response = {
                                result: 'Ok',
                                message: 'Next Request Already Expired.'
                            }

                            responseFunctions.delete(requestToServer.queryReceived.messageId)
                            resolve(response)
                        }
                    }
                }
            }
        }
    }
    
    /**Here we hold all info in memory for 10 minutes. */
    function rememberMessagesForDashboard(queryReceived) {
        let currentTimestamp = (new Date()).valueOf()
        let thisQueryReceived = queryReceived

        // Then we create a key for the map that holds the query messages in memory.
        let queryMemoryKeys = currentTimestamp
        queryMemory = queryMemories.get(queryMemoryKeys)
        if (queryMemory === undefined) {
            queryMemory = thisQueryReceived
            queryMemories.set(queryMemoryKeys, queryMemory)
        } else {
                queryMemories.set(queryMemoryKeys, thisQueryReceived)
        }

    }


    /**Here we remove any data from memory that is older then 10 minutes. */
    function maintainMemoryStorage() {
        let timestamp = (new Date()).valueOf()
        let oldestOkTimestamp = timestamp - 600000
        for (let [key, value] of queryMemories.entries()) {
            if (key < oldestOkTimestamp) { queryMemories.delete(key) }
        }
    }
    

    function getStats() {
        let response = {
            networkNode: {
                messageQueueSize: requestsToServer.length
            },
            networkClients: Array.from(statsByNetworkClients)
        }
        return response
    }
}