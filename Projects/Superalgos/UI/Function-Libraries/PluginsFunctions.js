function newSuperalgosFunctionLibraryPluginsFunctions() {
    thisObject = {
        pluginMissingProjects: pluginMissingProjects,
        pluginMissingDataMines: pluginMissingDataMines,
        pluginMissingTradingMines: pluginMissingTradingMines,
        pluginMissingTradingSystems: pluginMissingTradingSystems,
        pluginMissingTradingEngines: pluginMissingTradingEngines,
        pluginMissingLearningMines: pluginMissingLearningMines,
        pluginMissingLearningSystems: pluginMissingLearningSystems,
        pluginMissingLearningEngines: pluginMissingLearningEngines,
        pluginMissingTutorials: pluginMissingTutorials
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
            if (UI.projects.superalgos.utilities.children.isMissingChildrenByName(node, fileName) === true) {
                let child = UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Plugin File')
                child.name = fileName
            }
        }
    }

    function pluginMissingProjects(node, rootNodes) {
        for (let k = 0; k < PROJECTS_SCHEMA.length; k++) {
            let projectDefinition = PROJECTS_SCHEMA[k]
            let project = projectDefinition.name
            if (UI.projects.superalgos.utilities.children.isMissingChildrenByName(node, project) === true) {
                let child = UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Plugin Project')
                child.name = project
                let config = JSON.parse(child.config)
                config.codeName = project
                child.config = JSON.stringify(config)
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

    function pluginMissingDataMines(node, rootNodes) {
        let projectName = getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        getPluginFileNames(projectName, 'Data-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames)
        }
    }

    function pluginMissingTradingMines(node, rootNodes) {
        let projectName = getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        getPluginFileNames(projectName, 'Trading-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames)
        }
    }

    function pluginMissingTradingSystems(node, rootNodes) {
        let projectName = getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        getPluginFileNames(projectName, 'Trading-Systems', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames)
        }
    }

    function pluginMissingTradingEngines(node, rootNodes) {
        let projectName = getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        getPluginFileNames(projectName, 'Trading-Engines', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames)
        }
    }

    function pluginMissingLearningMines(node, rootNodes) {
        let projectName = getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        getPluginFileNames(projectName, 'Learning-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames)
        }
    }

    function pluginMissingLearningSystems(node, rootNodes) {
        let projectName = getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        getPluginFileNames(projectName, 'Learning-Systems', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames)
        }
    }

    function pluginMissingLearningEngines(node, rootNodes) {
        let projectName = getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        getPluginFileNames(projectName, 'Learning-Engines', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames)
        }
    }

    function pluginMissingTutorials(node, rootNodes) {
        let projectName = getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        getPluginFileNames(projectName, 'Tutorials', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames)
        }
    }
}
