exports.newNetworkModulesP2PNetworkNode = function newNetworkModulesP2PNetworkNode() {
    /*
    This module represents a P2P Network Node. At the bootstraping process
    all nodes are identified and stored in memory, so that later, they
    can be used to connect to.
    */
    let thisObject = {

        node: undefined,
        blockchainAccount: undefined,
        userProfile: undefined,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.node = undefined
        thisObject.blockchainAccount = undefined
        thisObject.userProfile = undefined
    }

    function initialize(
        node,
        userProfile,
        blockchainAccount
    ) {
        /*
        We will setup here the maps and arryas we will need to operate within the P2P Network.
        */
        thisObject.node = node
        thisObject.userProfile = userProfile
        thisObject.blockchainAccount = blockchainAccount
       
        if (
            thisObject.node.p2pNetworkReference === undefined ||
            thisObject.node.p2pNetworkReference.referenceParent === undefined ||
            thisObject.node.p2pNetworkReference.referenceParent.config === undefined
        ) {
            /*
            Bad Configuration. P2P Network Node needs to have a Network Reference with a Reference Parent.
            */
            return false
        } else {
            return true
        }
    }
}