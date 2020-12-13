function newSuperalgosFunctionLibraryDependenciesFilter() {
    thisObject = {
        createFilter: createFilter
    }

    return thisObject

    function createFilter(node) {
        let filters = new Map()
        recursiveFilter(node)

        return Array.from(filters.keys())

        function recursiveFilter(node) {
            filter(node.code)

            let nodeDefinition = getNodeDefinition(node)
            if (nodeDefinition !== undefined) {
                if (nodeDefinition.childrenNodesProperties !== undefined) {
                    let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
                    for (let i = 0; i < nodeDefinition.childrenNodesProperties.length; i++) {
                        let property = nodeDefinition.childrenNodesProperties[i]

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
