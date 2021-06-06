function newGovernanceFunctionLibraryWeights() {
    let thisObject = {
        calculateWeights: calculateWeights
    }

    return thisObject

    function calculateWeights(node) {
        let totalVotes = 0
        countVotesAndResetWeights(node)
        applyWeightCalculation(node)

        function countVotesAndResetWeights(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }

            if (node.payload.votes !== undefined) {
                totalVotes = totalVotes + node.payload.votes
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

            if (node.payload.votes !== undefined) {
                node.payload.weight = node.payload.votes / totalVotes
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
