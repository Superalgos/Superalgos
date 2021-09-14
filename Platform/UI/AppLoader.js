let postLoader

function newAppLoader() {
    const MODULE_NAME = 'App Loader'
    const INFO_LOG = false
    const ERROR_LOG = true
    const logger = newWebDebugLog()
<<<<<<< HEAD
    
=======

>>>>>>> d641a7e3b4a9f76cadee3d5dc0a02ed29d6b88ef

    let thisObject = {
        loadModules: loadModules
    }

    return thisObject

    async function loadModules() {
        try {
            if (INFO_LOG === true) { logger.write('[INFO] loadModules -> Entering function.') }

            let plotters
            let modulesArray = []

            plotters = defaultPlotters()

            modulesArray = modulesArray.concat([

                'Globals.js',
                'Workspace.js',

                'Files/SingleFile.js',
                'Files/FileCloud.js',
                'Files/MarketFiles.js',
                'Files/DailyFiles.js',
                'Files/FileCursor.js',
                'Files/FileSequence.js',
                'Files/FileStorage.js',

                'EventsServerClient.js',

                'LegacyPlotter.js',
                'PlotterPanel.js',

                'VideoRecorder.js',
                'ProductStorage.js',
                'Canvas.js',
                'EventHandler.js',
                'Frame.js',
                'Animation.js',
                'Container.js',
                'Utilities.js',
                'AppPostLoader.js'
            ])

            modulesArray = modulesArray.concat(plotters)

            functionLibraries()

            function functionLibraries() {
                let url = 'ListFunctionLibraries'
                httpRequest(undefined, url, onResponse)

                function onResponse(err, fileList) {
                    let urlArray = []
                    let fileArray = JSON.parse(fileList)
                    for (let i = 0; i < fileArray.length; i++) {
                        let item = fileArray[i]
<<<<<<< HEAD
                        
                        project = item[0]
                        fileName = item[1]
                        urlArray.push('Projects' + '/' + project + '/'  + 'UI'  + '/' + 'Function-Libraries' + '/' +  fileName)
=======

                        project = item[0]
                        fileName = item[1]
                        urlArray.push('Projects' + '/' + project + '/' + 'UI' + '/' + 'Function-Libraries' + '/' + fileName)
>>>>>>> d641a7e3b4a9f76cadee3d5dc0a02ed29d6b88ef
                    }

                    modulesArray = modulesArray.concat(urlArray)
                    utilities()
                }
<<<<<<< HEAD
            }    
=======
            }
>>>>>>> d641a7e3b4a9f76cadee3d5dc0a02ed29d6b88ef

            function utilities() {
                let url = 'ListUtilitiesFiles'
                httpRequest(undefined, url, onResponse)

                function onResponse(err, fileList) {
                    let urlArray = []
                    let fileArray = JSON.parse(fileList)
                    for (let i = 0; i < fileArray.length; i++) {
                        let item = fileArray[i]
<<<<<<< HEAD
                        
                        project = item[0]
                        fileName = item[1]
                        urlArray.push('Projects' + '/' + project + '/'  + 'UI' + '/' + 'Utilities' + '/' +  fileName)
=======

                        project = item[0]
                        fileName = item[1]
                        urlArray.push('Projects' + '/' + project + '/' + 'UI' + '/' + 'Utilities' + '/' + fileName)
>>>>>>> d641a7e3b4a9f76cadee3d5dc0a02ed29d6b88ef
                    }

                    modulesArray = modulesArray.concat(urlArray)
                    globals()
                }
<<<<<<< HEAD
            } 
=======
            }
>>>>>>> d641a7e3b4a9f76cadee3d5dc0a02ed29d6b88ef

            function globals() {
                let url = 'ListGlobalFiles'
                httpRequest(undefined, url, onResponse)

                function onResponse(err, fileList) {
                    let urlArray = []
                    let fileArray = JSON.parse(fileList)
                    for (let i = 0; i < fileArray.length; i++) {
                        let item = fileArray[i]
<<<<<<< HEAD
                        
                        project = item[0]
                        fileName = item[1]
                        urlArray.push('Projects' + '/' + project + '/'  + 'UI' + '/' + 'Globals' + '/' +  fileName)
=======

                        project = item[0]
                        fileName = item[1]
                        urlArray.push('Projects' + '/' + project + '/' + 'UI' + '/' + 'Globals' + '/' + fileName)
>>>>>>> d641a7e3b4a9f76cadee3d5dc0a02ed29d6b88ef
                    }

                    modulesArray = modulesArray.concat(urlArray)
                    spaces()
                }
<<<<<<< HEAD
            } 
=======
            }
