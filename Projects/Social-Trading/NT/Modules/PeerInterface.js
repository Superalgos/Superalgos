exports.newSocialTradingModulesPeerInterface = function newSocialTradingModulesPeerInterface() {
    /*
    This module represents the Interface the Network Node have 
    with other Network Nodes connected to it. 
    
    This interface is one layer above the communication protocol interface
    where actual messages are received through, like for instance the
    websockets interface.
    */
    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        run: run
    }

    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    function run() {

    }
}