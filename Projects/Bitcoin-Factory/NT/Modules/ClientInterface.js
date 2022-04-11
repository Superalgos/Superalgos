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
        /*
        Do something here...
        */
        console.log(queryMessage)
        let response = {
            result: 'Ok',
            message: 'Message Delivered.'
        }
        return response
    }
}