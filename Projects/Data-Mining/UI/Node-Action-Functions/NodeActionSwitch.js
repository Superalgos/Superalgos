function newDataMiningNodeActionSwitch() {

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
            case 'Add All Output Datasets':
                {
                    let newUiObjects = await UI.projects.dataMining.nodeActionFunctions.mineFunctions.addAllOutputDatasets(action.node)

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
                }
                break
            case 'Add All Data Dependencies':
                {
                    let newUiObjects = await UI.projects.dataMining.nodeActionFunctions.mineFunctions.addAllDataDependencies(action.node)

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
                }
                break
            case 'Add All Data Mine Dependencies':
                {
                    let newUiObjects = await UI.projects.dataMining.nodeActionFunctions.mineFunctions.addAllDataMineDataDependencies(action.node, action.rootNodes)

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
                }
                break

            case 'Install API Response Field Refs':
                {
                  UI.projects.dataMining.nodeActionFunctions.apiMaintenanceFunctions.installAPIResponseFieldRefs(action.node, action.rootNodes)
                }
                break
    

            default: {
                console.log("[WARN] Action sent to Data-Mining Action Switch does not belong here. Verify at the App Schema file of the node that triggered this action that the actionProject is pointing to the right project. -> Action = " + action.name + " -> Action Node Name = " + action.node.name)
            }
        }
    }
}
