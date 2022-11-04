const path = require('path')

const {info, warn} = require('./Scripts/Logger').logger
exports.newExportDocumentationApp = function newExportDocumentationApp() {

    let thisObject = {
        run: run
    }

    return thisObject

    async function run({project, category}) {
        info('starting source file moving')
        setSourceFileLinks()

        info('starting async project conversion')
        const completed = await convertProjectsToSchemas(project)
            .then(() => ED.designSpace.initialize(project))
            .then(() => setUpMenuItemsMap(project))
            .then(() => triggerPageRendering(project, category))
            .then((filePaths) => filePaths.length > 0 ? buildIndexPage(filePaths) : 0)
            .then((count) => {
                ED.designSpace.finalize()
                return count
            })

        return completed
        // if(completed.length > 0) {
        //     info('page creation competed')
        // }
        // else {
        //     info('page creation failed')
        // }

        async function convertProjectsToSchemas(project) {
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

            let schemas = {
                array: {
                    appSchema: [],
                    docsNodeSchema: [],
                    docsConceptSchema: [],
                    docsTopicSchema: [],
                    docsTutorialSchema: [],
                    docsReviewSchema: [],
                    docsBookSchema: [],
                    workspaceSchema: []
                },
                map: {
                    appSchema: new Map(),
                    docsNodeSchema: new Map(),
                    docsConceptSchema: new Map(),
                    docsTopicSchema: new Map(),
                    docsTutorialSchema: new Map(),
                    docsReviewSchema: new Map(),
                    docsBookSchema: new Map(),
                    workspaceSchema: new Map()
                }
            }
            SCHEMAS_BY_PROJECT.set(project, schemas)

            for(let j = 0; j < schemaTypes.length; j++) {
                let schemaType = schemaTypes[j]
                let schema = await sendSchema(global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/', schemaType.name)
                schemaType.callback(schema, schemas)
            }

            function addAppSchema(schema, schemas) {
                try {
                    schemas.array.appSchema = JSON.parse(schema)

                    for(let j = 0; j < schemas.array.appSchema.length; j++) {
                        let schemaDocument = schemas.array.appSchema[j]
                        let key = schemaDocument.type
                        schemas.map.appSchema.set(key, schemaDocument)
                    }
                } catch(err) {
                    console.error(err)
                }
            }

            function addDocSchema(schema, schemas) {
                try {
                    schemas.array.docsNodeSchema = JSON.parse(schema)

                    for(let j = 0; j < schemas.array.docsNodeSchema.length; j++) {
                        let schemaDocument = schemas.array.docsNodeSchema[j]
                        let key = schemaDocument.type
                        schemas.map.docsNodeSchema.set(key, schemaDocument)
                    }
                } catch(err) {
                    console.error(err)
                }
            }

            function addConceptSchema(schema, schemas) {
                try {
                    schemas.array.docsConceptSchema = JSON.parse(schema)

                    for(let j = 0; j < schemas.array.docsConceptSchema.length; j++) {
                        let schemaDocument = schemas.array.docsConceptSchema[j]
                        let key = schemaDocument.type
                        schemas.map.docsConceptSchema.set(key, schemaDocument)
                    }
                } catch(err) {
                    console.error(err)
                }
            }

            function addTopicSchema(schema, schemas) {
                try {
                    schemas.array.docsTopicSchema = JSON.parse(schema)

                    for(let j = 0; j < schemas.array.docsTopicSchema.length; j++) {
                        let schemaDocument = schemas.array.docsTopicSchema[j]
                        let key = schemaDocument.type
                        schemas.map.docsTopicSchema.set(key, schemaDocument)
                    }
                } catch(err) {
                    console.error(err)
                }
            }

            function addTutorialSchema(schema, schemas) {
                try {
                    schemas.array.docsTutorialSchema = JSON.parse(schema)

                    for(let j = 0; j < schemas.array.docsTutorialSchema.length; j++) {
                        let schemaDocument = schemas.array.docsTutorialSchema[j]
                        let key = schemaDocument.type
                        schemas.map.docsTutorialSchema.set(key, schemaDocument)
                    }
                } catch(err) {
                    console.error(err)
                }
            }

            function addReviewSchema(schema, schemas) {
                try {
                    schemas.array.docsReviewSchema = JSON.parse(schema)

                    for(let j = 0; j < schemas.array.docsReviewSchema.length; j++) {
                        let schemaDocument = schemas.array.docsReviewSchema[j]
                        let key = schemaDocument.type
                        schemas.map.docsReviewSchema.set(key, schemaDocument)
                    }
                } catch(err) {
                    console.error(err)
                }
            }

            function addBookSchema(schema, schemas) {
                try {
                    schemas.array.docsBookSchema = JSON.parse(schema)

                    for(let j = 0; j < schemas.array.docsBookSchema.length; j++) {
                        let schemaDocument = schemas.array.docsBookSchema[j]
                        let key = schemaDocument.type
                        schemas.map.docsBookSchema.set(key, schemaDocument)
                    }
                } catch(err) {
                    console.error(err)
                }
            }

            function addWorkspaceSchema(schema, schemas) {
                try {
                    schemas.array.workspaceSchema = JSON.parse(schema)

                    for(let j = 0; j < schemas.array.workspaceSchema.length; j++) {
                        let schemaDocument = schemas.array.workspaceSchema[j]
                        let key = schemaDocument.type
                        schemas.map.workspaceSchema.set(key, schemaDocument)
                    }
                } catch(err) {
                    console.error(err)
                }
            }

        }

        function setUpMenuItemsMap(project) {
            info('iterating schema project map for menu items')
            /*
            Here we will put put all the menu item labels of all nodes at all
            app schemas into a single map, that will allow us to know when a phrase
            is a label of a menu and then change its style.
            */
            let appSchemaArray = SCHEMAS_BY_PROJECT.get(project).array.appSchema

            for(let j = 0; j < appSchemaArray.length; j++) {
                let docsSchemaDocument = appSchemaArray[j]

                if(docsSchemaDocument.menuItems === undefined) {continue}
                for(let k = 0; k < docsSchemaDocument.menuItems.length; k++) {
                    let menuItem = docsSchemaDocument.menuItems[k]
                    ED.menuLabelsMap.set(menuItem.label, true)
                }
            }
        }

        function triggerPageRendering(project, category) {
            info('preparing for page transfer rendering')
            const exporter = require('./Scripts/DocumentationExporter')
            const filePaths = []
            for(let type of SCHEMAS_BY_PROJECT.get(project).map.appSchema.keys()) {
                info('render       -> ' + project + ' -> ' + category + ' -> ' + type)
                const exportProcess = exporter.documentationExporter()
                exportProcess.currentLanguageCode = ED.DEFAULT_LANGUAGE
                exportProcess.currentDocumentBeingRendered = {
                    project,
                    category,
                    type
                }

                info('initializing -> ' + project + ' -> ' + category + ' -> ' + type)
                exportProcess.initialize()

                info('rendering    -> ' + project + ' -> ' + category + ' -> ' + type)
                exportProcess.render()

                info('writing      -> ' + project + ' -> ' + category + ' -> ' + type)
                filePaths.push(exportProcess.write())

                info('finalizing   -> ' + project + ' -> ' + category + ' -> ' + type)
                exportProcess.finalize()
            }
            return filePaths
        }

        /**
         * 
         * @param {string[]} filePaths 
         */
        function writeIndexFile(filePaths) {
            SA.nodeModules.jsDom
            let docsContentDiv = document.getElementById('docs-content-div')
            docsContentDiv.innerHTML = HTML + addFooter()
        }

        async function sendSchema(filePath, schemaType) {
            let fs = SA.nodeModules.fs
            try {
                let folder = ''
                switch(schemaType) {
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
                    const {promisify} = SA.nodeModules.util
                    const {resolve} = SA.nodeModules.path;
                    const fs = SA.nodeModules.fs;
                    const readdir = promisify(fs.readdir);
                    const stat = promisify(fs.stat);

                    return await new Promise(res => getFiles(dir)
                        .then(files => {
                            let splittedDir = dir.split('/')
                            let lastFolder = splittedDir[splittedDir.length - 2]
                            let pathAndNames = []
                            for(let i = 0; i < files.length; i++) {
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
                    for(let k = 0; k < files.length; k++) {
                        let name = files[k]
                        let nameSplitted = name.split(folder)
                        let fileName = nameSplitted[1]
                        for(let i = 0; i < 10; i++) {
                            fileName = fileName.replace('\\', '/')
                        }
                        let fileToRead = filePath + folder + fileName

                        let fileContent = fs.readFileSync(fileToRead)
                        let schemaDocument
                        try {
                            schemaDocument = JSON.parse(fileContent)
                        } catch(err) {
                            warn('sendSchema -> Error Parsing JSON File: ' + fileToRead + ' .Error = ' + err.stack)
                            continue
                        }
                        schemaArray.push(schemaDocument)
                    }
                    return JSON.stringify(schemaArray)
                }
            } catch(err) {
                if(err.message.indexOf('no such file or directory') < 0) {
                    warn('Could not send Schema:', filePath, schemaType)
                    console.error(err)
                }
                return []
            }
        }

        /**
         * @param {string} filePaths
         * @return {number} 
         */
        function buildIndexPage(filePaths) {
            const files = filePaths.map(path => {
                const splittedPath = path.split('/')
                const name = splittedPath.pop()
                return {
                    path,
                    name
                }
            })
            let html = '<div>'
            for(let i = 0; i < files.length; i++) {
                html += '<div class="docs-definition-floating-cells"><a href="' + ED.utilities.normaliseInternalLink(files[i].path) + '">' + files[i].name + '</a></div>'
            }
            html += '</div>'

            let firstPath = filePaths[0].split('/')
            if(firstPath[0] == global.env.PATH_TO_PAGES_DIR) {
                firstPath = firstPath.slice(1)
            }
            const destination = global.env.PATH_TO_PAGES_DIR + '/' + (firstPath.slice(0,firstPath.length-1).join('/')) + '/index.html'
            try {
                const dom = new SA.nodeModules.jsDom(SA.nodeModules.fs.readFileSync(ED.indexFile))
                dom.window.document.getElementById('docs-content-div').innerHTML = html
                SA.nodeModules.fs.writeFileSync(destination, dom.serialize())
            }
            catch(error) {
                console.error(error)
            }
            return files.length
        }

        // /**
        //  * 
        //  * @param {string[]} filePaths
        //  * @return {{
        //  *   name: string,
        //  *   children: [],
        //  *   link: string
        //  * }} 
        //  */
        // function buildSiteIndexArray(filePaths) {
        //     let HTML = ''
        //     var keyPairs = {}
        //     filePaths.forEach(function(path) {
        //         path.split('/').reduce(function(r, e) {
        //             return r[e] || (r[e] = {})
        //         }, keyPairs)
        //     })

        //     function iterateObjectKeys(obj, parent) {
        //         for(let key of Object.keys(obj)) {
        //             const link = parent + '/' + key
        //             if(Object.keys(obj[key]).length > 0) {
        //                 HTML = HTML + '<li>' + (key == global.env.PATH_TO_PAGES_DIR ? '' : key) + '<ul>'
        //                 iterateObjectKeys(obj[key], link)
        //                 HTML = HTML + '</ul></li>'
        //             }
        //             else {
        //                 HTML = HTML + '<li><a href="' + ED.utilities.normaliseInternalLink(link) + '">' + key + '</a></li>'
        //             }
        //         }
        //     }
        //     HTML = HTML + '<ul>'
        //     iterateObjectKeys(keyPairs, '')
        //     HTML = HTML + '</ul>'

        //     const homePage = global.env.PATH_TO_PAGES_DIR + '/index.html'
        //     try {
        //         const dom = new SA.nodeModules.jsDom(SA.nodeModules.fs.readFileSync(ED.indexFile))
        //         dom.window.document.getElementById('docs-content-div').innerHTML = HTML
        //         SA.nodeModules.fs.writeFileSync(homePage, dom.serialize())
        //         return true
        //     }
        //     catch(error) {
        //         console.error(error)
        //         return false
        //     }
        // }

        function setSourceFileLinks() {
            const dom = new SA.nodeModules.jsDom(SA.nodeModules.fs.readFileSync(ED.baseIndexFile))

            const docs = dom.window.document.createElement('link')
            docs.type = 'text/css'
            docs.rel = 'stylesheet'
            docs.href = '/' + global.env.REMOTE_DOCS_DIR + '/css/docs.css'
            dom.window.document.getElementsByTagName('head')[0].appendChild(docs)
            
            const fonts = dom.window.document.createElement('link')
            fonts.type = 'text/css'
            fonts.rel = 'stylesheet'
            fonts.href = '/' + global.env.REMOTE_DOCS_DIR + '/css/font-awasome.css'
            dom.window.document.getElementsByTagName('head')[0].appendChild(fonts)

            // adding this to the bottom of the <body> as not sure if jsdom supports `defer` tag
            const actionScripts = dom.window.document.createElement('script')
            actionScripts.type = 'text/javascript'
            actionScripts.src = '/' + global.env.REMOTE_DOCS_DIR + '/js/action-scripts.js'
            dom.window.document.getElementsByTagName('body')[0].appendChild(actionScripts)

            SA.nodeModules.fs.writeFileSync(ED.indexFile, dom.serialize())
        }
    }
}
