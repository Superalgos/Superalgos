exports.newP2PNetworkInterface = function newP2PNetworkInterface() {
    /*
    This module handles the incoming events from the P2P Network.    
    */
    let thisObject = {
        eventReceived: eventReceived,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    function eventReceived(event) {
        console.log("This event has just arrived from the P2P Network: " + JSON.stringify(event))
    }
}