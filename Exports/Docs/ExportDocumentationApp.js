exports.newExportDocumentationApp = function newExportDocumentationApp() {

    let thisObject = {
        run: run
    }

    return thisObject

    function run() {
        const schemaTypes = [
            {
                name: 'AppSchema',
                callback: addAppSchema
            },
            {
                 name: 'DocsNodeSchema',
                 callback: addDocSchema
            },
            {
                 name: 'DocsConceptSchema',
                 callback: addConceptSchema
            },
            {
                 name: 'DocsTopicSchema',
                 callback: addTopicSchema
            },
            {
                name: 'DocsTutorialSchema',
                callback: addTutorialSchema
            },
            {
                 name: 'DocsReviewSchema',
                 callback: addReviewSchema
            },
            {
                 name: 'DocsBookSchema',
                 callback: addBookSchema
             }
        ]

        for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
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
            SCHEMAS_BY_PROJECT.set(PROJECTS_SCHEMA[i].name, schemas)
            for( let j = 0; j < schemaTypes.length; j++ ) {
                sendSchema(global.env.PATH_TO_PROJECTS + '/' + PROJECTS_SCHEMA[i].name + '/Schemas/', schemaTypes[j].name, s => schemaTypes[j].callback(s, schemas))
            }
        }

        let first = SCHEMAS_BY_PROJECT.get('Education')
        console.log(JSON.stringify(first, null, 4))

        function sendSchema(filePath, schemaType, callback) {
            let fs = SA.nodeModules.fs
            try {
                let folder = ''
                switch (schemaType) {
                    case 'AppSchema': {
                        folder = 'App-Schema'
                        break
                    }
                    case 'DocsNodeSchema': {
                        folder = 'Docs-Nodes'
                        break
                    }
                    case 'DocsConceptSchema': {
                        folder = 'Docs-Concepts'
                        break
                    }
                    case 'DocsTopicSchema': {
                        folder = 'Docs-Topics'
                        break
                    }
                    case 'DocsTutorialSchema': {
                        folder = 'Docs-Tutorials'
                        break
                    }
                    case 'DocsReviewSchema': {
                        folder = 'Docs-Reviews'
                        break
                    }
                    case 'DocsBookSchema': {
                        folder = 'Docs-Books'
                        break
                    }
                }
                SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories(filePath + folder, onFilesReady)

                function onFilesReady(files) {

                    let schemaArray = []
                    for (let k = 0; k < files.length; k++) {
                        let name = files[k]
                        let nameSplitted = name.split(folder)
                        let fileName = nameSplitted[1]
                        for (let i = 0; i < 10; i++) {
                            fileName = fileName.replace('\\', '/')
                        }
                        let fileToRead = filePath + folder + fileName

                        let fileContent = fs.readFileSync(fileToRead)
                        let schemaDocument
                        try {
                            schemaDocument = JSON.parse(fileContent)
                        } catch (err) {
                            console.log((new Date()).toISOString(), '[WARN] sendSchema -> Error Parsing JSON File: ' + fileToRead + ' .Error = ' + err.stack)
                            continue
                        }
                        schemaArray.push(schemaDocument)
                    }
                    callback(JSON.stringify(schemaArray))
                }
            } catch (err) {
                if (err.message.indexOf('no such file or directory') < 0) {
                    console.log('Could not send Schema:', filePath, schemaType)
                    console.log(err.stack)
                }
                callback([])
            }
        }

        function addAppSchema(schema, schemas) {
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
        }

        function addDocSchema(schema, schemas) {
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
        }

        function addConceptSchema(schema, schemas) {
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
        }

        function addTopicSchema(schema, schemas) {
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
        }

        function addTutorialSchema(schema, schemas) {
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
        }

        function addReviewSchema(schema, schemas) {
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
        }

        function addBookSchema(schema, schemas) {
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
        }
    }
}