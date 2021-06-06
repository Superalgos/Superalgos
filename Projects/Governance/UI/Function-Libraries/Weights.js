function newGovernanceFunctionLibraryWeights() {
    let thisObject = {
        calculate: calculate
    }

    return thisObject

    function calculate(
        pools,
        features,
        assets,
        positions
    ) {
        /* Weight Calculation Follows */
        for (let i = 0; i < assets.length; i++) {
            let asset = assets[i]
            calculateForNode(asset)
        }

        /* Weight Calculation Follows */
        for (let i = 0; i < features.length; i++) {
            let feature = features[i]
            calculateForNode(feature)
        }

        /* Weight Calculation Follows */
        for (let i = 0; i < positions.length; i++) {
            let position = positions[i]
            calculateForNode(position)
        }

        /* Weight Calculation Follows */
        for (let i = 0; i < pools.length; i++) {
            let poolsNode = pools[i]
            calculateForNode(poolsNode)
        }
    }

    function calculateForNode(node) {

        let totalVotes = 0
        countVotesAndResetWeights(node)
        applyWeightCalculation(node)

        function countVotesAndResetWeights(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }

            if (
                node.type !== 'Pool Class' &&
                node.type !== 'Asset Class' &&
                node.type !== 'Feature Class' &&
                node.type !== 'Position Class'
            ) {
                if (node.payload.votes !== undefined) {
                    totalVotes = totalVotes + node.payload.votes
                }
            }

            node.payload.weight = 0
            /*
            Now we will count the voting power of this node's children.
            */
            let schemaDocument = getSchemaDocument(node)
            if (schemaDocument === undefined) { return }

            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]
                    switch (property.type) {
                        case 'node': {
                            let childNode = node[property.name]
                            countVotesAndResetWeights(childNode)
                        }
                            break
                        case 'array': {
                            let propertyArray = node[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m]
                                    countVotesAndResetWeights(childNode)
                                }
                            }
                            break
                        }
                    }
                }
            }
        }

        function applyWeightCalculation(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }

            if (
                node.type !== 'Pool Class' &&
                node.type !== 'Asset Class' &&
                node.type !== 'Feature Class' &&
                node.type !== 'Position Class'
            ) {
                if (node.payload.votes !== undefined) {
                    if (node.payload.votes !== undefined) {
                        node.payload.weight = node.payload.votes / totalVotes
                    }
                }
            }

            /*
            Now we will count the voting power of this node's children.
            */
            let schemaDocument = getSchemaDocument(node)
            if (schemaDocument === undefined) { return }

            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]
                    switch (property.type) {
                        case 'node': {
                            let childNode = node[property.name]
                            applyWeightCalculation(childNode)
                        }
                            break
                        case 'array': {
                            let propertyArray = node[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m]
                                    applyWeightCalculation(childNode)
                                }
                            }
                            break
                        }
                    }
                }
            }
        }
    }
}
