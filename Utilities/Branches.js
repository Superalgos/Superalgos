function nodeBranchToArray(node, nodeType) {
    /*
    This function scans a node branch for a certain node type and 
    return an array of with all the nodes of that type found. 
    */
    let resultArray = []
    scanNodeBranch(node, nodeType)
    return resultArray

    function scanNodeBranch(startingNode) {
        let nodeDefinition = APP_SCHEMA_MAP.get(startingNode.type)
        if (nodeDefinition === undefined) { return }

        if (startingNode.type === nodeType) {
            resultArray.push(startingNode)
            return
        }

        if (nodeDefinition.properties === undefined) { return }
        for (let i = 0; i < nodeDefinition.properties.length; i++) {
            let property = nodeDefinition.properties[i]

            switch (property.type) {
                case 'node': {
                    scanNodeBranch(startingNode[property.name])
                }
                    break
                case 'array': {
                    let startingNodePropertyArray = startingNode[property.name]
                    for (let m = 0; m < startingNodePropertyArray.length; m++) {
                        scanNodeBranch(startingNodePropertyArray[m])
                    }
                    break
                }
            }
        }
    }
}

function findNodeInNodeBranch(node, nodeType) {
    /*
    This function scans a node branch for a certain node type and 
    returns the first instance found. 
    */
    let nodeFound
    scanNodeBranch(node, nodeType)
    return nodeFound

    function scanNodeBranch(startingNode) {
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
                        scanNodeBranch(startingNode[property.name])
                    }
                        break
                    case 'array': {
                        let startingNodePropertyArray = startingNode[property.name]
                        if (startingNodePropertyArray !== undefined) {
                            for (let m = 0; m < startingNodePropertyArray.length; m++) {
                                scanNodeBranch(startingNodePropertyArray[m])
                            }
                        }
                        break
                    }
                }
            }
        }
        /* We scan parents nodes. */
        if (startingNode.parentNode !== undefined) {
            scanNodeBranch(startingNode.parentNode)
        }
        /* We scan reference parents too. */
        if (startingNode.referenceParent !== undefined) {
            scanNodeBranch(startingNode.referenceParent)
        }
    }
}