function newDataMineFunctions() {
    thisObject = {
        addAllOutputDatasets: addAllOutputDatasets
    }

    return thisObject

    function addAllOutputDatasets(node, functionLibraryUiObjectsFromNodes) {

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
        asymetricalFolderStructureCloning(
            node.payload.parentNode.payload.parentNode,
            node,
            'products',
            'productDefinitionFolders',
            'outputDatasetFolders',
            'Output Dataset',
            'Output Dataset Folder',
            'datasets',
            functionLibraryUiObjectsFromNodes
        )
    }
}
