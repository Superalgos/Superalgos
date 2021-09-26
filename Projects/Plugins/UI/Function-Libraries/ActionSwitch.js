function newPluginsActionSwitch() {

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
                    UI.projects.plugins.functionLibraries.pluginsFunctions.installAsPlugin(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Projects':
                {
                    UI.projects.plugins.functionLibraries.pluginsFunctions.addMissingPluginProjects(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Types':
                {
                    UI.projects.plugins.functionLibraries.pluginsFunctions.addMissingPluginTypes(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Data Mines':
                {
                    UI.projects.plugins.functionLibraries.pluginsFunctions.addMissingPluginDataMines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Trading Mines':
                {
                    UI.projects.plugins.functionLibraries.pluginsFunctions.addMissingPluginTradingMines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Trading Systems':
                {
                    UI.projects.plugins.functionLibraries.pluginsFunctions.addMissingPluginTradingSystems(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Trading Engines':
                {
                    UI.projects.plugins.functionLibraries.pluginsFunctions.addMissingPluginTradingEngines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Learning Mines':
                {
                    UI.projects.plugins.functionLibraries.pluginsFunctions.addMissingPluginLearningMines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Learning Systems':
                {
                    UI.projects.plugins.functionLibraries.pluginsFunctions.addMissingPluginLearningSystems(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Learning Engines':
                {
                    UI.projects.plugins.functionLibraries.pluginsFunctions.addMissingPluginLearningEngines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Tutorials':
                {
                    UI.projects.plugins.functionLibraries.pluginsFunctions.addMissingPluginTutorials(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin API Maps':
                {
                    UI.projects.plugins.functionLibraries.pluginsFunctions.addMissingPluginApiMaps(action.node, action.rootNodes)
                }
                break
            case 'Enable Saving With Workspace':
                {
                    UI.projects.plugins.functionLibraries.pluginsFunctions.enableSavingWithWorkspace(action.node, action.rootNodes)
                }
                break
            case 'Disable Saving With Workspace':
                {
                    UI.projects.plugins.functionLibraries.pluginsFunctions.disableSavingWithWorkspace(action.node, action.rootNodes)
                }
                break
            case 'Save Plugin':
                {
                    UI.projects.plugins.functionLibraries.pluginsFunctions.savePlugin(action.node, action.rootNodes)
                }
                break
        }
    }
}
