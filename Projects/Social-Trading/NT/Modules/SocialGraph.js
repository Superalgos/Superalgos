exports.newNetworkModulesSocialGraph = function newNetworkModulesSocialGraph() {
    /*
    This module represents the Social Graph Service that 
    deals with the Social Graph this node maintains.
    The Social Graph is one of the services the Network Node provides.

    This service is responsible for maintaining the whole Social Graph
    or relationships between User and Bot profiles and also between 
    their posts.
    */
    let thisObject = {
        storage: undefined,
        clientInterface: undefined,
        peerInterface: undefined,
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

        thisObject.storage.finalize()
        thisObject.clientInterface.finalize()
        thisObject.peerInterface.finalize()

        thisObject.storage = undefined
        thisObject.clientInterface = undefined
        thisObject.peerInterface = undefined
    }

    async function initialize() {
        /*
        The Storage deals with persisting the Social Graph.
        */
        thisObject.storage = NT.projects.socialTrading.modules.storage.newSocialTradingModulesStorage()
        thisObject.clientInterface = NT.projects.socialTrading.modules.clientInterface.newSocialTradingModulesClientInterface()
        thisObject.peerInterface = NT.projects.socialTrading.modules.peerInterface.newSocialTradingModulesPeerInterface()

        thisObject.storage.initialize()
        thisObject.clientInterface.initialize()
        thisObject.peerInterface.initialize()
    }
}