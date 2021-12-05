exports.newNetworkModulesP2PNetworkClientIdentity = function newNetworkModulesP2PNetworkClientIdentity() {
    /*
    This module represents the P2P Network Client running at the moment.
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

    async function initialize() {

    }
}