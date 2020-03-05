function newCCXTFunctions () {
  thisObject = {
    addMissingExchanges: addMissingExchanges,
    addMissingAssets: addMissingAssets,
    addMissingMarkets: addMissingMarkets
  }

  return thisObject

  function addMissingExchanges (node, functionLibraryUiObjectsFromNodes) {
    currentExchanges = new Map()
    let parent = node.payload.parentNode
    if (parent !== undefined) {
      for (let i = 0; i < parent.cryptoExchanges.length; i++) {
        let cryptoExchanges = parent.cryptoExchanges[i]
        for (let j = 0; j < cryptoExchanges.exchanges.length; j++) {
          let exchange = cryptoExchanges.exchanges[j]
          let codeName = loadPropertyFromNodeConfig(exchange.payload, 'codeName')
          currentExchanges.set(codeName, exchange)
        }
      }
    }

    let params = {
      method: 'listExchanges',
      has: {
        fetchOHLCV: true,
        fetchMarkets: true
      }
    }

    callServer(JSON.stringify(params), 'CCXT', onResponse)

    function onResponse (err, data) {
      if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
        node.payload.uiObject.setErrorMessage('Failed to Fetch Assets from the Exchange')
        return
      }

      let exchanges = JSON.parse(data)
      for (let i = 0; i < exchanges.length; i++) {
        let exchange = exchanges[i]
        let existingExchange = currentExchanges.get(exchange.id)
        if (existingExchange === undefined) {
          let newExchange = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Crypto Exchange')
          newExchange.name = exchange.name
          newExchange.code = '{ \n\"codeName\": \"' + exchange.id + '\"\n}'
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

  function addMissingAssets (node, functionLibraryUiObjectsFromNodes) {
    currentAssets = new Map()
    for (let j = 0; j < node.assets.length; j++) {
      let asset = node.assets[j]
      let codeName = loadPropertyFromNodeConfig(asset.payload, 'codeName')
      currentAssets.set(codeName, asset)
    }

    let exchangeId = loadPropertyFromNodeConfig(node.payload.parentNode.payload, 'codeName')

    try {
      let params = {
        exchangeId: exchangeId,
        method: 'fetchMarkets'
      }
      callServer(JSON.stringify(params), 'CCXT', onResponse)

      function onResponse (err, data) {
        if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
          node.payload.uiObject.setErrorMessage('Failed to Fetch Assets from the Exchange')
          return
        }
        let queryParams = loadPropertyFromNodeConfig(node.payload, 'addMissingAssets')

        let markets = JSON.parse(data)
        for (let i = 0; i < markets.length; i++) {
          let market = markets[i]

          if (queryParams !== undefined) {
            if (queryParams.baseAsset !== undefined) {
              if (market.baseId.indexOf(queryParams.baseAsset) >= 0) {
                continue
              }
            }
            if (queryParams.quotedAsset !== undefined) {
              if (market.quoteId.indexOf(queryParams.quotedAsset) >= 0) {
                continue
              }
            }
          }
          if (currentAssets.get(market.baseId) === undefined) {
            addAsset(market.baseId)
            currentAssets.set(market.baseId, market.baseId)
          }
          if (currentAssets.get(market.quoteId) === undefined) {
            addAsset(market.quoteId)
            currentAssets.set(market.quoteId, market.quoteId)
          }

          function addAsset (name) {
            let newAsseet = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Asset')
            newAsseet.name = name
            newAsseet.code = '{ \n\"codeName\": \"' + name + '\"\n}'
            newAsseet.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_360
            newAsseet.payload.floatingObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_200X
          }
        }
      }
    } catch (err) {
      node.payload.uiObject.setErrorMessage('Failed to Fetch Assets from the Exchange')
      console.log(err.stack)
    }
  }

  function addMissingMarkets (node, functionLibraryUiObjectsFromNodes) {

  }
}
