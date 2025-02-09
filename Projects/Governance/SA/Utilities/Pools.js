exports.newGovernanceUtilitiesPools = function newGovernanceUtilitiesPools() {
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
            if (node.payload === undefined) { node.payload = {} }
            if (tokens !== undefined) { return }
    
            if (node.type === 'Pool') {
                if (node.config === undefined) { node.config = {} }
                let codeName = node.config.codeName
                SA.logger.info(`[findPool] Checking node: ${node.name}, codeName: ${codeName}`)
    
                if (codeName === codeNameToFind) {
                    tokens = node.payload.tokens
                    SA.logger.info(`[findPool] Found matching pool: ${node.name}, Tokens: ${tokens}`)
                }
            }
    
            // Recursivamente buscar en los nodos hijos
            let schemaDocument = SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.get(node.project + '-' + node.type)
            if (schemaDocument === undefined) { return }
    
            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]
    
                    switch (property.type) {
                        case 'node': {
                            let childNode = node[property.name]
                            findTokensAtPool(childNode, codeNameToFind)
                            break
                        }
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
