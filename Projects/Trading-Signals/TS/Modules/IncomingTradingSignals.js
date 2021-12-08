exports.newTradingSignalsModulesIncomingTradingSignals = function (processIndex) {

    let thisObject = {
        checkForSignals: checkForSignals,
        initialize: initialize,
        finalize: finalize
    }

    let web3
    return thisObject

    function initialize() {
        web3 = new SA.nodeModules.web3()
    }

    function finalize() {
        web3 = undefined
    }

    async function checkForSignals(node) {
        if (node === undefined) { return }
        if (node.incomingSignals === undefined) { return }
        if (node.incomingSignals.signalReferences === undefined) { return }

        for (let i = 0; i < node.incomingSignals.signalReferences.length; i++) {
            /*
            Run some validations
            */
            let signalReference = node.incomingSignals.signalReferences[i]
            if (signalReference.referenceParent === undefined) { return }
            let socialTradingBotSignalDefinition = signalReference.referenceParent
            let socialTradingBot = SA.projects.visualScripting.utilities.nodeFunctions.findNodeInNodeMesh(socialTradingBotSignalDefinition, 'Social Trading Bot')
            if (socialTradingBot === undefined) { return }
            if (socialTradingBot.config === undefined) { return }
            let socialTradingBotCodeName = socialTradingBot.config.codeName 
            if (socialTradingBot === undefined) { return }
            if (socialTradingBot.signingAccount === undefined) { return }
            let userApp = TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClientIdentity
            if (userApp === undefined) { return }
            if (userApp.node.config === undefined) { return }
            let userAppCodeName = userApp.node.config.codeName 
            if (userAppCodeName === undefined) { return }
            let userAppCategory = userApp.node.parentNode
            if (userAppCategory === undefined) { return }


            
        }
    }
}
