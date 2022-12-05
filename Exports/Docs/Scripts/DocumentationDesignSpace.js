const {info, error} = require('./Logger').logger

/**
 * @typedef {{
 *   canDrawIcon: boolean,
 *   src: string,
 *   fileName: string,
 *   asImageNode: (any) => any
 * }} Image
 */

exports.documentationDesignSpace = function documentationDesignSpace() {
    let thisObject = {
        getIconByProjectAndName: getIconByProjectAndName,
        getIconByProjectAndType: getIconByProjectAndType,
        getIconByExternalSource: getIconByExternalSource,
        initialize: initialize,
        finalize: finalize,
        copyWebServerData: copyWebServerData,
        copyCustomJsScripts: copyCustomJsScripts,
        copyCustomCssScripts: copyCustomCssScripts,
        copyProjectAssets: copyProjectAssets,
        copyFavicon: copyFavicon
    }

    return thisObject

    function finalize(project) {
        info('Design space'.padEnd(20) + ' -> ' + project + ' -> finalizing')
        // internal = undefined
    }

    async function initialize(project) {
        info('Design space'.padEnd(20) + ' -> ' + project + ' -> initializing project assets' )

        const iconsArray = await new Promise(res => SA.projects.foundations.utilities.icons.retrieveIcons(x => res(x)))

        let imageLoadedCounter = 0

        for(let i = 0; i < iconsArray.length; i++) {
            let iconProject = iconsArray[i][0]
            let iconPath = iconsArray[i][1]
            loadImage(project, iconProject, iconPath)
        }

        buildIconByProjectAndTypeMap(project)

        return 'loaded ' + imageLoadedCounter + ' image' + (imageLoadedCounter == 1 ? '' : 's')

        /**
         * 
         * @param {string} project 
         * @param {string} iconProject
         * @param {string} iconPath 
         */
        function loadImage(project, iconProject, iconPath) {
            imageLoadedCounter++
            let image = new Image()
            const pathParts = iconPath.replaceAll('\\', '/').split('/')
            image.fileName = pathParts.length === 1 ? pathParts[0] : pathParts[pathParts.length-1]
            
            let from = global.env.PATH_TO_PROJECTS + '/' + iconProject + '/Icons/'
            let to = global.env.PATH_TO_PAGES_DIR + '/' + 'Icons/' + iconProject + '/'
            
            if(pathParts.length > 1) {
                pathParts.splice(pathParts.length-1)
                from = from + pathParts.join('/') + '/'
                to = to +  pathParts.join('/') + '/'
            }
            image.src = to + image.fileName

            if(project === iconProject) {
                copyFile(from, to, image.fileName)
            }

            let key = iconProject + '-' + image.fileName.substring(0, image.fileName.length - 4)
            PROJECT_ICONS.byName.set(key, image)
        }
        
        function buildIconByProjectAndTypeMap(project) {
            /* Take types-icons relationships defined at the schema */
            addSchemaTypes(SCHEMAS_BY_PROJECT.get(project).array.appSchema)
            addSchemaTypes(SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema)
            addSchemaTypes(SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema)
            addSchemaTypes(SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema)
            
            function addSchemaTypes(schema) {
                for(let j = 0; j < schema.length; j++) {
                    let schemaDocument = schema[j]
                    let iconName = schemaDocument.icon
                    if(iconName === undefined) {
                        iconName = schemaDocument.type.toLowerCase()
                        iconName = iconName.split(" ").join("-")
                    }
                    let icon = getIconByProjectAndName(project, iconName)
                    if(icon !== undefined) {
                        let key = project + '-' + schemaDocument.type
                        PROJECT_ICONS.byType.set(key, icon)
                    }
                }
            }
        }
    }
    
    /**
     * 
     * @param {string} project 
     * @param {string} url 
     * @returns {Image}
     */
    function getIconByProjectAndName(project, name) {
        return PROJECT_ICONS.byName.get(project + '-' + name)
    }
    
    /**
     * 
     * @param {string} project 
     * @param {string} url 
     * @returns {Image}
     */
    function getIconByProjectAndType(project, type) {
        return PROJECT_ICONS.byType.get(project + '-' + type)
    }
    
    /**
     * 
     * @param {string} project 
     * @param {string} url 
     * @returns {Image}
     */
    function getIconByExternalSource(project, url) {
        
        let image
        let key = project + '-' + url
        
        image = PROJECT_ICONS.byName.get(key)
        
        if(image === undefined) {
            
            image = new Image()
            image.src = url
            
            let key = project + '-' + image.src
            PROJECT_ICONS.byName.set(key, image)
        }
        
        return image
    }
    
    function Image() {
        const image = {
            canDrawIcon: false,
            src: '',
            fileName: '',
            asImageNode: asImageNode
        }
        
        return image
        
        function asImageNode(doc) {
            const img = doc.createElement('img')
            img.src = ED.utilities.normaliseInternalLink(image.src.replaceAll('\\','/').split('/'))
            img.alt = image.fileName.replaceAll('\\','/')
            return img
        }
    }

    /**
     * 
     * @param {string} project 
     * @returns {Promise<void>}
     */
     async function copyProjectAssets(project) {
        info('Design space'.padEnd(20) + ' -> ' + project + ' -> copy asset files')
        const assetDirectories = ['PNGs', 'GIFs']
        for(let i = 0; i < assetDirectories.length; i++) {
            await copyAssetDirectory(project, assetDirectories[i]).catch(err => error(err))
        }
        
        async function copyAssetDirectory(project, assetDirectory) {
            const base = global.env.PATH_TO_PROJECTS + '/' + project + '/'
            const files = await new Promise(res => SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories(base + assetDirectory, (f) => res(f)))
            files.forEach(file => {
                let fileParts = file.replaceAll('\\','/').split('/')
                const fileName = fileParts.length === 1 ? fileParts[0] : fileParts.splice(fileParts.length-1)[0]
                const {from, to} = generateTransferDirectories(base, project, assetDirectory, fileParts)
                copyFile(from, to, fileName)
            })
            
            /**
             * 
             * @param {string} base 
             * @param {string} project 
             * @param {string} assetDirectory 
             * @param {string[]} fileParts 
             * @returns {{
             *   from: string,
             *   to: string
             * }}
             */
            function generateTransferDirectories(base, project, assetDirectory, fileParts) {
                const result = {
                    from: base + fileParts.join('/') + '/',
                    to: global.env.PATH_TO_PAGES_DIR + '/'
                }
                if(fileParts.length === 0) {
                    return result
                }
                if(fileParts[0] === assetDirectory) {
                    fileParts = fileParts.slice(1)
                }
                result.to += [assetDirectory, project].concat(fileParts).join('/') + '/'
                return result
            }
        }
    }

    /**
     * @return {Promise<void>}
     */
     async function copyWebServerData() {
        info('Design space'.padEnd(20) + ' -> copy web server files')
        const base = global.env.PATH_TO_PLATFORM + '/WebServer/'

        info('Design space'.padEnd(20) + ' -> transfering -> images')
        await copyDir(base, 'Images')

        info('Design space'.padEnd(20) + ' -> transfering -> fonts')
        await copyDir(base, 'Fonts')
        await copyDir(base, 'Fonts', undefined, ['Fonts', 'css/Fonts'])

        info('Design space'.padEnd(20) + ' -> transfering -> css')
        const desiredSheets = ['docs.css', 'main.css', 'font-awasome.css']
        await copyDir(base, 'css', (f) => desiredSheets.find(x => f.indexOf(x) > 0) !== undefined)

        info('Design space'.padEnd(20) + ' -> transfering -> js')
        await copyDir(base, 'externalScripts', (f) => f.indexOf('flexsearch.bundle.js') > 0, ['externalScripts', 'js'])
    }

    /**
     * @return {Promise<void>}
     */
    async function copyCustomJsScripts() {
        info('Design space'.padEnd(20) + ' -> copy custom JS files')
        await copyDir(global.env.EXPORT_DOCS_DIR + '/', 'js')
    }

    /**
     * @return {Promise<void>}
     */
    async function copyCustomCssScripts() {
        info('Design space'.padEnd(20) + ' -> copy custom CSS files')
        await copyDir(global.env.EXPORT_DOCS_DIR + '/', 'css')
    }

    function copyFavicon() {
        const fileName = 'favicon.ico'
        copyFile(global.env.EXPORT_DOCS_DIR + '/img/', global.env.PATH_TO_PAGES_DIR + '/', fileName) 
    }

    /**
     * 
     * @param {string} from directory the file is currently in 
     * @param {string} to directory the file is moving to
     * @param {string} fileName the file name to transfer
     */
    function copyFile(from, to, fileName) {
        const fs = SA.nodeModules.fs
        if(!fs.existsSync(to)) {
            SA.projects.foundations.utilities.filesAndDirectories.createNewDir(to)
        }
        fs.copyFileSync(from + fileName, to + fileName)
    }

    /**
     * 
     * @param {string} baseDirectory 
     * @param {string} directory 
     * @param {(string)=>boolean} filter
     * @param {string[]} directoryReplacement
     */
    async function copyDir(baseDirectory, directory, filter, directoryReplacement) {
        let files = await new Promise(res => SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories(baseDirectory + directory, (f) => res(f)))
        if(filter !== undefined) {
            files = files.filter(filter)
        }
        files.forEach(file => {
            let fileParts = file.replaceAll('\\','/').split('/')
            const fileName = fileParts.length === 1 ? fileParts[0] : fileParts.splice(fileParts.length-1)[0]
            const originalDir = fileParts.length > 0 ? fileParts.join('/') + '/' : ''
            let remoteDir = originalDir
            if(directoryReplacement !== undefined && directoryReplacement.length == 2) {
                remoteDir = originalDir.replace(directoryReplacement[0], directoryReplacement[1])
            }
            copyFile(baseDirectory + originalDir, global.env.PATH_TO_PAGES_DIR + '/' + remoteDir, fileName) 
        })
    }
}
