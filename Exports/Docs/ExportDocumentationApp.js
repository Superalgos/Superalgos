const {info} = require('./Scripts/Logger').logger
exports.newExportDocumentationApp = function newExportDocumentationApp() {

    let thisObject = {
        run: run
    }

    return thisObject

    async function run({project, category}) {
        info('Project conversion'.padEnd(20) + ' -> ' + project + ' -> ' + category + ' -> START')
        return await triggerPageRendering(project, category)
            .then((filePaths) => filePaths.length > 0 ? buildIndexPage(filePaths) : 0)

        async function triggerPageRendering(project, category) {
            info('Page rendering'.padEnd(20) + ' -> preparing')
            const exporter = require('./Scripts/DocumentationExporter')
            const filePaths = []
            const key = ED.schemas.schemaTypes.find( t => t.category == category).key
            const schemaKeys = SCHEMAS_BY_PROJECT.get(project).map[key].keys()
            for(let type of schemaKeys) {
                info('render'.padEnd(20) + ' -> ' + project + ' -> ' + category + ' -> ' + type)
                const exportProcess = exporter.documentationExporter()
                exportProcess.currentLanguageCode = ED.DEFAULT_LANGUAGE
                exportProcess.currentDocumentBeingRendered = {
                    project,
                    category,
                    type
                }

                info('Initializing'.padEnd(20) + ' -> ' + project + ' -> ' + category + ' -> ' + type)
                exportProcess.initialize()

                info('Rendering'.padEnd(20) + ' -> ' + project + ' -> ' + category + ' -> ' + type)
                await exportProcess.render().then(() => {  
                    info('Writing'.padEnd(20) + ' -> ' + project + ' -> ' + category + ' -> ' + type)
                    filePaths.push(exportProcess.write())
                    
                    info('Finalizing'.padEnd(20) + ' -> ' + project + ' -> ' + category + ' -> ' + type)
                    exportProcess.finalize()
                })
            }
            return filePaths
        }

        // TODO: remove section in favour of rendering from json file
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
                html += '<div class="docs-definition-floating-cells"><a href="' + ED.utilities.normaliseInternalLink(trimLocalPath(files[i].path)) + '">' + files[i].name + '</a></div>'
            }
            html += '</div>'
            const firstPath = trimLocalPath(filePaths[0])
            const destination = global.env.PATH_TO_PAGES_DIR + '/' + (firstPath.slice(0,firstPath.length-1).join('/')) + '/index.html'
            try {
                const dom = new SA.nodeModules.jsDom(SA.nodeModules.fs.readFileSync(ED.indexFile))
                dom.window.document.getElementById('docs-content-div').innerHTML = html
                SA.nodeModules.fs.writeFileSync(destination, dom.serialize())
            }
            catch(error) {
                error(error)
            }
            return files.length

            /**
             * removes the local folder directory for correct browser linking
             * @param {string} filePath 
             * @returns {string}
             */
            function trimLocalPath(filePath) {
                return filePath.indexOf(global.env.PATH_TO_PAGES_DIR) == 0 ? filePath.slice(global.env.PATH_TO_PAGES_DIR.length+1).split('/') : filePath.splice('/')
            }
        }
    }
}
