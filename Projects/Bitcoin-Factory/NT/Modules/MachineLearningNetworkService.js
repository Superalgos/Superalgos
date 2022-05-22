exports.newBitcoinFactoryModulesMachineLearningNetworkService = function newBitcoinFactoryModulesMachineLearningNetworkService() {
    /*
    This module represents the Machine Learning Network Service of the Bitcoin Factory.
    */
    let thisObject = {
        clientInterface: undefined,
        serverInterface: undefined,
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

        thisObject.clientInterface.finalize()
        thisObject.serverInterface.finalize()

        thisObject.clientInterface = undefined
        thisObject.serverInterface = undefined
    }

    async function initialize(
        p2pNetworkNode,
        p2pNetworkReachableNodes
    ) {
        /*
        We run the Service Bootstrapping Process
        */
        let appBootstrapingProcess = SA.projects.socialTrading.modules.appBootstrapingProcess.newSocialTradingAppBootstrapingProcess()
        appBootstrapingProcess.run()
        /*
        The Storage deals with persisting the Machine Learning.
        */
        thisObject.clientInterface = NT.projects.bitcoinFactory.modules.clientInterface.newBitcoinFactoryModulesClientInterface()
        thisObject.serverInterface = NT.projects.bitcoinFactory.modules.serverInterface.newBitcoinFactoryModulesServerInterface()

        await thisObject.clientInterface.initialize()
        await thisObject.serverInterface.initialize()
    }
}