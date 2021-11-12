exports.newNetworkModulesP2PNetworkNode = function newNetworkModulesP2PNetworkNode() {
    /*
    This module represents the P2P Network Node.
    */
    let thisObject = { 

        node: undefined,
        blockchainAccount: undefined,
        userProfile: undefined,

        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.node = undefined
        thisObject.blockchainAccount = undefined
        thisObject.userProfile = undefined
    }

    async function initialize(node, userProfile, blockchainAccount) {
        /*
        We will setup here the maps and arryas we will need to operate within the P2P Network.
        */
         thisObject.node = node
         thisObject.userProfile = userProfile
         thisObject.blockchainAccount = blockchainAccount
    }
}