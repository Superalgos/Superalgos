exports.newTradingRecords = function newTradingRecords(bot, logger) {

    const MODULE_NAME = 'Trading Records'

    let thisObject = {
        appendRecords: appendRecords,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine
    let tradingSystem
    let outputDatasetsMap

    return thisObject

    function initialize(pOutputDatasets, pOutputDatasetsMap) {
        tradingEngine = bot.TRADING_ENGINE
        tradingSystem = bot.TRADING_SYSTEM
        outputDatasetsMap = pOutputDatasetsMap  // These are the files turned into arrays, stored in a Map by Product codeName.
    }

    function finalize() {
        tradingEngine = undefined
        tradingSystem = undefined
        outputDatasetsMap = undefined
    }

    function appendRecords() {
        /*
            Here we add records to the output files. At the product config property nodePath
            we have a pointer to the node that have the information we need to extract.
            Later, based on the product record definition we will extract each individual value.
       */
        let outputDatasets = bot.processNode.referenceParent.processOutput.outputDatasets
        for (let i = 0; i < outputDatasets.length; i++) {
            let outputDatasetNode = outputDatasets[i]
            let dataset = outputDatasetNode.referenceParent
            let product = dataset.parentNode
            let record

            if (bot.processingDailyFiles === true && dataset.config.type === 'Daily Files') {
                record = scanRecordDefinition(product)
            }

            if (bot.processingDailyFiles === false && dataset.config.type === 'Market Files') {
                record = scanRecordDefinition(product)
            }

            let outputDatasetArray = outputDatasetsMap.get(product.config.codeName)
            outputDatasetArray.push(record)
        }

        function scanRecordDefinition(product) {
            let rootNode = eval(product.config.nodePath)
            let record = []
            for (let j = 0; j < product.recordDefinition.recordProperties.length; j++) {
                let recordProperty = product.recordDefinition.recordProperties[j]
                let value
                if (recordProperty.config.nodePath !== undefined) {
                    let childNode = rootNode[recordProperty.config.childNode]
                    if (recordProperty.config.index !== undefined) {
                        value = childNode[recordProperty.config.codeName]           // this returns an array
                        value = value[recordProperty.config.index].value            // this return a node item of the array and its value
                    } else {
                        value = childNode[recordProperty.config.codeName].value     // here we get the value of the childNode
                    }
                } else {
                    value = rootNode[recordProperty.config.codeName].value          // this is the standard way
                }
                if (value === Infinity) {
                    value = Number.MAX_SAFE_INTEGER
                }
                if (recordProperty.config.isString === true) {
                    value = '"' + value + '"'
                }
                record.push(value)
            }

            return record
        }
    }
}