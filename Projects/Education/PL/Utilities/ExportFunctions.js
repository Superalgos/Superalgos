exports.newEducationUtilitiesExportFunctions = function () {

    let thisObject = {
        process: process
    }

    return thisObject

    function process(body) {
        try {
            const payload = JSON.parse(body)
            const filePath = global.env.PATH_TO_EXPORT_DOCS + '/' + `${payload.project}/${payload.category}/`
            SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
            
            const fileName = `${payload.type.replace(' ', '-')}.html`
    
            const content = readIndexTemplateFile().replace('%docs-content-div%', payload.content)
    
            SA.nodeModules.fs.writeFileSync(filePath + fileName, content)
        }
        catch(error) {
            console.error(error)
        }
    }

    function readIndexTemplateFile() {
        const contents = SA.nodeModules.fs.readFileSync(global.env.PATH_TO_EXPORT_DOCS + '/index.html')
        return contents.toString('utf8')
    }
}