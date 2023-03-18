exports.newListSpaceFilesRoute = function newListSpaceFilesRoute() {
    const thisObject = {
        endpoint: 'ListSpaceFiles',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let fs = SA.nodeModules.fs
        let allFiles = []
        let projects = SA.projects.foundations.utilities.filesAndDirectories.getDirectories(global.env.PATH_TO_PROJECTS)
        let dirCount = 0
        let totalDirs = 0

        for(let i = 0; i < projects.length; i++) {
            let project = projects[i]

            let dirPath = project + '/UI/Spaces'
            let spaces = SA.projects.foundations.utilities.filesAndDirectories.getDirectories(global.env.PATH_TO_PROJECTS + '/' + dirPath)

            for(let j = 0; j < spaces.length; j++) {
                let space = spaces[j]
                readDirectory(dirPath + '/' + space)
            }

            function readDirectory(path) {
                try {

                    totalDirs++
                    fs.readdir(global.env.PATH_TO_PROJECTS + '/' + path, onDirRead)

                    let otherDirs = SA.projects.foundations.utilities.filesAndDirectories.getDirectories(global.env.PATH_TO_PROJECTS + '/' + path)
                    for(let m = 0; m < otherDirs.length; m++) {
                        let otherDir = otherDirs[m]
                        readDirectory(path + '/' + otherDir)
                    }

                    function onDirRead(err, fileList) {
                        if(err) {
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                        } else {
                            let updatedFileList = []
                            for(let k = 0; k < fileList.length; k++) {
                                let name = fileList[k]
                                if(name.indexOf('.js') < 0) {
                                    continue
                                }
                                updatedFileList.push(path + '/' + name)
                            }
                            allFiles = allFiles.concat(updatedFileList)
                            dirCount++
                            if(dirCount === totalDirs) {
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(allFiles), httpResponse)
                            }
                        }
                    }
                } catch(err) {
                    SA.logger.error('Error reading a directory content. filePath = ' + path)
                    SA.logger.error('err.stack = ' + err.stack)
                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                    return
                }
            }
        }
    }
}