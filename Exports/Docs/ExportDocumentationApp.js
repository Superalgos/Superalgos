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
        const completed = await ED.schemas.convertProjectsToSchemas(project)
            .then(() => ED.designSpace.initialize(project))
            .then(() => setUpMenuItemsMap(project))
            .then(() => triggerPageRendering(project, category))
            .then((filePaths) => filePaths.length > 0 ? buildIndexPage(filePaths) : 0)
            .then((count) => {
                ED.designSpace.finalize()
                return count
            })
            
        return completed

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

        async function triggerPageRendering(project, category) {
            info('preparing for page transfer rendering')
            const exporter = require('./Scripts/DocumentationExporter')
            const filePaths = []
            const key = ED.schemas.schemaTypes.find( t => t.category == category).key
            const schemaKeys = SCHEMAS_BY_PROJECT.get(project).map[key].keys()
            for(let type of schemaKeys) {
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
                await exportProcess.render().then(() => {  
                    info('writing      -> ' + project + ' -> ' + category + ' -> ' + type)
                    filePaths.push(exportProcess.write())
                    
                    info('finalizing   -> ' + project + ' -> ' + category + ' -> ' + type)
                    exportProcess.finalize()
                })
            }
            return filePaths
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
                html += '<div class="docs-definition-floating-cells"><a href="' + ED.utilities.normaliseInternalLink(files[i].path.split('/')) + '">' + files[i].name + '</a></div>'
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
