function newFoundationsFunctionLibraryCryptoEcosystemFunctions() {
    let thisObject = {
        addMissingExchanges: addMissingExchanges,
        addMissingAssets: addMissingAssets,
        addMissingMarkets: addMissingMarkets,
        installMarket: installMarket,
        uninstallMarket: uninstallMarket
    }

    return thisObject

    function addMissingExchanges(node) {
        currentExchanges = new Map()
        let parent = node.payload.parentNode
        if (parent !== undefined) {
            for (let i = 0; i < parent.cryptoExchanges.length; i++) {
                let cryptoExchanges = parent.cryptoExchanges[i]
                for (let j = 0; j < cryptoExchanges.exchanges.length; j++) {
                    let exchange = cryptoExchanges.exchanges[j]
                    let codeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(exchange.payload, 'codeName')
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

        httpRequest(JSON.stringify(params), 'CCXT', onResponse)

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
                    let newExchange = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Crypto Exchange')
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

    function addMissingAssets(node) {
        if (node.payload.parentNode === undefined) { return }

        let currentAssets = new Map()
        for (let j = 0; j < node.assets.length; j++) {
            let asset = node.assets[j]
            let codeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(asset.payload, 'codeName')
            currentAssets.set(codeName, asset)
        }

        let exchangeId = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload.parentNode.payload, 'codeName')

        try {
            let params = {
                exchangeId: exchangeId,
                method: 'fetchMarkets'
            }
            httpRequest(JSON.stringify(params), 'CCXT', onResponse)

            function onResponse(err, data) {
                if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    node.payload.uiObject.setErrorMessage('Failed to Fetch Assets from the Exchange')
                    return
                }
                let queryParams = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'addMissingAssetsFilter')

                let markets = JSON.parse(data)

                let totalAdded = 0
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
                        totalAdded++
                        currentAssets.set(market.base, market.base)
                    }
                    if (currentAssets.get(market.quote) === undefined) {
                        addAsset(market.quote)
                        totalAdded++
                        currentAssets.set(market.quote, market.quote)
                    }

                    function addAsset(name) {
                        let newAsseet = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Asset')
                        newAsseet.name = name
                        newAsseet.config = '{ \n\"codeName\": \"' + name + '\"\n}'
                    }
                }
                node.payload.uiObject.setInfoMessage(node.payload.parentNode.name + ' supports ' + markets.length + ' markets. Applying the filters at this node config ' + node.config + ' this process added ' + totalAdded + ' assets.', 4)

            }
        } catch (err) {
            node.payload.uiObject.setErrorMessage('Failed to Fetch Assets from the Exchange')
            console.log(err.stack)
        }
    }

    function addMissingMarkets(node) {
        if (node.payload.parentNode === undefined) { return }
        if (node.payload.parentNode.exchangeAssets === undefined) { return }
        if (node.payload.parentNode.payload.parentNode === undefined) { return }
        if (node.payload.parentNode.payload.parentNode.payload.parentNode === undefined) { return }

        let currentAssets = new Map()
        let exchangeAssets = node.payload.parentNode.exchangeAssets
        for (let j = 0; j < exchangeAssets.assets.length; j++) {
            let asset = exchangeAssets.assets[j]
            let codeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(asset.payload, 'codeName')
            currentAssets.set(codeName, asset)
        }

        let currentMarkets = new Map()
        let exchangeMarkets = node
        for (let j = 0; j < exchangeMarkets.markets.length; j++) {
            let asset = exchangeMarkets.markets[j]
            let codeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(asset.payload, 'codeName')
            currentMarkets.set(codeName, asset)
        }

        let exchangeId = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload.parentNode.payload, 'codeName')

        try {
            let params = {
                exchangeId: exchangeId,
                method: 'fetchMarkets'
            }
            httpRequest(JSON.stringify(params), 'CCXT', onResponse)

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
                        let newMarket = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Market')
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
                        UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(newMarket.baseAsset, baseAsset)
                        UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(newMarket.quotedAsset, quotedAsset)

                        currentMarkets.set(name, newMarket)
                    }
                }
            }
        } catch (err) {
            node.payload.uiObject.setErrorMessage('Failed to Fetch Assets from the Exchange')
            console.log(err.stack)
        }
    }

    function installMarket(
        node,
        rootNodes
    ) {
        let market = node
        let cryptoExchange = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(node, 'Crypto Exchange', undefined, true, false, true, false)
        if (cryptoExchange === undefined) {
            node.payload.uiObject.setErrorMessage('Market must be a descendant of a Crypto Exchange')
            return
        }
        node.payload.uiObject.setInfoMessage('This market is being installed. This might take a minute or two. Please hold on while we connect all the dots for you. ')

        setTimeout(installMarketProcedure, 500)

        function installMarketProcedure() {
            let dashboardsArray = []

            for (let i = 0; i < rootNodes.length; i++) {
                let rootNode = rootNodes[i]
                if (rootNode.type === 'LAN Network') {
                    installInNetwork(rootNode)
                }
            }

            for (let i = 0; i < rootNodes.length; i++) {
                let rootNode = rootNodes[i]
                if (rootNode.type === 'Charting Space') {
                    installInChartingSpace(rootNode)
                }
            }

            node.payload.uiObject.setInfoMessage('Market installation is complete.')

            function installInNetwork(network) {

                for (let j = 0; j < network.lanNetworkNodes.length; j++) {
                    let lanNetworkNode = network.lanNetworkNodes[j]
                    installInNetworkNode(lanNetworkNode)
                }

                function installInNetworkNode(lanNetworkNode) {

                    let tradingSessionsCreatedArray = []
                    let portfolioSessionsCreatedArray = []
                    let learningSessionsCreatedArray = []

                    installDataTasksTasks()
                    installLearningTasksTasks()
                    installTradingTasksTasks()
                    installPortfolioTasksTasks()

                    installDataMinesData()
                    installLearningMinesData()
                    installTradingMineData()
                    installPortfolioMineData()

                    function installDataTasksTasks() {
                        /*
                        Here we complete the missing stuff at Data Tasks
                        */
                        let dataTasks = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Data Tasks', node, true)
                        if (dataTasks === undefined) {
                            dataTasks = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(lanNetworkNode, 'Data Tasks')
                        }
                        /*
                        We will make ourselves sure that the Project Data Tasks nodes are there.
                        */
                        dataTasks.payload.uiObject.menu.internalClick('Add Missing Project Data Tasks')
                        dataTasks.payload.uiObject.menu.internalClick('Add Missing Project Data Tasks')

                        for (let i = 0; i < dataTasks.projectDataTasks.length; i++) {
                            let projectDataTasks = dataTasks.projectDataTasks[i]
                            projectDataTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90

                            if (projectDataTasks.project === "Foundations") {
                                installTheRestOfTheBranch(projectDataTasks)
                            }
                        }

                        function installTheRestOfTheBranch(projectDataTasks) {
                            let exchangeDataTasks = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectDataTasks, 'Exchange Data Tasks', cryptoExchange)
                            exchangeDataTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                            let marketDataTask = UI.projects.visualScripting.utilities.nodeChildren.findAndRecreateChildWithReference(exchangeDataTasks, 'Market Data Tasks', market, rootNodes)

                            UI.projects.foundations.utilities.menu.menuClick(marketDataTask, 'Add Missing Data Mine Tasks', true)
                            UI.projects.foundations.utilities.menu.menuClickOfNodeArray(marketDataTask.dataMineTasks, 'Add All Tasks', true)
                        }
                    }

                    function installLearningTasksTasks() {
                        /*
                        Here we complete the missing stuff at Learning Tasks
                        */
                        let learningTasks = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Learning Tasks', node, true)
                        if (learningTasks === undefined) {
                            learningTasks = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(lanNetworkNode, 'Learning Tasks')
                        }
                        /*
                        We will make ourselves sure that the Project Learning Tasks nodes are there.
                        */
                        learningTasks.payload.uiObject.menu.internalClick('Add Missing Project Learning Tasks')
                        learningTasks.payload.uiObject.menu.internalClick('Add Missing Project Learning Tasks')

                        for (let i = 0; i < learningTasks.projectLearningTasks.length; i++) {
                            let projectLearningTasks = learningTasks.projectLearningTasks[i]
                            projectLearningTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90

                            if (projectLearningTasks.project === "Foundations") {
                                installTheRestOfTheBranch(projectLearningTasks)
                            }
                        }

                        function installTheRestOfTheBranch(projectLearningTasks) {
                            let exchangeLearningTasks = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectLearningTasks, 'Exchange Learning Tasks', cryptoExchange)
                            exchangeLearningTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                            let marketLearningTask = UI.projects.visualScripting.utilities.nodeChildren.findAndRecreateChildWithReference(exchangeLearningTasks, 'Market Learning Tasks', market, rootNodes)

                            UI.projects.foundations.utilities.menu.menuClick(marketLearningTask, 'Add Missing Learning Mine Tasks', true)
                            UI.projects.foundations.utilities.menu.menuClickOfNodeArray(marketLearningTask.learningMineTasks, 'Add All Tasks', true)

                            /* This will be needed at the charting space, for creating Dashboards */
                            let backLearningSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(marketLearningTask, 'Back Learning Session')
                            let liveLearningSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(marketLearningTask, 'Live Learning Session')

                            let allSessionsArray = backLearningSessionsArray
                                .concat(liveLearningSessionsArray)

                            learningSessionsCreatedArray = learningSessionsCreatedArray.concat(allSessionsArray)

                            dashboardsArray.push({ environmentNode: learningTasks, lanNetworkNode: lanNetworkNode, sessionsArray: allSessionsArray })
                        }
                    }

                    function installTradingTasksTasks() {
                        /*
                        Next we complete the missing stuff at Testing Trading Tasks
                        */
                        installEnvironment('Testing Trading Tasks')
                        /*
                        Next we complete the missing stuff at Production Trading Tasks
                        */
                        installEnvironment('Production Trading Tasks')

                        function installEnvironment(environmentType) {
                            /*
                            Now we install the environment at the current Network Node
                            */
                            let tradingTasks = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, environmentType, node, true)
                            if (tradingTasks === undefined) {
                                tradingTasks = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(lanNetworkNode, environmentType)
                            }
                            /*
                             We will make ourselves sure that the Project Trading Tasks nodes are there.
                             */
                            tradingTasks.payload.uiObject.menu.internalClick('Add Missing Project Trading Tasks')
                            tradingTasks.payload.uiObject.menu.internalClick('Add Missing Project Trading Tasks')

                            for (let i = 0; i < tradingTasks.projectTradingTasks.length; i++) {
                                let projectTradingTasks = tradingTasks.projectTradingTasks[i]
                                projectTradingTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90

                                if (projectTradingTasks.project === "Foundations") {
                                    installTheRestOfTheBranch(projectTradingTasks)
                                }
                            }

                            function installTheRestOfTheBranch(projectTradingTasks) {
                                let exchangeTradingTasks = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectTradingTasks, 'Exchange Trading Tasks', cryptoExchange)
                                exchangeTradingTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                                let marketTradingTask = UI.projects.visualScripting.utilities.nodeChildren.findAndRecreateChildWithReference(exchangeTradingTasks, 'Market Trading Tasks', market, rootNodes)

                                UI.projects.foundations.utilities.menu.menuClick(marketTradingTask, 'Add Missing Trading Mine Tasks', true)
                                UI.projects.foundations.utilities.menu.menuClickOfNodeArray(marketTradingTask.tradingMineTasks, 'Add All Tasks', true)

                                /* This will be needed at the charting space, for creating Dashboards */
                                let backtestingSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(marketTradingTask, 'Backtesting Session')
                                let liveTradingSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(marketTradingTask, 'Live Trading Session')
                                let paperTradingSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(marketTradingTask, 'Paper Trading Session')
                                let forwardSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(marketTradingTask, 'Forward Testing Session')
                                let allSessionsArray = backtestingSessionsArray
                                    .concat(liveTradingSessionsArray)
                                    .concat(paperTradingSessionsArray)
                                    .concat(forwardSessionsArray)
                                tradingSessionsCreatedArray = tradingSessionsCreatedArray.concat(allSessionsArray)

                                dashboardsArray.push({ environmentNode: tradingTasks, lanNetworkNode: lanNetworkNode, sessionsArray: allSessionsArray })
                            }
                        }
                    }

                    function installPortfolioTasksTasks() {
                        /*
                        Next we complete the missing stuff at Testing Portfolio Tasks
                        */
                        //installEnvironment('Testing Portfolio Tasks')
                        /*
                        Next we complete the missing stuff at Production Portfolio Tasks
                        */
                        installEnvironment('Production Portfolio Tasks')

                        function installEnvironment(environmentType) {
                            /*
                            Now we install the environment at the current Network Node
                            */
                            let portfolioTasks = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, environmentType, node, true)
                            if (portfolioTasks === undefined) {
                                portfolioTasks = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(lanNetworkNode, environmentType)
                            }
                            /*
                             We will make ourselves sure that the Project Portfolio Tasks nodes are there.
                             */
                            portfolioTasks.payload.uiObject.menu.internalClick('Add Missing Project Portfolio Tasks')
                            portfolioTasks.payload.uiObject.menu.internalClick('Add Missing Project Portfolio Tasks')

                            for (let i = 0; i < portfolioTasks.projectPortfolioTasks.length; i++) {
                                let projectPortfolioTasks = portfolioTasks.projectPortfolioTasks[i]
                                projectPortfolioTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90

                                if (projectPortfolioTasks.project === "Foundations") {
                                    installTheRestOfTheBranch(projectPortfolioTasks)
                                }
                            }

                            function installTheRestOfTheBranch(projectPortfolioTasks) {
                                let exchangePortfolioTasks = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectPortfolioTasks, 'Exchange Portfolio Tasks', cryptoExchange)
                                exchangePortfolioTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                                let marketPortfolioTask = UI.projects.visualScripting.utilities.nodeChildren.findAndRecreateChildWithReference(exchangePortfolioTasks, 'Market Portfolio Tasks', market, rootNodes)

                                UI.projects.foundations.utilities.menu.menuClick(marketPortfolioTask, 'Add Missing Portfolio Mine Tasks', true)
                                UI.projects.foundations.utilities.menu.menuClickOfNodeArray(marketPortfolioTask.portfolioMineTasks, 'Add All Tasks', true)

                                /* This will be needed at the charting space, for creating Dashboards */
                                //let backtestingSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(marketPortfolioTask, 'Backtesting Session')
                                let livePortfolioSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(marketPortfolioTask, 'Live Portfolio Session')
                                //let paperPortfolioSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(marketPortfolioTask, 'Paper Portfolio Session')
                                //let forwardSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(marketPortfolioTask, 'Forward Testing Session')
                                let allSessionsArray = livePortfolioSessionsArray;
                                    /*backtestingSessionsArray
                                    .concat(livePortfolioSessionsArray)
                                    .concat(paperPortfolioSessionsArray)
                                    .concat(forwardSessionsArray)*/
                                portfolioSessionsCreatedArray = portfolioSessionsCreatedArray.concat(allSessionsArray)

                                dashboardsArray.push({ environmentNode: portfolioTasks, lanNetworkNode: lanNetworkNode, sessionsArray: allSessionsArray })
                            }
                        }
                    }

                    function installDataMinesData() {
                        /*
                        Here we complete the missing stuff at Data Mines Data
                        */
                        let dataStorage = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Data Storage', node, true)
                        if (dataStorage === undefined) {
                            dataStorage = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(lanNetworkNode, 'Data Storage')
                        }
                        let dataMinesData = UI.projects.visualScripting.utilities.branches.findInBranch(dataStorage, 'Data Mines Data', node, true)
                        if (dataMinesData === undefined) {
                            dataMinesData = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(dataStorage, 'Data Mines Data')
                        }
                        dataMinesData.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90
                        /*
                        We will make ourselves sure that the Project Data Products nodes are there.
                        */
                        dataMinesData.payload.uiObject.menu.internalClick('Add Missing Project Data Products')
                        dataMinesData.payload.uiObject.menu.internalClick('Add Missing Project Data Products')

                        for (let i = 0; i < dataMinesData.projectDataProducts.length; i++) {
                            let projectDataProducts = dataMinesData.projectDataProducts[i]
                            projectDataProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_45

                            if (projectDataProducts.project === "Foundations") {
                                installTheRestOfTheBranch(projectDataProducts)
                            }
                        }

                        function installTheRestOfTheBranch(projectDataProducts) {
                            let exchangeDataProducts = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectDataProducts, 'Exchange Data Products', cryptoExchange)
                            exchangeDataProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                            let marketDataProducts = UI.projects.visualScripting.utilities.nodeChildren.findAndRecreateChildWithReference(exchangeDataProducts, 'Market Data Products', market, rootNodes)
                            marketDataProducts.payload.floatingObject.collapseToggle()

                            UI.projects.foundations.utilities.menu.menuClick(marketDataProducts, 'Add All Data Mine Products', true)
                            UI.projects.foundations.utilities.menu.menuClickOfNodeArray(marketDataProducts.dataMineProducts, 'Add All Data Products', true)
                        }
                    }

                    function installLearningMinesData() {
                        /*
                        Here we complete the missing stuff at Data Mines Data
                        */
                        let dataStorage = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Data Storage', node, true)
                        if (dataStorage === undefined) {
                            dataStorage = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(lanNetworkNode, 'Data Storage')
                        }
                        let learningMinesData = UI.projects.visualScripting.utilities.branches.findInBranch(dataStorage, 'Learning Mines Data', node, true)
                        if (learningMinesData === undefined) {
                            learningMinesData = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(dataStorage, 'Learning Mines Data')
                        }
                        learningMinesData.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90
                        /*
                        We will make ourselves sure that the Project Learning Products nodes are there.
                        */
                        learningMinesData.payload.uiObject.menu.internalClick('Add Missing Project Learning Products')
                        learningMinesData.payload.uiObject.menu.internalClick('Add Missing Project Learning Products')

                        for (let i = 0; i < learningMinesData.projectLearningProducts.length; i++) {
                            let projectLearningProducts = learningMinesData.projectLearningProducts[i]
                            projectLearningProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_45

                            if (projectLearningProducts.project === "Foundations") {
                                installTheRestOfTheBranch(projectLearningProducts)
                            }
                        }

                        function installTheRestOfTheBranch(projectLearningProducts) {

                            let exchangeLearningProducts = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectLearningProducts, 'Exchange Learning Products', cryptoExchange)
                            exchangeLearningProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                            let marketLearningProducts = UI.projects.visualScripting.utilities.nodeChildren.findAndRecreateChildWithReference(exchangeLearningProducts, 'Market Learning Products', market, rootNodes)
                            marketLearningProducts.payload.floatingObject.collapseToggle()
                            /*
                            Create the new session references.
                            */
                            for (let i = 0; i < learningSessionsCreatedArray.length; i++) {
                                let session = learningSessionsCreatedArray[i]
                                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(marketLearningProducts, session, true) === true) {
                                    UI.projects.foundations.functionLibraries.dataStorageFunctions.createSessionReference(marketLearningProducts, session, 'Learning Session Reference')
                                }
                            }
                            /*
                            Create everything inside the session references.
                            */
                            for (let j = 0; j < marketLearningProducts.learningSessionReferences.length; j++) {
                                let sessionReference = marketLearningProducts.learningSessionReferences[j]
                                UI.projects.foundations.utilities.menu.menuClick(sessionReference, 'Add All Learning Mine Products', true)
                                UI.projects.foundations.utilities.menu.menuClickOfNodeArray(sessionReference.learningMineProducts, 'Add All Data Products', true)
                                sessionReference.payload.floatingObject.collapseToggle()
                            }
                        }
                    }

                    function installTradingMineData() {
                        /*
                        Here we complete the missing stuff at Data Mines Data
                        */
                        let dataStorage = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Data Storage', node, true)
                        if (dataStorage === undefined) {
                            dataStorage = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(lanNetworkNode, 'Data Storage')
                        }
                        let tradingMinesData = UI.projects.visualScripting.utilities.branches.findInBranch(dataStorage, 'Trading Mines Data', node, true)
                        if (tradingMinesData === undefined) {
                            tradingMinesData = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(dataStorage, 'Trading Mines Data')
                        }
                        tradingMinesData.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90
                        /*
                        We will make ourselves sure that the Project Trading Products nodes are there.
                        */
                        tradingMinesData.payload.uiObject.menu.internalClick('Add Missing Project Trading Products')
                        tradingMinesData.payload.uiObject.menu.internalClick('Add Missing Project Trading Products')

                        for (let i = 0; i < tradingMinesData.projectTradingProducts.length; i++) {
                            let projectTradingProducts = tradingMinesData.projectTradingProducts[i]
                            projectTradingProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_45

                            if (projectTradingProducts.project === "Foundations") {
                                installTheRestOfTheBranch(projectTradingProducts)
                            }
                        }

                        function installTheRestOfTheBranch(projectTradingProducts) {

                            let exchangeTradingProducts = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectTradingProducts, 'Exchange Trading Products', cryptoExchange)
                            exchangeTradingProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                            let marketTradingProducts = UI.projects.visualScripting.utilities.nodeChildren.findAndRecreateChildWithReference(exchangeTradingProducts, 'Market Trading Products', market, rootNodes)
                            marketTradingProducts.payload.floatingObject.collapseToggle()
                            /*
                            Create the new session references.
                            */
                            for (let i = 0; i < tradingSessionsCreatedArray.length; i++) {
                                let session = tradingSessionsCreatedArray[i]
                                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(marketTradingProducts, session, true) === true) {
                                    UI.projects.foundations.functionLibraries.dataStorageFunctions.createSessionReference(marketTradingProducts, session, 'Trading Session Reference')
                                }
                            }
                            /*
                            Create everything inside the session references.
                            */
                            for (let j = 0; j < marketTradingProducts.tradingSessionReferences.length; j++) {
                                let sessionReference = marketTradingProducts.tradingSessionReferences[j]
                                UI.projects.foundations.utilities.menu.menuClick(sessionReference, 'Add All Trading Mine Products', true)
                                UI.projects.foundations.utilities.menu.menuClickOfNodeArray(sessionReference.tradingMineProducts, 'Add All Data Products', true)
                                sessionReference.payload.floatingObject.collapseToggle()
                            }
                        }
                    }

                    function installPortfolioMineData() {
                        /*
                        Here we complete the missing stuff at Data Mines Data
                        */
                        let dataStorage = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Data Storage', node, true)
                        if (dataStorage === undefined) {
                            dataStorage = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(lanNetworkNode, 'Data Storage')
                        }
                        let portfolioMinesData = UI.projects.visualScripting.utilities.branches.findInBranch(dataStorage, 'Portfolio Mines Data', node, true)
                        if (portfolioMinesData === undefined) {
                            portfolioMinesData = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(dataStorage, 'Portfolio Mines Data')
                        }
                        portfolioMinesData.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90
                        /*
                        We will make ourselves sure that the Project Portfolio Products nodes are there.
                        */
                        portfolioMinesData.payload.uiObject.menu.internalClick('Add UI Object')
                        portfolioMinesData.payload.uiObject.menu.internalClick('Add Missing Project Portfolio Products')

                        for (let i = 0; i < portfolioMinesData.projectPortfolioProducts.length; i++) {
                            let projectPortfolioProducts = portfolioMinesData.projectPortfolioProducts[i]
                            projectPortfolioProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_45

                            if (projectPortfolioProducts.project === "Foundations") {
                                installTheRestOfTheBranch(projectPortfolioProducts)
                            }
                        }

                        function installTheRestOfTheBranch(projectPortfolioProducts) {

                            let exchangePortfolioProducts = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectPortfolioProducts, 'Exchange Portfolio Products', cryptoExchange)
                            exchangePortfolioProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                            let marketPortfolioProducts = UI.projects.visualScripting.utilities.nodeChildren.findAndRecreateChildWithReference(exchangePortfolioProducts, 'Market Portfolio Products', market, rootNodes)
                            marketPortfolioProducts.payload.floatingObject.collapseToggle()
                            /*
                            Create the new session references.
                            */
                            for (let i = 0; i < portfolioSessionsCreatedArray.length; i++) {
                                let session = portfolioSessionsCreatedArray[i]
                                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(marketPortfolioProducts, session, true) === true) {
                                    UI.projects.foundations.functionLibraries.dataStorageFunctions.createSessionReference(marketPortfolioProducts, session, 'Portfolio Session Reference')
                                }
                            }
                            /*
                            Create everything inside the session references.
                            */
                            for (let j = 0; j < marketPortfolioProducts.portfolioSessionReferences.length; j++) {
                                let sessionReference = marketPortfolioProducts.portfolioSessionReferences[j]
                                UI.projects.foundations.utilities.menu.menuClick(sessionReference, 'Add All Portfolio Mine Products', true)
                                UI.projects.foundations.utilities.menu.menuClickOfNodeArray(sessionReference.portfolioMineProducts, 'Add All Data Products', true)
                                sessionReference.payload.floatingObject.collapseToggle()
                            }
                        }
                    }
                }
            }

            function installInChartingSpace(chartingSpace) {
                /*
                We will make ourselves sure that the Project Data Tasks nodes are there.
                */
                chartingSpace.payload.uiObject.menu.internalClick('Add Missing Project Dashboards')
                chartingSpace.payload.uiObject.menu.internalClick('Add Missing Project Dashboards')

                for (let i = 0; i < chartingSpace.projectDashboards.length; i++) {
                    let projectDashboards = chartingSpace.projectDashboards[i]
                    projectDashboards.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180

                    if (projectDashboards.project === "Foundations") {
                        installTheRestOfTheBranch(projectDashboards)
                    }
                }

                function installTheRestOfTheBranch(projectDashboards) {

                    for (let i = 0; i < dashboardsArray.length; i++) {
                        /*
                        If the Dashboard we need is not already there we create a new one. 
                        */
                        let arrayItem = dashboardsArray[i]
                        let dashboard = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectDashboards, 'Dashboard', arrayItem.environmentNode)
                        dashboard.name = arrayItem.environmentNode.type + ' ' + arrayItem.lanNetworkNode.name
                        /*
                        We delete all the existing Time Machines related to the market we are currently installing. 
                        For that, we make a new array with the existing Time Machines so that the deleting
                        of each node does not affect the processing of the whole set.
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
                                This is what usually happens, that the install process make these
                                time machines to lose their reference parent since the install
                                process deletes them.
                                */
                                UI.projects.visualScripting.functionLibraries.nodeDeleter.deleteUIObject(timeMachine, rootNodes)
                                continue
                            }
                            let marketTradingTasks = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(session, 'Market Trading Tasks', undefined, true, false, true, false)
                            if (marketTradingTasks === undefined) { continue }
                            if (marketTradingTasks.payload === undefined) { continue }
                            if (marketTradingTasks.payload.referenceParent === undefined) { continue }
                            if (marketTradingTasks.payload.referenceParent.id === market.id) {
                                UI.projects.visualScripting.functionLibraries.nodeDeleter.deleteUIObject(timeMachine, rootNodes)
                            }

                            let marketPortfolioTasks = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(session, 'Market Portfolio Tasks', undefined, true, false, true, false)
                            if (marketPortfolioTasks === undefined) { continue }
                            if (marketPortfolioTasks.payload === undefined) { continue }
                            if (marketPortfolioTasks.payload.referenceParent === undefined) { continue }
                            if (marketPortfolioTasks.payload.referenceParent.id === market.id) {
                                UI.projects.visualScripting.functionLibraries.nodeDeleter.deleteUIObject(timeMachine, rootNodes)
                            }
                        }
                        /*
                        We create a time machine for each session added during the previous processing. 
                        */
                        for (let j = 0; j < arrayItem.sessionsArray.length; j++) {
                            let session = arrayItem.sessionsArray[j]
                            UI.projects.foundations.functionLibraries.chartingSpaceFunctions.createTimeMachine(dashboard, session, node, arrayItem.lanNetworkNode, rootNodes)
                        }
                    }
                }
            }
        }
    }

    function uninstallMarket(node, rootNodes) {

        node.payload.uiObject.setInfoMessage('This market is being uninstalled. Please hold on  that it might take a while.')

        setTimeout(uninstallMarketProcedure, 500)

        function uninstallMarketProcedure() {
            let market = node
            for (let i = 0; i < rootNodes.length; i++) {
                let rootNode = rootNodes[i]
                if (rootNode.type === 'Charting Space') {
                    uninstallInChartingSpace(rootNode)
                }
            }

            node.payload.uiObject.setInfoMessage('Market uninstall is complete.')

            function uninstallInChartingSpace(chartingSpace) {

                /* Delete all time machines which are referencing sessions inside the market being uninstalled. */
                let timeMachines = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(chartingSpace, 'Time Machine')
                for (let i = 0; i < timeMachines.length; i++) {
                    let timeMachine = timeMachines[i]
                    let session = timeMachine.payload.referenceParent
                    if (session === undefined) { continue }
                    let marketTradingTasks = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(session, 'Market Trading Tasks', undefined, true, false, true, false)
                    if (marketTradingTasks === undefined) { continue }
                    if (marketTradingTasks.payload === undefined) { continue }
                    if (marketTradingTasks.payload.referenceParent === undefined) { continue }
                    if (marketTradingTasks.payload.referenceParent.id === market.id) {
                        UI.projects.visualScripting.functionLibraries.nodeDeleter.deleteUIObject(timeMachine, rootNodes)
                    }

                    let marketPortfolioTasks = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(session, 'Market Portfolio Tasks', undefined, true, false, true, false)
                    if (marketPortfolioTasks === undefined) { continue }
                    if (marketPortfolioTasks.payload === undefined) { continue }
                    if (marketPortfolioTasks.payload.referenceParent === undefined) { continue }
                    if (marketPortfolioTasks.payload.referenceParent.id === market.id) {
                        UI.projects.visualScripting.functionLibraries.nodeDeleter.deleteUIObject(timeMachine, rootNodes)
                    }
                }

                /* Delete all Dashboards that does not have time machines inside. */
                let dashboardArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(chartingSpace, 'Dashboard')
                for (let i = 0; i < dashboardArray.length; i++) {
                    let dashboard = dashboardArray[i]
                    if (dashboard.timeMachines.length === 0) {
                        /* 
                        If possible, after we delete the dashboards, we will also
                        delete the project reference.
                        */
                        let projectReference = dashboard.payload.parentNode
                        schemaDocument = getSchemaDocument(dashboard)
                        UI.projects.visualScripting.functionLibraries.nodeDeleter.deleteUIObject(dashboard, rootNodes)
                        if (projectReference !== undefined && schemaDocument.propertyNameAtParent !== undefined) {
                            if (projectReference[schemaDocument.propertyNameAtParent] !== undefined) {
                                if (projectReference[schemaDocument.propertyNameAtParent].length === 0) {
                                    UI.projects.visualScripting.functionLibraries.nodeDeleter.deleteUIObject(projectReference, rootNodes)
                                }
                            }
                        }
                    }
                }

                /* Scan Networks for the market being uninstalled to delete it. */
                for (let i = 0; i < rootNodes.length; i++) {
                    let rootNode = rootNodes[i]
                    if (rootNode.type === 'LAN Network') {
                        uninstallInNetwork(rootNode)
                    }
                }
            }

            function uninstallInNetwork(network) {

                let marketDataTasksArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(network, 'Market Data Tasks')
                let marketTradingTasksArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(network, 'Market Trading Tasks')
                let marketPortfolioTasksArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(network, 'Market Portfolio Tasks')
                let marketLearningTasksArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(network, 'Market Learning Tasks')
                let marketDataProductsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(network, 'Market Data Products')
                let marketTradingProductsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(network, 'Market Trading Products')
                let marketPortfolioProductsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(network, 'Market Portfolio Products')
                let marketLearningProductsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(network, 'Market Learning Products')

                uninstalMarketArray(marketDataTasksArray)
                uninstalMarketArray(marketTradingTasksArray)
                uninstalMarketArray(marketPortfolioTasksArray)
                uninstalMarketArray(marketLearningTasksArray)
                uninstalMarketArray(marketDataProductsArray)
                uninstalMarketArray(marketTradingProductsArray)
                uninstalMarketArray(marketPortfolioProductsArray)
                uninstalMarketArray(marketLearningProductsArray)

                function uninstalMarketArray(marketArray) {
                    for (let i = 0; i < marketArray.length; i++) {
                        let marketReference = marketArray[i]
                        if (marketReference.payload === undefined) { continue }
                        if (marketReference.payload.referenceParent === undefined) { continue }
                        if (marketReference.payload.referenceParent.id === market.id) {
                            /* 
                            If possible, after we delete the market reference, we will also
                            delete the exchange reference.
                            */
                            let exchangeReference = marketReference.payload.parentNode
                            let schemaDocument = getSchemaDocument(marketReference)
                            UI.projects.visualScripting.functionLibraries.nodeDeleter.deleteUIObject(marketReference, rootNodes)
                            if (exchangeReference !== undefined && schemaDocument.propertyNameAtParent !== undefined) {
                                if (exchangeReference[schemaDocument.propertyNameAtParent].length === 0) {
                                    /* 
                                    If possible, after we delete the exchange reference, we will also
                                    delete the project reference.
                                    */
                                    let projectReference = exchangeReference.payload.parentNode
                                    schemaDocument = getSchemaDocument(exchangeReference)
                                    UI.projects.visualScripting.functionLibraries.nodeDeleter.deleteUIObject(exchangeReference, rootNodes)
                                    if (projectReference !== undefined && schemaDocument.propertyNameAtParent !== undefined) {
                                        if (projectReference[schemaDocument.propertyNameAtParent].length === 0) {
                                            UI.projects.visualScripting.functionLibraries.nodeDeleter.deleteUIObject(projectReference, rootNodes)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
