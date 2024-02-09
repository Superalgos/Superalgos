function newNetworkFunctionLibraryPluginsFunctions() {
    let thisObject = {
        addSpecifiedP2PNetwork: addSpecifiedP2PNetwork
    }
    return thisObject
    
    function addSpecifiedP2PNetwork(node, rootNodes) {
        let action = { node: node }

        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage(
                    "Config codeName must have the name of the project.",
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                )
                return
            }
        }

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'P2P-Networks', onNamesArrived)

        function onNamesArrived(fileNames) {
            let eventSubscriptionId = node.payload.uiObject.container.eventHandler.listenToEvent('listSelectorClicked', onListSelect)
            node.payload.uiObject.listSelector.activate(action, fileNames, eventSubscriptionId)

            function onListSelect(event) {
                let selectedArray = []
                selectedArray.push(event.selectedNode)
                UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, selectedArray, 'P2P-Networks', 'P2P Network', 'Network')
                node.payload.uiObject.container.eventHandler.stopListening('listSelectorClicked')
            }
        }
    }
}
