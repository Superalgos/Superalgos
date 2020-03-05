function newCCXTFunctions () {
  thisObject = {
    addMissingExchanges: addMissingExchanges,
    addMissingAssets: addMissingAssets,
    addMissingMarkets: addMissingMarkets
  }

  return thisObject

  function addMissingExchanges (node, functionLibraryUiObjectsFromNodes) {
    currentExchanges = new Map()
    for (let j = 0; j < node.exchanges.length; j++) {
      let exchange = node.exchanges[j]
      let codeName = loadPropertyFromNodeConfig(exchange.payload, 'codeName')
      currentExchanges.set(codeName, exchange)
    }
    for (let i = 0; i < ccxt.exchanges.length; i++) {
      let exchangeId = ccxt.exchanges[i]
      let existingExchange = currentExchanges.get(exchangeId)
      if (existingExchange === undefined) {
        const exchangeClass = ccxt[exchangeId]
        const exchangeConstructorParams = {
          'timeout': 30000,
          'enableRateLimit': true,
          verbose: false
        }

        let ccxtExchange = new exchangeClass(exchangeConstructorParams)

        if (ccxtExchange.has.fetchOHLCV === true) {
          if (ccxtExchange.timeframes['1m'] !== undefined) {
            let newExchange = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Crypto Exchange')
            newExchange.name = ccxtExchange.name
            newExchange.code = '{ \n\"codeName\": \"' + ccxtExchange.id + '\"\n}'
            newExchange.payload.floatingObject.collapseToggle()
            newExchange.exchangeAssets.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
            newExchange.exchangeMarkets.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
            newExchange.exchangeAccounts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
            newExchange.exchangeAssets.payload.floatingObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_050X
            newExchange.exchangeMarkets.payload.floatingObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_100X
            newExchange.exchangeAccounts.payload.floatingObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_025X
          }
        }
      }
    }
  }

  function addMissingAssets (node, functionLibraryUiObjectsFromNodes) {

  }

  function addMissingMarkets (node, functionLibraryUiObjectsFromNodes) {

  }
}
