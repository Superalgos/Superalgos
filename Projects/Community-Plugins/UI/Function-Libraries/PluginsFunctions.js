function newPluginsFunctionLibraryPluginsFunctions() {
    let thisObject = {
        addMissingPluginProjects: addMissingPluginProjects,
        addMissingPluginTypes: addMissingPluginTypes,
        addMissingPluginDataMines: addMissingPluginDataMines,
        addSpecifiedPluginDataMine: addSpecifiedPluginDataMine,
        addMissingPluginTradingMines: addMissingPluginTradingMines,
        addMissingPluginTradingSystems: addMissingPluginTradingSystems,
        addMissingPluginTradingEngines: addMissingPluginTradingEngines,
        addMissingPluginPortfolioMines: addMissingPluginPortfolioMines,
        addMissingPluginPortfolioSystems: addMissingPluginPortfolioSystems,
        addMissingPluginPortfolioEngines: addMissingPluginPortfolioEngines,
        addMissingPluginLearningMines: addMissingPluginLearningMines,
        addMissingPluginLearningSystems: addMissingPluginLearningSystems,
        addMissingPluginLearningEngines: addMissingPluginLearningEngines,
        addMissingPluginTutorials: addMissingPluginTutorials,
        addMissingPluginApiMaps: addMissingPluginApiMaps,
        enableSavingWithWorkspace: enableSavingWithWorkspace,
        disableSavingWithWorkspace: disableSavingWithWorkspace,
        savePlugin: savePlugin,
        installAsPlugin: installAsPlugin
    }
    return thisObject

    function addMissingPluginProjects(node, rootNodes) {
        for (let k = 0; k < PROJECTS_SCHEMA.length; k++) {
            let projectDefinition = PROJECTS_SCHEMA[k]
            let project = projectDefinition.name
            if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenByName(node, project) === true) {
                let child = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Plugin Project')
                child.name = project
                let config = JSON.parse(child.config)
                config.codeName = project
                child.config = JSON.stringify(config)
            }
        }
    }

    function addMissingPluginTypes(node, rootNodes) {
        let project = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'codeName')
        if (project === undefined || project === "") { return }
        for (let k = 0; k < PROJECTS_SCHEMA.length; k++) {
            let projectDefinition = PROJECTS_SCHEMA[k]
            if (projectDefinition.name !== project) { continue }
            if (projectDefinition.plugins === undefined) { continue }
            for (let i = 0; i < projectDefinition.plugins.length; i++) {
                let pluginType = "Plugin" + " " + projectDefinition.plugins[i]

                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenByType(node, pluginType) === true) {
                    UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, pluginType, undefined, 'Community-Plugins')
                }
            }
        }
    }

    function addMissingPluginDataMines(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'Data-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Data-Mines', 'Data Mine', 'Data-Mining')
        }
    }

    function addSpecifiedPluginDataMine(node, rootNodes) {
        let action = { node: node }

        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'Data-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            let eventSubscriptionId = node.payload.uiObject.container.eventHandler.listenToEvent('listSelectorClicked', onListSelect)
            node.payload.uiObject.listSelector.activate(action, fileNames, eventSubscriptionId)

            function onListSelect(event) {
                let selectedArray = []
                selectedArray.push(event.selectedNode)
                UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, selectedArray, 'Data-Mines', 'Data Mine', 'Data-Mining')
                node.payload.uiObject.container.eventHandler.stopListening('listSelectorClicked')
            }
        }
    }

    function addMissingPluginTradingMines(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'Trading-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Trading-Mines', 'Trading Mine', 'Algorithmic-Trading')
        }
    }

    function addMissingPluginTradingSystems(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'Trading-Systems', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Trading-Systems', 'Trading System', 'Algorithmic-Trading')
        }
    }

    function addMissingPluginTradingEngines(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'Trading-Engines', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Trading-Engines', 'Trading Engine', 'Algorithmic-Trading')
        }
    }

    function addMissingPluginPortfolioMines(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'Portfolio-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Portfolio-Mines', 'Portfolio Mine', 'Portfolio-Management')
        }
    }

    function addMissingPluginPortfolioSystems(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'Portfolio-Systems', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Portfolio-Systems', 'Portfolio System', 'Portfolio-Management')
        }
    }

    function addMissingPluginPortfolioEngines(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'Portfolio-Engines', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Portfolio-Engines', 'Portfolio Engine', 'Portfolio-Management')
        }
    }

    function addMissingPluginLearningMines(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'Learning-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Learning-Mines', 'Learning Mine', 'Machine-Learning')
        }
    }

    function addMissingPluginLearningSystems(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'Learning-Systems', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Learning-Systems', 'Learning System', 'Machine-Learning')
        }
    }

    function addMissingPluginLearningEngines(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'Learning-Engines', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Learning-Engines', 'Learning Engine', 'Machine-Learning')
        }
    }

    function addMissingPluginTutorials(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'Tutorials', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Tutorials', 'Tutorial', 'Education')
        }
    }

    function addMissingPluginApiMaps(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        UI.projects.communityPlugins.utilities.plugins.getPluginFileNames(projectName, 'API-Maps', onNamesArrived)

        function onNamesArrived(fileNames) {
            UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'API-Maps', 'API Map', 'Foundations')
        }
    }

    function enableSavingWithWorkspace(node, rootNodes, callBackFunction) {
        UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(node.payload, 'saveWithWorkspace', true)
        node.payload.uiObject.setInfoMessage('Saving with Workspace Enabled')
        callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
    }

    function disableSavingWithWorkspace(node, rootNodes, callBackFunction) {
        UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(node.payload, 'saveWithWorkspace', false)
        node.payload.uiObject.setInfoMessage('Saving with Workspace Disabled')
        callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
    }

    function savePlugin(node, rootNodes) {
        UI.projects.communityPlugins.utilities.plugins.savePluginFile(node)
    }

    function installAsPlugin(node, rootNodes) {
        let plugins = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadByNodeType('Plugins')
        let pluginProject = UI.projects.visualScripting.utilities.nodeChildren.findChildByCodeName(plugins, node.project)
        let pluginFolderName = UI.projects.communityPlugins.utilities.plugins.getPluginFolderNamesByNodeType(node.type)
        let pluginForlderNodeType = 'Plugin ' + pluginFolderName.replaceAll('-', ' ')
        let pluginFolderNode = UI.projects.visualScripting.utilities.nodeChildren.findChildByType(pluginProject, pluginForlderNodeType)
        let pluginFile = UI.projects.communityPlugins.utilities.plugins.addMissingPluginFile(pluginFolderNode, node.name, pluginFolderName, node.type, node.project, true)
        node.isPlugin = true

        if (pluginFile === undefined) {
            node.payload.uiObject.setErrorMessage('Plugin Not Saved because it already existed.')
            return
        }

        UI.projects.communityPlugins.utilities.plugins.savePluginFile(pluginFile)
    }
}
