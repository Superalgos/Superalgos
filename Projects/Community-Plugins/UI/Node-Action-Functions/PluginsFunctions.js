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
        addMissingPluginP2PNetworks: addMissingPluginP2PNetworks, 
        enableSavingWithWorkspace: enableSavingWithWorkspace,
        disableSavingWithWorkspace: disableSavingWithWorkspace,
        savePluginFile: savePluginFile,
        savePluginHierarchy: savePluginHierarchy, 
        installAsPlugin: installAsPlugin
    }
    return thisObject

    function addMissingPluginProjects(node, rootNodes) {
        let newUiObjects = []
        for (let k = 0; k < PROJECTS_SCHEMA.length; k++) {
            let projectDefinition = PROJECTS_SCHEMA[k]
            let project = projectDefinition.name
            if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenByName(node, project) === true) {
                let child = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, 'Plugin Project')
                child.name = project
                let config = JSON.parse(child.config)
                config.codeName = project
                child.config = JSON.stringify(config)
                newUiObjects.push(child)
            }
        }
        return newUiObjects
    }

    function addMissingPluginTypes(node, rootNodes) {
        let newUiObjects = []
        let project = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'codeName')
        if (project === undefined || project === "") { return }
        for (let k = 0; k < PROJECTS_SCHEMA.length; k++) {
            let projectDefinition = PROJECTS_SCHEMA[k]
            if (projectDefinition.name !== project) { continue }
            if (projectDefinition.plugins === undefined) { continue }
            for (let i = 0; i < projectDefinition.plugins.length; i++) {
                let pluginType = "Plugin" + " " + projectDefinition.plugins[i]

                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenByType(node, pluginType) === true) {
                    let child = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, pluginType, undefined, 'Community-Plugins')
                    newUiObjects.push(child)
                }
            }
        }
        return newUiObjects
    }

    async function addMissingPluginDataMines(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        let response = await httpRequestAsync(undefined, 'PluginFileNames/' + projectName + '/Data-Mines')
        let fileNames = JSON.parse(response.message)
        let newUiObjects = UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Data-Mines', 'Data Mine', 'Data-Mining')

        return newUiObjects
    }

    async function addSpecifiedPluginDataMine(node, rootNodes, historyObject) {
        let action = { node: node }

        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        let response = await httpRequestAsync(undefined, 'PluginFileNames/' + projectName + '/Data-Mines')
        let fileNames = JSON.parse(response.message)
        let eventSubscriptionId = node.payload.uiObject.container.eventHandler.listenToEvent('listSelectorClicked', onListSelect)
        node.payload.uiObject.listSelector.activate(action, fileNames, eventSubscriptionId)

        function onListSelect(event) {
            let selectedArray = []
            selectedArray.push(event.selectedNode)
            let newUiObjects = UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, selectedArray, 'Data-Mines', 'Data Mine', 'Data-Mining')
            node.payload.uiObject.container.eventHandler.stopListening('listSelectorClicked')

            if (newUiObjects !== undefined && newUiObjects.length > 0) {
                historyObject.newUiObjects = newUiObjects
                UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
            }
        }
    }

    async function addMissingPluginTradingMines(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        let response = await httpRequestAsync(undefined, 'PluginFileNames/' + projectName + '/Trading-Mines')
        let fileNames = JSON.parse(response.message)
        let newUiObjects = UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Trading-Mines', 'Trading Mine', 'Algorithmic-Trading')
        
        return newUiObjects
    }

    async function addMissingPluginTradingSystems(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        let response = await httpRequestAsync(undefined, 'PluginFileNames/' + projectName + '/Trading-Systems')
        let fileNames = JSON.parse(response.message)
        let newUiObjects = UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Trading-Systems', 'Trading System', 'Algorithmic-Trading')

        return newUiObjects
    }

    async function addMissingPluginTradingEngines(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        let response = await httpRequestAsync(undefined, 'PluginFileNames/' + projectName + '/Trading-Engines')
        let fileNames = JSON.parse(response.message)
        let newUiObjects = UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Trading-Engines', 'Trading Engine', 'Algorithmic-Trading')
        
        return newUiObjects
    }

    async function addMissingPluginPortfolioMines(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        let response = await httpRequestAsync(undefined, 'PluginFileNames/' + projectName + '/Portfolio-Mines')
        let fileNames = JSON.parse(response.message)
        let newUiObjects = UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Portfolio-Mines', 'Portfolio Mine', 'Portfolio-Management')
        
        return newUiObjects
    }

    async function addMissingPluginPortfolioSystems(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        let response = await httpRequestAsync(undefined, 'PluginFileNames/' + projectName + '/Portfolio-Systems')
        let fileNames = JSON.parse(response.message)
        let newUiObjects = UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Portfolio-Systems', 'Portfolio System', 'Portfolio-Management')
        
        return newUiObjects
    }

    async function addMissingPluginPortfolioEngines(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        let response = await httpRequestAsync(undefined, 'PluginFileNames/' + projectName + '/Portfolio-Engines')
        let fileNames = JSON.parse(response.message)
        let newUiObjects = UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Portfolio-Engines', 'Portfolio Engine', 'Portfolio-Management')
        
        return newUiObjects
    }

    async function addMissingPluginLearningMines(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        let response = await httpRequestAsync(undefined, 'PluginFileNames/' + projectName + '/Learning-Mines')
        let fileNames = JSON.parse(response.message)
        let newUiObjects = UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Learning-Mines', 'Learning Mine', 'Machine-Learning')
        
        return newUiObjects
    }

    async function addMissingPluginLearningSystems(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        let response = await httpRequestAsync(undefined, 'PluginFileNames/' + projectName + '/Learning-Systems')
        let fileNames = JSON.parse(response.message)
        let newUiObjects = UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Learning-Systems', 'Learning System', 'Machine-Learning')
        
        return newUiObjects
    }

    async function addMissingPluginLearningEngines(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        let response = await httpRequestAsync(undefined, 'PluginFileNames/' + projectName + '/Learning-Engines')
        let fileNames = JSON.parse(response.message)
        let newUiObjects = UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Learning-Engines', 'Learning Engine', 'Machine-Learning')
        
        return newUiObjects
    }

    async function addMissingPluginTutorials(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        let response = await httpRequestAsync(undefined, 'PluginFileNames/' + projectName + '/Tutorials')
        let fileNames = JSON.parse(response.message)
        let newUiObjects = UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'Tutorials', 'Tutorial', 'Education')
        
        return newUiObjects
    }

    async function addMissingPluginApiMaps(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        let response = await httpRequestAsync(undefined, 'PluginFileNames/' + projectName + '/API-Maps')
        let fileNames = JSON.parse(response.message)
        let newUiObjects = UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'API-Maps', 'API Map', 'Foundations')
        
        return newUiObjects
    }

    async function addMissingPluginP2PNetworks(node, rootNodes) {
        let projectName = UI.projects.communityPlugins.utilities.plugins.getProjectName(node)
        if (projectName === "" || projectName === undefined) {
            if (node.payload.parentNode !== undefined) {
                node.payload.parentNode.payload.uiObject.setErrorMessage("Config codeName must have the name of the project.")
                return
            }
        }

        let response = await httpRequestAsync(undefined, 'PluginFileNames/' + projectName + '/P2P-Networks')
        let fileNames = JSON.parse(response.message)
        let newUiObjects = UI.projects.communityPlugins.utilities.plugins.addMissingPluginFiles(node, fileNames, 'P2P-Networks', 'P2P Network', 'Network')
        
        return newUiObjects
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

    function savePluginFile(pluginFile, rootNodes) {
        UI.projects.communityPlugins.utilities.plugins.savePluginFileAtClient(pluginFile)
    }

    function savePluginHierarchy(node, rootNodes) {
        if (node.isPlugin !== true) { return }

        let plugins = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadByNodeType('Plugins')
        let pluginProject = UI.projects.visualScripting.utilities.nodeChildren.findChildByCodeName(plugins, node.project)
        let pluginFolderName = UI.projects.communityPlugins.utilities.plugins.getPluginFolderNamesByNodeType(node.type)
        let pluginForlderNodeType = 'Plugin ' + pluginFolderName.replaceAll('-', ' ')
        let pluginFolderNode = UI.projects.visualScripting.utilities.nodeChildren.findChildByType(pluginProject, pluginForlderNodeType)

        for (let i = 0; i < pluginFolderNode.pluginFiles.length; i++) {
            let pluginFile = pluginFolderNode.pluginFiles[i]
            let fileName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(pluginFile.payload, 'fileName')
            let codeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'codeName')
            if (codeName === fileName) {
                UI.projects.communityPlugins.utilities.plugins.savePluginFileAtClient(pluginFile)
                /*
                Show nice message.
                */
                node.payload.uiObject.setInfoMessage(
                    "Plugin Saved.",
                    UI.projects.governance.globals.designer.SET_INFO_COUNTER_FACTOR
                )
                return
            }
        }
    }

    function installAsPlugin(node, rootNodes) {
        let plugins = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadByNodeType('Plugins')
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

        UI.projects.communityPlugins.utilities.plugins.savePluginFileAtClient(pluginFile)
    }


}
