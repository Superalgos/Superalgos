function newSuperalgosFunctionLibraryNodePath() {
    thisObject = {
        getNodePath: getNodePath
    }

    return thisObject

    function getNodePath(node) {

        let nodePath = 'value'

        recursiveGet(node)

        return 'tradingEngine.' + nodePath

        function recursiveGet(node) {

            if (node.payload === undefined) { return }
            if (node.payload.parentNode === undefined) { return }

            let schemaDocument = getSchemaDocument(node.payload.parentNode)
            if (schemaDocument === undefined) { return }
            if (schemaDocument.childrenNodesProperties === undefined) { return }

            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                let parentProperty = node.payload.parentNode[property.name]
                if (parentProperty === undefined) { continue }

                switch (property.type) {
                    case 'node': {
                        if (parentProperty.id === node.id) {
                            /* We found it */
                            nodePath = property.name + '.' + nodePath
                            recursiveGet(node.payload.parentNode)
                        }
                    }
                        break
                    case 'array': {
                        for (let j = 0; j < parentProperty.length; j++) {
                            let arrayProperty = parentProperty[j]
                            if (arrayProperty === undefined) {continue}
                            if (arrayProperty.id === node.id) {
                                /* We found it */
                                nodePath = property.name + '[' + j + ']' + '.' + nodePath
                                recursiveGet(node.payload.parentNode)
                            }
                        }
                    }
                        break
                }
            }
        }
    }
}
