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
          if (ccxtExchange.has.fetchCurrencies === true) {
            if (ccxtExchange.has.fetchMarkets === true) {
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
    }
  }

  async function addMissingAssets (node, functionLibraryUiObjectsFromNodes) {
    currentAssets = new Map()
    for (let j = 0; j < node.assets.length; j++) {
      let asset = node.assets[j]
      let codeName = loadPropertyFromNodeConfig(asset.payload, 'codeName')
      currentAssets.set(codeName, asset)
    }

    let exchangeId = loadPropertyFromNodeConfig(node.payload.parentNode.payload, 'codeName')

    const exchangeClass = ccxt[exchangeId]
    const exchangeConstructorParams = {
      'timeout': 30000,
      'enableRateLimit': true,
      verbose: false
    }

    let ccxtExchange = new exchangeClass(exchangeConstructorParams)

    if (ccxtExchange.has.fetchCurrencies === true) {
      let ccxtAssets = []
      try {
        ccxtAssets = await ccxtExchange.fetchCurrencies()
      } catch (err) {
        node.payload.uiObject.setErrorMessage('Failed to Fetch Assets from the Exchange')
        console.log(err.stack)
      }

      for (let i = 0; i < ccxtAssets.length; i++) {
        let ccxtAsset = ccxtAssets[i]
        let newAsseet = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Asset')
        newAsseet.name = ccxtAsset.name
        newAsseet.code = '{ \n\"codeName\": \"' + newAsseet.id + '\"\n}'
        newAsseet.exchangeAssets.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_360
        newAsseet.exchangeMarkets.payload.floatingObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_100X
      }
    } else {
      node.payload.uiObject.setErrorMessage('This exchange does not provide a list of supported Assets.')
    }
  }

  function addMissingMarkets (node, functionLibraryUiObjectsFromNodes) {

  }
}
