function newSuperalgosUtilitiesBranches() {
    thisObject = {
        nodeBranchToArray: nodeBranchToArray,
        findInBranch: findInBranch
    }

    return thisObject

    function nodeBranchToArray(node, nodeType) {
        /*
        This function scans a node branch for a certain node type and 
        return an array of with all the nodes of that type found. Note that once
        a node with a matching type is found, it's children are not further scanned. 

        If nodeType is undefined, then all nodes of this branch will be returned in
        the array, including the children of the nodes added to the result array.
        */
        if (node === undefined) { return }
         let resultArray = []
        scanNodeBranch(node)
        return resultArray

        function scanNodeBranch(startingNode) {
            if (startingNode === undefined) { return }

            let schemaDocument = getSchemaDocument(startingNode)
            if (schemaDocument === undefined) { return }

            if (nodeType === undefined) {
                resultArray.push(startingNode)
            } else {
                if (startingNode.type === nodeType) {
                    resultArray.push(startingNode)
                    return
                }
            }

            if (schemaDocument.childrenNodesProperties === undefined) { return }
            let lastNodePropertyName
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]
                if (lastNodePropertyName === property.name) { continue } // Some nodes have a single property por multiple child node types. We need to check repeated properties only once so as no to duplicate results.
                switch (property.type) {
                    case 'node': {
                        scanNodeBranch(startingNode[property.name])
                        lastNodePropertyName = property.name
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

    function findInBranch(startingNode, nodeType, errorNode, connectedViaPayload, displayError) {
        /*
        This function finds a node in a brach and reports an error if it could not be found.
        */
        let nodeFound = UI.projects.superalgos.utilities.meshes.findNodeInNodeMesh(startingNode, nodeType, undefined, connectedViaPayload, true, false, false)
        if (nodeFound === undefined) {
            if (displayError === true) {
                errorNode.payload.uiObject.setErrorMessage('Could not find ' + nodeType + ' at ' + startingNode.type + ' ' + startingNode.name)
            }
            return
        } else {
            return nodeFound
        }
    }
}