const {info, warn} = require('./Logger').logger
exports.documentationDesignSpace = function() {
    let thisObject = {
        getIconByProjectAndName: getIconByProjectAndName,
        getIconByProjectAndType: getIconByProjectAndType,
        getIconByExternalSource: getIconByExternalSource,
        initialize: initialize,
        finalize: finalize
    }

    let internal = {
        iconsByProjectAndName: undefined,
        iconsByProjectAndType: undefined,
    }

    return thisObject

    function finalize() {
        info('finalizing design space')
        internal = undefined
    }

    async function initialize(project) {
        info('initializing design space')
        internal = {
            iconsByProjectAndName: new Map(),
            iconsByProjectAndType: new Map()
        }

        await copyWebServerData()
        await copyCustomJsScripts()

        const iconsArray = await new Promise(res => SA.projects.foundations.utilities.icons.retrieveIcons(x => res(x)))

        let imageLoadedCounter = 0

        for(let i = 0; i < iconsArray.length; i++) {
            let project = iconsArray[i][0]
            let path = iconsArray[i][1]
            loadImage(project, path)
        }

        buildIconByProjectAndTypeMap(project)

        return 'loaded ' + imageLoadedCounter + ' image' + (imageLoadedCounter == 1 ? '' : 's')

        /**
         * 
         * @param {string} project 
         * @param {string} path 
         */
        function loadImage(project, path) {
            imageLoadedCounter++
            let image = new Image()
            const pathParts = path.replaceAll('\\', '/').split('/')
            image.fileName = pathParts.length === 1 ? pathParts[0] : pathParts[pathParts.length-1]
            
            let splittedPath = path.split('\\')
            let name = splittedPath[splittedPath.length - 1]
            
            let from = global.env.PATH_TO_PROJECTS + '/' + project + '/Icons/'
            let to = global.env.PATH_TO_PAGES_DIR + '/' + 'Icons/' + project + '/'
            
            if(pathParts.length > 1) {
                pathParts.splice(pathParts.length-1)
                from = from + pathParts.join('/') + '/'
                to = to +  pathParts.join('/') + '/'
            }
            image.src = to + path

            copyFile(from, to, image.fileName)

            let key = project + '-' + name.substring(0, name.length - 4)
            internal.iconsByProjectAndName.set(key, image)
            
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

        async function copyWebServerData() {
            //TOD: transfer css, Fonts, Images
            const base = global.env.PATH_TO_PLATFORM + '/WebServer/'
            const transferDirectories = ['css', 'Fonts', 'Images']
            const filesTasks = transferDirectories.map( dir => new Promise(res => SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories(base + dir, (f) => res(f))))
            const files = (await Promise.all(filesTasks)).flat()
            files.forEach(file => {
                let fileParts = file.replaceAll('\\','/').split('/')
                const fileName = fileParts.length === 1 ? fileParts[0] : fileParts.splice(fileParts.length-1)[0]
                const additionalPath = fileParts.length > 0 ? fileParts.join('/') + '/' : ''
                copyFile(base + additionalPath, global.env.PATH_TO_PAGES_DIR + '/' + additionalPath, fileName) 
            })
        }

        async function copyCustomJsScripts() {
            const baseDir = global.env.EXPORT_DOCS_DIR + '/'
            const files = await new Promise(res => SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories(baseDir + 'js', (f) => res(f)))
            files.forEach(file => {
                let fileParts = file.replaceAll('\\','/').split('/')
                const fileName = fileParts.length === 1 ? fileParts[0] : fileParts.splice(fileParts.length-1)[0]
                const additionalPath = fileParts.length > 0 ? fileParts.join('/') + '/' : ''
                copyFile(baseDir + additionalPath, global.env.PATH_TO_PAGES_DIR + '/' + additionalPath, fileName) 
            })
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
                        internal.iconsByProjectAndType.set(key, icon)
                    }
                }
            }
        }
    }

    function getIconByProjectAndName(project, name) {
        return internal.iconsByProjectAndName.get(project + '-' + name)
    }

    function getIconByProjectAndType(project, type) {
        return internal.iconsByProjectAndType.get(project + '-' + type)
    }

    // TODO: review for potential download during build process
    function getIconByExternalSource(project, url) {

        let image
        let key = project + '-' + url

        image = internal.iconsByProjectAndName.get(key)

        if(image === undefined) {

            image = new Image()
            image.src = url

            let key = project + '-' + image.src
            internal.iconsByProjectAndName.set(key, image)
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
            img.src = ED.utilities.normaliseInternalLink(image.src.replaceAll('\\','/'))
            img.alt = image.fileName.replaceAll('\\','/')
            return img
        }
    }
}
