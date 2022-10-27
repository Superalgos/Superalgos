exports.newExportDocumentationApp = function newExportDocumentationApp() {

    let thisObject = {
        run: run
    }

    return thisObject

    async function run() {
        ED.exporter.currentLanguageCode = ED.DEFAULT_LANGUAGE
        await convertProjectsToSchemas()
            .then(() => setUpMenuItemsMap())
            .then(() => triggerPageRendering())

        async function convertProjectsToSchemas() {
            let schemaTypes = [
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
                let project = PROJECTS_SCHEMA[i].name
                SCHEMAS_BY_PROJECT.set(project, schemas)

                for( let j = 0; j < schemaTypes.length; j++ ) {
                    let schemaType = schemaTypes[j]
                    let schema = await sendSchema(global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/', schemaType.name)
                    schemaType.callback(schema, schemas)
                    break
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


        function setUpMenuItemsMap() {
            /*
            Here we will put put all the menu item labels of all nodes at all
            app schemas into a single map, that will allow us to know when a phrase
            is a label of a menu and then change its style.
            */
            for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
                let project = PROJECTS_SCHEMA[i].name
                let appSchemaArray = SCHEMAS_BY_PROJECT.get(project).array.appSchema

                for (let j = 0; j < appSchemaArray.length; j++) {
                    let docsSchemaDocument = appSchemaArray[j]

                    if (docsSchemaDocument.menuItems === undefined) { continue }
                    for (let k = 0; k < docsSchemaDocument.menuItems.length; k++) {
                        let menuItem = docsSchemaDocument.menuItems[k]
                        ED.menuLabelsMap.set(menuItem.label, true)
                    }
                }
            }
        }

        function triggerPageRendering() {
            const categories = ['Node', 'Concept', 'Tutorial', 'Topic', 'Review', 'Book', 'Workspace']

            for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
                let project = PROJECTS_SCHEMA[i].name
                let appSchemaTypes = SCHEMAS_BY_PROJECT.get(project).map.appSchema.keys()
                categories.forEach( category => {
                    for(let type of appSchemaTypes) {
                        ED.exporter.currentDocumentBeingRendered = {
                            project,
                            category,
                            type
                        }
                        ED.exporter.initialize()
                        ED.exporter.render()
                        ED.exporter.finalize()
                    }
                })
                break
            }
        }

        async function sendSchema(filePath, schemaType) {
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

                const files = await getAllFilesInDirectoryAndSubdirectories(filePath + folder)
                return onFilesReady(files)

                async function getAllFilesInDirectoryAndSubdirectories(dir) {
                    const { promisify } = SA.nodeModules.util
                    const { resolve } = SA.nodeModules.path;
                    const fs = SA.nodeModules.fs;
                    const readdir = promisify(fs.readdir);
                    const stat = promisify(fs.stat);
            
                    return await new Promise(res => getFiles(dir)
                        .then(files => {
                            let splittedDir = dir.split('/')
                            let lastFolder = splittedDir[splittedDir.length - 2]
                            let pathAndNames = []
                            for (let i = 0; i < files.length; i++) {
                                let file = files[i]
                                let pathName = file.substring(file.indexOf(lastFolder) + lastFolder.length, file.length)
                                pathName = pathName.substring(1, pathName.length)
                                pathAndNames.push(pathName)
                            }
                            res(pathAndNames)
                        })
                        .catch(e => {
                            res([])
                        }))
            
                    async function getFiles(dir) {
                        const subdirs = await readdir(dir);
                        const files = await Promise.all(subdirs.map(async (subdir) => {
                            const res = resolve(dir, subdir);
                            return (await stat(res)).isDirectory() ? getFiles(res) : res;
                        }));
                        return files.reduce((a, f) => a.concat(f), []);
                    }
                }

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
                    return JSON.stringify(schemaArray)
                }
            } catch (err) {
                if (err.message.indexOf('no such file or directory') < 0) {
                    console.log('Could not send Schema:', filePath, schemaType)
                    console.log(err.stack)
                }
                return []
            }
        }
    }
}