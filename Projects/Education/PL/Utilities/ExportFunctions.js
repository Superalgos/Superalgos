exports.newEducationUtilitiesExportFunctions = function () {

    let thisObject = {
        process: process
    }

    return thisObject

    function process(body) {
        const payload = JSON.parse(body)
        const filePath = global.env.PATH_TO_EXPORT_DOCS + '/' + `${payload.project}/${payload.category}/`
        SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
        
        const fileName = `${payload.type.replace(' ', '-')}.html`

        SA.nodeModules.fs.writeFileSync(filePath + fileName, payload.content)
    }
}