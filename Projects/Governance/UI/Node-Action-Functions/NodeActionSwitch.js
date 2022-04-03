function newGovernanceNodeActionSwitch() {

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
                    UI.projects.governance.nodeActionFunctions.assets.installMissingAssets(action.node, action.rootNodes)
                    break
                }
            case 'Install Missing Votes':
                {
                    let newUiObjects = await UI.projects.governance.nodeActionFunctions.votes.installMissingVotes(action.node, action.rootNodes)

                    if (action.isInternal === false && newUiObjects !== undefined && newUiObjects.length > 0) {
                        let historyObject = {
                            action: action,
                            newUiObjects: newUiObjects,
                            nodeClones: []
                        }
                        UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                        UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                        UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                    }
                    break
                }
            case 'Install Missing Claims':
                {
                    let newUiObjects = await UI.projects.governance.nodeActionFunctions.claims.installMissingClaims(action.node, action.rootNodes)
                    
                    if (action.isInternal === false && newUiObjects !== undefined && newUiObjects.length > 0) {
                        let historyObject = {
                            action: action,
                            newUiObjects: newUiObjects,
                            nodeClones: []
                        }
                        UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                        UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                        UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                    }
                    break
                }
            case 'Build Profile Wallet':
                {
                    UI.projects.governance.nodeActionFunctions.profileConstructor.buildProfileWallet(action.node, action.rootNodes)
                    break
                }
            case 'Build Profile Mnemonic':
                {
                    UI.projects.governance.nodeActionFunctions.profileConstructor.buildProfileMnemonic(action.node, action.rootNodes, 'mnemonic')
                    break
                }
            case 'Build Profile WalletConnect':
                {
                    UI.projects.governance.nodeActionFunctions.profileConstructor.buildProfileWalletConnect(action.node, action.rootNodes)
                    break
                }
            case 'Install Signing Accounts':
                {
                    UI.projects.governance.nodeActionFunctions.profileConstructor.installSigningAccounts(action.node, action.rootNodes)
                    break
                }
            case 'Add Missing Plugin User Profiles':
                {
                    UI.projects.governance.nodeActionFunctions.pluginsFunctions.addMissingPluginUserProfiles(action.node, action.rootNodes)
                }
                break
            case 'Add Specified User Profile':
                {
                    UI.projects.governance.nodeActionFunctions.pluginsFunctions.addSpecifiedUserProfile(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Pools':
                {
                    UI.projects.governance.nodeActionFunctions.pluginsFunctions.addMissingPluginPools(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Features':
                {
                    UI.projects.governance.nodeActionFunctions.pluginsFunctions.addMissingPluginFeatures(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Assets':
                {
                    UI.projects.governance.nodeActionFunctions.pluginsFunctions.addMissingPluginAssets(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Positions':
                {
                    UI.projects.governance.nodeActionFunctions.pluginsFunctions.addMissingPluginPositions(action.node, action.rootNodes)
                }
                break

            default: {
                console.log("[WARN] Action sent to Governance Action Switch does not belong here. Verify at the App Schema file of the node that triggered this action that the actionProject is pointing to the right project. -> Action = " + action.name + " -> Action Node Name = " + action.node.name)
            }
        }
    }
}
