function newVisualScriptingFunctionLibraryNodeDeleter() {
    let thisObject = {
        deleteWorkspace: deleteWorkspace,
        deleteUIObject: deleteUIObject,
        unDeleteUIObject: unDeleteUIObject
    }

    return thisObject

    function destroyUiObject(node) {
        UI.projects.foundations.spaces.floatingSpace.uiObjectConstructor.destroyUiObject(node.payload)
    }

    function deleteWorkspace(node, rootNodes, callBackFuntion) {
        if (node.rootNodes !== undefined) {

            let totalDeleted = 0
            let totalToBeDeleted = node.rootNodes.length

            for (let i = 0; i < node.rootNodes.length; i++) {
                let rootNode = node.rootNodes[i]
                setTimeout(deleteRootNode, 100, rootNode)
            }

            function deleteRootNode(rootNode) {
                let result = deleteUIObject(rootNode, rootNodes)
                if (result === false) {
                    return false
                } else {
                    totalDeleted++
                    if (totalDeleted === totalToBeDeleted) {
                        finish()
                    }
                }
            }
        }

        function finish() {
            completeDeletion(node, rootNodes)
            destroyUiObject(node)
            cleanNode(node)
            callBackFuntion()
        }
    }

    async function deleteUIObject(node, rootNodes) {

        /* First we restore the reference parent to its default state */
        if (node.payload !== undefined && node.payload.referenceParent !== undefined) {
            if (node.payload.referenceParent.payload !== undefined && node.payload.referenceParent.payload.uiObject !== undefined) {
                node.payload.referenceParent.payload.uiObject.isShowing = false
                node.payload.referenceParent.payload.referenceChildren.delete(node.id)
            }
        }

        let schemaDocument = getSchemaDocument(node)
        if (schemaDocument !== undefined) {
            /* Remove all of its own children nodes. */
            if (schemaDocument.childrenNodesProperties !== undefined) {
                let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoid counting each property of those as individual children.
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {
                            if (property.name !== previousPropertyName) {
                                if (node[property.name] !== undefined) {
                                    let result = deleteUIObject(node[property.name], rootNodes)
                                    if (result === false) { return false }
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
                                    if (result === false) { return false }
                                }
                            }
                        }
                            break
                    }
                }
            }

            /* Remove node from parent */
            if (schemaDocument.propertyNameAtParent !== undefined) {
                let removedFromParent = false
                if (node.payload !== undefined) {
                    if (node.payload.parentNode !== undefined) {
                        let parentSchemaDocument = getSchemaDocument(node.payload.parentNode)
                        if (parentSchemaDocument !== undefined) {
                            if (parentSchemaDocument.childrenNodesProperties !== undefined) {
                                for (let i = 0; i < parentSchemaDocument.childrenNodesProperties.length; i++) {
                                    let property = parentSchemaDocument.childrenNodesProperties[i]
                                    if (schemaDocument.propertyNameAtParent === property.name) {
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
                                                            if (schemaDocument.chainedToSameType === true) {
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
                            console.log('[ERROR] Deleting Node: ' + node.type + ' ' + node.name + '. This node could not be deleted from its parent node (' + node.payload.parentNode.type + ') because its configured propertyNameAtParent (' + schemaDocument.propertyNameAtParent + ') does not match any of the properties of its parent.')
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
        node.payload.title = undefined
        node.payload.node = undefined
        node.payload.parentNode = undefined
        node.payload.chainParent = undefined
        node.payload.executeAction = undefined
        node.handle = undefined
        node.payload = undefined
        node.cleaned = true
    }

    async function unDeleteUIObject(nodeClone, parentNode, chainParent, rootNodes) {
        let project = nodeClone.project
        let schemaDocument = getSchemaDocument(nodeClone, project)

        await UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.createUiObjectFromNode(nodeClone, parentNode, chainParent)

        /* if root node, register in rootNodes array */
        if (schemaDocument.isHierarchyHead === true || schemaDocument.isProjectHead === true) {
            rootNodes.push(nodeClone)
        }

        /* register at parent */
        if (parentNode !== undefined && schemaDocument.isProjectHead !== true) {
            let childName
            let parentSchemaDocument = getSchemaDocument(parentNode, parentNode.project)
            for (let property of parentSchemaDocument.childrenNodesProperties) {
                childName = (property.childType === nodeClone.type) ? property.name : undefined
                switch (property.type) {
                    case 'node': {
                        if (childName !== undefined) {
                            parentNode[childName] = nodeClone
                        }
                    }
                        break
                    case 'array': {
                        if (childName !== undefined) {
                            parentNode[schemaDocument.propertyNameAtParent].push(nodeClone)
                        }
                    }
                        break
                }
            }
        }

        /* recreate references */
        await UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.tryToConnectChildrenWithReferenceParents(nodeClone)
        UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.registerReferenceParentAtReferenceChildren(nodeClone)
    }
}
