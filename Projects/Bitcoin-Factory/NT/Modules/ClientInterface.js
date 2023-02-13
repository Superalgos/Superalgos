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
    }

    let requestsToServer = []
    let messagesForDashboard = new Map()
    let responseFunctions = new Map()
    let statsByNetworkClients = new Map()
    let activeTestServerOperators = new Set()
    let activeForecasterOperators = new Set()
    const MAXAGEMINUTES = 2
    let stats = {

    }

    /**Here we control our memory cleanup, it will run every 60 seconds. */
    let intervalId = setInterval(statsMaintenance, 60 * 1000)

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

            /** Here we add the information we are handling to memory
             * All memories are stored for 10 mintues before being removed from memory.*/
            rememberMessagesForDashboard(queryReceived)

            switch (queryReceived.sender) {
                case 'Test-Client': {
                    queryReceived.userProfile = userProfile.name
                    return await testClientMessage(queryReceived, userProfile.name)
                }
                case 'Forecast-Client': {
                    queryReceived.userProfile = userProfile.name
                    activeForecasterOperators.add(userProfile.name)
                    return await forecastClientMessage(queryReceived, userProfile.name)
                }
                case 'Test-Server': {
                    queryReceived.userProfile = userProfile.name
                    activeTestServerOperators.add(userProfile.name)
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
            SA.logger.info('Request From Test Client v.' + testClientVersion +
                '                 -> timestamp = ' + (new Date(requestToServer.timestamp)).toISOString() +
                ' -> Websockets Clients = ' + connectedUserProfilesLabel +
                ' -> Clients Requests Queue Size = ' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(requestsToServer.length, 3) +
                ' -> userProfile = ' + userProfile +
                ' -> instance = ' + queryReceived.instance +
                ' -> target = ' + ((requestToServer.queryReceived.testServer !== undefined) && (requestToServer.queryReceived.testServer.instance !== undefined) ? requestToServer.queryReceived.testServer.instance : '')
                )

            /*
            Update the Statistics
            */
            let networkClientKey = queryReceived.sender + '/' + userProfile + '/' + queryReceived.instance
            let statsByNetworkClient = statsByNetworkClients.get(networkClientKey)
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
                function onResponseFromServer(answerReceived) {
                    SA.logger.info('Answer to Test Client v.' + testClientVersion +
                        '                 -> timestamp = ' + (new Date(requestToServer.timestamp)).toISOString() +
                        ' -> userProfile = ' + userProfile +
                        ' -> sender = ' + answerReceived.sender +
                        ' -> instance = ' + answerReceived.instance 
                    )
                    /*
                    Process the Response
                    */
                    let response = {
                        result: 'Ok',
                        message: 'Server Responded.',
                        serverData: answerReceived
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
            let forecastClientVersion = queryReceived.forecastClientVersion
            if (forecastClientVersion === undefined) { forecastClientVersion = 1 }
            requestsToServer.push(requestToServer)
            SA.logger.info('Request From Forecast Client v.' + forecastClientVersion +
                '             -> timestamp = ' + (new Date(requestToServer.timestamp)).toISOString() +
                ' -> Websockets Clients = ' + connectedUserProfilesLabel +
                ' -> Clients Requests Queue Size = ' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(requestsToServer.length, 3) +
                ' -> userProfile = ' + userProfile +
                ' -> instance = ' + queryReceived.instance +
                ' -> target = ' + ((requestToServer.queryReceived.testServer !== undefined) && (requestToServer.queryReceived.testServer.instance !== undefined) ? requestToServer.queryReceived.testServer.instance : '')
                )
            return new Promise(promiseWork)

            async function promiseWork(resolve, reject) {
                responseFunctions.set(queryReceived.messageId, onResponseFromServer)
                function onResponseFromServer(answerReceived) {

                    SA.logger.info('Answer to Forecast Client v.' + forecastClientVersion +
                        '                 -> timestamp = ' + (new Date(requestToServer.timestamp)).toISOString() +
                        ' -> userProfile = ' + userProfile +
                        ' -> sender = ' + answerReceived.sender +
                        ' -> instance = ' + answerReceived.instance 
                    )

                    let response = {
                        result: 'Ok',
                        message: 'Server Responded.',
                        serverData: answerReceived
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
                    Workaround: The Forecaster is submitting cases with instance name, but without userProfile. Delete this 
                    block after this issue has been fixed at the source and old test cases were processed
                    */
                    for (let i = 0; i < requestsToServer.length; i++) {
                        let requestToServer = requestsToServer[i]
                        if (
                            requestToServer.queryReceived.testServer !== undefined &&
                            requestToServer.queryReceived.testServer.instance === queryReceived.instance
                        ) {
                            requestsToServer.splice(i, 1)
                            checkExpiration(requestToServer)
                            return
                        }
                    }
                    /*
                    There are no requests specific for this Test Server Instance, so we can assign the next generic one.
                    */
                    for (let i = 0; i < requestsToServer.length; i++) {
                        let requestToServer = requestsToServer[i]
                        if (
                            requestToServer.queryReceived.testServer === undefined
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
                        if (now - requestToServer.timestamp < MAXAGEMINUTES * 60 * 1000) {
                            let response = {
                                result: 'Ok',
                                message: 'Request Found.',
                                clientData: JSON.stringify(requestToServer.queryReceived)
                            }

                            SA.logger.info('Request sent to Server:                     -> timestamp = ' + (new Date(requestToServer.timestamp)).toISOString() +
                                ' -> Websockets Clients = ' + connectedUserProfilesLabel +
                                ' -> Clients Requests Queue Size = ' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(requestsToServer.length, 3) +
                                ' -> userProfile = ' + userProfile +
                                ' -> instance = ' + queryReceived.instance)
                            resolve(response)
                        } else {
                            SA.logger.warn('Request Expired                              -> timestamp = ' + (new Date(requestToServer.timestamp)).toISOString() +
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
    
    /* Statistics & Maintenance functions to be executed once a minute */
    function statsMaintenance() {
        /* Call memory handling function */
        maintainMemoryStorage()
        
        /* Output stats about connected test server and forecaster operators */
        let testServerList
        let forecasterList
        if (activeTestServerOperators.size === 0) { testServerList = "none" } else { testServerList = Array.from(activeTestServerOperators).join(', ') }
        if (activeForecasterOperators.size === 0) { forecasterList = "none" } else { forecasterList = Array.from(activeForecasterOperators).join(', ') }
        SA.logger.info('Active Test Server Operators: ' + testServerList)
        SA.logger.info('Active Forecaster Operators: ' + forecasterList)
        activeTestServerOperators.clear()
        activeForecasterOperators.clear()

        /* Delete all messages older than 2 minutes from the network node queue */
        let purgeCounter = 0
        for (let i = 0; i < requestsToServer.length; i++) {
            let requestToServer = requestsToServer[i]
            let now = (new Date()).valueOf()
            if (now - requestToServer.timestamp >= MAXAGEMINUTES * 60 * 1000) {
                purgeCounter++
                requestsToServer.splice(i, 1)
                responseFunctions.delete(requestToServer.queryReceived.messageId)
            }
        }
        if (purgeCounter > 0) {
            SA.logger.info('Deleted ' + purgeCounter + ' messages older than ' + MAXAGEMINUTES + ' minutes from the queue.')
        }
    }

    /**Here we add the message we are handling to memory for the dashboard to later access. */
    function rememberMessagesForDashboard(queryReceived) {
        let dashboardMemoryKeys = (new Date()).valueOf()
        messagesForDashboard.set(dashboardMemoryKeys, queryReceived)
    }


    /**Here we remove any memories that are older then 10 minutes. */
    function maintainMemoryStorage() {
        let timestamp = (new Date()).valueOf()
        let oldestOkTimestamp = timestamp - 600000
        for (let [key, value] of messagesForDashboard.entries()) {
            if (key < oldestOkTimestamp) { messagesForDashboard.delete(key) }
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
