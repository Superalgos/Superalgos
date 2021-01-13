function newSuperalgosFunctionLibraryNodeCloning() {
    const MODULE_NAME = 'Node Cloning'
    const ERROR_LOG = true
    const logger = newWebDebugLog()
    

    thisObject = {
        getNodeClone: getNodeClone
    }
    return thisObject

    function getNodeClone(node) {
        let idConversionMap = new Map()

        let inmatureClone = cloneNode(node)
        let matureClone = redirectReferenceParents(inmatureClone)

        return matureClone

        function cloneNode(node) {
            if (node === undefined) { return }
            let schemaDocument = getSchemaDocument(node)
            if (schemaDocument !== undefined) {
                let object = {
                    type: node.type,
                    name: node.name,
                    code: node.code,
                    config: node.config,
                    project: node.project
                }

                /* Children Nodes */
                if (schemaDocument.childrenNodesProperties !== undefined) {
                    let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
                    for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                        let property = schemaDocument.childrenNodesProperties[i]

                        switch (property.type) {
                            case 'node': {
                                if (property.name !== previousPropertyName) {
                                    if (node[property.name] !== undefined) {
                                        object[property.name] = cloneNode(node[property.name])
                                    }
                                    previousPropertyName = property.name
                                }
                                break
                            }
                            case 'array': {
                                if (node[property.name] !== undefined) {
                                    let nodePropertyArray = node[property.name]
                                    object[property.name] = []
                                    for (let m = 0; m < nodePropertyArray.length; m++) {
                                        let protocolNode = cloneNode(nodePropertyArray[m])
                                        if (protocolNode !== undefined) {
                                            object[property.name].push(protocolNode)
                                        }
                                    }
                                }
                                break
                            }
                        }
                    }
                }

                object.id = newUniqueId()
                idConversionMap.set(node.id, object.id)

                object.savedPayload = getSavedPayload(node)

                return object
            }
        }

        function redirectReferenceParents(node) {
            if (node === undefined) { return }
            let schemaDocument = getSchemaDocument(node)
            if (schemaDocument !== undefined) {
                let object = {
                    type: node.type,
                    name: node.name,
                    code: node.code,
                    config: node.config,
                    project: node.project
                }

                /* Children Nodes */
                if (schemaDocument.childrenNodesProperties !== undefined) {
                    let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
                    for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                        let property = schemaDocument.childrenNodesProperties[i]

                        switch (property.type) {
                            case 'node': {
                                if (property.name !== previousPropertyName) {
                                    if (node[property.name] !== undefined) {
                                        object[property.name] = redirectReferenceParents(node[property.name])
                                    }
                                    previousPropertyName = property.name
                                }
                                break
                            }
                            case 'array': {
                                if (node[property.name] !== undefined) {
                                    let nodePropertyArray = node[property.name]
                                    object[property.name] = []
                                    for (let m = 0; m < nodePropertyArray.length; m++) {
                                        let protocolNode = redirectReferenceParents(nodePropertyArray[m])
                                        if (protocolNode !== undefined) {
                                            object[property.name].push(protocolNode)
                                        }
                                    }
                                }
                                break
                            }
                        }
                    }
                }

                object.id = node.id

                object.savedPayload = node.savedPayload

                if (object.savedPayload !== undefined) {
                    if (object.savedPayload.referenceParent !== undefined) {
                        let newId = idConversionMap.get(object.savedPayload.referenceParent.id)
                        if (newId !== undefined) {
                            object.savedPayload.referenceParent.id = newId
                        }
                    }
                }

                return object
            }
        }
    }

    function getSavedPayload(node) {
        if (node.payload === undefined) { return }
        let savedPayload = {
            position: {
                x: node.payload.position.x,
                y: node.payload.position.y
            },
            targetPosition: {
                x: node.payload.targetPosition.x,
                y: node.payload.targetPosition.y
            },
            floatingObject: {
                isPinned: node.payload.floatingObject.isPinned,
                isFrozen: (node.payload.floatingObject.isFrozen && node.payload.floatingObject.frozenManually),
                isCollapsed: (node.payload.floatingObject.isCollapsed && node.payload.floatingObject.collapsedManually),
                angleToParent: (node.payload.floatingObject.angleToParent),
                distanceToParent: (node.payload.floatingObject.distanceToParent),
                arrangementStyle: (node.payload.floatingObject.arrangementStyle)
            },
            uiObject: {
                isPlaying: node.payload.uiObject.isPlaying,
                isRunning: node.payload.uiObject.isRunning,
                shortcutKey: node.payload.uiObject.shortcutKey
            }
        }

        /* Next for the ones that have a reference parent, we include it */
        if (node.payload.referenceParent !== undefined) {
            savedPayload.referenceParent = {
                type: node.payload.referenceParent.type,
                name: node.payload.referenceParent.name,
                id: node.payload.referenceParent.id
            }
        } else {
            /* The referenceParent property can be inherited from the previous saved payload. */
            if (node.savedPayload !== undefined) {
                savedPayload.referenceParent = node.savedPayload.referenceParent
            }
        }

        return savedPayload
    }
}
