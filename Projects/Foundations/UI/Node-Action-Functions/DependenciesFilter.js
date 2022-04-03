function newFoundationsFunctionLibraryDependenciesFilter() {
    /* 
    A Dependency Filter is list of Indicators and Studies a Strategy depends 
    on, that is later used to filter out all the other indicators and studies
    the Trading Bot depends on.

    The function will scan a node branch, most likely a Trading System,
    looking into the code property of each node. It will analyze it's
    content and try to make a list of all indicators and studies mentioned at the code 
    text and at which time frames they are mentioned.

    It is important to note that all nodes that are not of the type
    Javascript Code or Formula are going to be ignored.
    */
    let thisObject = {
        createDependencyFilter: createDependencyFilter
    }

    return thisObject

    function createDependencyFilter(
        defaultExchange,
        defaultMarket,
        startingNode,
        userDefinedParameters
    ) {
        let filters = {
            market: {
                list: new Map()
            },
            exchange: {
                list: new Map(),
                markets: new Map(),
                products: new Map(),
                timeFrames: new Map()
            }
        }

        if (userDefinedParameters === undefined) { userDefinedParameters = "{}" }
        let sessionParameters = JSON.parse(userDefinedParameters)
        recursiveFilter(startingNode, sessionParameters)

        /* Transform the Map into arrays */
        filters.market.list = Array.from(filters.market.list.keys())

        filters.exchange.list = Array.from(filters.exchange.list.keys())
        filters.exchange.markets = Array.from(filters.exchange.markets.keys())
        filters.exchange.products = Array.from(filters.exchange.products.keys())
        filters.exchange.timeFrames = Array.from(filters.exchange.timeFrames.keys())

        return filters

        function recursiveFilter(node, sessionParameters) {
            if (node.type === 'Procedure Javascript Code' || node.type === 'Javascript Code' || node.type === 'Formula' || node.type === 'Feature Formula' || node.type === 'Data Formula') {
                filter(node.code, sessionParameters)
            }

            let schemaDocument = getSchemaDocument(node)
            if (schemaDocument !== undefined) {
                if (schemaDocument.childrenNodesProperties !== undefined) {
                    let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoid counting each property of those as individual children.
                    for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                        let property = schemaDocument.childrenNodesProperties[i]

                        switch (property.type) {
                            case 'node':
                                {
                                    if (property.name !== previousPropertyName) {
                                        if (node[property.name] !== undefined) {
                                            recursiveFilter(node[property.name], sessionParameters)
                                        }
                                        previousPropertyName = property.name
                                    }
                                }
                                break
                            case 'array':
                                {
                                    let nodePropertyArray = node[property.name]
                                    if (nodePropertyArray !== undefined) {
                                        for (let j = 0; j < nodePropertyArray.length; j++) {
                                            let nodeProperty = nodePropertyArray[j]
                                            recursiveFilter(nodeProperty, sessionParameters)
                                        }
                                    }
                                }
                                break
                        }
                    }
                }
            }
        }

        function filter(code, sessionParameters) {
            if (code === undefined) { return }
            /*
            We will clean the code from symbols that we do not need during our dependency analysis.
            */
            code = code.replaceAll(',', '')
            code = code.replaceAll('(', '')
            code = code.replaceAll(')', '')
            code = code.replaceAll('{', '')
            code = code.replaceAll('}', '')
            code = code.replaceAll('!', '')
            code = code.replaceAll('|', '')
            code = code.replaceAll('<', '')
            code = code.replaceAll('>', '')
            code = code.replaceAll('=', '')
            code = code.replaceAll('\n', ' ')
            /*
            We will analyze each instruction of the code.
            */

            let instructionsArray = code.split(' ')
            let userVariableCount = (code.match(/\[sessionParameters.userDefinedParameters.config./g) || []).length

            //replace a code variable with the contents of the variable, and add all timeframes if this is in the variable
            if (userVariableCount > 0) {

                for (let i = 0; i < instructionsArray.length; i++) {
                    let instruction = instructionsArray[i]
                    let userVariableInInstructionCount = (instruction.match(/\[sessionParameters.userDefinedParameters.config./g) || []).length
                    if (userVariableInInstructionCount > 0) {
                        //this instruction contains a user defined parameter
                        let endUserParamName = instruction.slice(instruction.indexOf('[sessionParameters.userDefinedParameters.config.') + 48, instruction.indexOf(']'))
                        if (sessionParameters[endUserParamName].indexOf('at') === 0 && instruction.indexOf('chart[sessionParameters.userDefinedParameters.config.') === 0) {
                            // Time Frame is in the variable, so we need all timeframes of that instruction in the filter
                            let allTimeFramesArray = dailyTimeFramesArray.concat(marketTimeFramesArray)
                            for (let i = 0; i < allTimeFramesArray.length; i++) {
                                let label = "at" + allTimeFramesArray[i][1].replace("-", "")
                                if (i === 0) {
                                    instructionsArray[i] = instruction.replace("[sessionParameters.userDefinedParameters.config." + endUserParamName + "]", "." + label)
                                } else {
                                    instructionsArray.push(instruction.replace("[sessionParameters.userDefinedParameters.config." + endUserParamName + "]", "." + label))
                                }
                            }
                        } else {
                            //not sure what is in the variable, so we just replace it
                            instructionsArray[i] = instruction.replace("[sessionParameters.userDefinedParameters.config." + endUserParamName + "]", "." + sessionParameters[endUserParamName])
                        }

                    }
                }
            }
            for (let i = 0; i < instructionsArray.length; i++) {
                let instruction = instructionsArray[i]
                /*
                The first kind of instruction we will handle are the ones
                related to the chart structure. For that we need the 
                instruction to start with the keyword 'chart'.
                */
                if (instruction.indexOf('chart') === 0) { // Example: chart.at01hs.popularSMA.sma200 - chart.at01hs.popularSMA.sma100  < 10
                    let parts = instruction.split('.')
                    let timeFrame = parts[1]
                    let product = parts[2]
                    if (timeFrame === undefined || product === undefined) { continue }
                    /*
                    From the instruction syntax we will get the timeFrame
                    */
                    if (timeFrame !== 'atAnyTimeFrame') {
                        timeFrame = timeFrame.substring(2, 4) + '-' + timeFrame.substring(4, 7)
                    }
                    filters.market.list.set(defaultMarket, true)

                    filters.exchange.timeFrames.set(defaultExchange + '-' + defaultMarket + '-' + product + '-' + timeFrame, true)
                    filters.exchange.products.set(defaultExchange + '-' + defaultMarket + '-' + product, true)
                    filters.exchange.markets.set(defaultExchange + '-' + defaultMarket, true)
                    filters.exchange.list.set(defaultExchange, true)
                }
                /*
                The second kind of instruction we will handle are the ones
                related to the market data structure. For that we need
                the instruction to start with the keyword 'market'
                */
                if (instruction.indexOf('market') === 0) { // Example: market.BTC.USDT.chart.at01hs.popularSMA.sma200 - market.ETC.USDT.chart.at01hs.popularSMA.sma100  < 10
                    let parts = instruction.split('.')
                    let baseAsset = parts[1]
                    let quotedAsset = parts[2]
                    let timeFrame = parts[4]
                    let product = parts[5]
                    if (baseAsset === undefined || quotedAsset === undefined || timeFrame === undefined || product === undefined) { continue }
                    /*
                    From the instruction syntax we will get the timeFrame
                    */
                    if (timeFrame !== 'atAnyTimeFrame') {
                        timeFrame = timeFrame.substring(2, 4) + '-' + timeFrame.substring(4, 7)
                    }
                    filters.market.list.set(baseAsset + '-' + quotedAsset, true)

                    filters.exchange.timeFrames.set(defaultExchange + '-' + baseAsset + '-' + quotedAsset + '-' + product + '-' + timeFrame, true)
                    filters.exchange.products.set(defaultExchange + '-' + baseAsset + '-' + quotedAsset + '-' + product, true)
                    filters.exchange.markets.set(defaultExchange + '-' + baseAsset + '-' + quotedAsset, true)
                    filters.exchange.list.set(defaultExchange, true)
                }
                /*
                The third kind of instruction we will handle are the ones
                related to the exchange data structure. For that we need
                the instruction to start with the keyword 'exchange'
                */
                if (instruction.indexOf('exchange') === 0) { // Example: exchange.binance.market.BTC.USDT.chart.at01hs.popularSMA.sma200 - exchange.poloniex.market.ETC.USDT.chart.at01hs.popularSMA.sma100  < 10
                    let parts = instruction.split('.')
                    let exchange = parts[1]
                    let baseAsset = parts[3]
                    let quotedAsset = parts[4]
                    let timeFrame = parts[6]
                    let product = parts[7]
                    if (exchange === undefined || baseAsset === undefined || quotedAsset === undefined || timeFrame === undefined || product === undefined) { continue }
                    /*
                    From the instruction syntax we will get the timeFrame
                    */
                    if (timeFrame !== 'atAnyTimeFrame') {
                        timeFrame = timeFrame.substring(2, 4) + '-' + timeFrame.substring(4, 7)
                    }
                    filters.market.list.set(baseAsset + '-' + quotedAsset, true)

                    filters.exchange.timeFrames.set(exchange + '-' + baseAsset + '-' + quotedAsset + '-' + product + '-' + timeFrame, true)
                    filters.exchange.products.set(exchange + '-' + baseAsset + '-' + quotedAsset + '-' + product, true)
                    filters.exchange.markets.set(exchange + '-' + baseAsset + '-' + quotedAsset, true)
                    filters.exchange.list.set(exchange, true)
                }
            }
        }
    }
}