function newCryptoEcosystemFunctions() {
    thisObject = {
        addMissingExchanges: addMissingExchanges,
        addMissingAssets: addMissingAssets,
        addMissingMarkets: addMissingMarkets,
        installMarket: installMarket,
        uninstallMarket: uninstallMarket
    }

    return thisObject

    function addMissingExchanges(node, functionLibraryUiObjectsFromNodes) {
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

        function onResponse(err, data) {
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
                    newExchange.config = '{ \n\"codeName\": \"' + exchange.id + '\"\n}'
                    newExchange.payload.floatingObject.collapseToggle()
                    newExchange.exchangeAssets.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                    newExchange.exchangeMarkets.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                    newExchange.exchangeAccounts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                    newExchange.exchangeAssets.payload.floatingObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_050X
                    newExchange.exchangeMarkets.payload.floatingObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_100X
                    newExchange.exchangeAccounts.payload.floatingObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_025X
                    newExchange.exchangeAssets.payload.floatingObject.arrangementStyle = ARRANGEMENT_STYLE.CONCAVE
                    newExchange.exchangeMarkets.payload.floatingObject.arrangementStyle = ARRANGEMENT_STYLE.CONCAVE
                    newExchange.exchangeAccounts.payload.floatingObject.arrangementStyle = ARRANGEMENT_STYLE.CONCAVE
                }
            }
        }
    }

    function addMissingAssets(node, functionLibraryUiObjectsFromNodes) {
        if (node.payload.parentNode === undefined) { return }

        let currentAssets = new Map()
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

            function onResponse(err, data) {
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
                            if (market.base.indexOf(queryParams.baseAsset) < 0) {
                                continue
                            }
                        }
                        if (queryParams.quotedAsset !== undefined) {
                            if (market.quote.indexOf(queryParams.quotedAsset) < 0) {
                                continue
                            }
                        }
                    }
                    if (currentAssets.get(market.base) === undefined) {
                        addAsset(market.base)
                        currentAssets.set(market.base, market.base)
                    }
                    if (currentAssets.get(market.quote) === undefined) {
                        addAsset(market.quote)
                        currentAssets.set(market.quote, market.quote)
                    }

                    function addAsset(name) {
                        let newAsseet = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Asset')
                        newAsseet.name = name
                        newAsseet.config = '{ \n\"codeName\": \"' + name + '\"\n}'
                    }
                }
            }
        } catch (err) {
            node.payload.uiObject.setErrorMessage('Failed to Fetch Assets from the Exchange')
            console.log(err.stack)
        }
    }

    function addMissingMarkets(node, functionLibraryUiObjectsFromNodes, functionLibraryNodeCloning) {
        if (node.payload.parentNode === undefined) { return }
        if (node.payload.parentNode.exchangeAssets === undefined) { return }
        if (node.payload.parentNode.payload.parentNode === undefined) { return }
        if (node.payload.parentNode.payload.parentNode.payload.parentNode === undefined) { return }

        let currentAssets = new Map()
        let exchangeAssets = node.payload.parentNode.exchangeAssets
        for (let j = 0; j < exchangeAssets.assets.length; j++) {
            let asset = exchangeAssets.assets[j]
            let codeName = loadPropertyFromNodeConfig(asset.payload, 'codeName')
            currentAssets.set(codeName, asset)
        }

        let currentMarkets = new Map()
        let exchangeMarkets = node
        for (let j = 0; j < exchangeMarkets.markets.length; j++) {
            let asset = exchangeMarkets.markets[j]
            let codeName = loadPropertyFromNodeConfig(asset.payload, 'codeName')
            currentMarkets.set(codeName, asset)
        }

        let exchangeId = loadPropertyFromNodeConfig(node.payload.parentNode.payload, 'codeName')

        try {
            let params = {
                exchangeId: exchangeId,
                method: 'fetchMarkets'
            }
            callServer(JSON.stringify(params), 'CCXT', onResponse)

            function onResponse(err, data) {
                if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    node.payload.uiObject.setErrorMessage('Failed to Fetch Assets from the Exchange')
                    return
                }

                let markets = JSON.parse(data)
                for (let i = 0; i < markets.length; i++) {
                    let market = markets[i]
                    let baseAsset = currentAssets.get(market.base)
                    let quotedAsset = currentAssets.get(market.quote)

                    if (baseAsset === undefined) {
                        continue
                    }
                    if (quotedAsset === undefined) {
                        continue
                    }

                    if (currentMarkets.get(market.symbol) === undefined) {
                        addMarket(market.symbol, baseAsset, quotedAsset)
                    }

                    function addMarket(name, baseAsset, quotedAsset) {
                        let newMarket = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Market')
                        newMarket.name = name
                        newMarket.config = '{ \n\"codeName\": \"' + name + '\"\n}'
                        newMarket.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                        newMarket.payload.floatingObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_100X
                        newMarket.payload.floatingObject.arrangementStyle = ARRANGEMENT_STYLE.CONCAVE
                        newMarket.baseAsset.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_45
                        newMarket.quotedAsset.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_45
                        newMarket.baseAsset.payload.floatingObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_100X
                        newMarket.quotedAsset.payload.floatingObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_100X
                        newMarket.baseAsset.payload.floatingObject.arrangementStyle = ARRANGEMENT_STYLE.CONCAVE
                        newMarket.quotedAsset.payload.floatingObject.arrangementStyle = ARRANGEMENT_STYLE.CONCAVE
                        newMarket.baseAsset.payload.referenceParent = baseAsset
                        newMarket.quotedAsset.payload.referenceParent = quotedAsset

                        currentMarkets.set(name, newMarket)
                    }
                }
            }
        } catch (err) {
            node.payload.uiObject.setErrorMessage('Failed to Fetch Assets from the Exchange')
            console.log(err.stack)
        }
    }

    function installMarket(node, rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter) {

        let market = node
        let cryptoExchange = findNodeInNodeMesh(node, 'Crypto Exchange', undefined, true, false, true, false)
        if (cryptoExchange === undefined) {
            node.payload.uiObject.setErrorMessage('Market must be a descendant of a Crypto Exchange')
            return
        }

        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.type === 'Network') {
                installInNetwork(rootNode)
            }
        }

        function installInNetwork(network) {
            /*
            Here we complete the missing stuff at Data Mining
            */
            let dataMining = findInBranch(network, 'Data Mining', node, true)
            if (dataMining === undefined) { return }

            let exchangeDataTasks = findOrCreateChildWithReference(dataMining, 'Exchange Data Tasks', cryptoExchange, functionLibraryUiObjectsFromNodes)
            exchangeDataTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
            let marketDataTask = findAndRecreateChildWithReference(exchangeDataTasks, 'Market Data Tasks', market, rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter)

            menuClick(marketDataTask, 'Add Missing Data Mine Tasks', true)
            menuClickOfNodeArray(marketDataTask.dataMineTasks, 'Add All Tasks', true)
            /*
            Here we complete the missing stuff at Session Independent Data
            */
            let sessionIndependentData = findInBranch(network, 'Session Independent Data', node, true)
            if (sessionIndependentData === undefined) { return }

            let exchangeDataProducts = findOrCreateChildWithReference(sessionIndependentData, 'Exchange Data Products', cryptoExchange, functionLibraryUiObjectsFromNodes)
            exchangeDataProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
            let singleMarketData = findAndRecreateChildWithReference(exchangeDataProducts, 'Single Market Data', market, rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter)

            menuClick(singleMarketData, 'Add All Data Mine Products', true)
            menuClickOfNodeArray(singleMarketData.dataMineProducts, 'Add All Data Products', true)
        }
    }

    function uninstallMarket(node, rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter) {

    }
}
