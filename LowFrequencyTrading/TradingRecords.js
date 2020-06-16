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

    function initialize(pOutputDatasetsMap) {
        tradingEngine = bot.simulationState.tradingEngine
        tradingSystem = bot.simulationState.tradingSystem
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
            let outputDatasetArray = outputDatasetsMap.get(product.config.codeName)

            if (bot.processingDailyFiles === true && dataset.config.type === 'Daily Files') {
                record = scanRecordDefinition(product)
                outputDatasetArray.push(record)
            }

            if (bot.processingDailyFiles === false && dataset.config.type === 'Market Files') {
                record = scanRecordDefinition(product)
                outputDatasetArray.push(record)
            }
        }

        function scanRecordDefinition(product) {
            /*
            The Product Root Node is the root of the node hiriarchy branch that we need to look at
            in order to fnd the node where we are going to extract the value.
            */
            let productRootNode = eval(product.config.nodePath)
            let record = []
            for (let j = 0; j < product.record.properties.length; j++) {
                let recordProperty = product.record.properties[j]
                /* 
                The Property Root Node is the Root of the Hiriarchy branch we must find in order
                to get the node where we are going to extract the value. Initially
                we point it to the Product Root Node, because that is the default in case
                a property does not have at its configuration a different nodePath configured
                pointing to an specific Root for the property.
                */
                let propertyRootNode = productRootNode
                /*
                If we find at the configuration a nodePath, then we take this path to find
                the Root Node specifically for this property only.
                */
                if (recordProperty.config.nodePath !== undefined) {
                    propertyRootNode = eval(recordProperty.config.nodePath)
                }
                /* 
                The Target Node is the node from where we are going to exctract the value.
                We will use the codeName of the Record Property to match it with 
                the any of the properties of the Root Node to get the Target Node.  
                */
                let targetNode = propertyRootNode[recordProperty.config.codeName]
                /*
                If the codeName of the Record Property can not match the name of the property at
                the target node, the user can explicitly specify the property name at the configuration,
                and in those cases we need to use that. This happens when there are many Record Properties
                pointing to the same property at the Target Node.
                */
                if (recordProperty.config.childProperty !== undefined) {
                    targetNode = propertyRootNode[recordProperty.config.childProperty]
                }
                /*
                It can happen that intead of having a Node in targetNode what we have is an
                array of nodes. We need to pick one of the elements of the array and for that
                we use the Index value we find at the configuration of the Record Property.
                */
                if (recordProperty.config.index !== undefined) {
                    targetNode = targetNode[recordProperty.config.index]
                }
                /* 
                By Default the value is extracted from the value property of the Target Node.
                But it might happen the the Target Node does not exist for example when there is an Array
                of Nodes defined in the Record Properties but not all of them exist at the Root Node.
                We filter out those cases by not extracting the value from the value property.
                */
                let value
                if (targetNode !== undefined) {
                    if (targetNode.type !== undefined) {
                        /*
                        In this case the Target Node is really a node (since it has a type), so we extract the value
                        from its value property.
                        */
                        value = targetNode.value
                        value = safeValue(value)
                        if (recordProperty.config.isString === true) {
                            value = '"' + value + '"'
                        }
                        if (recordProperty.config.decimals !== undefined) {
                            value = Number(value.toFixed(recordProperty.config.decimals))
                        }
                    } else {
                        /*
                        In this case the Target Node is not really node, but the value itself. Se we return this as the
                        value of the Record Property.
                        */
                        value = targetNode
                    }
                }
                record.push(value)
            }
            return record
        }
    }

    function safeValue(value) {
        /*
        The purpose of this function is to check that value variable does not have a value that 
        will later break the JSON format of files where this is going to be stored at. 
        */
        if (value === Infinity) {
            value = Number.MAX_SAFE_INTEGER
        }
        if (value === undefined) {
            value = 0
        }
        return value
    }
}