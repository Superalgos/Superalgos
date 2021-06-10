function newGovernanceActionSwitch() {

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
            case 'Install Assets': {
                {
                    UI.projects.governance.functionLibraries.assets.installAssets(action.node, action.rootNodes)
                    break
                }
            }
            case 'Add Missing Plugin User Profiles':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.addMissingPluginUserProfiles(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Pools':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.addMissingPluginPools(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Features':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.addMissingPluginFeatures(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Assets':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.addMissingPluginAssets(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Positions':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.addMissingPluginPositions(action.node, action.rootNodes)
                }
                break
        }
    }
}
