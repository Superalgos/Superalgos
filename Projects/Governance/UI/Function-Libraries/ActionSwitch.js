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
                    UI.projects.governance.functionLibraries.pluginsFunctions.addMissingPluginUserProfiles(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Pools':
                {
                    UI.projects.governance.functionLibraries.pluginsFunctions.addMissingPluginPools(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Features':
                {
                    UI.projects.governance.functionLibraries.pluginsFunctions.addMissingPluginFeatures(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Assets':
                {
                    UI.projects.governance.functionLibraries.pluginsFunctions.addMissingPluginAssets(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Positions':
                {
                    UI.projects.governance.functionLibraries.pluginsFunctions.addMissingPluginPositions(action.node, action.rootNodes)
                }
                break
        }
    }
}
