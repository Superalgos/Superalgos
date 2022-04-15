function newGovernanceNodeActionFunctionsVotes() {
    let thisObject = {
        installMissingVotes: installMissingVotes
    }
    const MAX_GENERATIONS = 3

    return thisObject

    function installMissingVotes(node, rootNodes) {
        if (node.payload === undefined) { return }

        let newUiObjects = []
        if (node.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage(
                'To install votes you need a Reference Parent',
                UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
            )
            return
        }
        scanNodeBranch(node, node.payload.referenceParent)

        return newUiObjects

        function scanNodeBranch(originNode, destinationNode) {
            if (
                destinationNode.type === 'Pool' ||
                destinationNode.type === 'Asset' ||
                destinationNode.type === 'Feature' ||
                destinationNode.type === 'Position'
            ) {
                originNode.name = destinationNode.name + ' ' + destinationNode.type + ' ' + ' Vote'
            } else {
                originNode.name = destinationNode.name
            }

            let schemaDocument = getSchemaDocument(destinationNode)
            if (schemaDocument === undefined) { return }

            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {

                            let destinationNodeChild = destinationNode[property.name]

                            let originNodeChildType = getOriginNodeChildType(destinationNodeChild)
                            let originNodeChild = UI.projects.visualScripting.utilities.nodeChildren.findChildReferencingThisNode(originNode, destinationNodeChild)

                            if (originNodeChild === undefined) {
                                originNodeChild = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(originNode, originNodeChildType)
                                if (originNodeChild !== undefined && originNodeChild.payload.parentNode === node) {
                                    newUiObjects.push(originNodeChild)
                                }
                            }
                            UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(originNodeChild, destinationNodeChild)
                            scanNodeBranch(originNodeChild, destinationNodeChild)
                        }
                            break
                        case 'array': {
                            let propertyArray = destinationNode[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {

                                    let destinationNodeChild = propertyArray[m]

                                    let originNodeChildType = getOriginNodeChildType(destinationNodeChild)
                                    let originNodeChild = UI.projects.visualScripting.utilities.nodeChildren.findChildReferencingThisNode(originNode, destinationNodeChild)

                                    if (originNodeChild === undefined) {
                                        originNodeChild = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(originNode, originNodeChildType)
                                        if (originNodeChild !== undefined && originNodeChild.payload.parentNode === node) {
                                            newUiObjects.push(originNodeChild)
                                        }
                                    }
                                    UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(originNodeChild, destinationNodeChild)
                                    scanNodeBranch(originNodeChild, destinationNodeChild)
                                }
                            }
                            break
                        }
                    }
                }
            }
        }

        function getOriginNodeChildType(destinationNode) {
            let originNodeType

            switch (destinationNode.type) {
                case 'Pool Class': {
                    originNodeType = 'Weight Votes Switch'
                    break
                }
                case 'Asset Class': {
                    originNodeType = 'Weight Votes Switch'
                    break
                }
                case 'Feature Class': {
                    originNodeType = 'Weight Votes Switch'
                    break
                }
                case 'Position Class': {
                    originNodeType = 'Weight Votes Switch'
                    break
                }
                case 'Pool': {
                    originNodeType = 'Pool Weight Vote'
                    break
                }
                case 'Asset': {
                    originNodeType = 'Asset Weight Vote'
                    break
                }
                case 'Feature': {
                    originNodeType = 'Feature Weight Vote'
                    break
                }
                case 'Position': {
                    originNodeType = 'Position Weight Vote'
                    break
                }
                case 'Asset Claims Folder': {
                    originNodeType = 'Claim Votes Switch'
                    break
                }
                case 'Asset Contribution Claim': {
                    originNodeType = 'Asset Claim Vote'
                    break
                }
                case 'Feature Claims Folder': {
                    originNodeType = 'Claim Votes Switch'
                    break
                }
                case 'Feature Contribution Claim': {
                    originNodeType = 'Feature Claim Vote'
                    break
                }
                case 'Position Claims Folder': {
                    originNodeType = 'Claim Votes Switch'
                    break
                }
                case 'Position Contribution Claim': {
                    originNodeType = 'Position Claim Vote'
                    break
                }
            }
            return originNodeType
        }
    }
}