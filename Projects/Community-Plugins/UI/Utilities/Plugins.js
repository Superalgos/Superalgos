function newPluginsUtilitiesPlugins() {
    let thisObject = {
        getPluginFileNames: getPluginFileNames,
        getPluginFolderNamesByNodeType: getPluginFolderNamesByNodeType,
        addMissingPluginFiles: addMissingPluginFiles,
        addMissingPluginFile: addMissingPluginFile,
        getProjectName: getProjectName,
        savePluginFile: savePluginFile
    }

    return thisObject

    function getPluginFileNames(projectName, pluginFolder, callBack) {
        httpRequest(undefined, 'PluginFileNames/' + projectName + '/' + pluginFolder, onResponse)

        function onResponse(err, data) {
            if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                console.log('Failed to Fetch Plugin ' + pluginFolder + ' from the Client')
                return
            }

            let pluginFileNames = JSON.parse(data)
            callBack(pluginFileNames)
        }
    }

    function addMissingPluginFiles(node, fileNames, pluginFolder, nodeType, project) {
        for (let i = 0; i < fileNames.length; i++) {
            let fileName = fileNames[i]
            fileName = fileName.replace('.json', '')
            addMissingPluginFile(node, fileName, pluginFolder, nodeType, project, false)
        }
    }

    function addMissingPluginFile(node, fileName, pluginFolder, nodeType, project, saveWithWorkspace) {
        if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenByName(node, fileName) === true) {
            let child = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Plugin File', undefined, 'Community-Plugins')
            child.name = fileName
            child.config = JSON.stringify({
                project: project,
                fileName: fileName,
                folderName: pluginFolder,
                nodeType: nodeType,
                saveWithWorkspace: saveWithWorkspace
            })
            return child
        }
    }

    function getPluginFolderNamesByNodeType(nodeType) {
        switch (nodeType) {
            case 'API Map': {
                return 'API-Maps'
            }
            case 'Data Mine': {
                return 'Data-Mines'
            }
            case 'Learning Engine': {
                return 'Learning-Engines'
            }
            case 'Learning Mine': {
                return 'Learning-Mines'
            }
            case 'Learning System': {
                return 'Learning-Systems'
            }
            case 'Trading Engine': {
                return 'Trading-Engines'
            }
            case 'Trading Mine': {
                return 'Trading-Mines'
            }
            case 'Trading System': {
                return 'Trading-Systems'
            }
            case 'Portfolio Engine': {
                return 'Portfolio-Engines'
            }
            case 'Portfolio Mine': {
                return 'Portfolio-Mines'
            }
            case 'Portfolio System': {
                return 'Portfolio-Systems'
            }
            case 'Assets': {
                return 'Assets'
            }
            case 'Features': {
                return 'Features'
            }
            case 'Pools': {
                return 'Pools'
            }
            case 'Positions': {
                return 'Positions'
            }
            case 'User Profile': {
                return 'User-Profiles'
            }
        }
    }

    function getProjectName(node) {
        /* Validations to see if we can do this or not. */
        if (node.payload === undefined) { return }
        if (node.payload.uiObject === undefined) { return }

        if (node.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('You need to have a Plugin Project node as a parent to execute this action.')
            return
        }
        if (node.payload.parentNode.payload === undefined) {
            node.payload.uiObject.setErrorMessage('You need to have a Plugin Project node as a parent to execute this action.')
            return
        }
        let pluginProject = node.payload.parentNode
        let config = JSON.parse(pluginProject.config)

        return config.codeName
    }

    function savePluginFile(pluginFile) {
        let project = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(pluginFile.payload, 'project')
        let fileName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(pluginFile.payload, 'fileName')
        let folderName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(pluginFile.payload, 'folderName')
        let nodeType = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(pluginFile.payload, 'nodeType')

        if (
            project === undefined ||
            fileName === undefined ||
            folderName === undefined ||
            nodeType === undefined
        ) {
            pluginFile.payload.uiObject.setWarningMessage('This Plugin could not be saved because some Config Properties were missing.', 500)
            return
        }
        /*
        Next thing to do is to find the Plugin Hierarchy at the Workspace, and send 
        a request to the Client to save it.
        */
        let pluginToSave = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByCodeNameAndNodeType(fileName, nodeType)

        if (pluginToSave === undefined) {
            pluginFile.payload.uiObject.setWarningMessage('This Plugin could not be saved because it could not be found at the workspace.', 500)
            return
        }
        let fileContent = JSON.stringify(
            UI.projects.visualScripting.functionLibraries.protocolNode.getProtocolNode(pluginToSave, false, false, true, true, true),
            undefined,
            4)

        httpRequest(fileContent, 'SavePlugin' + '/' + project + '/' + folderName + '/' + fileName, onResponse)

        function onResponse(err, data) {
            /* Lets check the result of the call through the http interface */
            data = JSON.parse(data)
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result && data.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                pluginFile.payload.uiObject.setInfoMessage('Plugin Saved.', 5)
                pluginToSave.payload.uiObject.setInfoMessage('Plugin Saved.', 5)
                return
            }
            console.log('[ERROR] Saving Plugin File: ' + JSON.stringify(data))
            pluginFile.payload.uiObject.setErrorMessage('This Plugin Could not be Saved. ' + JSON.stringify(data), 500)
        }
    }
}