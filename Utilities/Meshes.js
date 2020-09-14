function findNodeInNodeMesh(node, nodeType, nodeName, connectedViaPayload, findInChildren, findInParents, findInReferenceParents) {
    /*
    This function scans a node mesh for a certain node type and 
    returns the first instance found. Please specify either nodeType
    or nodeName.
    */
    let nodeFound
    scanNodeMesh(node)
    return nodeFound

    function scanNodeMesh(startingNode) {
        if (startingNode === undefined) { return }
        if (nodeFound !== undefined) { return }

        let nodeDefinition = APP_SCHEMA_MAP.get(startingNode.type)
        if (nodeDefinition === undefined) { return }

        if (nodeType !== undefined) {
            if (startingNode.type === nodeType) {
                nodeFound = startingNode
                return
            }
        }

        if (nodeName !== undefined) {
            if (startingNode.name === nodeName) {
                nodeFound = startingNode
                return
            }
        }

        /* We scan through this node children */
        if (findInChildren === true) {
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
        }

        /* We scan parents nodes. */
        if (findInParents === true) {
            if (connectedViaPayload === true) {
                if (startingNode.payload.parentNode !== undefined) {
                    scanNodeMesh(startingNode.payload.parentNode)
                }
            } else {
                if (startingNode.parentNode !== undefined) {
                    scanNodeMesh(startingNode.parentNode)
                }
            }
        }

        /* We scan reference parents too. */
        if (findInReferenceParents === true) {
            if (connectedViaPayload === true) {
                if (startingNode.payload.referenceParent !== undefined) {
                    scanNodeMesh(startingNode.payload.referenceParent)
                }
            } else {
                if (startingNode.referenceParent !== undefined) {
                    scanNodeMesh(startingNode.referenceParent)
                }
            }
        }
    }
}