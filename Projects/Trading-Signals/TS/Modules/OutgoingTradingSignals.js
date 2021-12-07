exports.newTradingSignalsModulesOutgoingTradingSignals = function (processIndex) {

    let thisObject = {
        broadcastSignal: broadcastSignal,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {
    }

    function finalize() {
    }

    async function broadcastSignal(node) {
        if (node === undefined) { return }
        if (node.outgoingSignals === undefined) { return }
        if (node.outgoingSignals.signalReferences === undefined) { return }
        /*
        A single event might trigger multiple signals. That's fine. 
        */
        for (let i = 0; i < node.outgoingSignals.signalReferences.length; i++) {
            /*
            Run some validations
            */
            let signalReference = node.outgoingSignals.signalReferences[i]
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
            /*
            This is the signal message we are going to send
            */
            let signalMessage = {
                signal: {
                    uniqueId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                    source: {
                        tradingSystem: {
                            node: {
                                type: node.type
                            }
                        }
                    },
                    broadcaster: {
                        userApp: {
                            categoryType: userAppCategory.type,
                            appType: userApp.type,
                            appId: userApp.id
                        },
                        socialTradingBot: {
                            id: socialTradingBot.id,
                            signalDefinition: {
                                id: socialTradingBotSignalDefinition.id,
                                type: socialTradingBotSignalDefinition.type
                            }
                        }
                    }
                },
                signatures: {
                    userApp: {},
                    socialTradingBot: {}
                }
            }

            signalMessage.signatures.userApp = web3.eth.accounts.sign(JSON.stringify(signalMessage.signal), SA.secrets.map.get(userAppCodeName).privateKey)
            signalMessage.signatures.socialTradingBot = web3.eth.accounts.sign(JSON.stringify(signalMessage.signal), SA.secrets.map.get(socialTradingBotCodeName).privateKey)

            await TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkStart.sendMessage(signalMessage)
        }
    }
}
