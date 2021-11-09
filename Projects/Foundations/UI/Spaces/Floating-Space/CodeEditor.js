/**
 *
 * The only reason we are keeping this class is to keep consistency across the uiObject implementation
 * Entire functionality is provided by CodeEditor Space
 */
function newCodeEditor() {
    const MODULE_NAME = 'Code Editor'

    let thisObject = {
        activate: activate,
        initialize: initialize
    }

    return thisObject


    function finalize() {

    }

    function initialize() {

    }


    function activate(action) {

        UI.projects.foundations.spaces.codeEditorSpace.openSpaceArea(action.node)

    }

}
