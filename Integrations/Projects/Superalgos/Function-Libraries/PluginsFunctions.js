function newPluginsFunctions() {
    thisObject = {
        pluginMissingProjects: pluginMissingProjects,
        pluginMissingDataMines: pluginMissingDataMines,
        pluginMissingTradingMines: pluginMissingTradingMines,
        pluginMissingTradingSystems: pluginMissingTradingSystems,
        pluginMissingTradingEngines: pluginMissingTradingEngines,
        pluginMissingSuperScripts: pluginMissingSuperScripts,
        pluginMissingTutorials: pluginMissingTutorials
    }
    return thisObject

    function getPluginFileNames(projectName, pluginType, callBack) {
        callWebServer(undefined, 'PluginFileNames/' + projectName + '/' + pluginType, onResponse)

        function onResponse(err, data) {
            if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                console.log('Failed to Fetch Plugin ' + pluginType + ' from the Backend')
                return
            }

            let pluginFileNames = JSON.parse(data)
            callBack(pluginFileNames)
        }
    }

    function addPluginFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes) {
        for (let i = 0; i < fileNames.length; i++) {
            let fileName = fileNames[i]
            fileName = fileName.replace('.json', '')
            if (UI.projects.superalgos.utilities.children.isMissingChildrenByName(node, fileName) === true) {
                let child = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Plugin File')
                child.name = fileName
            }
        }
    }

    function pluginMissingProjects(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        let url = 'ProjectNames'
        callWebServer(undefined, url, onResponse)

        function onResponse(err, pProjects) {
            let projects = JSON.parse(pProjects)
            for (let i = 0; i < projects.length; i++) {
                let project = projects[i]
                if (UI.projects.superalgos.utilities.children.isMissingChildrenByName(node, project) === true) {
                    let child = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Plugin Project')
                    child.name = project
                    let config = JSON.parse(child.config)
                    config.codeName = project
                    child.config = JSON.stringify(config)
                }
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

    function pluginMissingDataMines(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        let projectName = getProjectName(node)

        getPluginFileNames(projectName, 'Data-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }

    function pluginMissingTradingMines(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        let projectName = getProjectName(node)

        getPluginFileNames(projectName, 'Trading-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }

    function pluginMissingTradingSystems(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        let projectName = getProjectName(node)

        getPluginFileNames(projectName, 'Trading-Systems', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }

    function pluginMissingTradingEngines(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        let projectName = getProjectName(node)

        getPluginFileNames(projectName, 'Trading-Engines', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }

    function pluginMissingSuperScripts(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        let projectName = getProjectName(node)

        getPluginFileNames(projectName, 'Super-Scripts', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }

    function pluginMissingTutorials(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        let projectName = getProjectName(node)

        getPluginFileNames(projectName, 'Tutorials', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }
}
