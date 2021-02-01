function newSuperalgosFunctionLibraryDependenciesFilter() {
    /* 
    A Dependency Filter is list of Indicators a Strategy depends 
    on, that is later used to filter out all the other indicators
    the Trading Bot depends on.

    The function will scen a node branch, most likely a Trading System,
    looking into the code property of each node. It will analyze it's
    content and try to make a list of all indicators mentioned at the code 
    text and at which time frames they are mentioned.

    It is important to note that all nodes that are not of the type
    Javascript Code or Formula are going to be ignored.
    */
    thisObject = {
        createDependencyFilter: createDependencyFilter
    }

    return thisObject

    function createDependencyFilter(node) {
        let filters = {
            chart: {
                list: new Map(),
                products: new Map()
            },
            market: {
                list: new Map(),
                products: new Map()
            },
            exchange: {
                list: new Map(),
                products: new Map()
            }
        }
        recursiveFilter(node)

        /* Transform the Map into arrays */
        filters.chart.list = Array.from(filters.chart.list.keys())
        filters.chart.products = Array.from(filters.chart.products.keys())

        filters.market.list = Array.from(filters.market.list.keys())
        filters.market.products = Array.from(filters.market.products.keys())

        filters.exchange.list = Array.from(filters.exchange.list.keys())
        filters.exchange.products = Array.from(filters.exchange.products.keys())

        return filters

        function recursiveFilter(node) {
            if (node.type === 'Javascript Code' || node.type === 'Formula') {
                filter(node.code)
            }

            let schemaDocument = getSchemaDocument(node)
            if (schemaDocument !== undefined) {
                if (schemaDocument.childrenNodesProperties !== undefined) {
                    let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
                    for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                        let property = schemaDocument.childrenNodesProperties[i]

                        switch (property.type) {
                            case 'node': {
                                if (property.name !== previousPropertyName) {
                                    if (node[property.name] !== undefined) {
                                        recursiveFilter(node[property.name])
                                    }
                                    previousPropertyName = property.name
                                }
                            }
                                break
                            case 'array': {
                                let nodePropertyArray = node[property.name]
                                if (nodePropertyArray !== undefined) {
                                    for (let j = 0; j < nodePropertyArray.length; j++) {
                                        let nodeProperty = nodePropertyArray[j]
                                        recursiveFilter(nodeProperty)
                                    }
                                }
                            }
                                break
                        }
                    }
                }
            }
        }

        function filter(code) {
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
            for (let i = 0; i < instructionsArray.length; i++) {
                let instruction = instructionsArray[i]
                /*
                The first kind of instruction we will handle are the ones
                related to the chart structure. For that we need the 
                instruction to start with the keyword 'chart'.
                */
                if (instruction.indexOf('chart') === 0) {  // Example: chart.at01hs.popularSMA.sma200 - chart.at01hs.popularSMA.sma100  < 10
                    let parts = instruction.split('.')
                    let timeFrame = parts[1]
                    let product = parts[2]
                    /*
                    From the instruction syntax we will get the timeFrame
                    */
                    if (timeFrame !== 'atAnyTimeFrame') {
                        timeFrame = timeFrame.substring(2, 4) + '-' + timeFrame.substring(4, 7)
                    }
                    filters.chart.products.set(timeFrame + '-' + product, true)
                    filters.chart.list.set(timeFrame, true)
                }
                /*
                The second kind of instruction we will handle are the ones
                related to the market data structure. For that we need
                the instruction to start with the keyword 'market'
                */
                if (instruction.indexOf('market') === 0) {  // Example: market.BTC.USDT.chart.at01hs.popularSMA.sma200 - market.ETC.USDT.chart.at01hs.popularSMA.sma100  < 10
                    let parts = instruction.split('.')
                    let baseAsset = parts[1]
                    let quotedAsset = parts[2]
                    let timeFrame = parts[4]
                    let product = parts[5]
                    /*
                    From the instruction syntax we will get the timeFrame
                    */
                    if (timeFrame !== 'atAnyTimeFrame') {
                        timeFrame = timeFrame.substring(2, 4) + '-' + timeFrame.substring(4, 7)
                    }
                    filters.market.products.set(baseAsset + '-' + quotedAsset + '-' + timeFrame + '-' + product, true)
                    filters.market.list.set(baseAsset + '-' + quotedAsset, true)
                }
                /*
                The third kind of instruction we will handle are the ones
                related to the exchange data structure. For that we need
                the instruction to start with the keyword 'market'
                */
                if (instruction.indexOf('exchange') === 0) {  // Example: exchange.binance.market.BTC.USDT.chart.at01hs.popularSMA.sma200 - exchange.poloniex.market.ETC.USDT.chart.at01hs.popularSMA.sma100  < 10
                    let parts = instruction.split('.')
                    let exchange = parts[1]
                    let baseAsset = parts[3]
                    let quotedAsset = parts[4]
                    let timeFrame = parts[6]
                    let product = parts[7]
                    /*
                    From the instruction syntax we will get the timeFrame
                    */
                    if (timeFrame !== 'atAnyTimeFrame') {
                        timeFrame = timeFrame.substring(2, 4) + '-' + timeFrame.substring(4, 7)
                    }
                    filters.exchange.products.set(exchange + '-' + baseAsset + '-' + quotedAsset + '-' + timeFrame + '-' + product, true)
                    filters.exchange.list.set(exchange, true)
                }
            }
        }
    }
}
