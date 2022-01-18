/**
 *
 * The only reason we are keeping this class is to keep consistency across the uiObject implementation
 * It will also provide a good place to enrich the action received, separating the logic of the action from the editor space
 * Entire functionality is provided by CodeEditor Space
 */
function newConfigEditor() {

    let thisObject = {
        activate: activate,
        initialize: initialize
    }

    return thisObject


    function initialize() {

    }


    async function activate(action) {
        let historyObjectOnHold = {
            action: action,
            previousConfig: action.node.config
        }
        UI.projects.foundations.spaces.codeEditorSpace.openSpaceArea(action.node, codeEditorType.CONFIG)
        UI.projects.workspaces.spaces.designSpace.workspace.undoStackOnHold.push(historyObjectOnHold)
    }

}
