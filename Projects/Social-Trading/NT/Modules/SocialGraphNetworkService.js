exports.newSocialTradingModulesSocialGraphNetworkService = function newSocialTradingModulesSocialGraphNetworkService() {
    /*
    This module represents the Social Graph Network Service that 
    deals with the Social Graph this node maintains when it is running.
    
    The Social Graph is one of the services the Network Node provides.

    This service is responsible for maintaining the whole Social Graph
    or relationships between User and Bot profiles and also between 
    their posts.
    */
    let thisObject = {
        storage: undefined,
        clientInterface: undefined,
        peerInterface: undefined,
        serviceInterface: undefined,
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

        thisObject.storage.finalize()
        thisObject.clientInterface.finalize()
        thisObject.peerInterface.finalize()
        thisObject.serviceInterface.finalize()

        thisObject.storage = undefined
        thisObject.clientInterface = undefined
        thisObject.peerInterface = undefined
        thisObject.serviceInterface = undefined
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
        The Storage deals with persisting the Social Graph.
        */
        thisObject.storage = NT.projects.socialTrading.modules.storage.newSocialTradingModulesStorage()
        thisObject.clientInterface = NT.projects.socialTrading.modules.clientInterface.newSocialTradingModulesClientInterface()
        thisObject.peerInterface = NT.projects.socialTrading.modules.peerInterface.newSocialTradingModulesPeerInterface()
        thisObject.serviceInterface = NT.projects.socialTrading.modules.serviceInterface.newSocialTradingModulesServiceInterface()

        await thisObject.storage.initialize(
            p2pNetworkNode,
            p2pNetworkReachableNodes
        )
        await thisObject.clientInterface.initialize()
        await thisObject.peerInterface.initialize()
        await thisObject.serviceInterface.initialize()
    }
}