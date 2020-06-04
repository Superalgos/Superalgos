exports.newTradingEngine = function newTradingEngine(bot, logger) {

    const MODULE_NAME = 'Trading Engine'

    let thisObject = {
        updatePositionCounters: updatePositionCounters,
        updateDistanceToEventsCounters: updateDistanceToEventsCounters,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine

    return thisObject

    function initialize() {
        /* Here we will go through all the nodes in the Trading Engine hiriarchy and apply the initial value to the value property when needed */

        tradingEngine = bot.TRADING_ENGINE

        if (tradingEngine.isInitialized !== true || bot.RESUME === false) {
            tradingEngine.isInitialized = true
            initializeNode(tradingEngine)
        }
    }

    function finalize() {
        tradingEngine = undefined
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
                            object[property.name] = []
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

    function updatePositionCounters() {
        /* Keeping Position Counters Up-to-date */
        if (
            (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage')
        ) {
            if (takePositionNow === true) {
                tradingEngine.current.position.positionCounters.periods.value = 0
            }

            tradingEngine.current.position.positionCounters.periods.value++
            tradingEngine.current.position.positionStatistics.days.value = tradingEngine.current.position.positionCounters.periods.value * sessionParameters.timeFrame.config.value / ONE_DAY_IN_MILISECONDS
        } else {
            tradingEngine.current.position.positionCounters.periods.value = 0
            tradingEngine.current.position.positionStatistics.days.value = 0
        }
    }

    function updateDistanceToEventsCounters() {
        /* Keeping Distance Counters Up-to-date */
        if (
            tradingEngine.current.distanceToEvent.triggerOn.value > 0 // with this we avoind counting before the first event happens.
        ) {
            tradingEngine.current.distanceToEvent.triggerOn.value++
        }

        if (
            tradingEngine.current.distanceToEvent.triggerOff.value > 0 // with this we avoind counting before the first event happens.
        ) {
            tradingEngine.current.distanceToEvent.triggerOff.value++
        }

        if (
            tradingEngine.current.distanceToEvent.takePosition.value > 0 // with this we avoind counting before the first event happens.
        ) {
            tradingEngine.current.distanceToEvent.takePosition.value++
        }

        if (
            tradingEngine.current.distanceToEvent.closePosition.value > 0 // with this we avoind counting before the first event happens.
        ) {
            tradingEngine.current.distanceToEvent.closePosition.value++
        }
    }
}

