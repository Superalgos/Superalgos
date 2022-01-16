/**
 *
 * The only reason we are keeping this class is to keep consistency across the uiObject implementation
 * It will also provide a good place to enrich the action received, separating the logic of the action from the editor space
 * Entire functionality is provided by CodeEditor Space
 */
function newCodeEditor() {

    let thisObject = {
        activate: activate,
        initialize: initialize
    }

    return thisObject

    function initialize() {

    }


    function activate(action) {
        UI.projects.foundations.spaces.codeEditorSpace.openSpaceArea(action.node, codeEditorType.CODE)
    }

}
