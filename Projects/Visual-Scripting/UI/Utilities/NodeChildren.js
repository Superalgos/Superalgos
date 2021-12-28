function newVisualScriptingUtilitiesNodeChildren() {
    let thisObject = {
        isMissingChildrenById: isMissingChildrenById,
        isMissingChildrenByType: isMissingChildrenByType,
        findChildReferencingThisNode: findChildReferencingThisNode,
        findChildByType: findChildByType,
        findChildByCodeName: findChildByCodeName,
        findOrCreateChildWithReference: findOrCreateChildWithReference,
        findAndRecreateChildWithReference: findAndRecreateChildWithReference,
        findChildIndexAtParentNode: findChildIndexAtParentNode,
        isMissingChildrenByName: isMissingChildrenByName
    }

    return thisObject

    function isMissingChildrenById(startingNode, checkNode, checkReferenceParent) {
        /*
        This function scan all the children of a node and returns true or false
        depending if the checkNode is a missing children. 
        */
        if (startingNode === undefined) { return }
        if (checkNode === undefined) { return }

        let schemaDocument = getSchemaDocument(startingNode)
        if (schemaDocument === undefined) { return }

        /* We scan through this node children */
        if (schemaDocument.childrenNodesProperties !== undefined) {
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        let child = startingNode[property.name]
                        if (child === undefined) { continue }
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

    function isMissingChildrenByName(startingNode, nodeName) {
        /*
        This function scan all the children of a node and returns true or false
        depending if the node has a children with a certain name.  
        */
        if (startingNode === undefined) { return }

        let schemaDocument = getSchemaDocument(startingNode)
        if (schemaDocument === undefined) { return }

        /* We scan through this node children */
        if (schemaDocument.childrenNodesProperties !== undefined) {
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        let child = startingNode[property.name]
                        if (child !== undefined) {
                            if (child.name === nodeName) {
                                return false
                            }
                        }
                    }
                        break
                    case 'array': {
                        let startingNodePropertyArray = startingNode[property.name]
                        if (startingNodePropertyArray !== undefined) {
                            for (let m = 0; m < startingNodePropertyArray.length; m++) {
                                let arrayItem = startingNodePropertyArray[m]
                                if (arrayItem.name === nodeName) {
                                    return false
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

    function isMissingChildrenByType(startingNode, nodeType) {
        /*
        This function scan all the children of a node and returns true or false
        depending if the node has a children with a certain type.  
        */
        if (startingNode === undefined) { return }

        let schemaDocument = getSchemaDocument(startingNode)
        if (schemaDocument === undefined) { return }

        /* We scan through this node children */
        if (schemaDocument.childrenNodesProperties !== undefined) {
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        let child = startingNode[property.name]
                        if (child !== undefined) {
                            if (child.type === nodeType) {
                                return false
                            }
                        }
                    }
                        break
                    case 'array': {
                        let startingNodePropertyArray = startingNode[property.name]
                        if (startingNodePropertyArray !== undefined) {
                            for (let m = 0; m < startingNodePropertyArray.length; m++) {
                                let arrayItem = startingNodePropertyArray[m]
                                if (arrayItem.type === nodeType) {
                                    return false
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

    function findChildReferencingThisNode(startingNode, checkNode) {
        /*
        This function scan all the children of a node and returns the child
        that is referencing the checkNode. 
        */
        if (startingNode === undefined) { return }
        if (checkNode === undefined) { return }

        let schemaDocument = getSchemaDocument(startingNode)
        if (schemaDocument === undefined) { return }

        /* We scan through this node children */
        if (schemaDocument.childrenNodesProperties !== undefined) {
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        let child = startingNode[property.name]
                        if (child === undefined) { continue }
                        if (child.payload !== undefined) {
                            if (child.payload.referenceParent !== undefined) {
                                if (child.payload.referenceParent.id === checkNode.id) {
                                    return child
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

                                if (arrayItem.payload !== undefined) {
                                    if (arrayItem.payload.referenceParent !== undefined) {
                                        if (arrayItem.payload.referenceParent.id === checkNode.id) {
                                            return arrayItem
                                        }
                                    }
                                }
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function findChildByType(startingNode, nodeType) {
        /*
        This function scan all the children of a node and returns the child
        that has a type  as specified via parameter.
        */
        if (startingNode === undefined) { return }
        if (nodeType === undefined) { return }

        let schemaDocument = getSchemaDocument(startingNode)
        if (schemaDocument === undefined) { return }

        /* We scan through this node children */
        if (schemaDocument.childrenNodesProperties !== undefined) {
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        let child = startingNode[property.name]
                        if (child === undefined) { continue }
                        if (child.payload !== undefined) {
                            if (child.type === nodeType) {
                                return child
                            }
                        }
                    }
                        break
                    case 'array': {
                        let startingNodePropertyArray = startingNode[property.name]
                        if (startingNodePropertyArray !== undefined) {
                            for (let m = 0; m < startingNodePropertyArray.length; m++) {
                                let arrayItem = startingNodePropertyArray[m]

                                if (arrayItem.payload !== undefined) {
                                    if (arrayItem.type === nodeType) {
                                        return arrayItem
                                    }
                                }
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function findChildByCodeName(startingNode, checkCodeName) {
        /*
        This function scan all the children of a node and returns the child
        that has a codeName as specified via parameter.
        */
        if (startingNode === undefined) { return }
        if (checkCodeName === undefined) { return }

        let schemaDocument = getSchemaDocument(startingNode)
        if (schemaDocument === undefined) { return }

        /* We scan through this node children */
        if (schemaDocument.childrenNodesProperties !== undefined) {
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        let child = startingNode[property.name]
                        if (child === undefined) { continue }
                        if (child.payload !== undefined) {
                            let codeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(child.payload, 'codeName')
                            if (codeName !== undefined) {
                                if (codeName === checkCodeName) {
                                    return child
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

                                if (arrayItem.payload !== undefined) {
                                    let codeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(arrayItem.payload, 'codeName')
                                    if (codeName !== undefined) {
                                        if (codeName === checkCodeName) {
                                            return arrayItem
                                        }
                                    }
                                }
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function findOrCreateChildWithReference(startingNode, childType, referencedNode) {
        /*
        This function find the child node of starting node that references
        referenced node. If there is none, then it creates a child and establish
        the reference.
        */
        let child
        if (isMissingChildrenById(startingNode, referencedNode, true) === true) {
            child = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(startingNode, childType)
            UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(child, referencedNode)
        } else {
            child = findChildReferencingThisNode(startingNode, referencedNode)
        }
        return child
    }

    function findAndRecreateChildWithReference(startingNode, childType, referencedNode, rootNodes) {
        /* 
        This function finds the child of the starting node that references
        the reference node and if found it deletes it. Existing or not
        it creates it again with the child type specified.
        */
        let child
        child = findChildReferencingThisNode(startingNode, referencedNode)
        if (child !== undefined) {
            UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(child, rootNodes)
        }
        child = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(startingNode, childType)
        UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(child, referencedNode)
        return child
    }

    function findChildIndexAtParentNode(startingNode) {
        /*
        This function scan all the children of a node's parent and returns the child
        index at the node property array that contains it. 
        */
        if (startingNode === undefined) { return }
        if (startingNode.payload === undefined) { return }
        if (startingNode.payload.parentNode === undefined) { return }

        let parentNode = startingNode.payload.parentNode

        let schemaDocument = getSchemaDocument(parentNode)
        if (schemaDocument === undefined) { return }

        /* We scan through this parent node children */
        if (schemaDocument.childrenNodesProperties !== undefined) {
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        /* We ignore these types of children. */
                    }
                        break
                    case 'array': {
                        let startingNodePropertyArray = parentNode[property.name]
                        if (startingNodePropertyArray !== undefined) {
                            for (let m = 0; m < startingNodePropertyArray.length; m++) {
                                let arrayItem = startingNodePropertyArray[m]

                                if (arrayItem.id === startingNode.id) {
                                    return m
                                }
                            }
                        }
                        break
                    }
                }
            }
        }
    }

}