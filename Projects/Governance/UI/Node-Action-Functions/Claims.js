function newGovernanceNodeActionFunctionsClaims() {
    let thisObject = {
        installMissingClaims: installMissingClaims
    }

    return thisObject

    function installMissingClaims(node, rootNodes) {
        if (node.payload === undefined) { return }
        if (node.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage(
                'To Install Missing Claims you need a Reference Parent',
                UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
            )
            return
        }
        scanNodeBranch(node, node.payload.referenceParent)

        function scanNodeBranch(originNode, destinationNode) {
            if (
                destinationNode.type === 'Asset' ||
                destinationNode.type === 'Feature' ||
                destinationNode.type === 'Position'
            ) {
                originNode.name = destinationNode.name + ' ' + destinationNode.type + ' ' + ' Claim'
            } else {
                originNode.name = destinationNode.name + ' ' + destinationNode.type
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
                case 'Asset Class': {
                    originNodeType = 'Asset Claims Folder'
                    break
                }
                case 'Feature Class': {
                    originNodeType = 'Feature Claims Folder'
                    break
                }
                case 'Position Class': {
                    originNodeType = 'Position Claims Folder'
                    break
                }
                case 'Asset': {
                    originNodeType = 'Asset Contribution Claim'
                    break
                }
                case 'Feature': {
                    originNodeType = 'Feature Contribution Claim'
                    break
                }
                case 'Position': {
                    originNodeType = 'Position Contribution Claim'
                    break
                }
            }
            return originNodeType
        }
    }
}