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
        let projectName = UI.projects.foundations.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.foundations.utilities.plugins.getPluginFileNames(projectName, 'User-Profiles', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.foundations.utilities.plugins.addPluginFileIfNeeded(node, fileNames, 'User-Profiles', 'User Profile')
        }
    }

    function addMissingPluginPools(node, rootNodes) {
        let projectName = UI.projects.foundations.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.foundations.utilities.plugins.getPluginFileNames(projectName, 'Pools', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.foundations.utilities.plugins.addPluginFileIfNeeded(node, fileNames, 'Pools', 'Pools')
        }
    }

    function addMissingPluginAssets(node, rootNodes) {
        let projectName = UI.projects.foundations.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.foundations.utilities.plugins.getPluginFileNames(projectName, 'Assets', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.foundations.utilities.plugins.addPluginFileIfNeeded(node, fileNames, 'Assets', 'Assets')
        }
    }

    function addMissingPluginFeatures(node, rootNodes) {
        let projectName = UI.projects.foundations.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.foundations.utilities.plugins.getPluginFileNames(projectName, 'Features', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.foundations.utilities.plugins.addPluginFileIfNeeded(node, fileNames, 'Features', 'Features')
        }
    }

    function addMissingPluginPositionss(node, rootNodes) {
        let projectName = UI.projects.foundations.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.foundations.utilities.plugins.getPluginFileNames(projectName, 'Positions', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.foundations.utilities.plugins.addPluginFileIfNeeded(node, fileNames, 'Positions', 'Positions')
        }
    }
}
