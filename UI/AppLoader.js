let postLoader

function newAppLoader() {
    const MODULE_NAME = 'App Loader'
    const INFO_LOG = false
    const ERROR_LOG = true
    const logger = newWebDebugLog()
    

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
                        
                        project = item[0]
                        fileName = item[1]
                        urlArray.push('Projects' + '/' + project + '/'  + 'UI'  + '/' + 'Function-Libraries' + '/' +  fileName)
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
                        urlArray.push('Projects' + '/' + project + '/'  + 'UI' + '/' + 'Utilities' + '/' +  fileName)
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
                        urlArray.push('Projects' + '/' + project + '/'  + 'UI' + '/' + 'Globals' + '/' +  fileName)
                    }

                    modulesArray = modulesArray.concat(urlArray)
                    spaces()
                }
            } 

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
            'Plotters/Superalgos/Masters/Plotters-Candles-Volumes/Candles.js',
            'Plotters/Superalgos/Masters/Plotters-Candles-Volumes/CandlePanel.js',
            'Plotters/Superalgos/Masters/Plotters-Candles-Volumes/Volumes.js',
            'Plotters/Superalgos/Masters/Plotters-Candles-Volumes/VolumePanel.js',
            'Plotters/Superalgos/Masters/Plotters-Bollinger-Bands/BollingerBands.js',
            'Plotters/Superalgos/Masters/Plotters-Bollinger-Bands/BollingerBandsPanel.js',
            'Plotters/Superalgos/Masters/Plotters-Bollinger-Bands/PercentageBandwidth.js'
        ]
    }
}

