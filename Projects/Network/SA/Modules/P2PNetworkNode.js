exports.newNetworkModulesP2PNetworkNode = function newNetworkModulesP2PNetworkNode() {
    /*
    This module represents the P2P Network Node.
    */
    let thisObject = { 

        node: undefined,
        userPofile: undefined,

        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.node = undefined
        thisObject.userPofile = undefined
    }

    async function initialize(node, userPofile) {
        /*
        We will setup here the maps and arryas we will need to operate within the P2P Network.
        */
         thisObject.node = node
         thisObject.userPofile = userPofile
    }
}