function newSuperalgosFunctionLibraryProtocolNode() {
    const MODULE_NAME = 'Protocol Node'
    const ERROR_LOG = true
    const logger = newWebDebugLog()
    

    thisObject = {
        getProtocolNode: getProtocolNode
    }
    return thisObject

    function getProtocolNode(node, removePersonalData, parseConfig, includeIds, includePayload, includeReferencesInSavedPayload, lightingPath) {
        if (node === undefined) { return }
        if (node.payload === undefined) { return }

        let schemaDocument = getSchemaDocument(node)
        if (schemaDocument !== undefined) {
            if (removePersonalData === true && schemaDocument.isPersonalData === true) { return }
            let object = {
                type: node.type,
                name: node.name,
                code: node.code,
                config: node.config,
                project: node.project
            }

            /* Children Nodes */
            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {
                            if (node[property.name] !== undefined) {
                                if (lightingPath === undefined) {
                                    object[property.name] = getProtocolNode(node[property.name], removePersonalData, parseConfig, includeIds, includeReferencesInSavedPayload, includePayload)
                                } else {
                                    let newLightingPath = getNewLightingPath(lightingPath, node.type, property.childType)
                                    if (newLightingPath !== undefined) {
                                        object[property.name] = getProtocolNode(node[property.name], removePersonalData, parseConfig, includeIds, includePayload, includeReferencesInSavedPayload, newLightingPath)
                                    }
                                }
                            }
                            break
                        }
                        case 'array': {
                            if (node[property.name] !== undefined) {
                                if (lightingPath === undefined) {
                                    let nodePropertyArray = node[property.name]
                                    object[property.name] = []
                                    for (let m = 0; m < nodePropertyArray.length; m++) {
                                        let protocolNode = getProtocolNode(nodePropertyArray[m], removePersonalData, parseConfig, includeIds, includeReferencesInSavedPayload, includePayload)
                                        if (protocolNode !== undefined) {
                                            object[property.name].push(protocolNode)
                                        }
                                    }
                                } else {
                                    let newLightingPath = getNewLightingPath(lightingPath, node.type, property.childType)
                                    if (newLightingPath !== undefined) {
                                        let nodePropertyArray = node[property.name]
                                        object[property.name] = []
                                        for (let m = 0; m < nodePropertyArray.length; m++) {
                                            let protocolNode = getProtocolNode(nodePropertyArray[m], removePersonalData, parseConfig, includeIds, includePayload, includeReferencesInSavedPayload, newLightingPath)
                                            if (protocolNode !== undefined) {
                                                object[property.name].push(protocolNode)
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

            /* Parent Nodes */
            if (node.payload.parentNode !== undefined) {
                let newLightingPath = getNewLightingPath(lightingPath, node.type, node.payload.parentNode.type)
                if (newLightingPath !== undefined) {
                    object.parentNode = getProtocolNode(node.payload.parentNode, removePersonalData, parseConfig, includeIds, includePayload, includeReferencesInSavedPayload, newLightingPath)
                } else {
                    let newLightingPath = getNewLightingPath(lightingPath, node.type, node.payload.parentNode.type)
                }
            }
            if (node.payload.referenceParent !== undefined) {
                let newLightingPath = getNewLightingPath(lightingPath, node.type, node.payload.referenceParent.type)
                if (newLightingPath !== undefined) {
                    object.referenceParent = getProtocolNode(node.payload.referenceParent, removePersonalData, parseConfig, includeIds, includePayload, includeReferencesInSavedPayload, newLightingPath)
                }
            }

            if (parseConfig && object.config !== undefined && schemaDocument.editors !== undefined) {
                if (schemaDocument.editors.config === true) {
                    try {
                        object.config = JSON.parse(node.config)
                    } catch (err) {
                        if (ERROR_LOG === true) { logger.write('[ERROR] getProtocolNode -> default -> err = ' + err.stack) }
                        if (ERROR_LOG === true) { logger.write('[ERROR] getProtocolNode -> default -> node.type = ' + node.type) }
                        if (ERROR_LOG === true) { logger.write('[ERROR] getProtocolNode -> default -> node.name = ' + node.name) }
                        if (ERROR_LOG === true) { logger.write('[ERROR] getProtocolNode -> default -> node.config = ' + node.config) }
                        if (ERROR_LOG === true) { logger.write('[ERROR] getProtocolNode -> default -> node.id = ' + node.id) }
                    }
                }
            }

            if (includeIds) {
                object.id = node.id
            }
            if (includePayload) {
                object.savedPayload = getSavedPayload(node, includeReferencesInSavedPayload)
            }

            return object
        }
    }

    function getNewLightingPath(lightingPath, currentNodeType, nextNodeType) {
        if (lightingPath === undefined) { return }

        if (currentNodeType === undefined) { return }
        if (nextNodeType === undefined) { return }

        let currentNodePosition = lightingPath.indexOf('->' + currentNodeType + '->')
        let nextNodePosition = lightingPath.indexOf('->' + nextNodeType + '->')

        /* 
        In some situations, the current and next node are of the same type.
        When that happens, we need to search for the second instance of that type
        at the lighting path.
        */
        if (currentNodeType === nextNodeType) {
            let tempLightingPath = lightingPath.substring(currentNodePosition + currentNodeType.length, lightingPath.length + 1)
            nextNodePosition = tempLightingPath.indexOf('->' + nextNodeType + '->')
        }

        let newLightingPath = lightingPath.substring(nextNodePosition, lightingPath.length + 1)

        if (nextNodePosition > currentNodePosition) {
            return newLightingPath
        } else {
            return
        }
    }

    function getSavedPayload(node, includeReferencesInSavedPayload) {
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

        if (node.payload.frame !== undefined) {
            savedPayload.frame = {
                position: {
                    x: node.payload.frame.position.x,
                    y: node.payload.frame.position.y
                },
                width: node.payload.frame.width,
                height: node.payload.frame.height,
                radius: node.payload.frame.radius
            }
        }

        if (node.payload.tutorial !== undefined) {
            savedPayload.tutorial = {
                status: node.payload.tutorial.status
            }
        }

        if (includeReferencesInSavedPayload) {
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
        }
        return savedPayload
    }
}
