exports.newBitcoinFactoryModulesMachineLearningNetworkServiceClient = function newBitcoinFactoryModulesMachineLearningNetworkServiceClient() {
    /*
    This module represents the Client of the Machine Learning Network Service
    running inside P2P Network Nodes.
    */
    let thisObject = {
        userAppSigningAccountCodeName: undefined,
        machineLearningNetworkServiceProxy: undefined,
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.userAppSigningAccountCodeName = undefined
        thisObject.machineLearningNetworkServiceProxy = undefined
    }

    function initialize(
        userAppSigningAccountCodeName,
        machineLearningNetworkServiceProxy
    ) {

        thisObject.userAppSigningAccountCodeName = userAppSigningAccountCodeName
        thisObject.machineLearningNetworkServiceProxy = machineLearningNetworkServiceProxy

        let appBootstrapingProcess = SA.projects.bitcoinFactory.modules.appBootstrapingProcess.newBitoinFactoryAppBootstrapingProcess()
        appBootstrapingProcess.run()
    }

    async function sendMessage(messageHeader) {

        switch (messageHeader.requestType) {
            case 'Query': {
                let queryMessage
                try {
                    queryMessage = JSON.parse(messageHeader.queryMessage)
                } catch (err) {
                    let response = {
                        result: 'Error',
                        message: 'queryMessage Not Correct JSON Format.'
                    }
                    return JSON.stringify(response)
                }

                messageHeader.queryMessage = JSON.stringify(queryMessage)

                let response

                // console.log((new Date()).toISOString(), '- Web App Interface', '- Query Message Received', JSON.stringify(queryMessage))

                /*
                In general, all Queries go to the P2P Network to fetch information from the Bitcoin Factory Server. 
                */
                response = {
                    result: 'Ok',
                    message: 'Web App Interface Query Processed.',
                    data: await thisObject.machineLearningNetworkServiceProxy.sendMessage(JSON.stringify(messageHeader))
                }

                // console.log((new Date()).toISOString(), '- Web App Interface', '- Query Response Sent', JSON.stringify(response))

                return response
            }
            default: {
                let response = {
                    result: 'Error',
                    message: 'requestType Not Supported.'
                }
                return JSON.stringify(response)
            }
        }
    }
}