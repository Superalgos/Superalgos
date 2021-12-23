exports.newTradingSignalsModulesOutgoingCandleSignals = function (processIndex) {

    let thisObject = {
        broadcastSignal: broadcastSignal,
        broadcastFileKey: broadcastFileKey,
        initialize: initialize,
        finalize: finalize
    }

    let socialTradingBotsMap
    let web3
    return thisObject

    function initialize() {
        socialTradingBotsMap = new Map()
        web3 = new SA.nodeModules.web3()
    }

    function finalize() {
        socialTradingBotsMap = undefined
        web3 = undefined
    }

    function broadcastSignal(tradingSignalMessage, socialTradingBot) {

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
        if (tradingSignalMessage.tradingSignal.source.tradingSystem.node.type !== 'Trading System') {
            candleSignals.push(tradingSignalMessage)
        } else {
            candleSignals.push(tradingSignalMessage)
            TS.projects.foundations.globals.taskConstants.OPEN_STORAGE_CLIENT.persit(candleSignals, socialTradingBot)
            socialTradingBotsMap.delete(socialTradingBot.id)
        }
    }

    async function broadcastFileKey(fileKey, socialTradingBot) {

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
        if (socialTradingBot.signingAccount === undefined) { return }

        let signal = {
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

        signal.signatures.userApp = await web3.eth.accounts.sign(JSON.stringify(signal.fileKey), SA.secrets.signingAccountSecrets.map.get(userAppCodeName).privateKey)
        signal.signatures.socialTradingBot = await web3.eth.accounts.sign(JSON.stringify(signal.fileKey), SA.secrets.signingAccountSecrets.map.get(socialTradingBotCodeName).privateKey)

        TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkStart.sendMessage(signal)
    }
}