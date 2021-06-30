function newFoundationsFunctionLibraryPluginsFunctions() {
    let thisObject = {
        addMissingPluginProjects: addMissingPluginProjects,
        addMissingPluginTypes: addMissingPluginTypes,
        addMissingPluginDataMines: addMissingPluginDataMines,
        addMissingPluginTradingMines: addMissingPluginTradingMines,
        addMissingPluginTradingSystems: addMissingPluginTradingSystems,
        addMissingPluginTradingEngines: addMissingPluginTradingEngines,
        addMissingPluginLearningMines: addMissingPluginLearningMines,
        addMissingPluginLearningSystems: addMissingPluginLearningSystems,
        addMissingPluginLearningEngines: addMissingPluginLearningEngines,
        addMissingPluginTutorials: addMissingPluginTutorials,
        addMissingPluginApiMaps: addMissingPluginApiMaps
    }
    return thisObject

    function addMissingPluginProjects(node, rootNodes) {
        for (let k = 0; k < PROJECTS_SCHEMA.length; k++) {
            let projectDefinition = PROJECTS_SCHEMA[k]
            let project = projectDefinition.name
            if (UI.projects.foundations.utilities.children.isMissingChildrenByName(node, project) === true) {
                let child = UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Plugin Project')
                child.name = project
                let config = JSON.parse(child.config)
                config.codeName = project
                child.config = JSON.stringify(config)
            }
        }
    }

    function addMissingPluginTypes(node, rootNodes) {
        let project = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(node.payload, 'codeName')
        if (project === undefined || project === "") { return }
        for (let k = 0; k < PROJECTS_SCHEMA.length; k++) {
            let projectDefinition = PROJECTS_SCHEMA[k]
            if (projectDefinition.name !== project) { continue }
            if (projectDefinition.plugins === undefined) { continue }
            for (let i = 0; i < projectDefinition.plugins.length; i++) {
                let pluginType = "Plugin" + " " + projectDefinition.plugins[i]

                if (UI.projects.foundations.utilities.children.isMissingChildrenByType(node, pluginType) === true) {
                    UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(node, pluginType, undefined, project)
                }
            }
        }
    }

    function addMissingPluginDataMines(node, rootNodes) {
        let projectName = UI.projects.foundations.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.foundations.utilities.plugins.getPluginFileNames(projectName, 'Data-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.foundations.utilities.plugins.addPluginFileIfNeeded(node, fileNames, 'Data-Mines', 'Data Mine')
        }
    }

    function addMissingPluginTradingMines(node, rootNodes) {
        let projectName = UI.projects.foundations.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.foundations.utilities.plugins.getPluginFileNames(projectName, 'Trading-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.foundations.utilities.plugins.addPluginFileIfNeeded(node, fileNames, 'Trading-Mines', 'Trading Mine')
        }
    }

    function addMissingPluginTradingSystems(node, rootNodes) {
        let projectName = UI.projects.foundations.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.foundations.utilities.plugins.getPluginFileNames(projectName, 'Trading-Systems', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.foundations.utilities.plugins.addPluginFileIfNeeded(node, fileNames, 'Trading-Systems', 'Trading System')
        }
    }

    function addMissingPluginTradingEngines(node, rootNodes) {
        let projectName = UI.projects.foundations.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.foundations.utilities.plugins.getPluginFileNames(projectName, 'Trading-Engines', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.foundations.utilities.plugins.addPluginFileIfNeeded(node, fileNames, 'Trading-Engines', 'Trading Engine')
        }
    }

    function addMissingPluginLearningMines(node, rootNodes) {
        let projectName = UI.projects.foundations.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.foundations.utilities.plugins.getPluginFileNames(projectName, 'Learning-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.foundations.utilities.plugins.addPluginFileIfNeeded(node, fileNames, 'Learning-Mines', 'Learning Mine')
        }
    }

    function addMissingPluginLearningSystems(node, rootNodes) {
        let projectName = UI.projects.foundations.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.foundations.utilities.plugins.getPluginFileNames(projectName, 'Learning-Systems', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.foundations.utilities.plugins.addPluginFileIfNeeded(node, fileNames, 'Learning-Systems', 'Learning System')
        }
    }

    function addMissingPluginLearningEngines(node, rootNodes) {
        let projectName = UI.projects.foundations.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.foundations.utilities.plugins.getPluginFileNames(projectName, 'Learning-Engines', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.foundations.utilities.plugins.addPluginFileIfNeeded(node, fileNames, 'Learning-Engines', 'Learning Engine')
        }
    }

    function addMissingPluginTutorials(node, rootNodes) {
        let projectName = UI.projects.foundations.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.foundations.utilities.plugins.getPluginFileNames(projectName, 'Tutorials', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.foundations.utilities.plugins.addPluginFileIfNeeded(node, fileNames, 'Tutorials', 'Tutorial')
        }
    }

    function addMissingPluginApiMaps(node, rootNodes) {
        let projectName = UI.projects.foundations.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.foundations.utilities.plugins.getPluginFileNames(projectName, 'API-Maps', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.foundations.utilities.plugins.addPluginFileIfNeeded(node, fileNames, 'API-Maps', 'API Map')
        }
    }
}
