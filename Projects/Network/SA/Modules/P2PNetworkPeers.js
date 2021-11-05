exports.newNetworkModulesP2PNetworkPeers = function newNetworkModulesP2PNetworkPeers() {
    /*
    This module represents the P2P Nodes we are connected to.
    */
    let thisObject = { 

        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    async function initialize() {
        /*
        On a first iteration, we will try to connect to 2 Network Peers, one upstream and one downstream,
        meaning one with higher ranking that us, and the other with lower ranking than us.
        */

        
    }
}