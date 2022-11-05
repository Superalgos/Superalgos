const path = require('path')

const {info, warn} = require('./Scripts/Logger').logger
exports.newExportDocumentationApp = function newExportDocumentationApp() {

    let thisObject = {
        run: run
    }
    
    let schemaTypes = [
        {
            name: 'AppSchema',
            key:  'appSchema',
            folder: 'App-Schema'
        },
        {
            name: 'DocsNodeSchema',
            key:  'docsNodeSchema',
            folder: 'Docs-Nodes'
        },
        {
            name: 'DocsConceptSchema',
            key:  'docsConceptSchema',
            folder: 'Docs-Concepts'
        },
        {
            name: 'DocsTopicSchema',
            key:  'docsTopicSchema',
            folder: 'Docs-Topics'
        },
        {
            name: 'DocsTutorialSchema',
            key:  'docsTutorialSchema',
            folder: 'Docs-Tutorials'
        },
        {
            name: 'DocsReviewSchema',
            key:  'docsReviewSchema',
            folder: 'Docs-Reviews'
        },
        {
            name: 'DocsBookSchema',
            key:  'docsBookSchema',
            folder: 'Docs-Books'
        }
    ]

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

        async function convertProjectsToSchemas(project) {
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
                let schema = await sendSchema(global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/', schemaType)
                process(schema, schemas, schemaType.key)
            }

            /**
             * 
             * @param {string} schema 
             * @param {{
             *   array: {
             *     appSchema: [],
             *     docsNodeSchema: [],
             *     docsConceptSchema: [],
             *     docsTopicSchema: [],
             *     docsTutorialSchema: [],
             *     docsReviewSchema: [],
             *     docsBookSchema: [],
             *     workspaceSchema: []
             *   },
             *   map: {
             *     appSchema: new Map(),
             *     docsNodeSchema: new Map(),
             *     docsConceptSchema: new Map(),
             *     docsTopicSchema: new Map(),
             *     docsTutorialSchema: new Map(),
             *     docsReviewSchema: new Map(),
             *     docsBookSchema: new Map(),
             *     workspaceSchema: new Map()
             *   }
             * }} schemas 
             * @param {string} schemaKey 
             */
            function process(schema, schemas, schemaKey) {
                try {
                    schemas.array[schemaKey] = JSON.parse(schema)

                    for(let j = 0; j < schemas.array[schemaKey].length; j++) {
                        let schemaDocument = schemas.array[schemaKey][j]
                        let key = schemaDocument.type
                        schemas.map[schemaKey].set(key, schemaDocument)
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
         * @param {string} filePath
         * @param {{
         *   name: string,
         *   key: string,
         *   folder: string
         * }} schemaType
         */
        async function sendSchema(filePath, schemaType) {
            let fs = SA.nodeModules.fs
            try {
                const files = await getAllFilesInDirectoryAndSubdirectories(filePath + schemaType.folder)
                return onFilesReady(files)

                /**
                 * 
                 * @param {string} dir 
                 * @returns {Promise<string[]>}
                 */
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

                /**
                 * 
                 * @param {string[]} files 
                 * @returns {string}
                 */
                function onFilesReady(files) {

                    let schemaArray = []
                    for(let k = 0; k < files.length; k++) {
                        let name = files[k]
                        let nameSplitted = name.split(schemaType.folder)
                        let fileName = nameSplitted[1]
                        for(let i = 0; i < 10; i++) {
                            fileName = fileName.replace('\\', '/')
                        }
                        let fileToRead = filePath + schemaType.folder + fileName

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
                    warn('Could not send Schema:', filePath, schemaType.name)
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
