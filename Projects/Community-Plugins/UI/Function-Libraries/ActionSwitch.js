function newCommunityPluginsActionSwitch() {

    let thisObject = {
        executeAction: executeAction,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {
        /* Nothing to initialize since a Function Library does not hold any state. */
    }

    async function executeAction(action) {
        switch (action.name) {
            case 'Install as Plugin':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.installAsPlugin(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Projects':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.addMissingPluginProjects(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Types':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.addMissingPluginTypes(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Data Mines':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.addMissingPluginDataMines(action.node, action.rootNodes)
                }
                break
            case 'Add Specified Plugin Data Mine':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.addSpecifiedPluginDataMine(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Trading Mines':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.addMissingPluginTradingMines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Trading Systems':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.addMissingPluginTradingSystems(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Trading Engines':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.addMissingPluginTradingEngines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Portfolio Mines':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.addMissingPluginPortfolioMines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Portfolio Systems':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.addMissingPluginPortfolioSystems(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Portfolio Engines':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.addMissingPluginPortfolioEngines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Learning Mines':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.addMissingPluginLearningMines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Learning Systems':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.addMissingPluginLearningSystems(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Learning Engines':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.addMissingPluginLearningEngines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Tutorials':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.addMissingPluginTutorials(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin API Maps':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.addMissingPluginApiMaps(action.node, action.rootNodes)
                }
                break
            case 'Enable Saving With Workspace':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.enableSavingWithWorkspace(action.node, action.rootNodes, action.callBackFunction)
                }
                break
            case 'Disable Saving With Workspace':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.disableSavingWithWorkspace(action.node, action.rootNodes, action.callBackFunction)
                }
                break
            case 'Save Plugin File':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.savePluginFile(action.node, action.rootNodes)
                }
                break
            case 'Save Plugin':
                {
                    UI.projects.communityPlugins.functionLibraries.pluginsFunctions.savePluginHierarchy(action.node, action.rootNodes)
                }
                break

            default: {
                console.log("[WARN] Action sent to Community-Plugins Action Switch does not belong here. Verify at the App Schema file of the node that triggered this action that the actionProject is pointing to the right project. -> Action = " + action.name + " -> Action Node Name = " + action.node.name)
            }
        }
    }
}
