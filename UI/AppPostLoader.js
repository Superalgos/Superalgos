

function newAppPostLoader() {
    const MODULE_NAME = 'Post Loader'
    const ERROR_LOG = true
    const logger = newWebDebugLog()
    

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
                httpRequest(undefined, 'ProjectsSchema', onResponse)

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
                            docsNodeSchema: [],
                            docsConceptSchema: [],
                            docsTopicSchema: [],
                            docsTutorialSchema: [],
                            docsReviewSchema: [],
                            docsBookSchema: []
                        },
                        map: {
                            appSchema: new Map(),
                            docsNodeSchema: new Map(),
                            docsConceptSchema: new Map(),
                            docsTopicSchema: new Map(),
                            docsTutorialSchema: new Map(),
                            docsReviewSchema: new Map(),
                            docsBookSchema: new Map()
                        }
                    }
                    SCHEMAS_BY_PROJECT.set(project, schemas)

                    totalWebServerCalls++
                    httpRequest(undefined, 'Schema/' + project + '/AppSchema', onResponseAppSchema)

                    function onResponseAppSchema(err, schema) {
                        try {
                            schemas.array.appSchema = JSON.parse(schema)

                            for (let j = 0; j < schemas.array.appSchema.length; j++) {
                                let schemaDocument = schemas.array.appSchema[j]
                                let key = schemaDocument.type
                                schemas.map.appSchema.set(key, schemaDocument)
                            }
                        } catch (err) {
                            console.log(err.stack)
                        }

                        webServerResponses++
                        if (webServerResponses === totalWebServerCalls) { startCanvas() }
                    }

                    totalWebServerCalls++
                    httpRequest(undefined, 'Schema/' + project + '/DocsNodeSchema', onResponseDocSchema)

                    function onResponseDocSchema(err, schema) {
                        try {
                            schemas.array.docsNodeSchema = JSON.parse(schema)

                            for (let j = 0; j < schemas.array.docsNodeSchema.length; j++) {
                                let schemaDocument = schemas.array.docsNodeSchema[j]
                                let key = schemaDocument.type
                                schemas.map.docsNodeSchema.set(key, schemaDocument)
                            }
                        } catch (err) {
                            console.log(err.stack)
                        }

                        webServerResponses++
                        if (webServerResponses === totalWebServerCalls) { startCanvas() }
                    }

                    totalWebServerCalls++
                    httpRequest(undefined, 'Schema/' + project + '/DocsConceptSchema', onResponseConceptSchema)

                    function onResponseConceptSchema(err, schema) {
                        try {
                            schemas.array.docsConceptSchema = JSON.parse(schema)

                            for (let j = 0; j < schemas.array.docsConceptSchema.length; j++) {
                                let schemaDocument = schemas.array.docsConceptSchema[j]
                                let key = schemaDocument.type
                                schemas.map.docsConceptSchema.set(key, schemaDocument)
                            }
                        } catch (err) {
                            console.log(err.stack)
                        }

                        webServerResponses++
                        if (webServerResponses === totalWebServerCalls) { startCanvas() }
                    }

                    totalWebServerCalls++
                    httpRequest(undefined, 'Schema/' + project + '/DocsTopicSchema', onResponseTopicSchema)

                    function onResponseTopicSchema(err, schema) {
                        try {
                            schemas.array.docsTopicSchema = JSON.parse(schema)

                            for (let j = 0; j < schemas.array.docsTopicSchema.length; j++) {
                                let schemaDocument = schemas.array.docsTopicSchema[j]
                                let key = schemaDocument.type
                                schemas.map.docsTopicSchema.set(key, schemaDocument)
                            }
                        } catch (err) {
                            console.log(err.stack)
                        }

                        webServerResponses++
                        if (webServerResponses === totalWebServerCalls) { startCanvas() }
                    }

                    totalWebServerCalls++
                    httpRequest(undefined, 'Schema/' + project + '/DocsTutorialSchema', onResponseTutorialSchema)

                    function onResponseTutorialSchema(err, schema) {
                        try {
                            schemas.array.docsTutorialSchema = JSON.parse(schema)

                            for (let j = 0; j < schemas.array.docsTutorialSchema.length; j++) {
                                let schemaDocument = schemas.array.docsTutorialSchema[j]
                                let key = schemaDocument.type
                                schemas.map.docsTutorialSchema.set(key, schemaDocument)
                            }
                        } catch (err) {
                            console.log(err.stack)
                        }

                        webServerResponses++
                        if (webServerResponses === totalWebServerCalls) { startCanvas() }
                    }

                    totalWebServerCalls++
                    httpRequest(undefined, 'Schema/' + project + '/DocsReviewSchema', onResponseReviewSchema)

                    function onResponseReviewSchema(err, schema) {
                        try {
                            schemas.array.docsReviewSchema = JSON.parse(schema)

                            for (let j = 0; j < schemas.array.docsReviewSchema.length; j++) {
                                let schemaDocument = schemas.array.docsReviewSchema[j]
                                let key = schemaDocument.type
                                schemas.map.docsReviewSchema.set(key, schemaDocument)
                            }
                        } catch (err) {
                            console.log(err.stack)
                        }

                        webServerResponses++
                        if (webServerResponses === totalWebServerCalls) { startCanvas() }
                    }

                    totalWebServerCalls++
                    httpRequest(undefined, 'Schema/' + project + '/DocsBookSchema', onResponseBookSchema)

                    function onResponseBookSchema(err, schema) {
                        try {
                            schemas.array.docsBookSchema = JSON.parse(schema)

                            for (let j = 0; j < schemas.array.docsBookSchema.length; j++) {
                                let schemaDocument = schemas.array.docsBookSchema[j]
                                let key = schemaDocument.type
                                schemas.map.docsBookSchema.set(key, schemaDocument)
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
