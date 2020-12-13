function newSuperalgosFunctionLibraryNodeDeleter() {
    thisObject = {
        deleteWorkspace: deleteWorkspace,
        deleteUIObject: deleteUIObject
    }

    return thisObject

    function destroyUiObject(node) {
        UI.projects.superalgos.spaces.floatingSpace.uiObjectConstructor.destroyUiObject(node.payload)
    }

    function deleteWorkspace(node, rootNodes) {
        if (node.rootNodes !== undefined) {
            while (node.rootNodes.length > 0) {
                let rootNode = node.rootNodes[0]
                let result = deleteUIObject(rootNode, rootNodes)
                if (result === false) { return false}
            }
        }

        completeDeletion(node, rootNodes)
        destroyUiObject(node)
        cleanNode(node)
    }

    function deleteUIObject(node, rootNodes) {

        /* First we restore the reference parent to its default state */
        if (node.payload !== undefined && node.payload.referenceParent !== undefined && node.payload.referenceParent.payload !== undefined && node.payload.referenceParent.payload.uiObject !== undefined) {
            node.payload.referenceParent.payload.uiObject.isShowing = false
        }

        let nodeDefinition = getNodeDefinition(node)
        if (nodeDefinition !== undefined) {
            /* Remove all of its own children nodes. */
            if (nodeDefinition.childrenNodesProperties !== undefined) {
                let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
                for (let i = 0; i < nodeDefinition.childrenNodesProperties.length; i++) {
                    let property = nodeDefinition.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {
                            if (property.name !== previousPropertyName) {
                                if (node[property.name] !== undefined) {
                                    let result = deleteUIObject(node[property.name], rootNodes)
                                    if (result === false) { return false}
                                }
                                previousPropertyName = property.name
                            }
                        }
                            break
                        case 'array': {
                            let nodePropertyArray = node[property.name]
                            if (nodePropertyArray !== undefined) {
                                while (nodePropertyArray.length > 0) {
                                    let result = deleteUIObject(nodePropertyArray[0], rootNodes)
                                    if (result === false) { return false}
                                }
                            }
                        }
                            break
                    }
                }
            }

            /* Remove node from parent */
            if (nodeDefinition.propertyNameAtParent !== undefined) {
                let removedFromParent = false
                if (node.payload !== undefined) {
                    if (node.payload.parentNode !== undefined) {
                        let parentNodeDefinition = getNodeDefinition(node.payload.parentNode)
                        if (parentNodeDefinition !== undefined) {
                            if (parentNodeDefinition.childrenNodesProperties !== undefined) {
                                for (let i = 0; i < parentNodeDefinition.childrenNodesProperties.length; i++) {
                                    let property = parentNodeDefinition.childrenNodesProperties[i]
                                    if (nodeDefinition.propertyNameAtParent === property.name) {
                                        switch (property.type) {
                                            case 'node': {
                                                node.payload.parentNode[property.name] = undefined
                                                removedFromParent = true
                                            }
                                                break
                                            case 'array': {
                                                let nodePropertyArray = node.payload.parentNode[property.name]
                                                if (nodePropertyArray !== undefined) {
                                                    for (let j = 0; j < nodePropertyArray.length; j++) {
                                                        let arrayItem = nodePropertyArray[j]
                                                        if (arrayItem.id === node.id) {
                                                            /* If this object is chained to the ones of the same type we need to give the next in the chain the reference to the current chain parent */
                                                            if (nodeDefinition.chainedToSameType === true) {
                                                                if (j < nodePropertyArray.length - 1) {
                                                                    let nextArrayItem = nodePropertyArray[j + 1]
                                                                    nextArrayItem.payload.chainParent = node.payload.chainParent
                                                                }
                                                            }
    
                                                            nodePropertyArray.splice(j, 1)
                                                            removedFromParent = true
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
                        if (removedFromParent === false) {
                            console.log('[ERROR] Deleting Node: ' + node.type + ' ' + node.name + '. This node could not be deleted from its parent node (' + node.payload.parentNode.type + ') because its configured propertyNameAtParent (' + nodeDefinition.propertyNameAtParent + ') does not match any of the properties of its parent.')
                            return false
                        }
                    }
                }
            }

            completeDeletion(node, rootNodes)
            destroyUiObject(node)
            cleanNode(node)
        }
    }

    function completeDeletion(node, rootNodes) {
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.id === node.id) {
                rootNodes.splice(i, 1)
                return
            }
        }
    }

    function cleanNode(node) {
        if (node === undefined) { return }
        if (node.payload === undefined) { return }

        node.payload.targetPosition.x = undefined
        node.payload.targetPosition.y = undefined
        node.payload.visible = undefined
        node.payload.subTitle = undefined
        node.payload.title = undefined
        node.payload.node = undefined
        node.payload.parentNode = undefined
        node.payload.chainParent = undefined
        node.payload.executeAction = undefined
        node.handle = undefined
        node.payload = undefined
        node.cleaned = true
    }
}
