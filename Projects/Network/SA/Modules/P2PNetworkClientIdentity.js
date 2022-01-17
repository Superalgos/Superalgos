exports.newNetworkModulesP2PNetworkClientIdentity = function newNetworkModulesP2PNetworkClientIdentity() {
    /*
    This module represents the P2P Network Client running at the moment.
    */
    let thisObject = {

        node: undefined,
        blockchainAccount: undefined,
        userProfile: undefined,
        userSocialProfile: undefined,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.node = undefined
        thisObject.blockchainAccount = undefined
        thisObject.userSocialProfile = undefined
    }

    async function initialize(
        node,
        userProfile,
        userSocialProfile,
        blockchainAccount
    ) {
        thisObject.node = node
        thisObject.userProfile = userProfile
        thisObject.userSocialProfile = userSocialProfile
        thisObject.blockchainAccount = blockchainAccount
    }
}