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
            let assetsNode = assets[i]
            calculateForNode(assetsNode)
        }

        /* Weight Calculation Follows */
        for (let i = 0; i < features.length; i++) {
            let featuresNode = features[i]
            calculateForNode(featuresNode)
        }

        /* Weight Calculation Follows */
        for (let i = 0; i < positions.length; i++) {
            let positionsNode = positions[i]
            calculateForNode(positionsNode)
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
                (node.type !== 'Pool Class' &&
                    node.type !== 'Asset Class' &&
                    node.type !== 'Feature Class' &&
                    node.type !== 'Position Class') ||
                (
                    node.type === 'Asset Class' &&
                    node.payload.referenceParent !== undefined
                ) ||
                (
                    node.type === 'Feature Class' &&
                    node.payload.referenceParent !== undefined
                )
            ) {
                if (
                    node.payload.votingProgram !== undefined &&
                    node.payload.votingProgram.votes !== undefined
                ) {
                    let votes = node.payload.votingProgram.votes
                    if (votes < 0) { votes = 0 }
                    totalVotes = totalVotes + votes
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
                (node.type !== 'Pool Class' &&
                    node.type !== 'Asset Class' &&
                    node.type !== 'Feature Class' &&
                    node.type !== 'Position Class') ||
                (
                    node.type === 'Asset Class' &&
                    node.payload.referenceParent !== undefined
                ) ||
                (
                    node.type === 'Feature Class' &&
                    node.payload.referenceParent !== undefined
                )
            ) {
                if (node.payload.votingProgram !== undefined) {
                    if (node.payload.votingProgram.votes !== undefined) {
                        let votes = node.payload.votingProgram.votes
                        if (votes < 0) { votes = 0 }
                        node.payload.weight = votes / totalVotes
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
