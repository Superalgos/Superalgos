exports.newPluginsUtilitiesPlugins = function () {

    let thisObject = {
        getPluginFileNames: getPluginFileNames,
        getPluginFileContent: getPluginFileContent
    }

    return thisObject

    async function getPluginFileNames(project, folder) {
        let promise = new Promise((resolve, reject) => {

            let path = global.env.PATH_TO_PROJECTS + '/' + project + '/Plugins/' + folder

            SA.nodeModules.fs.readdir(path, (err, files) => {
                if (err) {
                    reject(err)
                    return
                }
                if (files === undefined) {
                    files = []
                }
                resolve(files)
            })

        }
        )
        return promise
    }

    async function getPluginFileContent(project, folder, fileName) {
        let promise = new Promise((resolve, reject) => {

            let path = global.env.PATH_TO_PROJECTS + '/' + project + '/Plugins/' + folder + '/' + fileName

            SA.nodeModules.fs.readFile(path, onFileRead)

            function onFileRead(err, file) {
                if (err) {
                    console.log('[WARN] getPluginFileContent -> File not Found -> Path = ' + path)
                    reject('File not Found')
                    return
                }
                resolve(file.toString())
            }
        }
        )
        return promise
    }
}