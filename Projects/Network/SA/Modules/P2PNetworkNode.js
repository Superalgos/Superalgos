exports.newNetworkModulesP2PNetworkNode = function newNetworkModulesP2PNetworkNode() {
    /*
    This module represents a P2P Network Node. At the bootstraping process
    all nodes are identified and stored in memory, so that later, they
    can be used to connect to.
    */
    let thisObject = { 

        node: undefined,
        blockchainAccount: undefined,
        userSocialProfile: undefined,

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

    async function initialize(node, userSocialProfile, blockchainAccount) {
        /*
        We will setup here the maps and arryas we will need to operate within the P2P Network.
        */
         thisObject.node = node
         thisObject.userSocialProfile = userSocialProfile
         thisObject.blockchainAccount = blockchainAccount
    }
}