exports.newTradingEngine = function newTradingEngine(bot, logger) {
    /*
    We call the Trading Engine to the data structure that is needed in order to exevute the
    trading protocol with the specific rules defined at the Trading System.
    */
    const MODULE_NAME = 'Trading Engine'
    let thisObject = {
        mantain: mantain,
        reset: reset,
        getNodeById: getNodeById,
        cloneValues: cloneValues,
        setCurrentCandle: setCurrentCandle,
        setCurrentCycle: setCurrentCycle,
        initializeNode: initializeNode,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine
    let sessionParameters
    let nodesMap = new Map()

    return thisObject

    function initialize() {

        tradingEngine = bot.simulationState.tradingEngine
        sessionParameters = bot.SESSION.parameters

        initializeNodeMap(tradingEngine)

        if (bot.FIRST_EXECUTION === true) {
            /* 
            Here we will go through all the nodes in the Trading Engine hiriarchy and
            apply the initial value to the value property when needed 
             */
            initializeNode(tradingEngine)
        }
    }

    function finalize() {
        tradingEngine = undefined
        sessionParameters = undefined
        nodesMap = undefined
    }

    function mantain() {
    }

    function reset() {

    }

    function getNodeById(NodeId) {
        return nodesMap.get(NodeId)
    }

    function setCurrentCandle(candle) {
        tradingEngine.current.episode.candle.begin.value = candle.begin
        tradingEngine.current.episode.candle.end.value = candle.end
        tradingEngine.current.episode.candle.open.value = candle.open
        tradingEngine.current.episode.candle.close.value = candle.close
        tradingEngine.current.episode.candle.min.value = candle.min
        tradingEngine.current.episode.candle.max.value = candle.max
    }

    function setCurrentCycle(cycle) {
        tradingEngine.current.episode.cycle.value = cycle
        switch (cycle) {
            case 'First': {
                tradingEngine.current.episode.cycle.begin.value =
                    tradingEngine.current.episode.candle.begin.value +
                    sessionParameters.timeFrame.config.value
                tradingEngine.current.episode.cycle.end.value =
                    tradingEngine.current.episode.candle.begin.value +
                    sessionParameters.timeFrame.config.value +
                    sessionParameters.timeFrame.config.value / 2 - 1
                break
            }
            case 'Second': {
                tradingEngine.current.episode.cycle.begin.value =
                    tradingEngine.current.episode.candle.begin.value +
                    sessionParameters.timeFrame.config.value +
                    sessionParameters.timeFrame.config.value / 2
                tradingEngine.current.episode.cycle.end.value =
                    tradingEngine.current.episode.candle.begin.value +
                    sessionParameters.timeFrame.config.value +
                    sessionParameters.timeFrame.config.value * 4 / 4 - 1
                break
            }
        }
    }

    function cloneValues(originNode, destinationNode) {
        if (originNode === undefined) { return }
        if (destinationNode === undefined) { return }

        /* Here copy the node value */
        destinationNode.value = originNode.value

        /* Now we go down through all the children  of the origin node, assuming the destination node has the same children structure*/
        let nodeDefinition = global.APP_SCHEMA_MAP.get(originNode.type)
        if (nodeDefinition === undefined) { return }

        if (nodeDefinition.properties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
            for (let i = 0; i < nodeDefinition.properties.length; i++) {
                let property = nodeDefinition.properties[i]

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
        let nodeDefinition = global.APP_SCHEMA_MAP.get(node.type)
        if (nodeDefinition === undefined) { return }

        if (nodeDefinition.properties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
            for (let i = 0; i < nodeDefinition.properties.length; i++) {
                let property = nodeDefinition.properties[i]

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
        let nodeDefinition = global.APP_SCHEMA_MAP.get(node.type)
        if (nodeDefinition === undefined) { return }

        if (nodeDefinition.properties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
            for (let i = 0; i < nodeDefinition.properties.length; i++) {
                let property = nodeDefinition.properties[i]

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

