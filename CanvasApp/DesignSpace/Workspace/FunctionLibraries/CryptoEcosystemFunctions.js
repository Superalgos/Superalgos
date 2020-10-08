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
                let queryParams = loadPropertyFromNodeConfig(node.payload, 'addMissingAssetsFilter')

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

    function installMarket(node, rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter, functionLibraryChartingSpaceFunctions, functionLibraryDataStorageFunctions) {

        let market = node
        let cryptoExchange = findNodeInNodeMesh(node, 'Crypto Exchange', undefined, true, false, true, false)
        if (cryptoExchange === undefined) {
            node.payload.uiObject.setErrorMessage('Market must be a descendant of a Crypto Exchange')
            return
        }
        let dashboardsArray = []

        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.type === 'Network') {
                installInNetwork(rootNode)
            }
        }

        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.type === 'Charting Space') {
                installInChartingSpace(rootNode)
            }
        }

        function installInNetwork(network) {

            for (let j = 0; j < network.networkNodes.length; j++) {
                let networkNode = network.networkNodes[j]
                installInNetworkNode(networkNode)
            }

            function installInNetworkNode(networkNode) {
                /*
                Here we complete the missing stuff at Data Mining
                */
                let dataMining = findInBranch(networkNode, 'Data Mining', node, true)
                if (dataMining === undefined) {
                    node.payload.uiObject.setErrorMessage('Data Mining node not found at Network Node ' + networkNode.name)
                    return
                }

                let exchangeDataTasks = findOrCreateChildWithReference(dataMining, 'Exchange Data Tasks', cryptoExchange, functionLibraryUiObjectsFromNodes)
                exchangeDataTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                let marketDataTask = findAndRecreateChildWithReference(exchangeDataTasks, 'Market Data Tasks', market, rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter)

                menuClick(marketDataTask, 'Add Missing Data Mine Tasks', true)
                menuClickOfNodeArray(marketDataTask.dataMineTasks, 'Add All Tasks', true)

                let sessionsCreatedArray = []
                /*
                Next we complete the missing stuff at Testing Environment
                */
                installEnvironment('Testing Environment')
                /*
                Next we complete the missing stuff at Production Environment
                */
                installEnvironment('Production Environment')

                function installEnvironment(environment) {
                    /*
                    Now we install the environmnet at the current Network Node
                    */
                    let environmentFound = findInBranch(networkNode, environment, node, true)
                    if (environmentFound === undefined) {
                        node.payload.uiObject.setErrorMessage(environment + ' node not found at Network Node ' + networkNode.name)
                        return
                    }

                    let exchangeTradingTasks = findOrCreateChildWithReference(environmentFound, 'Exchange Trading Tasks', cryptoExchange, functionLibraryUiObjectsFromNodes)
                    exchangeTradingTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                    let marketTradingTask = findAndRecreateChildWithReference(exchangeTradingTasks, 'Market Trading Tasks', market, rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter)

                    menuClick(marketTradingTask, 'Add Missing Trading Mine Tasks', true)
                    menuClickOfNodeArray(marketTradingTask.tradingMineTasks, 'Add All Tasks', true)

                    /* This will be needed at the charging space, for creating Dashboards */
                    let backtestingSessionsArray = nodeBranchToArray(marketTradingTask, 'Backtesting Session')
                    let liveTradingSessionsArray = nodeBranchToArray(marketTradingTask, 'Live Trading Session')
                    let allSessionsArray = backtestingSessionsArray.concat(liveTradingSessionsArray)
                    sessionsCreatedArray = sessionsCreatedArray.concat(allSessionsArray)

                    dashboardsArray.push({ environmentNode: environmentFound, networkNode: networkNode, sessionsArray: allSessionsArray })
                }
                /*
                Here we complete the missing stuff at Data Mines Data
                */
                let dataMinesData = findInBranch(networkNode, 'Data Mines Data', node, true)
                if (dataMinesData === undefined) {
                    node.payload.uiObject.setErrorMessage('Data Mines Data node not found at Network Node ' + networkNode.name)
                    return
                }

                let exchangeDataProducts = findOrCreateChildWithReference(dataMinesData, 'Exchange Data Products', cryptoExchange, functionLibraryUiObjectsFromNodes)
                exchangeDataProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                let marketDataProducts = findAndRecreateChildWithReference(exchangeDataProducts, 'Market Data Products', market, rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter)
                marketDataProducts.payload.floatingObject.collapseToggle()

                menuClick(marketDataProducts, 'Add All Data Mine Products', true)
                menuClickOfNodeArray(marketDataProducts.dataMineProducts, 'Add All Data Products', true)
                /*
                Finally we complete the missing stuff at Trading Mines Data
                */
                let tradingMinesData = findInBranch(networkNode, 'Trading Mines Data', node, true)
                if (tradingMinesData === undefined) {
                    node.payload.uiObject.setErrorMessage('Trading Mines Data node not found at Network Node ' + networkNode.name)
                    return
                }

                let exchangeTradingProducts = findOrCreateChildWithReference(tradingMinesData, 'Exchange Trading Products', cryptoExchange, functionLibraryUiObjectsFromNodes)
                exchangeTradingProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                let marketTradingProducts = findAndRecreateChildWithReference(exchangeTradingProducts, 'Market Trading Products', market, rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter)
                marketTradingProducts.payload.floatingObject.collapseToggle()
                /*
                Create the new session references.
                */
                for (let i = 0; i < sessionsCreatedArray.length; i++) {
                    let session = sessionsCreatedArray[i]
                    if (isMissingChildren(marketTradingProducts, session, true) === true) {
                        functionLibraryDataStorageFunctions.createSessionReference(marketTradingProducts, session, functionLibraryUiObjectsFromNodes)
                    }
                }
                /*
                Create everything inside the session references.
                */
                for (let j = 0; j < marketTradingProducts.sessionReferences.length; j++) {
                    let sessionReference = marketTradingProducts.sessionReferences[j]
                    menuClick(sessionReference, 'Add All Trading Mine Products', true)
                    menuClickOfNodeArray(sessionReference.tradingMineProducts, 'Add All Data Products', true)
                    sessionReference.payload.floatingObject.collapseToggle()
                }
            }
        }

        function installInChartingSpace(chartingSpace) {

            for (let i = 0; i < dashboardsArray.length; i++) {
                /*
                If the Dashboard we need is not already there we create a new one. 
                */
                let arrayItem = dashboardsArray[i]
                let dashboard = findOrCreateChildWithReference(chartingSpace, 'Dashboard', arrayItem.environmentNode, functionLibraryUiObjectsFromNodes)
                dashboard.name = arrayItem.environmentNode.type + ' ' + arrayItem.networkNode.name
                /*
                We delete all the existing Time Machines related to the market we are currently installing. 
                For that, we make a new array with the existing Time Machines so that the deleting
                of each node does not affect the proccessing of the whole set.
                */
                let timeMachines = []
                for (let i = 0; i < dashboard.timeMachines.length; i++) {
                    let timeMachine = dashboard.timeMachines[i]
                    timeMachines.push(timeMachine)
                }
                for (let i = 0; i < timeMachines.length; i++) {
                    let timeMachine = timeMachines[i]
                    let session = timeMachine.payload.referenceParent
                    if (session === undefined || session.cleaned === true) {
                        /* 
                        This is what usually happens, that the intall process make these 
                        time machines to lose their reference parent since the install
                        process deletes them.
                        */
                        functionLibraryNodeDeleter.deleteUIObject(timeMachine, rootNodes)
                        continue
                    }
                    let marketTradingTasks = findNodeInNodeMesh(session, 'Market Trading Tasks', undefined, true, false, true, false)
                    if (marketTradingTasks === undefined) { continue }
                    if (marketTradingTasks.payload === undefined) { continue }
                    if (marketTradingTasks.payload.referenceParent === undefined) { continue }
                    if (marketTradingTasks.payload.referenceParent.id === market.id) {
                        functionLibraryNodeDeleter.deleteUIObject(timeMachine, rootNodes)
                    }
                }
                /*
                We create a time machine for each session added during the previous processing. 
                */
                for (let j = 0; j < arrayItem.sessionsArray.length; j++) {
                    let session = arrayItem.sessionsArray[j]
                    functionLibraryChartingSpaceFunctions.createTimeMachine(dashboard, session, node, arrayItem.networkNode, rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter)
                }
            }
        }
    }

    function uninstallMarket(node, rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter, functionLibraryChartingSpaceFunctions, functionLibraryDataStorageFunctions) {
        let market = node
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.type === 'Charting Space') {
                uninstallInChartingSpace(rootNode)
            }
        }

        function uninstallInChartingSpace(chartingSpace) {

            /* Delete all time machines which are referencing sessions inside the market being unistalled. */
            let timeMachines = nodeBranchToArray(chartingSpace, 'Time Machine')
            for (let i = 0; i < timeMachines.length; i++) {
                let timeMachine = timeMachines[i]
                let session = timeMachine.payload.referenceParent
                if (session === undefined) { continue }
                let marketTradingTasks = findNodeInNodeMesh(session, 'Market Trading Tasks', undefined, true, false, true, false)
                if (marketTradingTasks === undefined) { continue }
                if (marketTradingTasks.payload === undefined) { continue }
                if (marketTradingTasks.payload.referenceParent === undefined) { continue }
                if (marketTradingTasks.payload.referenceParent.id === market.id) {
                    functionLibraryNodeDeleter.deleteUIObject(timeMachine, rootNodes)
                }
            }

            /* Delete all Dashboards that does not have time machines inside. */
            let dashboardArray = nodeBranchToArray(chartingSpace, 'Dashboard')
            for (let i = 0; i < dashboardArray.length; i++) {
                let dashboard = dashboardArray[i]
                if (dashboard.timeMachines.length === 0) {
                    functionLibraryNodeDeleter.deleteUIObject(dashboard, rootNodes)
                }
            }

            /* Scan Networks for the market being unistalled to delete it. */
            for (let i = 0; i < rootNodes.length; i++) {
                let rootNode = rootNodes[i]
                if (rootNode.type === 'Network') {
                    uninstallInNetwork(rootNode)
                }
            }
        }

        function uninstallInNetwork(network) {

            let marketDataTasksArray = nodeBranchToArray(network, 'Market Data Tasks')
            let marketTradingTasksArray = nodeBranchToArray(network, 'Market Trading Tasks')
            let marketDataProductsArray = nodeBranchToArray(network, 'Market Data Products')
            let marketTradingProductsArray = nodeBranchToArray(network, 'Market Trading Products')

            uninstalMarketArray(marketDataTasksArray)
            uninstalMarketArray(marketTradingTasksArray)
            uninstalMarketArray(marketDataProductsArray)
            uninstalMarketArray(marketTradingProductsArray)

            function uninstalMarketArray(marketArray) {
                for (let i = 0; i < marketArray.length; i++) {
                    let marketReference = marketArray[i]
                    if (marketReference.payload === undefined) { continue }
                    if (marketReference.payload.referenceParent === undefined) { continue }
                    if (marketReference.payload.referenceParent.id === market.id) {
                        functionLibraryNodeDeleter.deleteUIObject(marketReference, rootNodes)
                    }
                }
            }
        }
    }
}
