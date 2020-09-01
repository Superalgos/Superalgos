function findNodeInNodeMesh(node, nodeType) {
    /*
    This function scans a node mesh for a certain node type and 
    returns the first instance found. 
    */
    let nodeFound
    scanNodeMesh(node, nodeType)
    return nodeFound

    function scanNodeMesh(startingNode) {
        if (startingNode === undefined) { return }
        if (nodeFound !== undefined) { return }

        let nodeDefinition = APP_SCHEMA_MAP.get(startingNode.type)
        if (nodeDefinition === undefined) { return }

        if (startingNode.type === nodeType) {
            nodeFound = startingNode
            return
        }

        /* We scan through this node children */
        if (nodeDefinition.properties !== undefined) {
            for (let i = 0; i < nodeDefinition.properties.length; i++) {
                let property = nodeDefinition.properties[i]

                switch (property.type) {
                    case 'node': {
                        scanNodeMesh(startingNode[property.name])
                    }
                        break
                    case 'array': {
                        let startingNodePropertyArray = startingNode[property.name]
                        if (startingNodePropertyArray !== undefined) {
                            for (let m = 0; m < startingNodePropertyArray.length; m++) {
                                scanNodeMesh(startingNodePropertyArray[m])
                            }
                        }
                        break
                    }
                }
            }
        }
        /* We scan parents nodes. */
        if (startingNode.parentNode !== undefined) {
            scanNodeMesh(startingNode.parentNode)
        }
        /* We scan reference parents too. */
        if (startingNode.referenceParent !== undefined) {
            scanNodeMesh(startingNode.referenceParent)
        }
    }
}