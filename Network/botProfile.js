exports.newBot = function newBot() {

    let thisObject = {
        botId: undefined,
        botProfileHandle: undefined,
        botAsset: undefined,
        botExchange: undefined,
        enabled: undefined,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize(
        botId,
        botAsset,
        botExchange
    ) {
        thisObject.botId = botId
        thisObject.botAsset = botAsset
        thisObject.botExchange = botExchange
        thisObject.enabled = true
    }
}