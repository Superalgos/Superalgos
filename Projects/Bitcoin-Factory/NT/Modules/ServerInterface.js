exports.newBitcoinFactoryModulesServerInterface = function newBitcoinFactoryModulesServerInterface() {
    /*
    This module represents the Interface the Machine Learning Network Service have 
    with Bitcoin Factory Server connected to it. 

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

        if (messageHeader.requestType !== 'Message To Server') {
            let response = {
                result: 'Error',
                message: 'Client Interface requestType Not Supported.'
            }
            return response
        }

        switch (messageHeader.requestType) {
            case 'Message To Server': {
                return await queryReceived(
                    messageHeader.queryMessage,
                    userProfile
                )
            }
        }
    }
}