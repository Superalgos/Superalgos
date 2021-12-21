exports.newTradingSignalsModulesOutgoingCandleSignals = function (processIndex) {

    let thisObject = {
        broadcastSignal: broadcastSignal,
        broadcastFileKey: broadcastFileKey,
        initialize: initialize,
        finalize: finalize
    }

    let socialTradingBotsMap
    return thisObject

    function initialize() {
        socialTradingBotsMap = new Map()
    }

    function finalize() {
        socialTradingBotsMap = undefined
    }

    function broadcastSignal(signalMessage, socialTradingBot) {

        let candleSignals = socialTradingBotsMap.get(socialTradingBot.id)
        if (candleSignals === undefined) { 
            candleSignals = [] 
            socialTradingBotsMap.set(socialTradingBot.id, candleSignals)
        }

        /*
        We are going to accumulate all the signals that are not the 
        "candle signal", which menas the signal that represents that 
        a whole candle has been processed.

        Once we receive the "candle Signal", then we send the whole package
        to the Open Storage.
        */
        if (signalMessage.signal.source.tradingSystem.node.type !== 'Trading System') {
            candleSignals.push(signalMessage)
        } else {
            candleSignals.push(signalMessage)
            TS.projects.foundations.globals.taskConstants.OPEN_STORAGE.persit(candleSignals, socialTradingBot)
            socialTradingBotsMap.delete(socialTradingBot.id)
        }
    }

    function broadcastFileKey(fileKey, socialTradingBot) {

        let userApp = TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClientIdentity
        if (userApp === undefined) { return }
        if (userApp.node.config === undefined) { return }
        let userAppCodeName = userApp.node.config.codeName
        if (userAppCodeName === undefined) { return }
        let userAppCategory = userApp.node.parentNode
        if (userAppCategory === undefined) { return }

        if (socialTradingBot === undefined) { return }
        if (socialTradingBot.config === undefined) { return }
        let socialTradingBotCodeName = socialTradingBot.config.codeName
        if (socialTradingBot === undefined) { return }
        if (socialTradingBot.signingAccount === undefined) { return }

        let signalMessage = {
            fileKey: fileKey,
            broadcaster: {
                userApp: {
                    categoryType: userAppCategory.type,
                    appType: userApp.node.type,
                    appId: userApp.node.id
                },
                socialTradingBot: {
                    id: socialTradingBot.id
                }
            },
            signatures: {
                userApp: {},
                socialTradingBot: {}
            }
        }

        signalMessage.signatures.userApp = web3.eth.accounts.sign(JSON.stringify(signalMessage.fileKey), SA.secrets.signingAccountSecrets.map.get(userAppCodeName).privateKey)
        signalMessage.signatures.socialTradingBot = web3.eth.accounts.sign(JSON.stringify(signalMessage.fileKey), SA.secrets.signingAccountSecrets.map.get(socialTradingBotCodeName).privateKey)

        await TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkStart.sendMessage(signalMessage)
    }
}