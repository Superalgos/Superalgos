exports.newHttpInterface = function newHttpInterface(WEB_SERVER, DATA_FILE_SERVER, PROJECT_FILE_SERVER, UI_FILE_SERVER, PLUGIN_SERVER, CCXT_SERVER, WEB3_SERVER) {

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

    let port = process.env.HTTP_INTERFACE_PORT

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
        if (CONSOLE_LOG === true) { console.log('[INFO] httpInterface -> startHtttpServer -> Entering function.') }

        try {
            if (isHttpServerStarted === false) {
                gWebServer = http.createServer(onBrowserRequest).listen(port)
                isHttpServerStarted = true
                /* Starting the browser now is optional */
                if (process.argv.includes("noBrowser")) {
                    //Running Backend only with no UI.
                } else {
                    open('http://localhost:' + port)
                }

            }
        } catch (err) {
            console.log('[ERROR] httpInterface -> startHtttpServer -> Error = ' + err.stack)
        }
    }

    function onBrowserRequest(httpRequest, httpResponse) {
        if (CONSOLE_LOG === true && httpRequest.url.indexOf('NO-LOG') === -1) { console.log('[INFO] httpInterface -> onBrowserRequest -> httpRequest.url = ' + httpRequest.url) }

        function getBody(callback) { // Gets the de body from a POST httpRequest to the web server
            try {

                let body = ''

                httpRequest.on('data', function (data) {
                    body += data
                    // Too much POST data
                    //if (body.length > 1e6) {
                    //    httpRequest.connection.destroy()
                    //}
                })

                httpRequest.on('end', function () {
                    callback(body)
                })

                httpRequest.on('error', function (err) {
                    if (CONSOLE_LOG === true) { console.log('[INFO] httpInterface -> onBrowserRequest -> getBody -> err = ' + err.stack) }
                    respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                })
            } catch (err) {
                if (CONSOLE_LOG === true) { console.log('[INFO] httpInterface -> onBrowserRequest -> getBody -> err = ' + err.stack) }
                respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
            }
        }

        let requestParameters = httpRequest.url.split('/')

        requestParameters = httpRequest.url.split('?') // Remove version information
        requestParameters = requestParameters[0].split('/')

        switch (requestParameters[1]) {

            case 'WEB3':
                {
                    getBody(processRequest)

                    async function processRequest(body) {
                        try {
                            let params = JSON.parse(body)

                            switch (params.method) {
                                case 'getNetworkClientStatus': {

                                    let serverResponse = await WEB3_SERVER.getNetworkClientStatus(
                                        params.host,
                                        params.port,
                                        params.interface
                                    )

                                    respondWithContent(JSON.stringify(serverResponse), httpResponse)
                                    return
                                }
                                case 'createWalletAccount': {

                                    let serverResponse = await WEB3_SERVER.createWalletAccount(
                                        params.entropy
                                    )

                                    respondWithContent(JSON.stringify(serverResponse), httpResponse)
                                    return
                                }
                                case 'getWalletBalances': {

                                    let serverResponse = await WEB3_SERVER.getWalletBalances(
                                        params.host,
                                        params.port,
                                        params.interface,
                                        params.walletDefinition
                                    )

                                    respondWithContent(JSON.stringify(serverResponse), httpResponse)
                                    return
                                }
                                default: {
                                    respondWithContent(JSON.stringify({ error: 'Method ' + params.method + ' is invalid.' }), httpResponse)
                                }
                            }
                        } catch (err) {
                            if (CONSOLE_ERROR_LOG === true) { console.log('[ERROR] httpInterface -> WEB3s -> Method call produced an error.') }
                            if (CONSOLE_ERROR_LOG === true) { console.log('[ERROR] httpInterface -> WEB3s -> err.stack = ' + err.stack) }
                            if (CONSOLE_ERROR_LOG === true) { console.log('[ERROR] httpInterface -> WEB3s -> Params Received = ' + body) }

                            let error = {
                                result: 'Fail Because',
                                message: err.message,
                                stack: err.stack
                            }
                            respondWithContent(JSON.stringify(error), httpResponse)
                        }
                    }
                    break
                }

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
                                    respondWithContent(JSON.stringify(ccxtMarkets), httpResponse)
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
                                    respondWithContent(JSON.stringify(exchanges), httpResponse)
                                    return
                                }
                            }

                            let content = {
                                err: global.DEFAULT_FAIL_RESPONSE // method not supported
                            }
                        } catch (err) {
                            if (CONSOLE_LOG === true) { console.log('[INFO] httpInterface -> CCXT FetchMarkets -> Could not fetch markets.') }
                            let error = {
                                result: 'Fail Because',
                                message: err.message
                            }
                            respondWithContent(JSON.stringify(error), httpResponse)
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
                                console.log('[WARN] httpInterface -> Webhook -> Fetch-Messages -> Message with no Exchange received -> messageReceived = ' + messageReceived)
                                respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                return
                            }
                            if (market === undefined) {
                                console.log('[WARN] httpInterface -> Webhook -> Fetch-Messages -> Message with no market received -> messageReceived = ' + messageReceived)
                                respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                return
                            }

                            let key = exchange + '-' + market

                            let webhookMessages = webhook.get(key)
                            if (webhookMessages === undefined) {
                                webhookMessages = []
                            }

                            respondWithContent(JSON.stringify(webhookMessages), httpResponse)
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
                                    console.log('[WARN] httpInterface -> Webhook -> New-Message -> Message with no Source received -> messageReceived = ' + messageReceived)
                                    respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    return
                                }
                                if (exchange === undefined) {
                                    console.log('[WARN] httpInterface -> Webhook -> New-Message -> Message with no Exchange received -> messageReceived = ' + messageReceived)
                                    respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    return
                                }
                                if (market === undefined) {
                                    console.log('[WARN] httpInterface -> Webhook -> New-Message -> Message with no market received -> messageReceived = ' + messageReceived)
                                    respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    return
                                }

                                let key = exchange + '-' + market

                                let webhookMessages = webhook.get(key)
                                if (webhookMessages === undefined) {
                                    webhookMessages = []
                                }

                                webhookMessages.push([timestamp, source, messageReceived])
                                webhook.set(key, webhookMessages)

                                respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                            }
                            break
                        }
                    }
                    break
                }
                break

            case 'LegacyPlotter.js':
                {
                    respondWithFile(process.env.PATH_TO_CLIENT + 'WebServer/LegacyPlotter.js', httpResponse)
                }
                break

            case 'PlotterPanel.js':
                {
                    respondWithFile(process.env.PATH_TO_CLIENT + 'WebServer/PlotterPanel.js', httpResponse)
                }
                break

            case 'Images': // This means the Images folder.
                {
                    let path = process.env.PATH_TO_CLIENT + 'WebServer/Images/' + requestParameters[2]

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

                    respondWithImage(path, httpResponse)
                }
                break

            case 'Icons': // This means the Icons folder under Projects.
                {
                    let path = process.env.PROJECTS_PATH + '/' + requestParameters[2] + '/Icons'

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
                    respondWithImage(path, httpResponse)
                }
                break

            case 'Gifs': // This means the Gifs folder under Projects.
                {
                    let path = process.env.PROJECTS_PATH + '/' + requestParameters[2] + '/Gifs'

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
                    respondWithImage(path, httpResponse)
                }
                break

            case 'favicon.ico': // This means the Scripts folder.
                {
                    respondWithImage(process.env.PATH_TO_CLIENT + 'WebServer/Images/' + 'favicon.ico', httpResponse)
                }
                break

            case 'WebServer': // This means the WebServer folder.
                {
                    respondWithFile(process.env.PATH_TO_CLIENT + 'WebServer/' + requestParameters[2], httpResponse)
                }
                break

            case 'externalScripts': // This means the WebServer folder.
                {
                    respondWithFile(process.env.PATH_TO_CLIENT + 'WebServer/externalScripts/' + requestParameters[2], httpResponse)
                }
                break

            case 'Plotters': // This means the plotter folder, not to be confused with the Plotters script!
                {
                    let dataMine = requestParameters[2]
                    let codeName = requestParameters[3]
                    let moduleName = requestParameters[4]
                    let filePath = process.env.PLOTTERS_PATH + '/' + dataMine + '/plotters/' + codeName + '/' + moduleName
                    respondWithFile(filePath, httpResponse)
                }
                break

            case 'PlotterPanels': // This means the PlotterPanels folder, not to be confused with the Plotter Panels scripts!
                {
                    let dataMine = requestParameters[2]
                    let codeName = requestParameters[3]
                    let moduleName = requestParameters[4]
                    let filePath = process.env.PLOTTERS_PATH + '/' + dataMine + '/plotters/' + codeName + '/' + moduleName
                    respondWithFile(filePath, httpResponse)
                }
                break

            case 'ChartLayers':
                {
                    respondWithFile(process.env.PATH_TO_UI + '/' + requestParameters[1] + '/' + requestParameters[2], httpResponse)
                }
                break

            case 'Files':
                {
                    respondWithFile(process.env.PATH_TO_DATA_FILES + '/' + requestParameters[2], httpResponse)
                }
                break

            case 'Fonts':
                {
                    respondWithFont(process.env.PATH_TO_FONTS + '/' + requestParameters[2], httpResponse)
                }
                break

            case 'ProjectNames':
                {
                    let projects = getDirectories(process.env.PROJECTS_PATH)
                    respondWithContent(JSON.stringify(projects), httpResponse)
                }
                break

            case 'Schema':
                {
                    sendSchema(process.env.PROJECTS_PATH + '/' + requestParameters[2] + '/Schemas/', requestParameters[3] + '.json')
                }
                break

            case 'IconNames':
                {
                    let projects = getDirectories(process.env.PROJECTS_PATH)
                    const fs = require('fs')

                    let icons = []
                    let totalProjects = projects.length
                    let projectCounter = 0

                    for (let i = 0; i < projects.length; i++) {
                        let project = projects[i]

                        const folder = process.env.PROJECTS_PATH + '/' + project + '/Icons/'

                        fs.readdir(folder, (err, files) => {
                            for (let j = 0; j < files.length; j++) {
                                let file = files[j]
                                icons.push([project, file])
                            }

                            projectCounter++
                            if (projectCounter === totalProjects) {
                                respondWithContent(JSON.stringify(icons), httpResponse)
                            }
                        })
                    }
                }
                break

            case 'PluginFileNames':
                {
                    let project = unescape(requestParameters[2])
                    let pluginType = unescape(requestParameters[3])

                    const fs = require('fs')
                    let folder = process.env.PROJECTS_PATH + '/' + project + '/Plugins/' + pluginType

                    fs.readdir(folder, (err, files) => {
                        respondWithContent(JSON.stringify(files), httpResponse)
                    })
                }
                break

            case 'LoadPlugin':
                {
                    let project = unescape(requestParameters[2])
                    let pluginType = unescape(requestParameters[3])
                    let fileName = unescape(requestParameters[4])
                    let filePath = process.env.PROJECTS_PATH + '/' + project + '/Plugins/' + pluginType + '/' + fileName
                    respondWithFile(filePath, httpResponse)
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
                            respondWithContent(undefined, httpResponse)
                        } else {
                            let responseContent = 'function getWorkspace(){ return ' + workspace + '}'
                            respondWithContent(responseContent, httpResponse)
                        }
                    }
                }
                break

            case 'ListWorkspaces':
                {
                    let allWorkspaces = []
                    let projects = getDirectories(process.env.PROJECTS_PATH)
                    let projectsCount = 0

                    for (let i = 0; i < projects.length; i++) {
                        let project = projects[i]
                        readPluginWorkspaces()
                        function readPluginWorkspaces() {
                            let dirPath = process.env.PROJECTS_PATH + '/' + project + '/Plugins/Workspaces'
                            try {
                                let fs = require('fs')
                                fs.readdir(dirPath, onDirRead)

                                function onDirRead(err, fileList) {
                                    if (err) {
                                        if (CONSOLE_ERROR_LOG === true) { console.log('[WARN] Error reading a directory content. filePath = ' + dirPath) }
                                        respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                        return
                                    } else {
                                        let updatedFileList = []
                                        for (let i = 0; i < fileList.length; i++) {
                                            let name = 'Plugin \u2192 ' + fileList[i]
                                            updatedFileList.push([project, name])
                                        }
                                        allWorkspaces = allWorkspaces.concat(updatedFileList)
                                        projectsCount++
                                        if (projectsCount === projects.length) {
                                            readMyWorkspaces()
                                        }
                                        return
                                    }
                                }
                            } catch (err) {
                                if (CONSOLE_ERROR_LOG === true) { console.log('[ERROR] Error reading a directory content. filePath = ' + dirPath) }
                                if (CONSOLE_ERROR_LOG === true) { console.log('[ERROR] err.stack = ' + err.stack) }
                                respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                return
                            }
                        }
                    }

                    function readMyWorkspaces() {
                        let dirPath = process.env.MY_WORKSPACES_PATH
                        try {
                            let fs = require('fs')
                            fs.readdir(dirPath, onDirRead)

                            function onDirRead(err, fileList) {
                                if (err) {
                                    if (CONSOLE_ERROR_LOG === true) { console.log('[WARN] Error reading a directory content. filePath = ' + dirPath) }
                                    respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    return
                                } else {
                                    let updatedFileList = []
                                    for (let i = 0; i < fileList.length; i++) {
                                        let name = fileList[i]
                                        updatedFileList.push(['', name])
                                    }
                                    allWorkspaces = allWorkspaces.concat(updatedFileList)
                                    respondWithContent(JSON.stringify(allWorkspaces), httpResponse)
                                    return
                                }
                            }
                        } catch (err) {
                            if (CONSOLE_ERROR_LOG === true) { console.log('[ERROR] Error reading a directory content. filePath = ' + dirPath) }
                            if (CONSOLE_ERROR_LOG === true) { console.log('[ERROR] err.stack = ' + err.stack) }
                            respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                            return
                        }
                    }
                }
                break

            case 'LoadMyWorkspace':
                {
                    let fileName = unescape(requestParameters[2])
                    let filePath = process.env.MY_WORKSPACES_PATH + '/' + fileName + '.json'
                    respondWithFile(filePath, httpResponse)
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
                                    console.log('[ERROR] SaveWorkspace -> onFileWritten -> Error writting the Workspace file. fileName = ' + fileName)
                                    console.log('[ERROR] SaveWorkspace -> onFileWritten -> err.stack = ' + err.stack)
                                    let error = {
                                        result: 'Fail Because',
                                        message: err.message,
                                        stack: err.stack
                                    }
                                    respondWithContent(JSON.stringify(error), httpResponse)
                                } else {
                                    respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                }
                            }

                        } catch (err) {
                            console.log('[ERROR] SaveWorkspace -> Error writting the Workspace file. fileName = ' + fileName)
                            console.log('[ERROR] SaveWorkspace -> err.stack = ' + err.stack)
                            let error = {
                                result: 'Fail Because',
                                message: err.message,
                                stack: err.stack
                            }
                            respondWithContent(JSON.stringify(error), httpResponse)
                        }
                    }
                }
                break

            case 'ListFunctionLibraries':
                {
                    returnProjectFolderFileList('Function-Libraries')
                }
                break

            case 'ProjectsSchema':
                {
                    let path = process.env.PROJECTS_PATH + '/' + 'ProjectsSchema.json'
                    respondWithFile(path, httpResponse)
                }
                break

            case 'ListSpaceFiles':
                {
                    let fs = require('fs')
                    let allFiles = []
                    let projects = getDirectories(process.env.PROJECTS_PATH)
                    let dirCount = 0
                    let totalDirs = 0

                    for (let i = 0; i < projects.length; i++) {
                        let project = projects[i]

                        let dirPath = project + '/Spaces'
                        let spaces = getDirectories(process.env.PROJECTS_PATH + '/' + dirPath)

                        for (let j = 0; j < spaces.length; j++) {
                            let space = spaces[j]
                            readDirectory(dirPath + '/' + space)
                        }

                        function readDirectory(path) {
                            try {

                                totalDirs++
                                fs.readdir(process.env.PROJECTS_PATH + '/' + path, onDirRead)

                                let otherDirs = getDirectories(process.env.PROJECTS_PATH + '/' + path)
                                for (let m = 0; m < otherDirs.length; m++) {
                                    let otherDir = otherDirs[m]
                                    readDirectory(path + '/' + otherDir)
                                }

                                function onDirRead(err, fileList) {
                                    if (err) {
                                        respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    } else {
                                        let updatedFileList = []
                                        for (let k = 0; k < fileList.length; k++) {
                                            let name = fileList[k]
                                            if (name.indexOf('.js') < 0) { continue }
                                            updatedFileList.push(path + '/' + name)
                                        }
                                        allFiles = allFiles.concat(updatedFileList)
                                        dirCount++
                                        if (dirCount === totalDirs) {
                                            respondWithContent(JSON.stringify(allFiles), httpResponse)
                                        }
                                    }
                                }
                            } catch (err) {
                                console.log('[ERROR] Error reading a directory content. filePath = ' + path)
                                if (CONSOLE_ERROR_LOG === true) { console.log('[ERROR] err.stack = ' + err.stack) }

                                console.log(err.stack)
                                respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                return
                            }
                        }
                    }
                }
                break

            case 'ListUtilitiesFiles':
                {
                    returnProjectFolderFileList('Utilities')
                }
                break

            case 'ListGlobalFiles':
                {
                    returnProjectFolderFileList('Globals')
                }
                break

            case 'Projects':
                {
                    let path = ''
                    for (let i = 2; i < 10; i++) {
                        if (requestParameters[i] !== undefined) {
                            let parameter = unescape(requestParameters[i])
                            path = path + '/' + parameter
                        }

                    }
                    let filePath = process.env.PROJECTS_PATH + path
                    respondWithFile(filePath, httpResponse)
                }
                break

            case 'Storage':
                {
                    respondWithFile(process.env.STORAGE_PATH + '/' + httpRequest.url.substring(9), httpResponse)
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
            case 'ExecuteTerminalCommand':
                {
                    let command = unescape(requestParameters[2])
                    executeTerminalCommand(command)
                }
                break
            default:
                {
                    homePage()
                }
        }

        function returnProjectFolderFileList(projectFolderName) {
            {
                let allLibraries = []
                let projects = getDirectories(process.env.PROJECTS_PATH)
                let projectsCount = 0

                for (let i = 0; i < projects.length; i++) {
                    let project = projects[i]

                    let dirPath = process.env.PROJECTS_PATH + '/' + project + '/' + projectFolderName
                    try {
                        let fs = require('fs')
                        fs.readdir(dirPath, onDirRead)

                        function onDirRead(err, fileList) {
                            if (err) {
                                if (CONSOLE_ERROR_LOG === true) { console.log('[WARN] Error reading a directory content. filePath = ' + dirPath) }
                                if (CONSOLE_ERROR_LOG === true) { console.log(err.stack) }
                                return
                            } else {
                                let updatedFileList = []
                                for (let i = 0; i < fileList.length; i++) {
                                    let name = fileList[i]
                                    updatedFileList.push([project, name])
                                }
                                allLibraries = allLibraries.concat(updatedFileList)
                                projectsCount++
                                if (projectsCount === projects.length) {
                                    respondWithContent(JSON.stringify(allLibraries), httpResponse)
                                }
                                return
                            }
                        }
                    } catch (err) {
                        if (CONSOLE_ERROR_LOG === true) { console.log('[ERROR] Error reading a directory content. filePath = ' + dirPath) }
                        if (CONSOLE_ERROR_LOG === true) { console.log('[ERROR] err.stack = ' + err.stack) }

                        respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                        return
                    }
                }
            }
        }

        function executeTerminalCommand(command) {
            const util = require('util');
            const exec = util.promisify(require('child_process').exec);
            async function lsWithGrep() {
                try {
                    const { stdout, stderr } = await exec(command);
                    console.log('stdout:', stdout);
                    console.log('stderr:', stderr);
                } catch (err) {
                    console.error(err.stack);
                };
            };
            lsWithGrep();
        }

        function sendSchema(filePath, fileName) {
            let fs = require('fs')

            try {
                filePath = filePath + fileName
                fs.readFile(filePath, onFileRead)
            } catch (e) {
                console.log('[ERROR] Error reading the ' + fileName, e)
            }

            function onFileRead(err, schema) {
                if (err) {
                    respondWithContent(undefined, httpResponse)
                } else {
                    respondWithContent(schema, httpResponse)
                }
            }
        }

        function sendStyleSheet(fileName) {
            let fs = require('fs')
            try {
                let filePath = process.env.PATH_TO_CLIENT + 'WebServer/' + fileName
                fs.readFile(filePath, onFileRead)

                function onFileRead(err, file) {
                    try {
                        let fileContent = file.toString()

                        fileContent = fileContent.replace('HTTP_INTERFACE_PORT', process.env.HTTP_INTERFACE_PORT)
                        fileContent = fileContent.replace('HTTP_INTERFACE_PORT', process.env.HTTP_INTERFACE_PORT)
                        fileContent = fileContent.replace('HTTP_INTERFACE_PORT', process.env.HTTP_INTERFACE_PORT)
                        respondWithContent(fileContent, httpResponse, 'text/css')
                    } catch (err) {
                        console.log('[ERROR] httpInterface -> mainCSS -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
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
                    let fileName = process.env.PATH_TO_CLIENT + 'WebServer/index.html'
                    fs.readFile(fileName, onFileRead)

                    function onFileRead(err, file) {
                        try {
                            let fileContent = file.toString()

                            fileContent = fileContent.replace('HTTP_INTERFACE_PORT', process.env.HTTP_INTERFACE_PORT)
                            respondWithContent(fileContent, httpResponse)
                        } catch (err) {
                            console.log('[ERROR] httpInterface -> homePage -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
                        }
                    }
                } catch (err) {
                    console.log(err)
                }
            } else {
                respondWithFile(process.env.PATH_TO_UI + '/' + requestParameters[1], httpResponse)
            }
        }
    }

    function respondWithFile(fileName, httpResponse) {
        let fs = require('fs')
        if (fileName.indexOf('undefined') > 0) {
            console.log('[WRN] httpInterface -> respondWithFile -> Received httpRequest for undefined file. ')
            respondWithContent(undefined, httpResponse)
        } else {
            try {
                fs.readFile(fileName, onFileRead)

                function onFileRead(err, file) {
                    if (CONSOLE_LOG === true) { console.log('[INFO] httpInterface -> respondWithFile -> onFileRead -> Entering function.') }
                    if (!err) {
                        respondWithContent(file.toString(), httpResponse)
                    } else {
                        //console.log('File requested not found: ' + fileName)
                        respondWithContent(undefined, httpResponse)
                    }
                }
            } catch (err) {
                returnEmptyArray()
            }
        }
    }

    function respondWithContent(content, httpResponse, contentType) {
        if (CONSOLE_LOG === true) { console.log('[INFO] httpInterface -> respondWithContent -> Entering function.') }

        try {
            httpResponse.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
            httpResponse.setHeader('Pragma', 'no-cache') // HTTP 1.0.
            httpResponse.setHeader('Expires', '0') // Proxies.
            httpResponse.setHeader('Access-Control-Allow-Origin', '*') // Allows to access data from other domains.

            if (content !== undefined) {
                if (contentType !== undefined) {
                    httpResponse.writeHead(200, { 'Content-Type': contentType })
                } else {
                    httpResponse.writeHead(200, { 'Content-Type': 'text/html' })
                }
                httpResponse.write(content)
            } else {
                httpResponse.writeHead(404, { 'Content-Type': 'text/html' })
                httpResponse.write('The specified key does not exist.')
            }
            httpResponse.end('\n')
        } catch (err) {
            returnEmptyArray(httpResponse)
        }
    }

    function respondWithImage(fileName, httpResponse) {
        if (CONSOLE_LOG === true) { console.log('[INFO] httpInterface -> respondWithImage -> Entering function.') }

        let fs = require('fs')
        try {
            fs.readFile(fileName, onFileRead)

            function onFileRead(err, file) {
                if (err) {
                    console.log('[ERROR] httpInterface -> respondWithImage -> onFileRead -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
                    return
                }
                try {
                    httpResponse.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
                    httpResponse.setHeader('Pragma', 'no-cache') // HTTP 1.0.
                    httpResponse.setHeader('Expires', '0') // Proxies.
                    httpResponse.setHeader('Access-Control-Allow-Origin', '*') // Allows to access data from other domains.

                    httpResponse.writeHead(200, { 'Content-Type': 'image/png' })
                    httpResponse.end(file, 'binary')
                } catch (err) {
                    console.log('[ERROR] httpInterface -> respondWithImage -> onFileRead -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
                }
            }
        } catch (err) {
            console.log('[ERROR] httpInterface -> respondWithImage -> err = ' + err.stack)
        }
    }

    function respondWithFont(fileName, httpResponse) {
        if (CONSOLE_LOG === true) { console.log('[INFO] httpInterface -> respondWithBinary -> Entering function.') }

        let fs = require('fs')
        try {
            fs.readFile(fileName, onFileRead)

            function onFileRead(err, file) {
                if (CONSOLE_LOG === true) { console.log('[INFO] httpInterface -> respondWithBinary -> onFileRead -> Entering function.') }

                try {
                    if (err) {
                        console.log('[ERROR] httpInterface -> respondWithBinary -> onFileRead -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
                        return
                    }
                    httpResponse.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
                    httpResponse.setHeader('Pragma', 'no-cache') // HTTP 1.0.
                    httpResponse.setHeader('Expires', '0') // Proxies.
                    httpResponse.setHeader('Access-Control-Allow-Origin', '*') // Allows to access data from other domains.

                    if (fileName.indexOf('2') < 0) {
                        httpResponse.writeHead(200, { 'Content-Type': 'font/woff' })
                    } else {
                        httpResponse.writeHead(200, { 'Content-Type': 'font/woff2' })
                    }
                    httpResponse.end(file, 'binary')
                } catch (err) {
                    console.log('[ERROR] httpInterface -> respondWithBinary -> onFileRead -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
                }
            }
        } catch (err) {
            console.log('[ERROR] httpInterface -> respondWithBinary -> err = ' + err.stack)
        }
    }

    function returnEmptyArray(httpResponse) {
        try {
            if (CONSOLE_LOG === true) { console.log('[INFO] httpInterface -> returnEmptyArray -> Entering function.') }
            httpResponse.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
            httpResponse.setHeader('Pragma', 'no-cache') // HTTP 1.0.
            httpResponse.setHeader('Expires', '0') // Proxies.

            httpResponse.writeHead(200, { 'Content-Type': 'text/html' })
            httpResponse.write('[]')
            httpResponse.end('\n')
        } catch (err) {
            console.log('[ERROR] httpInterface -> returnEmptyArray -> err.stack ' + err.stack)
        }
    }

    function getDirectories(path) {
        const fs = require('fs')
        return fs.readdirSync(path).filter(function (file) {
            return fs.statSync(path + '/' + file).isDirectory();
        });
    }
}