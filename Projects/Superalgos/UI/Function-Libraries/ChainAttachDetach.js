function newSuperalgosFunctionLibraryChainAttachDetach() {
    thisObject = {
        chainDetachNode: chainDetachNode,
        chainAttachNode: chainAttachNode
    }

    return thisObject

    function chainDetachNode(node, rootNodes) {
        if (node.payload.parentNode === undefined) { return }
        switch (node.type) {
            case 'Phase': {
                let payload = node.payload
                for (let i = 0; i < payload.parentNode.phases.length; i++) {
                    let phase = payload.parentNode.phases[i]
                    if (phase.id === node.id) {
                        if (i < payload.parentNode.phases.length - 1) {
                            let nextPhase = payload.parentNode.phases[i + 1]
                            if (i > 0) {
                                let previousPhase = payload.parentNode.phases[i - 1]
                                nextPhase.payload.chainParent = previousPhase
                            } else {
                                nextPhase.payload.chainParent = payload.parentNode
                            }
                        }
                        payload.parentNode.phases.splice(i, 1)
                        completeDetachment(node, rootNodes)
                        return
                    }
                }
                return
            }
            default: {
                let schemaDocument = getSchemaDocument(node)
                if (schemaDocument !== undefined) {
                    /* Detach from parent */
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
                                            }
                                                break
                                            case 'array': {
                                                let nodePropertyArray = node.payload.parentNode[property.name]
                                                if (nodePropertyArray !== undefined) {
                                                    for (let j = 0; j < nodePropertyArray.length; j++) {
                                                        let arrayItem = nodePropertyArray[j]
                                                        if (arrayItem.id === node.id) {
                                                            nodePropertyArray.splice(j, 1)
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
                    }
                    completeDetachment(node, rootNodes)
                }
            }
        }
    }

    function chainAttachNode(node, attachToNode, rootNodes) {
        switch (node.type) {

            case 'Exchange Account Key': {
                node.payload.parentNode = attachToNode
                node.payload.chainParent = attachToNode
                if (node.payload.parentNode.keys !== undefined) {
                    node.payload.parentNode.keys.push(node)
                } else {
                    node.payload.parentNode.key = node
                }
                completeAttachment(node, rootNodes)
            }
                break

            case 'Phase': {
                switch (attachToNode.type) {
                    case 'Stop': {
                        node.payload.parentNode = attachToNode
                        if (attachToNode.phases.length > 0) {
                            let phase = attachToNode.phases[attachToNode.phases.length - 1]
                            node.payload.chainParent = phase
                        } else {
                            node.payload.chainParent = attachToNode
                        }
                        attachToNode.phases.push(node)
                        completeAttachment(node, rootNodes)
                    }
                        break
                    case 'Take Profit': {
                        node.payload.parentNode = attachToNode
                        if (attachToNode.phases.length > 0) {
                            let phase = attachToNode.phases[attachToNode.phases.length - 1]
                            node.payload.chainParent = phase
                        } else {
                            node.payload.chainParent = attachToNode
                        }
                        attachToNode.phases.push(node)
                        completeAttachment(node, rootNodes)
                    }
                        break
                    case 'Initial Stop': {
                        if (attachToNode.phases.length >= 1) {
                            return
                        }

                        node.payload.parentNode = attachToNode
                        if (attachToNode.phases.length > 0) {
                            let phase = attachToNode.phases[attachToNode.phases.length - 1]
                            node.payload.chainParent = phase
                        } else {
                            node.payload.chainParent = attachToNode
                        }
                        attachToNode.phases.push(node)
                        completeAttachment(node, rootNodes)
                    }
                        break
                    case 'Initial Take Profit': {
                        if (attachToNode.phases.length >= 1) {
                            return
                        }
                        node.payload.parentNode = attachToNode
                        if (attachToNode.phases.length > 0) {
                            let phase = attachToNode.phases[attachToNode.phases.length - 1]
                            node.payload.chainParent = phase
                        } else {
                            node.payload.chainParent = attachToNode
                        }
                        attachToNode.phases.push(node)
                        completeAttachment(node, rootNodes)
                    }
                        break
                    case 'Phase': {
                        node.payload.parentNode = attachToNode.payload.parentNode
                        for (let i = 0; i < node.payload.parentNode.phases.length; i++) {
                            let phase = node.payload.parentNode.phases[i]
                            if (attachToNode.id === phase.id) {
                                if (i === node.payload.parentNode.phases.length - 1) {
                                    node.payload.chainParent = attachToNode
                                    node.payload.parentNode.phases.push(node)
                                    completeAttachment(node, rootNodes)
                                } else {
                                    node.payload.chainParent = attachToNode
                                    let nextPhase = node.payload.parentNode.phases[i + 1]
                                    nextPhase.payload.chainParent = node
                                    node.payload.parentNode.phases.splice(i + 1, 0, node)
                                    completeAttachment(node, rootNodes)
                                    return
                                }
                            }
                        }
                    }
                }
            }
                break
            default: {
                let schemaDocument = getSchemaDocument(node)
                if (schemaDocument !== undefined) {
                    node.payload.parentNode = attachToNode
                    node.payload.chainParent = attachToNode
                    /* Attach to new parent */
                    if (node.payload.parentNode !== undefined) {
                        let parentSchemaDocument = getSchemaDocument(node.payload.parentNode)
                        if (parentSchemaDocument !== undefined) {
                            if (parentSchemaDocument.childrenNodesProperties !== undefined) {
                                for (let i = 0; i < parentSchemaDocument.childrenNodesProperties.length; i++) {
                                    let property = parentSchemaDocument.childrenNodesProperties[i]
                                    if (schemaDocument.propertyNameAtParent === property.name) {
                                        switch (property.type) {
                                            case 'node': {
                                                node.payload.parentNode[property.name] = node
                                            }
                                                break
                                            case 'array': {
                                                if (node.payload.parentNode[property.name] === undefined) {
                                                    node.payload.parentNode[property.name] = []
                                                }
                                                let nodePropertyArray = node.payload.parentNode[property.name]
                                                nodePropertyArray.push(node)
                                            }
                                                break
                                        }
                                    }
                                }
                            }
                        }
                    }
                    completeAttachment(node, rootNodes)
                }
            }
        }
    }

    function completeDetachment(node, rootNodes) {
        node.payload.parentNode = undefined
        node.payload.chainParent = undefined
        rootNodes.push(node)
    }

    function completeAttachment(node, rootNodes) {
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.id === node.id) {
                rootNodes.splice(i, 1)
                return
            }
        }
    }
}
