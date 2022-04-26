exports.newBitcoinFactoryModulesClientInterface = function newBitcoinFactoryModulesClientInterface() {
    /*
    This module represents the Interface the Machine Learning Network Service have 
    with Network Clients connected to it. 

    */
    let thisObject = {
        messageReceived: messageReceived,
        initialize: initialize,
        finalize: finalize
    }

    let requestsToServer = []
    let responseFunctions = new Map()

    return thisObject

    function finalize() {

    }

    async function initialize() {

    }

    async function messageReceived(
        messageHeader,
        userProfile,
        connectedUserProfiles
    ) {

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
        //console.log(queryMessage)
        switch (queryReceived.sender) {
            case 'Test-Client': {
                queryReceived.userProfile = userProfile.name
                return await testClientMessage(queryReceived)
            }
            case 'Forecast-Client': {
                queryReceived.userProfile = userProfile.name
                return await forecastClientMessage(queryReceived)
            }
            case 'Test-Server': {
                return await testServerMessage(queryReceived)
            }
        }
    }

    async function testClientMessage(queryReceived) {
        let requestToServer = {
            queryReceived: queryReceived,
            timestamp: (new Date()).valueOf()
        }
        requestsToServer.push(requestToServer)
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

    async function forecastClientMessage(queryReceived) {
        let requestToServer = {
            queryReceived: queryReceived,
            timestamp: (new Date()).valueOf()
        }
        requestsToServer.push(requestToServer)
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

    async function testServerMessage(queryReceived) {
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
            } else {
                let requestToServer = requestsToServer[0]
                let now = (new Date()).valueOf()
                if (now - requestToServer.timestamp < 60000) {
                    let response = {
                        result: 'Ok',
                        message: 'Request Found.',
                        clientData: JSON.stringify(requestToServer.queryReceived)
                    }
                    requestsToServer.splice(0, 1)
                    resolve(response)
                } else {
                    let response = {
                        result: 'Ok',
                        message: 'Next Request Already Expired.'
                    }
                    requestsToServer.splice(0, 1)
                    responseFunctions.delete(requestToServer.queryReceived.messageId)
                    resolve(response)
                }
            }
        }
    }
}