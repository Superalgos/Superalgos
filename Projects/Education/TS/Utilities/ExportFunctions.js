exports.newEducationUtilitiesExportFunctions = function () {
    let thisObject = {
        process: process
    }

    return thisObject

    function process(body) {
        const filePath = global.env.PATH_TO_EXPORT_DOCS + '/'
        SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
        
        const payload = JSON.parse(body)
        const fileName = `${payload.project}/${payload.category}/${payload.type}.html`

        SA.nodeModules.fs.writeFileSync(filePath + fileName, payload.content)
    }
}