function newSuperalgosUtilitiesMeshes() {
    thisObject = {
        findNodeInNodeMesh: findNodeInNodeMesh
    }

    return thisObject

    function findNodeInNodeMesh(node, nodeType, nodeName, connectedViaPayload, findInChildren, findInParents, findInReferenceParents) {
        /*
        This function scans a node mesh for a certain node type and 
        returns the first instance found. Please specify either nodeType
        or nodeName.
        */
        const MAX_DEPTH = 100
        let nodeFound
        scanNodeMesh(node, 0)
        return nodeFound

        function scanNodeMesh(startingNode, depth) {
            if (startingNode === undefined) { return }
            if (connectedViaPayload === true) {
                if (startingNode.payload === undefined) { return }
            }
            if (nodeFound !== undefined) { return }
            if (depth >= MAX_DEPTH) { return }

            let schemaDocument = getSchemaDocument(startingNode)
            if (schemaDocument === undefined) { return }

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
                if (schemaDocument.childrenNodesProperties !== undefined) {
                    for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                        let property = schemaDocument.childrenNodesProperties[i]

                        switch (property.type) {
                            case 'node': {
                                scanNodeMesh(startingNode[property.name], depth + 1)
                            }
                                break
                            case 'array': {
                                let startingNodePropertyArray = startingNode[property.name]
                                if (startingNodePropertyArray !== undefined) {
                                    for (let m = 0; m < startingNodePropertyArray.length; m++) {
                                        scanNodeMesh(startingNodePropertyArray[m], depth + 1)
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
                        scanNodeMesh(startingNode.payload.parentNode, depth + 1)
                    }
                } else {
                    if (startingNode.parentNode !== undefined) {
                        scanNodeMesh(startingNode.parentNode, depth + 1)
                    }
                }
            }

            /* We scan reference parents too. */
            if (findInReferenceParents === true) {
                if (connectedViaPayload === true) {
                    if (startingNode.payload.referenceParent !== undefined) {
                        scanNodeMesh(startingNode.payload.referenceParent, depth + 1)
                    }
                } else {
                    if (startingNode.referenceParent !== undefined) {
                        scanNodeMesh(startingNode.referenceParent, depth + 1)
                    }
                }
            }
        }
    }
}