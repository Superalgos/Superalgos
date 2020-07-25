exports.newTradingEngine = function newTradingEngine(bot, logger) {
    /*
    We call the Trading Engine to the data structure that is needed in order to exevute the
    trading protocol with the specific rules defined at the Trading System.
    */
    const MODULE_NAME = 'Trading Engine'
    let thisObject = {
        getNodeById: getNodeById,
        cloneValues: cloneValues,
        setCurrentCandle: setCurrentCandle,
        updateEpisodeCountersAndStatistics: updateEpisodeCountersAndStatistics,
        updateDistanceToEventsCounters: updateDistanceToEventsCounters,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine
    let sessionParameters
    let nodesMap = new Map()

    return thisObject

    function initialize() {
        /* Here we will go through all the nodes in the Trading Engine hiriarchy and apply the initial value to the value property when needed */

        tradingEngine = bot.simulationState.tradingEngine
        sessionParameters = bot.SESSION.parameters

        if (bot.FIRST_EXECUTION === true) {
            initializeNode(tradingEngine)
            tradingEngine.current.balance.baseAsset.value = sessionParameters.sessionBaseAsset.config.initialBalance
            tradingEngine.current.balance.quotedAsset.value = sessionParameters.sessionQuotedAsset.config.initialBalance
        }
    }

    function finalize() {
        tradingEngine = undefined
        sessionParameters = undefined
        nodesMap = undefined
    }

    function getNodeById(NodeId) {
        return nodesMap.get(NodeId)
    }

    function setCurrentCandle(candle) {
        cloneValues(tradingEngine.current.candle, tradingEngine.previous.candle)

        tradingEngine.current.candle.begin.value = candle.begin
        tradingEngine.current.candle.end.value = candle.end
        tradingEngine.current.candle.open.value = candle.open
        tradingEngine.current.candle.close.value = candle.close
        tradingEngine.current.candle.min.value = candle.min
        tradingEngine.current.candle.max.value = candle.max
    }

    function cloneValues(originNode, destinationNode) {
        if (originNode === undefined) { return }
        if (destinationNode === undefined) { return }

        /* Here copy the node value */
        destinationNode.value = originNode.value

        /* Now we go down through all the children  of the origin node, assuming the destination node has the same children structure*/
        let nodeDefinition = bot.APP_SCHEMA_MAP.get(originNode.type)
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

    function initializeNode(node) {
        if (node === undefined) { return }
        /* Add to Node Map */
        nodesMap.set(node.id, node)

        /* Here we initialize the node value */
        if (node.config !== undefined) {
            if (node.config.initialValue !== undefined) {
                node.value = node.config.initialValue
            }
        }
        node.initialize = initializeNode // This will allow anyone to initialize this node and its children.

        /* Now we go down through all this node children */
        let nodeDefinition = bot.APP_SCHEMA_MAP.get(node.type)
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

    function updateEpisodeCountersAndStatistics() {
        tradingEngine.episode.episodeCounters.periods.value++
        tradingEngine.episode.episodeStatistics.days.value = tradingEngine.episode.episodeCounters.periods.value * sessionParameters.timeFrame.config.value / global.ONE_DAY_IN_MILISECONDS
    }

    function updateDistanceToEventsCounters() {
        /* Keeping Distance Counters Up-to-date while avoinding counting before the first event happens. */
        if (
            tradingEngine.current.distanceToEvent.triggerOn.value > 0
        ) {
            tradingEngine.current.distanceToEvent.triggerOn.value++
        }

        if (
            tradingEngine.current.distanceToEvent.triggerOff.value > 0
        ) {
            tradingEngine.current.distanceToEvent.triggerOff.value++
        }

        if (
            tradingEngine.current.distanceToEvent.takePosition.value > 0
        ) {
            tradingEngine.current.distanceToEvent.takePosition.value++
        }

        if (
            tradingEngine.current.distanceToEvent.closePosition.value > 0
        ) {
            tradingEngine.current.distanceToEvent.closePosition.value++
        }

        if (
            tradingEngine.current.distanceToEvent.nextPhase.value > 0
        ) {
            tradingEngine.current.distanceToEvent.nextPhase.value++
        }

        if (
            tradingEngine.current.distanceToEvent.moveToPhase.value > 0
        ) {
            tradingEngine.current.distanceToEvent.moveToPhase.value++
        }

        if (
            tradingEngine.current.distanceToEvent.createOrder.value > 0
        ) {
            tradingEngine.current.distanceToEvent.createOrder.value++
        }

        if (
            tradingEngine.current.distanceToEvent.cancelOrder.value > 0
        ) {
            tradingEngine.current.distanceToEvent.cancelOrder.value++
        }

        if (
            tradingEngine.current.distanceToEvent.closeOrder.value > 0
        ) {
            tradingEngine.current.distanceToEvent.closeOrder.value++
        }
    }

}

