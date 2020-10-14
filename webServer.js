exports.newWebServer = function newWebServer(EVENTS_SERVER) {

    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        run: run
    }

    require('dotenv').config()
    const open = require('open')

    CONSOLE_LOG = process.env.CONSOLE_LOG === 'true'
    CONSOLE_ERROR_LOG = process.env.CONSOLE_ERROR_LOG === 'true'
    LOG_FILE_CONTENT = process.env.LOG_FILE_CONTENT === 'true'

    let port = process.env.WEB_SERVER_PORT

    let http = require('http')
    let isHttpServerStarted = false
  
    let webhook = new Map()

    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    function run() {
        startHtttpServer()
    }

    function startHtttpServer() {
        if (CONSOLE_LOG === true) { console.log('[INFO] webServer -> startHtttpServer -> Entering function.') }

        try {
            if (isHttpServerStarted === false) {
                gWebServer = http.createServer(onBrowserRequest).listen(port)
                isHttpServerStarted = true
                /* Starting the browser now is optional */
                if (process.argv.includes("noBrowser")) {
                    console.log('Running Backend only with no UI.')
                } else {
                    open('http://localhost:' + port)
                }

                console.log('Web Server Started.')
            }
        } catch (err) {
            console.log('[ERROR] webServer -> startHtttpServer -> Error = ' + err.stack)
        }
    }

    function onBrowserRequest(request, response) {
        if (CONSOLE_LOG === true && request.url.indexOf('NO-LOG') === -1) { console.log('[INFO] webServer -> onBrowserRequest -> request.url = ' + request.url) }

        function getBody(callback) { // Gets the de body from a POST request to the web server
            try {

                let body = ''

                request.on('data', function (data) {
                    body += data
                    // Too much POST data
                    //if (body.length > 1e6) {
                    //    request.connection.destroy()
                    //}
                })

                request.on('end', function () {
                    callback(body)
                })

                request.on('error', function (err) {
                    if (CONSOLE_LOG === true) { console.log('[INFO] webServer -> onBrowserRequest -> getBody -> err = ' + err.stack) }
                    respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), response)
                })
            } catch (err) {
                if (CONSOLE_LOG === true) { console.log('[INFO] webServer -> onBrowserRequest -> getBody -> err = ' + err.stack) }
                respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), response)
            }
        }

        let requestParameters = request.url.split('/')

        requestParameters = request.url.split('?') // Remove version information
        requestParameters = requestParameters[0].split('/')

        switch (requestParameters[1]) {

            case 'CCXT':
                {
                    getBody(processRequest)

                    async function processRequest(body) {
                        try {
                            let params = JSON.parse(body)

                            const ccxt = require('ccxt')

                            switch (params.method) {
                                case 'fetchMarkets': {

                                    const exchangeClass = ccxt[params.exchangeId]
                                    const exchangeConstructorParams = {
                                        'timeout': 30000,
                                        'enableRateLimit': true,
                                        verbose: false
                                    }

                                    let ccxtExchange = new exchangeClass(exchangeConstructorParams)
                                    let ccxtMarkets = []

                                    if (ccxtExchange.has.fetchMarkets === true) {
                                        ccxtMarkets = await ccxtExchange.fetchMarkets()
                                    }
                                    respondWithContent(JSON.stringify(ccxtMarkets), response)
                                    return
                                }
                                case 'listExchanges': {
                                    let exchanges = []
                                    for (let i = 0; i < ccxt.exchanges.length; i++) {
                                        let exchangeId = ccxt.exchanges[i]

                                        const exchangeClass = ccxt[exchangeId]
                                        const exchangeConstructorParams = {
                                            'timeout': 30000,
                                            'enableRateLimit': true,
                                            verbose: false
                                        }
                                        let ccxtExchange
                                        try { ccxtExchange = new exchangeClass(exchangeConstructorParams) }
                                        catch (err) { }
                                        if (ccxtExchange === undefined) { continue }


                                        if (ccxtExchange.has.fetchOHLCV === params.has.fetchOHLCV) {
                                            if (ccxtExchange.has.fetchMarkets === params.has.fetchMarkets) {
                                                if (ccxtExchange.timeframes['1m'] !== undefined) {
                                                    let exchange = {
                                                        name: ccxtExchange.name,
                                                        id: ccxtExchange.id
                                                    }
                                                    exchanges.push(exchange)
                                                }
                                            }
                                        }
                                    }
                                    respondWithContent(JSON.stringify(exchanges), response)
                                    return
                                }
                            }

                            let content = {
                                err: global.DEFAULT_FAIL_RESPONSE // method not supported
                            }
                        } catch (err) {
                            if (CONSOLE_LOG === true) { console.log('[INFO] webServer -> CCXT FetchMarkets -> Could not fetch markets.') }
                            let error = {
                                result: 'Fail Because',
                                message: err.message
                            }
                            respondWithContent(JSON.stringify(error), response)
                        }
                    }
                    break
                }
                break

            case 'Webhook':
                {
                    switch (requestParameters[2]) { // switch by command
                        case 'Fetch-Messages': {
                            let exchange = requestParameters[3]
                            let market = requestParameters[4]

                            /* Some validations */
                            if (exchange === undefined) {
                                console.log('[WARN] webServer -> Webhook -> Fetch-Messages -> Message with no Exchange received -> messageReceived = ' + messageReceived)
                                respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), response)
                                return
                            }
                            if (market === undefined) {
                                console.log('[WARN] webServer -> Webhook -> Fetch-Messages -> Message with no market received -> messageReceived = ' + messageReceived)
                                respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), response)
                                return
                            }

                            let key = exchange + '-' + market

                            let webhookMessages = webhook.get(key)
                            if (webhookMessages === undefined) {
                                webhookMessages = []
                            }

                            respondWithContent(JSON.stringify(webhookMessages), response)
                            webhookMessages = []

                            webhook.set(key, webhookMessages)
                            break
                        }
                        case 'New-Message': {
                            getBody(processRequest)

                            function processRequest(messageReceived) {
                                let timestamp = (new Date()).valueOf()
                                let source = requestParameters[3]
                                let exchange = requestParameters[4]
                                let market = requestParameters[5]

                                /* Some validations */
                                if (source === undefined) {
                                    console.log('[WARN] webServer -> Webhook -> New-Message -> Message with no Source received -> messageReceived = ' + messageReceived)
                                    respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), response)
                                    return
                                }
                                if (exchange === undefined) {
                                    console.log('[WARN] webServer -> Webhook -> New-Message -> Message with no Exchange received -> messageReceived = ' + messageReceived)
                                    respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), response)
                                    return
                                }
                                if (market === undefined) {
                                    console.log('[WARN] webServer -> Webhook -> New-Message -> Message with no market received -> messageReceived = ' + messageReceived)
                                    respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), response)
                                    return
                                }

                                let key = exchange + '-' + market

                                let webhookMessages = webhook.get(key)
                                if (webhookMessages === undefined) {
                                    webhookMessages = []
                                }

                                webhookMessages.push([timestamp, source, messageReceived])
                                webhook.set(key, webhookMessages)

                                respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), response)
                            }
                            break
                        }
                    }
                    break
                }
                break

            case 'ResetLogsAndData':
                {
                    try {
                        let rimraf = require('rimraf')
                        rimraf.sync(process.env.STORAGE_PATH + '/Masters/Masters/AAJason.1.0')
                        rimraf.sync(process.env.LOG_PATH)

                        respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), response)
                    } catch (err) {
                        if (CONSOLE_LOG === true) { console.log('[INFO] webServer -> ResetLogsAndData -> Could not delete Logs and Data.') }
                        let error = {
                            result: 'Fail Because',
                            message: err.message
                        }
                        respondWithContent(JSON.stringify(error), response)
                    }
                    break
                }

            case 'LegacyPlotter.js':
                {
                    respondWithFile(process.env.PATH_TO_WEB_SERVER + 'WebServer/LegacyPlotter.js', response)
                }
                break

            case 'PlotterPanel.js':
                {
                    respondWithFile(process.env.PATH_TO_WEB_SERVER + 'WebServer/PlotterPanel.js', response)
                }
                break

            case 'Images': // This means the Images folder.
                {
                    let path = process.env.PATH_TO_WEB_SERVER + 'WebServer/Images/' + requestParameters[2]

                    if (requestParameters[3] !== undefined) {
                        path = path + '/' + requestParameters[3]
                    }

                    if (requestParameters[4] !== undefined) {
                        path = path + '/' + requestParameters[4]
                    }

                    if (requestParameters[5] !== undefined) {
                        path = path + '/' + requestParameters[5]
                    }

                    path = unescape(path)

                    respondWithImage(path, response)
                }
                break

            case 'favicon.ico': // This means the Scripts folder.
                {
                    respondWithImage(process.env.PATH_TO_WEB_SERVER + 'WebServer/Images/' + 'favicon.ico', response)
                }
                break

            case 'CockpitSpace': // This means the CockpitSpace folder.
                {
                    respondWithFile(process.env.PATH_TO_CANVAS_APP + '/CockpitSpace/' + requestParameters[2], response)
                }
                break

            case 'Plotting': // This means the Plotting folder.
                {
                    respondWithFile(process.env.PATH_TO_CANVAS_APP + '/Plotting/' + requestParameters[2], response)
                }
                break

            case 'TopSpace': // This means the TopSpace folder.
                {
                    respondWithFile(process.env.PATH_TO_CANVAS_APP + '/TopSpace/' + requestParameters[2], response)
                }
                break

            case 'DesignSpace': // This means the DesignSpace folder.

                {
                    if (requestParameters[3] === undefined) {
                        respondWithFile(process.env.PATH_TO_CANVAS_APP + '/DesignSpace/' + requestParameters[2], response)
                        return
                    }
                    if (requestParameters[4] === undefined) {
                        respondWithFile(process.env.PATH_TO_CANVAS_APP + '/DesignSpace/' + requestParameters[2] + '/' + requestParameters[3], response)
                        return
                    }
                    if (requestParameters[5] === undefined) {
                        respondWithFile(process.env.PATH_TO_CANVAS_APP + '/DesignSpace/' + requestParameters[2] + '/' + requestParameters[3] + '/' + requestParameters[4], response)
                        return
                    }
                }
                break

            case 'ControlsToolBox': // This means the DesignSpace folder.
                {
                    respondWithFile(process.env.PATH_TO_CANVAS_APP + '/ControlsToolBox/' + requestParameters[2], response)
                }
                break

            case 'Utilities': // This means the DesignSpace folder.
                {
                    respondWithFile(process.env.PATH_TO_CANVAS_APP + '/Utilities/' + requestParameters[2], response)
                }
                break

            case 'WebServer': // This means the WebServer folder.
                {
                    respondWithFile(process.env.PATH_TO_WEB_SERVER + 'WebServer/' + requestParameters[2], response)
                }
                break

            case 'externalScripts': // This means the WebServer folder.
                {
                    respondWithFile(process.env.PATH_TO_WEB_SERVER + 'WebServer/externalScripts/' + requestParameters[2], response)
                }
                break

            case 'Plotters': // This means the plotter folder, not to be confused with the Plotters script!
                {
                    let dataMine = requestParameters[2]
                    let codeName = requestParameters[3]
                    let moduleName = requestParameters[4]
                    let filePath = process.env.PLOTTERS_PATH + '/' + dataMine + '/plotters/' + codeName + '/' + moduleName
                    respondWithFile(filePath, response)
                }
                break

            case 'PlotterPanels': // This means the PlotterPanels folder, not to be confused with the Plotter Panels scripts!
                {
                    let dataMine = requestParameters[2]
                    let codeName = requestParameters[3]
                    let moduleName = requestParameters[4]
                    let filePath = process.env.PLOTTERS_PATH + '/' + dataMine + '/plotters/' + codeName + '/' + moduleName
                    respondWithFile(filePath, response)
                }
                break

            case 'Panels':
                {
                    respondWithFile(process.env.PATH_TO_CANVAS_APP + '/' + requestParameters[1] + '/' + requestParameters[2], response)
                }
                break

            case 'ChartLayers':
                {
                    respondWithFile(process.env.PATH_TO_CANVAS_APP + '/' + requestParameters[1] + '/' + requestParameters[2], response)
                }
                break

            case 'Spaces':
                {
                    respondWithFile(process.env.PATH_TO_CANVAS_APP + '/' + requestParameters[1] + '/' + requestParameters[2], response)
                }
                break

            case 'Scales':
                {
                    respondWithFile(process.env.PATH_TO_CANVAS_APP + '/' + requestParameters[1] + '/' + requestParameters[2], response)
                }
                break

            case 'Files':
                {
                    respondWithFile(process.env.PATH_TO_FILES_COMPONENT + '/' + requestParameters[2], response)
                }
                break

            case 'Fonts':
                {
                    respondWithFont(process.env.PATH_TO_FONTS + '/' + requestParameters[2], response)
                }
                break

            case 'FloatingSpace':
                {
                    respondWithFile(process.env.PATH_TO_CANVAS_APP + '/' + requestParameters[1] + '/' + requestParameters[2], response)
                }
                break

            case 'ChartingSpace':
                {
                    respondWithFile(process.env.PATH_TO_CANVAS_APP + '/' + requestParameters[1] + '/' + requestParameters[2], response)
                }
                break

            case 'SideSpace':
                {
                    respondWithFile(process.env.PATH_TO_CANVAS_APP + '/' + requestParameters[1] + '/' + requestParameters[2], response)
                }
                break

            case 'ImagesNames':
                {
                    const folder = process.env.PATH_TO_WEB_SERVER + 'WebServer/Images/Icons/style-01/'
                    const fs = require('fs')

                    fs.readdir(folder, (err, files) => {
                        respondWithContent(JSON.stringify(files), response)
                    })
                }
                break

            case 'PluginFileNames':
                {
                    const fs = require('fs')
                    let folder
                    switch (requestParameters[2]) {
                        case 'Data-Mines': {
                            folder = process.env.DATA_MINES_PATH + '/'
                            break
                        }
                        case 'Trading-Mines': {
                            folder = process.env.TRADING_MINES_PATH + '/'
                            break
                        }
                        case 'Trading-Systems': {
                            folder = process.env.TRADING_SYSTEMS_PATH + '/'
                            break
                        }
                        case 'Trading-Engines': {
                            folder = process.env.TRADING_ENGINES_PATH + '/'
                            break
                        }
                        case 'Super-Scripts': {
                            folder = process.env.SUPER_SCRIPTS_PATH + '/'
                            break
                        }
                        case 'Tutorials': {
                            folder = process.env.TUTORIALS_PATH + '/'
                            break
                        }
                    }

                    fs.readdir(folder, (err, files) => {
                        respondWithContent(JSON.stringify(files), response)
                    })
                }
                break

            case 'AppSchema.js':
                {
                    sendSchema(process.env.PROJECTS_PATH + '/Superalgos/Schemas/', 'AppSchema', 'getAppSchema')
                }
                break

            case 'DocSchema.js':
                {
                    sendSchema(process.env.PROJECTS_PATH + '/Superalgos/Schemas/', 'DocSchema', 'getDocSchema')
                }
                break

            case 'ConceptSchema.js':
                {
                    sendSchema(process.env.PROJECTS_PATH + '/Superalgos/Schemas/', 'ConceptSchema', 'getConceptSchema')
                }
                break

            case 'Workspace.js':
                {
                    let fs = require('fs')

                    try {
                        let filePath = process.env.DEFAULT_WORKSPACE_PATH + '/Getting-Started.json'
                        fs.readFile(filePath, onFileRead)
                    } catch (e) {
                        console.log('[ERROR] Error reading the Workspace.', e)
                    }

                    function onFileRead(err, workspace) {
                        if (err) {
                            respondWithContent(undefined, response)
                        } else {
                            let responseContent = 'function getWorkspace(){ return ' + workspace + '}'
                            respondWithContent(responseContent, response)
                        }
                    }
                }
                break

            case 'ListWorkspaces':
                {
                    let allWorkspaces = []
                    readPluginWorkspaces()
                    function readPluginWorkspaces() {
                        let dirPath = process.env.WORKSPACES_PATH
                        try {
                            let fs = require('fs')
                            fs.readdir(dirPath, onDirRead)

                            function onDirRead(err, fileList) {
                                if (err) {
                                    if (CONSOLE_LOG === true) { console.log('[ERROR] Error reading a directory content. filePath = ' + dirPath) }
                                    respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), response)
                                    return
                                } else {
                                    let updatedFileList = []
                                    for (let i = 0; i < fileList.length; i++) {
                                        let name = 'Plugin \u2192 ' + fileList[i]
                                        updatedFileList.push(name)
                                    }
                                    allWorkspaces = allWorkspaces.concat(updatedFileList)
                                    readMyWorkspaces()
                                    return
                                }
                            }
                        } catch (err) {
                            if (CONSOLE_LOG === true) { console.log('[ERROR] Error reading a directory content. filePath = ' + dirPath) }
                            respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), response)
                            return
                        }
                    }

                    function readMyWorkspaces() {
                        let dirPath = process.env.MY_WORKSPACES_PATH
                        try {
                            let fs = require('fs')
                            fs.readdir(dirPath, onDirRead)

                            function onDirRead(err, fileList) {
                                if (err) {
                                    if (CONSOLE_LOG === true) { console.log('[ERROR] Error reading a directory content. filePath = ' + dirPath) }
                                    respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), response)
                                    return
                                } else {
                                    allWorkspaces = allWorkspaces.concat(fileList)
                                    respondWithContent(JSON.stringify(allWorkspaces), response)
                                    return
                                }
                            }
                        } catch (err) {
                            if (CONSOLE_LOG === true) { console.log('[ERROR] Error reading a directory content. filePath = ' + dirPath) }
                            respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), response)
                            return
                        }
                    }
                }
                break

            case 'LoadWorkspace':
                {
                    let fileName = unescape(requestParameters[2])
                    let filePath = process.env.MY_WORKSPACES_PATH + '/' + fileName + '.json'
                    respondWithFile(filePath, response)
                }
                break

            case 'LoadPluginWorkspace':
                {
                    let fileName = unescape(requestParameters[2])
                    let filePath = process.env.WORKSPACES_PATH + '/' + fileName + '.json'
                    respondWithFile(filePath, response)
                }
                break

            case 'SaveWorkspace':
                {
                    getBody(processRequest)

                    async function processRequest(body) {

                        let fileContent = body
                        let fileName = unescape(requestParameters[2])
                        let filePath = process.env.MY_WORKSPACES_PATH + '/' + fileName + '.json'

                        try {
                            let fs = require('fs')
                            let dir = process.env.MY_WORKSPACES_PATH;

                            /* Create Dir if it does not exist */
                            if (!fs.existsSync(dir)) {
                                fs.mkdirSync(dir);
                            }

                            fs.writeFile(filePath, fileContent, onFileWritten)

                            function onFileWritten(err) {
                                if (err) {
                                    if (CONSOLE_LOG === true) { console.log('[ERROR] Error writting the Workspace file. fileName = ' + fileName) }
                                    respondWithContent(JSON.stringify(exchanges), response)
                                } else {
                                    respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), response)
                                }
                            }

                        } catch (err) {
                            if (CONSOLE_LOG === true) { console.log('[ERROR] Error writting the Workspace file. fileName = ' + fileName) }
                            respondWithContent(JSON.stringify(exchanges), response)
                        }
                    }
                }
                break

            case 'Data-Mines':
                {
                    respondWithFile(process.env.DATA_MINES_PATH + '/' + requestParameters[2], response)
                }
                break

            case 'Trading-Mines':
                {
                    respondWithFile(process.env.TRADING_MINES_PATH + '/' + requestParameters[2], response)
                }
                break

            case 'Trading-Systems':
                {
                    respondWithFile(process.env.TRADING_SYSTEMS_PATH + '/' + requestParameters[2], response)
                }
                break

            case 'Super-Scripts':
                {
                    respondWithFile(process.env.SUPER_SCRIPTS_PATH + '/' + requestParameters[2], response)
                }
                break

            case 'Trading-Engines':
                {
                    respondWithFile(process.env.TRADING_ENGINES_PATH + '/' + requestParameters[2], response)
                }
                break

            case 'Tutorials':
                {
                    respondWithFile(process.env.TUTORIALS_PATH + '/' + requestParameters[2], response)
                }
                break

            case 'Storage':
                {
                    respondWithFile(process.env.STORAGE_PATH + '/' + request.url.substring(9), response)
                }
                break

            case 'main.css':
                {
                    sendStyleSheet('main.css')
                }
                break

            case 'font-awasome.css':
                {
                    sendStyleSheet('font-awasome.css')
                }
                break

            default:
                {
                    homePage()
                }
        }

        function sendSchema(filePath, fileName, functionName) {
            let fs = require('fs')

            try {
                filePath = filePath + fileName + '.json'
                console.log(filePath)
                fs.readFile(filePath, onFileRead)
            } catch (e) {
                console.log('[ERROR] Error reading the ' + fileName, e)
            }

            function onFileRead(err, schema) {
                if (err) {
                    respondWithContent(undefined, response)
                } else {
                    let responseContent = 'function ' + functionName + '(){ return ' + schema + '}'
                    respondWithContent(responseContent, response)
                }
            }
        }

        function sendStyleSheet(fileName) {
            let fs = require('fs')
            try {
                let filePath = process.env.PATH_TO_WEB_SERVER + 'WebServer/' + fileName
                fs.readFile(filePath, onFileRead)

                function onFileRead(err, file) {
                    try {
                        let fileContent = file.toString()

                        fileContent = fileContent.replace('WEB_SERVER_PORT', process.env.WEB_SERVER_PORT)
                        fileContent = fileContent.replace('WEB_SERVER_PORT', process.env.WEB_SERVER_PORT)
                        fileContent = fileContent.replace('WEB_SERVER_PORT', process.env.WEB_SERVER_PORT)
                        respondWithContent(fileContent, response, 'text/css')
                    } catch (err) {
                        console.log('[ERROR] webServer -> mainCSS -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }

        function homePage() {
            if (requestParameters[1] === '') {
                let fs = require('fs')
                try {
                    let fileName = process.env.PATH_TO_WEB_SERVER + 'WebServer/index.html'
                    fs.readFile(fileName, onFileRead)

                    function onFileRead(err, file) {
                        try {
                            let fileContent = file.toString()

                            fileContent = fileContent.replace('WEB_SERVER_PORT', process.env.WEB_SERVER_PORT)
                            respondWithContent(fileContent, response)
                        } catch (err) {
                            console.log('[ERROR] webServer -> homePage -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
                        }
                    }
                } catch (err) {
                    console.log(err)
                }
            } else {
                respondWithFile(process.env.PATH_TO_CANVAS_APP + '/' + requestParameters[1], response)
            }
        }
    }

    function respondWithFile(fileName, response) {
        if (CONSOLE_LOG === true) { console.log('[INFO] webServer -> respondWithFile -> Entering function.') }

        let fs = require('fs')
        if (fileName.indexOf('undefined') > 0) {
            console.log('[WRN] webServer -> respondWithFile -> Received request for undefined file. ')
            respondWithContent(undefined, response)
        } else {
            try {
                fs.readFile(fileName, onFileRead)

                function onFileRead(err, file) {
                    if (CONSOLE_LOG === true) { console.log('[INFO] webServer -> respondWithFile -> onFileRead -> Entering function.') }
                    if (!err) {
                        respondWithContent(file.toString(), response)
                    } else {
                        //console.log('File requested not found: ' + fileName)
                        respondWithContent(undefined, response)
                    }
                }
            } catch (err) {
                returnEmptyArray()
            }
        }
    }

    function respondWithContent(content, response, contentType) {
        if (CONSOLE_LOG === true) { console.log('[INFO] webServer -> respondWithContent -> Entering function.') }

        try {
            response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
            response.setHeader('Pragma', 'no-cache') // HTTP 1.0.
            response.setHeader('Expires', '0') // Proxies.
            response.setHeader('Access-Control-Allow-Origin', '*') // Allows to access data from other domains.

            if (content !== undefined) {
                if (contentType !== undefined) {
                    response.writeHead(200, { 'Content-Type': contentType })
                } else {
                    response.writeHead(200, { 'Content-Type': 'text/html' })
                }
                response.write(content)
            } else {
                response.writeHead(404, { 'Content-Type': 'text/html' })
                response.write('The specified key does not exist.')
            }
            response.end('\n')
        } catch (err) {
            returnEmptyArray(response)
        }
    }

    function respondWithImage(fileName, response) {
        if (CONSOLE_LOG === true) { console.log('[INFO] webServer -> respondWithImage -> Entering function.') }

        let fs = require('fs')
        try {
            fs.readFile(fileName, onFileRead)

            function onFileRead(err, file) {
                if (err) {
                    console.log('[ERROR] webServer -> respondWithImage -> onFileRead -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
                    return
                }
                try {
                    response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
                    response.setHeader('Pragma', 'no-cache') // HTTP 1.0.
                    response.setHeader('Expires', '0') // Proxies.
                    response.setHeader('Access-Control-Allow-Origin', '*') // Allows to access data from other domains.

                    response.writeHead(200, { 'Content-Type': 'image/png' })
                    response.end(file, 'binary')
                } catch (err) {
                    console.log('[ERROR] webServer -> respondWithImage -> onFileRead -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
                }
            }
        } catch (err) {
            console.log('[ERROR] webServer -> respondWithImage -> err = ' + err.stack)
        }
    }

    function respondWithFont(fileName, response) {
        if (CONSOLE_LOG === true) { console.log('[INFO] webServer -> respondWithBinary -> Entering function.') }

        let fs = require('fs')
        try {
            fs.readFile(fileName, onFileRead)

            function onFileRead(err, file) {
                if (CONSOLE_LOG === true) { console.log('[INFO] webServer -> respondWithBinary -> onFileRead -> Entering function.') }

                try {
                    if (err) {
                        console.log('[ERROR] webServer -> respondWithBinary -> onFileRead -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
                        return
                    }
                    response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
                    response.setHeader('Pragma', 'no-cache') // HTTP 1.0.
                    response.setHeader('Expires', '0') // Proxies.
                    response.setHeader('Access-Control-Allow-Origin', '*') // Allows to access data from other domains.

                    if (fileName.indexOf('2') < 0) {
                        response.writeHead(200, { 'Content-Type': 'font/woff' })
                    } else {
                        response.writeHead(200, { 'Content-Type': 'font/woff2' })
                    }
                    response.end(file, 'binary')
                } catch (err) {
                    console.log('[ERROR] webServer -> respondWithBinary -> onFileRead -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
                }
            }
        } catch (err) {
            console.log('[ERROR] webServer -> respondWithBinary -> err = ' + err.stack)
        }
    }

    function returnEmptyArray(response) {
        try {
            if (CONSOLE_LOG === true) { console.log('[INFO] webServer -> respondWithFile -> returnEmptyArray -> Entering function.') }

            response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
            response.setHeader('Pragma', 'no-cache') // HTTP 1.0.
            response.setHeader('Expires', '0') // Proxies.

            response.writeHead(200, { 'Content-Type': 'text/html' })
            response.write('[]')
            response.end('\n')
        } catch (err) {
            console.log('[ERROR] webServer -> returnEmptyArray -> err.message ' + err.message)
        }
    }
}