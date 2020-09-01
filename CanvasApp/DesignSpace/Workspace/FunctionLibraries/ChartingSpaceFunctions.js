function newChartingSpaceFunctions() {
    thisObject = {
        addAllDataMineLayers: addAllDataMineLayers
    }

    return thisObject

    function addAllDataMineLayers(node, functionLibraryUiObjectsFromNodes) {

        /* Validations to see if we can do this or not. */
        if (node.payload === undefined) { return }
        if (node.payload.uiObject === undefined) { return }
        if (node.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('You need to have a reference parent node to execute this action.')
            return
        }
        if (node.payload.referenceParent.payload === undefined) {
            node.payload.uiObject.setErrorMessage('You need to have a reference parent node to execute this action.')
            return
        }

        /* 
        We are going to go through the referenced branch and recreate the structure
        we find there inside the layers manager. We will end up having at the end
        all layers referencing the data products inside the referenced branch.
        */
        let dataMine = node.payload.referenceParent
        scanBotArray(dataMine.botProducts)

        function scanBotArray(botArray) {
            for (let i = 0; i < botArray.length; i++) {
                let bot = botArray[i]
                let botLayers = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Bot Layers')
                botLayers.name = bot.name

                asymetricalFolderStructureCloning(
                    bot,
                    botLayers,
                    'dataProducts',
                    'dataProductFolders',
                    'layerFolders',
                    'Layer',
                    'Layer Folder',
                    undefined,
                    functionLibraryUiObjectsFromNodes
                )
            }
        }
    }
}
