function newGovernanceFunctionLibraryPluginsFunctions() {
    let thisObject = {
        addMissingPluginUserProfiles: addMissingPluginUserProfiles,
        addSpecifiedUserProfile: addSpecifiedUserProfile,
        addMissingPluginPools: addMissingPluginPools,
        addMissingPluginAssets: addMissingPluginAssets,
        addMissingPluginFeatures: addMissingPluginFeatures,
        addMissingPluginPositions: addMissingPluginPositionss
    }
    return thisObject

    function addMissingPluginUserProfiles(node, rootNodes) {
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

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'User-Profiles', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'User-Profiles', 'User Profile', 'Governance')
        }
    }

    function addSpecifiedUserProfile(node, rootNodes) {
        let action = { node: node}

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

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'User-Profiles', onNamesArrived)

        function onNamesArrived(fileNames) {
            let eventSubscriptionId = node.payload.uiObject.container.eventHandler.listenToEvent('listSelectorClicked', onListSelect)
            node.payload.uiObject.listSelector.activate(action, fileNames, eventSubscriptionId)

            function onListSelect(event) {
                let selectedArray = []
                selectedArray.push(event.selectedNode)
                UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, selectedArray, 'User-Profiles', 'User Profile', 'Governance')
                node.payload.uiObject.container.eventHandler.stopListening('listSelectorClicked')
            }
        }
    }

    function addMissingPluginPools(node, rootNodes) {
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

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'Pools', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Pools', 'Pools', 'Governance')
        }
    }

    function addMissingPluginAssets(node, rootNodes) {
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

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'Assets', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Assets', 'Assets', 'Governance')
        }
    }

    function addMissingPluginFeatures(node, rootNodes) {
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

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'Features', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Features', 'Features', 'Governance')
        }
    }

    function addMissingPluginPositionss(node, rootNodes) {
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

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'Positions', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Positions', 'Positions', 'Governance')
        }
    }
}
