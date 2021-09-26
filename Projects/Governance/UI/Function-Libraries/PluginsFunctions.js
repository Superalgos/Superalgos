function newGovernanceFunctionLibraryPluginsFunctions() {
    let thisObject = {
        addMissingPluginUserProfiles: addMissingPluginUserProfiles,
        addMissingPluginPools: addMissingPluginPools,
        addMissingPluginAssets: addMissingPluginAssets,
        addMissingPluginFeatures: addMissingPluginFeatures,
        addMissingPluginPositions: addMissingPluginPositionss
    }
    return thisObject

    function addMissingPluginUserProfiles(node, rootNodes) {
        let projectName = UI.projects.plugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage(
                    "Config codeName must have the name of the project.",
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                return
            }
        }

        UI.projects.plugins.utilities.plugins.getPluginFileNames(projectName, 'User-Profiles', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.plugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'User-Profiles', 'User Profile', 'Governance')
        }
    }

    function addMissingPluginPools(node, rootNodes) {
        let projectName = UI.projects.plugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage(
                    "Config codeName must have the name of the project.",
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                return
            }
        }

        UI.projects.plugins.utilities.plugins.getPluginFileNames(projectName, 'Pools', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.plugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Pools', 'Pools', 'Governance')
        }
    }

    function addMissingPluginAssets(node, rootNodes) {
        let projectName = UI.projects.plugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage(
                    "Config codeName must have the name of the project.",
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                return
            }
        }

        UI.projects.plugins.utilities.plugins.getPluginFileNames(projectName, 'Assets', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.plugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Assets', 'Assets', 'Governance')
        }
    }

    function addMissingPluginFeatures(node, rootNodes) {
        let projectName = UI.projects.plugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage(
                    "Config codeName must have the name of the project.",
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                return
            }
        }

        UI.projects.plugins.utilities.plugins.getPluginFileNames(projectName, 'Features', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.plugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Features', 'Features', 'Governance')
        }
    }

    function addMissingPluginPositionss(node, rootNodes) {
        let projectName = UI.projects.plugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage(
                    "Config codeName must have the name of the project.",
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                return
            }
        }

        UI.projects.plugins.utilities.plugins.getPluginFileNames(projectName, 'Positions', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.plugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Positions', 'Positions', 'Governance')
        }
    }
}