>>>>>>> d641a7e3b4a9f76cadee3d5dc0a02ed29d6b88ef

            function spaces() {
                let url = 'ListSpaceFiles'
                httpRequest(undefined, url, onResponse)

                function onResponse(err, fileList) {
                    let urlArray = []
                    let fileArray = JSON.parse(fileList)
                    for (let i = 0; i < fileArray.length; i++) {
                        let path = fileArray[i]
                        urlArray.push('Projects' + '/' + path)
                    }

                    modulesArray = modulesArray.concat(urlArray)
                    downloadIncludedFiles()
                }
            }

            function downloadIncludedFiles() {

                let downloadedCounter = 0

                for (let i = 0; i < modulesArray.length; i++) {
                    let path = modulesArray[i]
<<<<<<< HEAD

=======
                    console.log(path)
>>>>>>> d641a7e3b4a9f76cadee3d5dc0a02ed29d6b88ef
                    REQUIREJS([path], onRequired)

                    if (INFO_LOG === true) { logger.write('[INFO] loadModules -> Module Requested.') }
                    if (INFO_LOG === true) { logger.write('[INFO] loadModules -> path = ' + path) }
                    if (INFO_LOG === true) { logger.write('[INFO] loadModules -> total requested = ' + (i + 1)) }

                    function onRequired(pModule) {
                        try {
                            if (INFO_LOG === true) { logger.write('[INFO] loadModules -> onRequired -> Entering function.') }
                            if (INFO_LOG === true) { logger.write('[INFO] loadModules -> onRequired -> Module Downloaded.') }
                            if (INFO_LOG === true) { logger.write('[INFO] loadModules -> onRequired -> path = ' + path) }

                            downloadedCounter++

                            if (INFO_LOG === true) { logger.write('[INFO] loadModules -> onRequired -> downloadedCounter = ' + downloadedCounter) }

                            if (downloadedCounter === modulesArray.length) {
                                if (INFO_LOG === true) { logger.write('[INFO] loadModules -> onRequired -> Starting Advanced Algos Platform.') }
                                setTimeout(() => {
                                    postLoader = newAppPostLoader()
                                    postLoader.start()
                                }, 500)

                            }
                        } catch (err) {
                            if (ERROR_LOG === true) { logger.write('[ERROR] loadModules -> onRequired -> err = ' + err.stack) }
                        }
                    }
                }
            }

        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] loadModules -> err = ' + err.stack) }
        }
    }

    function defaultPlotters() {
        return [
            'Plotters/Foundations/Candles/Plotters-Candles-Volumes/Candles.js',
            'Plotters/Foundations/Candles/Plotters-Candles-Volumes/CandlePanel.js',
            'Plotters/Foundations/Candles/Plotters-Candles-Volumes/Volumes.js',
            'Plotters/Foundations/Candles/Plotters-Candles-Volumes/VolumePanel.js',
            'Plotters/Foundations/Bollinger/Plotters-Bollinger-Bands/BollingerBands.js',
            'Plotters/Foundations/Bollinger/Plotters-Bollinger-Bands/BollingerBandsPanel.js',
            'Plotters/Foundations/Bollinger/Plotters-Bollinger-Bands/PercentageBandwidth.js'
        ]
    }
}

