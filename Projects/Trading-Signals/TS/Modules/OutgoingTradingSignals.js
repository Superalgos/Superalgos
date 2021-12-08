exports.newTradingSignalsModulesOutgoingTradingSignals = function (processIndex) {

    let thisObject = {
        broadcastSignal: broadcastSignal,
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
            let signalDefinition = signalReference.referenceParent
            let socialTradingBot = SA.projects.visualScripting.utilities.nodeFunctions.findNodeInNodeMesh(signalDefinition, 'Social Trading Bot')
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
                    timestamp: (new Date()).valueOf(),
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
                            appType: userApp.node.type,
                            appId: userApp.node.id
                        },
                        socialTradingBot: {
                            id: socialTradingBot.id,
                            signalDefinition: {
                                id: signalDefinition.id,
                                type: signalDefinition.type
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
