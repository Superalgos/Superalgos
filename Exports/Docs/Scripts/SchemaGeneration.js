const {debug, error, warn} = require('./Logger').logger

exports.schemaGeneration = function schemaGeneration() {
    const thisObject = {
        convertProjectsToSchemas: convertProjectsToSchemas,
        schemaTypes: [
            {
                category: 'App-Schema',
                name: 'AppSchema',
                key:  'appSchema',
                folder: 'App-Schema'
            },
            {
                category: 'Node', 
                name: 'DocsNodeSchema',
                key:  'docsNodeSchema',
                folder: 'Docs-Nodes'
            },
            {
                category: 'Concept', 
                name: 'DocsConceptSchema',
                key:  'docsConceptSchema',
                folder: 'Docs-Concepts'
            },
            {
                category: 'Topic', 
                name: 'DocsTopicSchema',
                key:  'docsTopicSchema',
                folder: 'Docs-Topics'
            },
            {
                category: 'Tutorial',
                name: 'DocsTutorialSchema',
                key:  'docsTutorialSchema',
                folder: 'Docs-Tutorials'
            },
            {
                category:  'Review',
                name: 'DocsReviewSchema',
                key:  'docsReviewSchema',
                folder: 'Docs-Reviews'
            },
            {
                category:  'Book',
                name: 'DocsBookSchema',
                key:  'docsBookSchema',
                folder: 'Docs-Books'
            }
        ]
    }

    return thisObject

    async function convertProjectsToSchemas(project) {
        const schemas = {
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
        // SCHEMAS_BY_PROJECT.set(project, schemas)

        const path = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/'
        debug('retrieving schemas from ' + path)
        for(let j = 0; j < thisObject.schemaTypes.length; j++) {
            const schemaType = thisObject.schemaTypes[j]
            debug('retrieving schema from ' + schemaType.folder)
            const schema = await sendSchema(path, schemaType)
            process(schema, schemas, schemaType.key)
        }

        return schemas

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
                debug('processing ' + schemas.array[schemaKey].length + ' schemas for ' + schemaKey)
                for(let j = 0; j < schemas.array[schemaKey].length; j++) {
                    const schemaDocument = schemas.array[schemaKey][j]
                    const key = schemaDocument.type
                    schemas.map[schemaKey].set(key, schemaDocument)
                }
            } catch(err) {
                error(err)
            }
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
                            const splittedDir = dir.split('/')
                            const lastFolder = splittedDir[splittedDir.length - 2]
                            const pathAndNames = []
                            for(let i = 0; i < files.length; i++) {
                                const file = files[i]
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

                    const schemaArray = []
                    for(let k = 0; k < files.length; k++) {
                        const name = files[k]
                        const nameSplitted = name.split(schemaType.folder)
                        let fileName = nameSplitted[1]
                        for(let i = 0; i < 10; i++) {
                            fileName = fileName.replace('\\', '/')
                        }
                        const fileToRead = filePath + schemaType.folder + fileName

                        const fileContent = fs.readFileSync(fileToRead)
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
                    error(err)
                }
                return []
            }
        }
    }
}