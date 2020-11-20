

function newAppPostLoader() {
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
            /* Moving PROJECTS_ARRAY to the global variable */
            PROJECTS_ARRAY = window.PROJECTS
            window.PROJECTS = undefined

            setBrowserEvents()
            setupProjectsSchema()

            function setupProjectsSchema() {
                callWebServer(undefined, 'ProjectsSchema', onResponse)

                function onResponse(err, file) {
                    PROJECTS_SCHEMA = JSON.parse(file)
                    setupSchemas()
                }
            }

            function setupSchemas() {

                let totalWebServerCalls = 0
                let webServerResponses = 0

                for (let i = 0; i < PROJECTS_ARRAY.length; i++) {
                    let project = PROJECTS_ARRAY[i]
                    let schemas = {
                        array: {
                            appSchema: [],
                            docSchema: [],
                            conceptSchema: []
                        },
                        map: {
                            appSchema: new Map(),
                            docSchema: new Map(),
                            conceptSchema: new Map()
                        }
                    }
                    SCHEMAS_BY_PROJECT.set(project, schemas)

                    totalWebServerCalls++
                    callWebServer(undefined, 'Schema/' + project + '/AppSchema', onResponseAppSchema)

                    function onResponseAppSchema(err, schema) {
                        try {
                            schemas.array.appSchema = JSON.parse(schema)

                            for (let j = 0; j < schemas.array.appSchema.length; j++) {
                                let nodeDefinition = schemas.array.appSchema[j]
                                let key = nodeDefinition.type
                                schemas.map.appSchema.set(key, nodeDefinition)
                            }
                        } catch (err) {
                            console.log(err.stack)
                        }

                        webServerResponses++
                        if (webServerResponses === totalWebServerCalls) { startCanvas() }
                    }

                    totalWebServerCalls++
                    callWebServer(undefined, 'Schema/' + project + '/DocSchema', onResponseDocSchema)

                    function onResponseDocSchema(err, schema) {
                        try {
                            schemas.array.docSchema = JSON.parse(schema)

                            for (let j = 0; j < schemas.array.docSchema.length; j++) {
                                let nodeDefinition = schemas.array.docSchema[j]
                                let key = nodeDefinition.type
                                schemas.map.docSchema.set(key, nodeDefinition)
                            }
                        } catch (err) {
                            console.log(err.stack)
                        }

                        webServerResponses++
                        if (webServerResponses === totalWebServerCalls) { startCanvas() }
                    }

                    totalWebServerCalls++
                    callWebServer(undefined, 'Schema/' + project + '/ConceptSchema', onResponseConceptSchema)

                    function onResponseConceptSchema(err, schema) {
                        try {
                            schemas.array.conceptSchema = JSON.parse(schema)

                            for (let j = 0; j < schemas.array.conceptSchema.length; j++) {
                                let nodeDefinition = schemas.array.conceptSchema[j]
                                let key = nodeDefinition.type
                                schemas.map.conceptSchema.set(key, nodeDefinition)
                            }
                        } catch (err) {
                            console.log(err.stack)
                        }

                        webServerResponses++
                        if (webServerResponses === totalWebServerCalls) { startCanvas() }
                    }
                }
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
            UI.projects.superalgos.spaces.designSpace.workspace.save()
        }
    }
}
