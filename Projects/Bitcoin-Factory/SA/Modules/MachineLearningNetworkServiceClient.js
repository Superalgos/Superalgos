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

        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {
            let promiseStatus = 'Unresolved'
            setTimeout(onTimeout, 3 * 60 * 1000)

            switch (messageHeader.requestType) {
                case 'Query': {
                    let queryMessage
                    try {
                        queryMessage = JSON.parse(messageHeader.queryMessage)
                    } catch (err) {
                        promiseStatus = 'Rejected'
                        let response = {
                            result: 'Error',
                            message: 'queryMessage Not Correct JSON Format.'
                        }
                        reject(JSON.stringify(response))
                    }

                    messageHeader.queryMessage = JSON.stringify(queryMessage)

                    /*
                    In general, all Queries go to the P2P Network to fetch information from the Bitcoin Factory Server. 
                    */
                    await thisObject.machineLearningNetworkServiceProxy.sendMessage(JSON.stringify(messageHeader), TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.networkNodeUserProfile)
                        .then(onSuccess)
                        .catch(onError)
                    async function onSuccess(data) {
                        if (promiseStatus === 'Unresolved') {
                            promiseStatus = 'Resolved'
                            let response = {
                                result: 'Ok',
                                message: 'Web App Interface Query Processed.',
                                data: data
                            }
                            resolve(response)
                        }
                    }
                    async function onError(data) {
                        if (promiseStatus === 'Unresolved') {
                            promiseStatus = 'Rejected'
                            let response = {
                                result: 'Error',
                                message: 'Error sending the message.',
                                data: data
                            }
                            reject(JSON.stringify(response))
                        }
                    }
                }
                default: {
                    promiseStatus = 'Rejected'
                    let response = {
                        result: 'Error',
                        message: 'requestType Not Supported.'
                    }
                    reject(JSON.stringify(response))
                }
            }

            function onTimeout() {
                if (promiseStatus === 'Unresolved') {
                    promiseStatus = 'Rejected'
                    let response = {
                        result: 'Error',
                        message: 'Timeout waiting for a Response.'
                    }
                    reject(JSON.stringify(response))
                }
            }
        }
    }
}