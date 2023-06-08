exports.newListWorkspacesRoute = function newListWorkspacesRoute() {
    const thisObject = {
        endpoint: 'ListWorkspaces',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        const fs = SA.nodeModules.fs
        let allWorkspaces = []
        let projects = SA.projects.foundations.utilities.filesAndDirectories.getDirectories(global.env.PATH_TO_PROJECTS)
        let projectsCount = 0

        for(let i = 0; i < projects.length; i++) {
            let project = projects[i]
            readPluginWorkspaces()

            function readPluginWorkspaces() {
                let pluginName = project
                if(global.env.PROJECT_PLUGIN_MAP[project] && global.env.PROJECT_PLUGIN_MAP[project].dir) pluginName = global.env.PROJECT_PLUGIN_MAP[project].dir
                let dirPath = global.env.PATH_TO_PLUGINS + '/' + pluginName + '/Workspaces'
                try {
                    fs.readdir(dirPath, onDirRead)

                    function onDirRead(err, fileList) {
                        let updatedFileList = []

                        if(err) {
                            /*
                            If we have a problem reading this folder we will assume that it is
                            because this project does not need this folder and that's it.
                            */
                            //SA.logger.warn('Error reading a directory content. filePath = ' + dirPath)
                        } else {
                            for(let i = 0; i < fileList.length; i++) {
                                let name = 'Native \u2192 ' + fileList[i]
                                updatedFileList.push([project, name])
                            }
                        }
                        allWorkspaces = allWorkspaces.concat(updatedFileList)
                        projectsCount++
                        if(projectsCount === projects.length) {
                            // SA.logger.debug(`${projectsCount} === ${projects.length}`)
                            readMyWorkspaces()
                        }
                    }
                } catch(err) {
                    SA.logger.error('Error reading a directory content. filePath = ' + dirPath)
                    SA.logger.error('err.stack = ' + err.stack)
                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                    return
                }
            }
        }

        function readMyWorkspaces() {
            let dirPath = global.env.PATH_TO_MY_WORKSPACES
            /* Create Dir if it does not exist */
            if(!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, {recursive: true});
            }
            try {
                const nestedList = iterateDirectoryItems([dirPath])
                allWorkspaces = allWorkspaces.concat(nestedList.map(list => {
                    list.splice(0, 1, '')
                    return list
                }))
                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(allWorkspaces), httpResponse)
            } catch(err) {
                SA.logger.error('Error reading a directory content. filePath = ' + dirPath)
                SA.logger.error('err.stack = ' + err.stack)
                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                return
            }
        }

        function iterateDirectoryItems(dirPath) {
            let results = []
            const topPath = SA.nodeModules.path.join(...dirPath)
            const items = fs.readdirSync(topPath)
            for(let i = 0; i < items.length; i++) {
                const name = SA.nodeModules.path.join(topPath, items[i])
                if(fs.lstatSync(name).isDirectory()) {
                    results = results.concat(iterateDirectoryItems([...dirPath, items[i]]))
                }
                else {
                    results.push([...dirPath, items[i]])
                }
            }
            return results
        }
    }
}