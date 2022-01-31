exports.newPortfolioManagementBotModulesPortfolioEngine = function (processIndex) {
    /*
    We call the Portfolio Engine to the data structure that is needed in order to exevute the
    portfolio protocol with the specific rules defined at the Portfolio System.
    */

    let thisObject = {
        maintain: maintain,
        reset: reset,
        getNodeById: getNodeById,
        cloneValues: cloneValues,
        setCurrentCandle: setCurrentCandle,
        setCurrentCycle: setCurrentCycle,
        initializeNode: initializeNode,
        updateExchangeAssets: updateExchangeAssets,
        initialize: initialize,
        finalize: finalize
    }

    let portfolioEngine
    let sessionParameters
    let nodesMap = new Map()
    let exchangeAPIModuleObject

    return thisObject

    function initialize() {

        portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters

        initializeNodeMap(portfolioEngine)

        if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_FIRST_LOOP === true) {
            /* 
            Here we will go through all the nodes in the Portfolio Engine hiriarchy and
            apply the initial value to the value property when needed 
             */
            initializeNode(portfolioEngine)
        }

        exchangeAPIModuleObject = TS.projects.portfolioManagement.botModules.exchangeAPI.newPortfolioManagementBotModulesExchangeAPI(processIndex)
        exchangeAPIModuleObject.initialize()
    }

    function finalize() {
        portfolioEngine = undefined
        sessionParameters = undefined
        nodesMap = undefined
    }

    async function updateExchangeAssets() {

        switch (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type) {
            case 'Live Portfolio Session': {
                await fetchBalancesFromExchange()
                break
            }
            case 'Backtesting Portfolio Session': {
                simulateBalancesFromExchange()
                break
            }
        }

        async function fetchBalancesFromExchange() {
            /*
            Iterate the assets list and fetch for each one of them, their balance from the exchange.
            Then put the values into the right place at the Portfolio Engine.
            */
            let balances = await exchangeAPIModuleObject.fetchAllBalances()
            if (balances !== undefined && balances !== false) {
                for (let i = 0; i < sessionParameters.managedAssets.managedAssets.length; i++) {

                    let managedAssetCodeName = sessionParameters.managedAssets.managedAssets[i].referenceParent.config.codeName

                    portfolioEngine.portfolioCurrent.exchangeManagedAssets.exchangeManagedAssets[i].value = managedAssetCodeName
                    portfolioEngine.portfolioCurrent.exchangeManagedAssets.exchangeManagedAssets[i].assetFreeBalance.value = balances[managedAssetCodeName].free
                    portfolioEngine.portfolioCurrent.exchangeManagedAssets.exchangeManagedAssets[i].assetLockedBalance.value = balances[managedAssetCodeName].used
                    portfolioEngine.portfolioCurrent.exchangeManagedAssets.exchangeManagedAssets[i].assetTotalBalance.value = balances[managedAssetCodeName].total

                    if (portfolioEngine.portfolioCurrent.exchangeManagedAssets.exchangeManagedAssets[i].assetInitialBalance.value === undefined) {
                        portfolioEngine.portfolioCurrent.exchangeManagedAssets.exchangeManagedAssets[i].assetInitialBalance.value = balances[managedAssetCodeName].total
                    }
                }
            }
        }

        function simulateBalancesFromExchange() {
            /*
            To simulate exchange balances, we will need to start with the initialBalance configured for each
            asset at the session parameters, and then look at the Trading Engine of each of the bots which 
            are trading each of these assets, and use the information there to simulate what the balance at the
            exchange would be at any point in time.
            */
        }
    }

    function maintain() {
    }

    function reset() {

    }

    function getNodeById(NodeId) {
        return nodesMap.get(NodeId)
    }

    function setCurrentCandle(candle) {
        portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value = candle.begin
        portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value = candle.end
        portfolioEngine.portfolioCurrent.portfolioEpisode.candle.open.value = candle.open
        portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value = candle.close
        portfolioEngine.portfolioCurrent.portfolioEpisode.candle.min.value = candle.min
        portfolioEngine.portfolioCurrent.portfolioEpisode.candle.max.value = candle.max
    }

    function setCurrentCycle(cycle) {
        portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.value = cycle
        portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.lastBegin.value = portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.begin.value
        portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.lastEnd.value = portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.end.value
        switch (cycle) {
            case 'First': {
                portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.begin.value =
                    portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value +
                    sessionParameters.timeFrame.config.value
                portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.end.value =
                    portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value +
                    sessionParameters.timeFrame.config.value +
                    sessionParameters.timeFrame.config.value / 2 - 1
                break
            }
            case 'Second': {
                portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.begin.value =
                    portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value +
                    sessionParameters.timeFrame.config.value +
                    sessionParameters.timeFrame.config.value / 2
                portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.end.value =
                    portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value +
                    sessionParameters.timeFrame.config.value +
                    sessionParameters.timeFrame.config.value * 4 / 4 - 1
                break
            }
        }
        /* 
        We can not have the last begin or last end to be zero, because that would prevent
        objects starting with lastBegin in zero to being saved on file. For that reason
        we will do this:
        */
        if (portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.lastBegin.value === 0) {
            portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.lastBegin.value = portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.begin.value
        }
        if (portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.lastEnd.value === 0) {
            portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.lastEnd.value = portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.end.value
        }
    }

    function cloneValues(originNode, destinationNode) {
        if (originNode === undefined) { return }
        if (destinationNode === undefined) { return }

        /* Here copy the node value */
        destinationNode.value = originNode.value

        /* Now we go down through all the children  of the origin node, assuming the destination node has the same children structure*/
        let schemaDocument = SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.get(originNode.project + '-' + originNode.type)
        if (schemaDocument === undefined) { return }

        if (schemaDocument.childrenNodesProperties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        if (property.name !== previousPropertyName) {
                            if (originNode[property.name] !== undefined && destinationNode[property.name] !== undefined) {
                                cloneValues(originNode[property.name], destinationNode[property.name])
                            }
                            previousPropertyName = property.name
                        }
                        break
                    }
                    case 'array': {
                        if (originNode[property.name] !== undefined && destinationNode[property.name] !== undefined) {
                            let originNodePropertyArray = originNode[property.name]
                            let destinationNodePropertyArray = destinationNode[property.name]
                            for (let m = 0; m < originNodePropertyArray.length; m++) {
                                cloneValues(originNodePropertyArray[m], destinationNodePropertyArray[m])
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function initializeNodeMap(node) {
        if (node === undefined) { return }
        /* Add to Node Map */
        nodesMap.set(node.id, node)

        /* Now we go down through all this node children */
        let schemaDocument = SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.get(node.project + '-' + node.type)
        if (schemaDocument === undefined) { return }

        if (schemaDocument.childrenNodesProperties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        if (property.name !== previousPropertyName) {
                            if (node[property.name] !== undefined) {
                                initializeNodeMap(node[property.name])
                            }
                            previousPropertyName = property.name
                        }
                        break
                    }
                    case 'array': {
                        if (node[property.name] !== undefined) {
                            let nodePropertyArray = node[property.name]
                            for (let m = 0; m < nodePropertyArray.length; m++) {
                                initializeNodeMap(nodePropertyArray[m])
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function initializeNode(node) {
        if (node === undefined) { return }

        /* Here we initialize the node value */
        if (node.config !== undefined) {
            if (node.config.initialValue !== undefined) {
                node.value = node.config.initialValue
            }
        }

        /* Now we go down through all this node children */
        let schemaDocument = SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.get(node.project + '-' + node.type)
        if (schemaDocument === undefined) { return }

        if (schemaDocument.childrenNodesProperties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        if (property.name !== previousPropertyName) {
                            if (node[property.name] !== undefined) {
                                initializeNode(node[property.name])
                            }
                            previousPropertyName = property.name
                        }
                        break
                    }
                    case 'array': {
                        if (node[property.name] !== undefined) {
                            let nodePropertyArray = node[property.name]
                            for (let m = 0; m < nodePropertyArray.length; m++) {
                                initializeNode(nodePropertyArray[m])
                            }
                        }
                        break
                    }
                }
            }
        }
    }
}

