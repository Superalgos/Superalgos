exports.newTradingSignalsModulesTradingSignalsNetworkService = function newTradingSignalsModulesTradingSignalsNetworkService() {
    /*
    This module represents the Social Trading Signals Service that 
    deals with the reception and distribution of Trading Signals
    when this service it is running.
    
    The Trading Signals is one of the services the Network Node provides.
    */
    let thisObject = {
        clientInterface: undefined,
        peerInterface: undefined,
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.clientInterface.finalize()
        thisObject.peerInterface.finalize()

        thisObject.clientInterface = undefined
        thisObject.peerInterface = undefined
    }

    async function initialize() {
        thisObject.clientInterface = NT.projects.tradingSignals.modules.clientInterface.newTradingSignalsModulesClientInterface()
        thisObject.peerInterface = NT.projects.tradingSignals.modules.peerInterface.newSocialTradingModulesPeerInterface()

        thisObject.clientInterface.initialize()
        thisObject.peerInterface.initialize()
    }
}