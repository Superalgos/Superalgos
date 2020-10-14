

function newPostLoader() {
    const MODULE_NAME = 'Post Loader'
    const ERROR_LOG = true
    const logger = newWebDebugLog()
    logger.fileName = MODULE_NAME

    let thisObject = {
        start: start
    }

    return thisObject

    function start() {
        try {
            setBrowserEvents()
            setUpSchemas()

            function setUpSchemas() {
                APP_SCHEMA_ARRAY = getAppSchema()
                for (let i = 0; i < APP_SCHEMA_ARRAY.length; i++) {
                    let nodeDefinition = APP_SCHEMA_ARRAY[i]
                    let key = nodeDefinition.type
                    APP_SCHEMA_MAP.set(key, nodeDefinition)
                }
                DOC_SCHEMA_ARRAY = getDocSchema()
                for (let i = 0; i < DOC_SCHEMA_ARRAY.length; i++) {
                    let nodeDefinition = DOC_SCHEMA_ARRAY[i]
                    let key = nodeDefinition.type
                    DOC_SCHEMA_MAP.set(key, nodeDefinition)
                }
                CONCEPT_SCHEMA_ARRAY = getConceptSchema()
                for (let i = 0; i < CONCEPT_SCHEMA_ARRAY.length; i++) {
                    let nodeDefinition = CONCEPT_SCHEMA_ARRAY[i]
                    let key = nodeDefinition.type
                    CONCEPT_SCHEMA_MAP.set(key, nodeDefinition)
                }
                startCanvas()
            }

            function startCanvas() {
                /* If this method is executed for a second time, it should finalize the current execution structure */

                if (canvas !== undefined) { canvas.finalize() }

                canvas = newCanvas()
                canvas.initialize()
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] start -> err = ' + err.stack) }
        }
    }

    function setBrowserEvents() {
        window.onbeforeunload = saveWorkspace

        /* handles backspace and refresh(F5) from keyboard */
        window.manageBackRefresh = function (event) {
            var tag = event.target.tagName.toLowerCase()
            if (event.keyCode === 8 && tag !== 'input' && tag !== 'textarea') { // Backbutton pressed
                saveWorkspace()
            } else if (event.keyCode === 116) { // F5 pressed
                saveWorkspace()
            }
        }

        window.addEventListener('keydown', window.manageBackRefresh)

        function saveWorkspace() {
            canvas.designSpace.workspace.save()
        }
    }
}
