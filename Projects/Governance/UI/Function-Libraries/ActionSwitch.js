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
            case 'Install Missing Assets':
                {
                    UI.projects.governance.functionLibraries.assets.installMissingAssets(action.node, action.rootNodes)
                    break
                }
            case 'Install Missing Votes':
                {
                    UI.projects.governance.functionLibraries.votingProgram.installMissingVotes(action.node, action.rootNodes)
                    break
                }
            case 'Install Missing Claims':
                {
                    UI.projects.governance.functionLibraries.claimsProgram.installMissingClaims(action.node, action.rootNodes)
                    break
                }
            case 'Build Profile':
                {
                    UI.projects.governance.functionLibraries.profileConstructor.buildProfile(action.node, action.rootNodes)
                    break
                }
            case 'Add Social Trading Desktop App':
                {
                    UI.projects.governance.functionLibraries.profileConstructor.addSigningAccount(action.node, action.rootNodes, 'Social Trading Desktop App')
                    break
                }
            case 'Add Social Trading Server App':
                {
                    UI.projects.governance.functionLibraries.profileConstructor.addSigningAccount(action.node, action.rootNodes, 'Social Trading Server App')
                    break
                }
            case 'Add Social Trading Mobile App':
                {
                    UI.projects.governance.functionLibraries.profileConstructor.addSigningAccount(action.node, action.rootNodes, 'Social Trading Mobile App')
                    break
                }
            case 'Add Algo Traders Platform':
                {
                    UI.projects.governance.functionLibraries.profileConstructor.addSigningAccount(action.node, action.rootNodes, 'Algo Traders Platform')
                    break
                }
            case 'Add P2P Network Node':
                {
                    UI.projects.governance.functionLibraries.profileConstructor.addSigningAccount(action.node, action.rootNodes, 'P2P Network Node')
                    break
                }
            case 'Add Missing Plugin User Profiles':
                {
                    UI.projects.governance.functionLibraries.pluginsFunctions.addMissingPluginUserProfiles(action.node, action.rootNodes)
                }
                break
            case 'Add Specified User Profile':
            {
                UI.projects.governance.functionLibraries.pluginsFunctions.addSpecifiedUserProfile(action.node, action.rootNodes)
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

            default: {
                console.log("[WARN] Action sent to Governance Action Switch does not belong here. Verify at the App Schema file of the node that triggered this action that the actionProject is pointing to the right project. -> Action = " + action.name + " -> Action Node Name = " + action.node.name)
            }
        }
    }
}
