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
            thisObject.node.p2pNetworkReference === undefined  
        ) {
            SA.logger.warn('User Profile  "' +  userProfile.name + '" has declared a Network Node without a Network Node Reference child. This child is needed in order for this Network Node definition to be considered by the rest of the Network.')
            throw ('Bad Configuration -> thisObject.node.p2pNetworkReference === undefined')
        }

        if (
            thisObject.node.p2pNetworkReference.referenceParent === undefined  
        ) {
            SA.logger.warn('User Profile "' +  userProfile.name + '" has declared a P2P Network Node with a Network Node Reference child that does not reference any P2P Network. A reference is missing from Network Node Reference node. If this is your user profile and you are trying to set up a new Network Node, please use the P2P-Network-Demo Native Workspace to do so. There you will find the Mainet and Testnet Network nodes that you need to reference. Another solution is to clone the P2P Network Node of a User Profile that has a running one, and adapt it with your own configs. If this User Profile is not yours, you can ignore this warning.')
            throw ('Bad Configuration -> thisObject.node.p2pNetworkReference.referenceParent === undefined')
        }

        if (
            thisObject.node.p2pNetworkReference.referenceParent.config === undefined  
        ) {
            SA.logger.warn('User Profile "' +  userProfile.name + '" has declared a Network Node with a Network Node Reference child that references Network node. That referenced Network Node does not have a config, rendering this whole definition useless.')
            throw ('Bad Configuration -> thisObject.node.p2pNetworkReference.referenceParent.config === undefined')
        }
    }
}