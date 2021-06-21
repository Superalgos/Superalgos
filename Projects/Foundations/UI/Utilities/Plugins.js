function newFoundationsUtilitiesPlugins() {
    let thisObject = {
        getPluginFileNames: getPluginFileNames,
        addPluginFileIfNeeded: addPluginFileIfNeeded,
        getProjectName: getProjectName
    }

    return thisObject

    function getPluginFileNames(projectName, pluginType, callBack) {
        httpRequest(undefined, 'PluginFileNames/' + projectName + '/' + pluginType, onResponse)

        function onResponse(err, data) {
            if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                console.log('Failed to Fetch Plugin ' + pluginType + ' from the Client')
                return
            }

            let pluginFileNames = JSON.parse(data)
            callBack(pluginFileNames)
        }
    }

    function addPluginFileIfNeeded(node, fileNames) {
        for (let i = 0; i < fileNames.length; i++) {
            let fileName = fileNames[i]
            fileName = fileName.replace('.json', '')
            if (UI.projects.foundations.utilities.children.isMissingChildrenByName(node, fileName) === true) {
                let child = UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Plugin File', undefined, 'Foundations')
                child.name = fileName
                child.config = JSON.stringify({
                    project: node.project,
                    fileName: fileName
                })
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
}