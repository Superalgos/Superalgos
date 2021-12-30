function newWorkspacesSystemActionSwitch() {

    let thisObject = {
        name: 'newWorkspacesSystemActionSwitch',
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
            case 'saveWorkspace':
                {
                    await UI.projects.workspaces.spaces.designSpace.workspace.save()
                }
                break
            case 'switchWorkspace':
                {
                    UI.projects.workspaces.spaces.designSpace.workspace.replaceWorkspaceByLoadingOne(action.params[0], action.params[1])
                }
                break
            /* the following is a special action called by the buildSystemMenu function that constructs and returns a submenu */
            case 'workspacesSubmenu':
                {
                    return UI.projects.workspaces.systemActionFunctions.workspaceFunctions.workspacesSubmenu(action.params[0])
                }
            default: {
                console.log("[WARN] Action sent to Workspaces System Action Switch does not belong here. -> Action = " + action.name)
            }
        }
    }
}
