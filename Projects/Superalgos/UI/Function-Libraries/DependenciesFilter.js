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
        let filters = new Map()
        recursiveFilter(node)

        return Array.from(filters.keys())

        function recursiveFilter(node) {
            if (node.type === 'Javascript Code' || node.type === 'Formula' ) {
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

            let instructionsArray = code.split(' ')
            for (let i = 0; i < instructionsArray.length; i++) {
                let instruction = instructionsArray[i]
                if (instruction.indexOf('chart') >= 0) {
                    let parts = instruction.split('.')
                    let timeFrame = parts[1]
                    let product = parts[2]
                    let productParts = product.split(',')
                    product = productParts[0]
                    productParts = product.split(')')
                    product = productParts[0]

                    // Example: chart.at01hs.popularSMA.sma200 - chart.at01hs.popularSMA.sma100  < 10
                    if (timeFrame !== 'atAnyTimeFrame') {
                        timeFrame = timeFrame.substring(2, 4) + '-' + timeFrame.substring(4, 7)
                    }
                    filters.set(timeFrame + '-' + product, true)
                }
            }
        }
    }
}
