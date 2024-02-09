function newGovernanceUtilitiesPools() {
    let thisObject = {
        findPool: findPool
    }

    return thisObject

    function findPool(node, codeNameToFind) {

        let tokens = undefined
        findTokensAtPool(node, codeNameToFind)

        return tokens

        function findTokensAtPool(node, codeNameToFind) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }
            if (tokens !== undefined) { return }
            /*
            This function allows us to find a Pool within a Pool hierarchy that 
            has a give codeName config property.
            */
            if (
                node.type === 'Pool'
            ) {
                let codeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'codeName')
                if (codeName === codeNameToFind) {
                    tokens = node.payload.tokens
                }
            }
            let schemaDocument = getSchemaDocument(node)
            if (schemaDocument === undefined) { return }

            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {
                            let childNode = node[property.name]
                            findTokensAtPool(childNode, codeNameToFind)
                        }
                            break
                        case 'array': {
                            let propertyArray = node[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m]
                                    findTokensAtPool(childNode, codeNameToFind)
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

exports.newGovernanceUtilitiesPools = newGovernanceUtilitiesPools