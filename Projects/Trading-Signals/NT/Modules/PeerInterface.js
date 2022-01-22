exports.newSocialTradingModulesPeerInterface = function newSocialTradingModulesPeerInterface() {
    /*
    This module represents the Interface of this Network Service where 
    we process messages comming from other Network Nodes.
    */
    let thisObject = {
        messageReceived: messageReceived,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {

    }
    
    async function messageReceived(message) {
    }
}