function isMissingChildren(startingNode, checkNode, checkReferenceParent) {
    /*
    This functioin scan all the children of a node and returns true or false
    depending if the checkNode is a missing children. 
    */
    if (startingNode === undefined) { return }
    if (checkNode === undefined) { return }

    let nodeDefinition = APP_SCHEMA_MAP.get(startingNode.type)
    if (nodeDefinition === undefined) { return }

    /* We scan through this node children */
    if (nodeDefinition.properties !== undefined) {
        for (let i = 0; i < nodeDefinition.properties.length; i++) {
            let property = nodeDefinition.properties[i]

            switch (property.type) {
                case 'node': {
                    let child = startingNode[property.name]
                    if (checkReferenceParent !== true) {
                        if (child.id === checkNode.id) {
                            return false
                        }
                    } else {
                        if (child.payload !== undefined) {
                            if (child.payload.referenceParent !== undefined) {
                                if (child.payload.referenceParent.id === checkNode.id) {
                                    return false
                                }
                            }
                        }
                    }
                }
                    break
                case 'array': {
                    let startingNodePropertyArray = startingNode[property.name]
                    if (startingNodePropertyArray !== undefined) {
                        for (let m = 0; m < startingNodePropertyArray.length; m++) {
                            let arrayItem = startingNodePropertyArray[m]
                            if (checkReferenceParent !== true) {
                                if (arrayItem.id === checkNode.id) {
                                    return false
                                }
                            } else {
                                if (arrayItem.payload !== undefined) {
                                    if (arrayItem.payload.referenceParent !== undefined) {
                                        if (arrayItem.payload.referenceParent.id === checkNode.id) {
                                            return false
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break
                }
            }
        }
        return true
    }
}