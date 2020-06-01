exports.newTradingEngine = function newTradingEngine(bot, logger) {

    const MODULE_NAME = 'Trading Engine'

    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {
        /* Here we will go through all the nodes in the Trading Engine hiriarchy and apply the initial value to the value property when needed */

        if (bot.TRADING_ENGINE.isInitialized !== true || bot.RESUME === false) {
            bot.TRADING_ENGINE.isInitialized = true
            initializeNode(bot.TRADING_ENGINE)
        }
    }

    function finalize() {

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
}

