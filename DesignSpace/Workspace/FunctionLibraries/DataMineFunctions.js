function newDataMineFunctions() {
    thisObject = {
        addMissingOutputDatasets: addMissingOutputDatasets
    }

    return thisObject

    function addMissingOutputDatasets(node, functionLibraryUiObjectsFromNodes) {

        /* Validations to see if we can do this or not. */
        if (node.payload === undefined) { return }
        if (node.payload.uiObject === undefined) { return }
        if (node.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('You need to have a parent node to execute this action.')
            return
        }
        if (node.payload.parentNode.payload === undefined) {
            node.payload.uiObject.setErrorMessage('You need to have a parent node to execute this action.')
            return
        }
        if (node.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('You need to have a grand parent node to execute this action.')
            return
        }

        /* 
        Next, we are going to scan recursively through all nodes of type Product Definition Folder
        and Product Definition. For each Product Definition Folder we will create a counterpart
        Output Dataset Folder, and for each Product Definition found we will create a Output Definition
        for each Dataset defined inside the Product Definition.
        */
        scanForProductDefinitions(node.payload.parentNode.payload.parentNode, node)

        function scanForProductDefinitions(originNode, destinationNode) {
            if (originNode === undefined) { return }
            if (destinationNode === undefined) { return }

            /* Now we go down through all the children  of the origin node, recreating at the destination node the same children structure*/
            let nodeDefinition = getNodeDefinition(originNode)
            if (nodeDefinition === undefined) { return }

            if (nodeDefinition.properties !== undefined) {
                for (let i = 0; i < nodeDefinition.properties.length; i++) {
                    let property = nodeDefinition.properties[i]

                    switch (property.name) {
                        case 'products': {
                            let originNodePropertyArray = originNode[property.name]
                             for (let m = 0; m < originNodePropertyArray.length; m++) {
                                let originProduct = originNodePropertyArray[m]
                                 for (let n = 0; n < originProduct.datasets.length; n++) {
                                    let datasetDefinition = originProduct.datasets[n]
                                    let outputDataset = functionLibraryUiObjectsFromNodes.addUIObject(destinationNode, 'Output Dataset')
                                    outputDataset.payload.referenceParent = datasetDefinition 
                                }
                            }
                            break
                        }
                        case 'productDefinitionFolders': {
                            let originNodePropertyArray = originNode[property.name]
                            let destinationNodePropertyArray = destinationNode['outputDatasetFolders']
                            for (let m = 0; m < originNodePropertyArray.length; m++) {
                                let originFolder = originNodePropertyArray[m]
                                let found = false
                                let destinationFolder
                                for (let n = 0; n < destinationNodePropertyArray.length; n++) {
                                    destinationFolder = destinationNodePropertyArray[n]
                                    if (originFolder.name === destinationFolder.name) {
                                        found = true
                                    }
                                }
                                if (found === false) {
                                    destinationFolder = functionLibraryUiObjectsFromNodes.addUIObject(destinationNode, 'Output Dataset Folder')
                                    destinationFolder.name = originFolder.name
                                }
                                scanForProductDefinitions(originFolder, destinationFolder)
                            }
                            break
                        }
                    }
                }
            }
        }
    }
}
