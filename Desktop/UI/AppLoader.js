
function newAppLoader() {

    let thisObject = {
        loadModules: loadModules
    }

    let postLoader
    return thisObject

    async function loadModules() {
        try {
            let modulesArray = [
                'WebDebugLog.js',
                'AppPostLoader.js',
                'Globals.js',
                'WebApp.js'
            ]

            functionLibraries()

            function functionLibraries() {
                let url = 'ListFunctionLibraries'
                httpRequest(undefined, url, onResponse)

                function onResponse(err, fileList) {
                    let urlArray = []
                    let fileArray = JSON.parse(fileList)
                    for (let i = 0; i < fileArray.length; i++) {
                        let item = fileArray[i]

                        project = item[0]
                        fileName = item[1]
                        urlArray.push('Projects' + '/' + project + '/' + 'UI' + '/' + 'Function-Libraries' + '/' + fileName)
                    }

                    modulesArray = modulesArray.concat(urlArray)
                    utilities()
                }
            }

            function utilities() {
                let url = 'ListUtilitiesFiles'
                httpRequest(undefined, url, onResponse)

                function onResponse(err, fileList) {
                    let urlArray = []
                    let fileArray = JSON.parse(fileList)
                    for (let i = 0; i < fileArray.length; i++) {
                        let item = fileArray[i]

                        project = item[0]
                        fileName = item[1]
                        urlArray.push('Projects' + '/' + project + '/' + 'UI' + '/' + 'Utilities' + '/' + fileName)
                    }

                    modulesArray = modulesArray.concat(urlArray)
                    globals()
                }
            }

            function globals() {
                let url = 'ListGlobalFiles'
                httpRequest(undefined, url, onResponse)

                function onResponse(err, fileList) {
                    let urlArray = []
                    let fileArray = JSON.parse(fileList)
                    for (let i = 0; i < fileArray.length; i++) {
                        let item = fileArray[i]

                        project = item[0]
                        fileName = item[1]
                        urlArray.push('Projects' + '/' + project + '/' + 'UI' + '/' + 'Globals' + '/' + fileName)
                    }

                    modulesArray = modulesArray.concat(urlArray)
                    downloadIncludedFiles()
                }
            }

            function downloadIncludedFiles() {

                let downloadedCounter = 0

                for (let i = 0; i < modulesArray.length; i++) {
                    let path = modulesArray[i]

                    REQUIREJS([path], onRequired)

                    function onRequired(pModule) {
                        try {

                            downloadedCounter++

                            if (downloadedCounter === modulesArray.length) {
                                setTimeout(() => {
                                    postLoader = newAppPostLoader()
                                    postLoader.start()
                                }, 500)

                            }
                        } catch (err) {
                            console.log('[ERROR] loadModules -> onRequired -> err = ' + err.stack)
                        }
                    }
                }
            }

        } catch (err) {
            console.log('[ERROR] loadModules -> err = ' + err.stack)
        }
    }
}

