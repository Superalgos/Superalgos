exports.newHttpInterface = function newHttpInterface(WEB_SERVER, DATA_FILE_SERVER, PROJECT_FILE_SERVER, UI_FILE_SERVER, PLUGIN_SERVER, CCXT_SERVER, WEB3_SERVER) {

    /*
    IMPORTANT: If you are reviewing the code of the project please note 
    that this file is the single file in the whole system that accumulated
    more technical debt by far. I did not have the time yet to pay the 
    technical debt, and therefore there is a lot to reorganize in here. 
    I will remove this note once this job is done.
    */
    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        run: run
    }

    const open = require('open')

    let port = global.env.HTTP_INTERFACE_PORT

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

        try {
            if (isHttpServerStarted === false) {
                gWebServer = http.createServer(onBrowserRequest).listen(port)
                isHttpServerStarted = true
                /* Starting the browser now is optional */
                if (process.argv.includes("noBrowser")) {
                    //Running Client only with no UI.
                } else {
                    open('http://localhost:' + port)
                }

            }
        } catch (err) {
            console.log('[ERROR] httpInterface -> startHtttpServer -> Error = ' + err.stack)
        }
    }

    function onBrowserRequest(httpRequest, httpResponse) {

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
                    console.log('[INFO] httpInterface -> onBrowserRequest -> getBody -> err = ' + err.stack)
                    respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                })
            } catch (err) {
                console.log('[INFO] httpInterface -> onBrowserRequest -> getBody -> err = ' + err.stack)
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
                            console.log('[ERROR] httpInterface -> WEB3s -> Method call produced an error.')
                            console.log('[ERROR] httpInterface -> WEB3s -> err.stack = ' + err.stack)
                            console.log('[ERROR] httpInterface -> WEB3s -> Params Received = ' + body)

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
                            console.log('[INFO] httpInterface -> CCXT FetchMarkets -> Could not fetch markets.')
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

                            console.log('[INFO] httpInterface -> Webhook -> Fetch-Messages -> Exchange-Market = ' + exchange + '-' + market)
                            console.log('[INFO] httpInterface -> Webhook -> Fetch-Messages -> Messeges Fetched by Webhooks Sensor Bot = ' + webhookMessages.length)

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

                                console.log('[INFO] httpInterface -> Webhook -> New-Message -> Exchange-Market = ' + exchange + '-' + market)
                                console.log('[INFO] httpInterface -> Webhook -> New-Message -> messageReceived = ' + messageReceived)
                                console.log('[INFO] httpInterface -> Webhook -> New-Message -> Messeges waiting to be Fetched by Webhooks Sensor Bot = ' + webhookMessages.length)
                                respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                            }
                            break
                        }
                    }
                    break
                }
                break

            case 'Docs':
                {
                    switch (requestParameters[2]) { // switch by command
                        case 'Save-Node-Schema': {
                            getBody(processRequest)

                            async function processRequest(body) {
                                try {
                                    let docsSchema = JSON.parse(body)
                                    let project = requestParameters[3]
                                    let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Nodes'

                                    if (checkAllSchmemaDocuments('Node', docsSchema, filePath) === true) {
                                        respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                    } else {
                                        respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    }

                                } catch (err) {
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Node-Schema -> Method call produced an error.')
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Node-Schema -> err.stack = ' + err.stack)
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Node-Schema -> Params Received = ' + body)

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
                        case 'Save-Concept-Schema': {
                            getBody(processRequest)

                            async function processRequest(body) {
                                try {
                                    let docsSchema = JSON.parse(body)
                                    let project = requestParameters[3]
                                    let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Concepts'

                                    if (checkAllSchmemaDocuments('Concept', docsSchema, filePath) === true) {
                                        respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                    } else {
                                        respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    }

                                } catch (err) {
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Concept-Schema -> Method call produced an error.')
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Concept-Schema -> err.stack = ' + err.stack)
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Concept-Schema -> Params Received = ' + body)

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
                        case 'Save-Topic-Schema': {
                            getBody(processRequest)

                            async function processRequest(body) {
                                try {
                                    let docsSchema = JSON.parse(body)
                                    let project = requestParameters[3]
                                    let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Topics'

                                    if (checkAllSchmemaDocuments('Topic', docsSchema, filePath) === true) {
                                        respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                    } else {
                                        respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    }

                                } catch (err) {
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Topic-Schema -> Method call produced an error.')
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Topic-Schema -> err.stack = ' + err.stack)
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Topic-Schema -> Params Received = ' + body)

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
                        case 'Save-Tutorial-Schema': {
                            getBody(processRequest)

                            async function processRequest(body) {
                                try {
                                    let docsSchema = JSON.parse(body)
                                    let project = requestParameters[3]
                                    let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Tutorials'

                                    if (checkAllSchmemaDocuments('Tutorial', docsSchema, filePath) === true) {
                                        respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                    } else {
                                        respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    }

                                } catch (err) {
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Tutorial-Schema -> Method call produced an error.')
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Tutorial-Schema -> err.stack = ' + err.stack)
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Tutorial-Schema -> Params Received = ' + body)

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
                        case 'Save-Review-Schema': {
                            getBody(processRequest)

                            async function processRequest(body) {
                                try {
                                    let docsSchema = JSON.parse(body)
                                    let project = requestParameters[3]
                                    let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Reviews'

                                    if (checkAllSchmemaDocuments('Review', docsSchema, filePath) === true) {
                                        respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                    } else {
                                        respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    }

                                } catch (err) {
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Review-Schema -> Method call produced an error.')
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Review-Schema -> err.stack = ' + err.stack)
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Review-Schema -> Params Received = ' + body)

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
                        case 'Save-Book-Schema': {
                            getBody(processRequest)

                            async function processRequest(body) {
                                try {
                                    let docsSchema = JSON.parse(body)
                                    let project = requestParameters[3]
                                    let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Books'

                                    if (checkAllSchmemaDocuments('Book', docsSchema, filePath) === true) {
                                        respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                    } else {
                                        respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    }

                                } catch (err) {
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Book-Schema -> Method call produced an error.')
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Book-Schema -> err.stack = ' + err.stack)
                                    console.log('[ERROR] httpInterface -> Docs -> Save-Book-Schema -> Params Received = ' + body)

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
                    }

                    function checkAllSchmemaDocuments(category, docsSchema, filePath) {
                        const fs = require('fs')
                        let noErrorsDuringSaving = true

                        for (let i = 0; i < docsSchema.length; i++) {
                            let schemaDocument = docsSchema[i]
                            let fileName = schemaDocument.type.toLowerCase()
                            for (let j = 0; j < 10; j++) {
                                fileName = cleanFileName(fileName)
                            }
                            let pageNumber = '00' + schemaDocument.pageNumber

                            switch (category) {
                                case 'Topic': {
                                    fileName = schemaDocument.topic.toLowerCase() + '-' + pageNumber.substring(pageNumber.length - 3, pageNumber.length) + '-' + schemaDocument.type.toLowerCase()
                                    fileName = cleanFileName(fileName)
                                    break
                                }
                                case 'Tutorial': {
                                    fileName = schemaDocument.tutorial.toLowerCase() + '-' + pageNumber.substring(pageNumber.length - 3, pageNumber.length) + '-' + schemaDocument.type.toLowerCase()
                                    fileName = cleanFileName(fileName)
                                    break
                                }
                                case 'Review': {
                                    fileName = schemaDocument.review.toLowerCase() + '-' + pageNumber.substring(pageNumber.length - 3, pageNumber.length) + '-' + schemaDocument.type.toLowerCase()
                                    fileName = cleanFileName(fileName)
                                    break
                                }
                            }
                            fileName = fileName + '.json'

                            if (schemaDocument.deleted === true) {
                                try {
                                    fs.unlinkSync(filePath + '/' + fileName)
                                    console.log('[SUCCESS] ' + filePath + '/' + fileName + ' deleted.')
                                } catch (err) {
                                    noErrorsDuringSaving = false
                                    console.log('[ERROR] httpInterface -> Docs -> Save -> ' + filePath + '/' + fileName + ' could not be deleted.')
                                    console.log('[ERROR] httpInterface -> Docs -> Save -> Resolve the issue that is preventing the Client to delete this file. Look at the error message below as a guide. At the UI you will need to delete this page again in order for the Client to retry next time you execute the docs.save command.')
                                    console.log('[ERROR] httpInterface -> Docs -> Save -> err.stack = ' + err.stack)
                                }
                            } else {
                                if (schemaDocument.updated === true || schemaDocument.created === true) {
                                    try {
                                        let created = schemaDocument.created
                                        let updated = schemaDocument.updated
                                        schemaDocument.updated = undefined
                                        schemaDocument.created = undefined
                                        let fileContent = JSON.stringify(schemaDocument, undefined, 4)
                                        try {
                                            fs.mkdirSync(filePath)
                                        } catch (err) {
                                            if (err.message.indexOf('file already exists') < 0) {
                                                throw (err)
                                            }
                                        }
                                        fs.writeFileSync(filePath + '/' + fileName, fileContent)
                                        if (created === true) {
                                            console.log('[SUCCESS] ' + filePath + '/' + fileName + '  created.')
                                        } else {
                                            if (updated === true) {
                                                console.log('[SUCCESS] ' + filePath + '/' + fileName + '  updated.')
                                            }
                                        }
                                    } catch (err) {
                                        noErrorsDuringSaving = false
                                        console.log('[ERROR] httpInterface -> Docs -> Save -> ' + filePath + '/' + fileName + ' could not be created / updated.')
                                        console.log('[ERROR] httpInterface -> Docs -> Save -> err.stack = ' + err.stack)
                                    }
                                }
                            }
                        }

                        return noErrorsDuringSaving
                    }

                    function cleanFileName(fileName) {
                        for (let i = 0; i < 100; i++) {
                            fileName = fileName
                                .replace(' ', '-')
                                .replace('--', '-')
                                .replace('?', '')
                                .replace('#', '')
                                .replace('$', '')
                                .replace('%', '')
                                .replace('^', '')
                                .replace('&', '')
                                .replace('*', '')
                                .replace('(', '')
                                .replace(')', '')
                                .replace('!', '')
                                .replace('..', '.')
                                .replace(',', '')
                                .replace('\'', '')
                        }
                        return fileName
                    }
                }
                break

            case 'App': {
                switch (requestParameters[2]) { // switch by command
                    case 'Contribute': {
                        try {
                            let commitMessage = unescape(requestParameters[3])
                            const username = unescape(requestParameters[4])
                            const token = unescape(requestParameters[5])
                            const currentBranch = unescape(requestParameters[6])
                            const contributionsBranch = unescape(requestParameters[7])
                            let error

                            /* Unsavping # */
                            for (let i = 0; i < 10; i++) {
                                commitMessage = commitMessage.replace('_SLASH_', '/')
                                commitMessage = commitMessage.replace('_HASHTAG_', '#')
                            }

                            contribute()

                            async function contribute() {
                                await doGit()
                                if (error !== undefined) {

                                    let docs = {
                                        project: 'Superalgos',
                                        category: 'Topic',
                                        type: 'App Error - Contribution Not Sent',
                                        anchor: undefined,
                                        placeholder: {}
                                    }

                                    respondWithDocsObject(docs, error)
                                    return
                                }

                                await doGithub()
                                if (error !== undefined) {

                                    let docs = {
                                        project: 'Superalgos',
                                        category: 'Topic',
                                        type: 'App Error - Contribution Not Sent',
                                        anchor: undefined,
                                        placeholder: {}
                                    }
                                    console.log('respond with docs ')

                                    respondWithDocsObject(docs, error)
                                    return
                                }
                                respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                            }

                            async function doGit() {
                                const simpleGit = require('simple-git');
                                const options = {
                                    baseDir: process.cwd(),
                                    binary: 'git',
                                    maxConcurrentProcesses: 6,
                                }
                                const git = simpleGit(options)

                                try {
                                    await git.add('./*')
                                    await git.commit(commitMessage)
                                    await git.push('origin', currentBranch)
                                } catch (err) {
                                    console.log('[ERROR] httpInterface -> App -> Contribute -> doGit -> Method call produced an error.')
                                    console.log('[ERROR] httpInterface -> App -> Contribute -> doGit -> err.stack = ' + err.stack)
                                    console.log('[ERROR] httpInterface -> App -> Contribute -> doGit -> commitMessage = ' + commitMessage)
                                    console.log('[ERROR] httpInterface -> App -> Contribute -> doGit -> currentBranch = ' + currentBranch)
                                    console.log('[ERROR] httpInterface -> App -> Contribute -> doGit -> contributionsBranch = ' + contributionsBranch)
                                    error = err
                                }
                            }

                            async function doGithub() {

                                const { Octokit } = require("@octokit/rest")

                                const octokit = new Octokit({
                                    auth: token,
                                    userAgent: 'Superalgos Beta 9'
                                })

                                const repo = 'Superalgos'
                                const owner = 'Superalgos'
                                const head = username + ':' + contributionsBranch
                                const base = currentBranch
                                const title = 'Contribution: ' + commitMessage

                                try {
                                    await octokit.pulls.create({
                                        owner,
                                        repo,
                                        title,
                                        head,
                                        base,
                                    });
                                } catch (err) {
                                    if (err.stack.indexOf('A pull request already exists') >= 0) {
                                        return
                                    } else {
                                        console.log('[ERROR] httpInterface -> App -> Contribute -> doGithub -> Method call produced an error.')
                                        console.log('[ERROR] httpInterface -> App -> Contribute -> doGithub -> err.stack = ' + err.stack)
                                        console.log('[ERROR] httpInterface -> App -> Contribute -> doGithub -> commitMessage = ' + commitMessage)
                                        console.log('[ERROR] httpInterface -> App -> Contribute -> doGithub -> username = ' + username)
                                        console.log('[ERROR] httpInterface -> App -> Contribute -> doGithub -> token starts with = ' + token.substring(0, 10) + '...')
                                        console.log('[ERROR] httpInterface -> App -> Contribute -> doGithub -> token ends with = ' + '...' + token.substring(token.length - 10))
                                        console.log('[ERROR] httpInterface -> App -> Contribute -> doGithub -> currentBranch = ' + currentBranch)
                                        console.log('[ERROR] httpInterface -> App -> Contribute -> doGithub -> contributionsBranch = ' + contributionsBranch)
                                        error = err
                                    }
                                }
                            }

                        } catch (err) {
                            console.log('[ERROR] httpInterface -> App -> Contribute -> Method call produced an error.')
                            console.log('[ERROR] httpInterface -> App -> Contribute -> err.stack = ' + err.stack)
                            console.log('[ERROR] httpInterface -> App -> Contribute -> commitMessage = ' + commitMessage)
                            console.log('[ERROR] httpInterface -> App -> Contribute -> username = ' + username)
                            console.log('[ERROR] httpInterface -> App -> Contribute -> token = ' + token)
                            console.log('[ERROR] httpInterface -> App -> Contribute -> currentBranch = ' + currentBranch)
                            console.log('[ERROR] httpInterface -> App -> Contribute -> contributionsBranch = ' + contributionsBranch)

                            let error = {
                                result: 'Fail Because',
                                message: err.message,
                                stack: err.stack
                            }
                            respondWithContent(JSON.stringify(error), httpResponse)
                        }
                        break
                    }

                    case 'Update': {
                        try {
                            const currentBranch = unescape(requestParameters[3])
                            update()

                            async function update() {
                                let result = await doGit()

                                if (result.error === undefined) {
                                    let customResponse = {
                                        result: global.CUSTOM_OK_RESPONSE.result,
                                        message: result.message
                                    }
                                    respondWithContent(JSON.stringify(customResponse), httpResponse)
                                } else {

                                    let docs = {
                                        project: 'Superalgos',
                                        category: 'Topic',
                                        type: 'App Error - Update Failed',
                                        anchor: undefined,
                                        placeholder: {}
                                    }

                                    respondWithDocsObject(docs, result.error)

                                }
                            }

                            async function doGit() {
                                const simpleGit = require('simple-git');
                                const options = {
                                    baseDir: process.cwd(),
                                    binary: 'git',
                                    maxConcurrentProcesses: 6,
                                }
                                const git = simpleGit(options)

                                let message
                                try {
                                    message = await git.pull('https://github.com/Superalgos/Superalgos', currentBranch)
                                    return { message: message }
                                } catch (err) {
                                    console.log('[ERROR] Error updating ' + currentBranch)
                                    console.log(err.stack)
                                    return { error: err }
                                }
                            }

                        } catch (err) {
                            console.log('[ERROR] httpInterface -> App -> Update -> Method call produced an error.')
                            console.log('[ERROR] httpInterface -> App -> Update -> err.stack = ' + err.stack)
                            console.log('[ERROR] httpInterface -> App -> Update -> commitMessage = ' + commitMessage)
                            console.log('[ERROR] httpInterface -> App -> Update -> username = ' + username)
                            console.log('[ERROR] httpInterface -> App -> Update -> token = ' + token)

                            let error = {
                                result: 'Fail Because',
                                message: err.message,
                                stack: err.stack
                            }
                            respondWithContent(JSON.stringify(error), httpResponse)
                        }
                        break
                    }

                    case 'Checkout': {
                        try {
                            const currentBranch = unescape(requestParameters[3])
                            let error

                            checkout()

                            async function checkout() {
                                await doGit()

                                if (error === undefined) {
                                    respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                } else {
                                    let docs = {
                                        project: 'Superalgos',
                                        category: 'Topic',
                                        type: 'Switching Branches - Current Branch Not Changed',
                                        anchor: undefined,
                                        placeholder: {}
                                    }

                                    respondWithDocsObject(docs, error)
                                }
                            }

                            async function doGit() {
                                const simpleGit = require('simple-git');
                                const options = {
                                    baseDir: process.cwd(),
                                    binary: 'git',
                                    maxConcurrentProcesses: 6,
                                }
                                const git = simpleGit(options)
                                try {
                                    await git.checkout(currentBranch)
                                } catch (err) {
                                    console.log('[ERROR] Error changing current branch to ' + currentBranch)
                                    console.log(err.stack)
                                    error = err
                                }
                            }

                        } catch (err) {
                            console.log('[ERROR] httpInterface -> App -> Update -> Method call produced an error.')
                            console.log('[ERROR] httpInterface -> App -> Update -> err.stack = ' + err.stack)
                            console.log('[ERROR] httpInterface -> App -> Update -> commitMessage = ' + commitMessage)
                            console.log('[ERROR] httpInterface -> App -> Update -> username = ' + username)
                            console.log('[ERROR] httpInterface -> App -> Update -> token = ' + token)

                            let error = {
                                result: 'Fail Because',
                                message: err.message,
                                stack: err.stack
                            }
                            respondWithContent(JSON.stringify(error), httpResponse)
                        }
                        break
                    }
                }

                function respondWithDocsObject(docs, error) {

                    if (error.message !== undefined) {
                        docs.placeholder.errorMessage = {
                            style: 'Error',
                            text: error.message
                        }
                    }
                    if (error.stack !== undefined) {
                        docs.placeholder.errorStack = {
                            style: 'Javascript',
                            text: error.stack
                        }
                    }
                    if (error.code !== undefined) {
                        docs.placeholder.errorCode = {
                            style: 'Json',
                            text: error.code
                        }
                    }

                    docs.placeholder.errorDetails = {
                        style: 'Json',
                        text: JSON.stringify(error, undefined, 4)
                    }

                    let customResponse = {
                        result: global.CUSTOM_FAIL_RESPONSE.result,
                        docs: docs
                    }

                    respondWithContent(JSON.stringify(customResponse), httpResponse)

                }
            }
                break

            case 'LegacyPlotter.js':
                {
                    respondWithFile(global.env.PATH_TO_CLIENT + 'WebServer/LegacyPlotter.js', httpResponse)
                }
                break

            case 'PlotterPanel.js':
                {
                    respondWithFile(global.env.PATH_TO_CLIENT + 'WebServer/PlotterPanel.js', httpResponse)
                }
                break

            case 'Images': // This means the Images folder.
                {
                    let path = global.env.PATH_TO_CLIENT + 'WebServer/Images/' + requestParameters[2]

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
                    let path = global.env.PATH_TO_PROJECTS + '/' + requestParameters[2] + '/Icons'

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

            case 'GIFs': // This means the GIFs folder under Projects.
                {
                    let path = global.env.PATH_TO_PROJECTS + '/' + requestParameters[2] + '/GIFs'

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

            case 'PNGs': // This means the PNGs folder under Projects.
                {
                    let path = global.env.PATH_TO_PROJECTS + '/' + requestParameters[2] + '/PNGs'

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
                    respondWithImage(global.env.PATH_TO_CLIENT + 'WebServer/Images/' + 'favicon.ico', httpResponse)
                }
                break

            case 'WebServer': // This means the WebServer folder.
                {
                    respondWithFile(global.env.PATH_TO_CLIENT + 'WebServer/' + requestParameters[2], httpResponse)
                }
                break

            case 'externalScripts': // This means the WebServer folder.
                {
                    respondWithFile(global.env.PATH_TO_CLIENT + 'WebServer/externalScripts/' + requestParameters[2], httpResponse)
                }
                break

            case 'Plotters': // This means the plotter folder, not to be confused with the Plotters script!
                {
                    let project = requestParameters[2]
                    let dataMine = requestParameters[3]
                    let codeName = requestParameters[4]
                    let moduleName = requestParameters[5]
                    let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/' + 'Bots-Plotters-Code' + '/' + dataMine + '/plotters/' + codeName + '/' + moduleName
                    respondWithFile(filePath, httpResponse)
                }
                break

            case 'ChartLayers':
                {
                    respondWithFile(global.env.PATH_TO_UI + '/' + requestParameters[1] + '/' + requestParameters[2], httpResponse)
                }
                break

            case 'Files':
                {
                    respondWithFile(global.env.PATH_TO_DATA_FILES + '/' + requestParameters[2], httpResponse)
                }
                break

            case 'Fonts':
                {
                    respondWithFont(global.env.PATH_TO_FONTS + '/' + requestParameters[2], httpResponse)
                }
                break

            case 'ProjectNames':
                {
                    let projects = getDirectories(global.env.PATH_TO_PROJECTS)
                    respondWithContent(JSON.stringify(projects), httpResponse)
                }
                break

            case 'Schema':
                {
                    sendSchema(global.env.PATH_TO_PROJECTS + '/' + requestParameters[2] + '/Schemas/', requestParameters[3])
                }
                break

            case 'IconNames':
                {
                    let projects = getDirectories(global.env.PATH_TO_PROJECTS)
                    const fs = require('fs')

                    let icons = []
                    let totalProjects = projects.length
                    let projectCounter = 0

                    for (let i = 0; i < projects.length; i++) {
                        let project = projects[i]

                        const folder = global.env.PATH_TO_PROJECTS + '/' + project + '/Icons/'

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
                    let folder = global.env.PATH_TO_PROJECTS + '/' + project + '/Plugins/' + pluginType

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
                    let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Plugins/' + pluginType + '/' + fileName
                    respondWithFile(filePath, httpResponse)
                }
                break

            case 'Workspace.js':
                {
                    let fs = require('fs')

                    try {
                        let filePath = global.env.PATH_TO_DEFAULT_WORKSPACE + '/Getting-Started.json'
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
                    let projects = getDirectories(global.env.PATH_TO_PROJECTS)
                    let projectsCount = 0

                    for (let i = 0; i < projects.length; i++) {
                        let project = projects[i]
                        readPluginWorkspaces()
                        function readPluginWorkspaces() {
                            let dirPath = global.env.PATH_TO_PROJECTS + '/' + project + '/Plugins/Workspaces'
                            try {
                                let fs = require('fs')
                                fs.readdir(dirPath, onDirRead)

                                function onDirRead(err, fileList) {
                                    let updatedFileList = []

                                    if (err) {
                                        /*
                                        If we have a problem reading this folder we will assume that it is
                                        because this project does not need this folder and that's it.
                                        */
                                        //console.log('[WARN] Error reading a directory content. filePath = ' + dirPath)
                                    } else {
                                        for (let i = 0; i < fileList.length; i++) {
                                            let name = 'Plugin \u2192 ' + fileList[i]
                                            updatedFileList.push([project, name])
                                        }
                                    }
                                    allWorkspaces = allWorkspaces.concat(updatedFileList)
                                    projectsCount++
                                    if (projectsCount === projects.length) {
                                        readMyWorkspaces()
                                    }
                                }
                            } catch (err) {
                                console.log('[ERROR] Error reading a directory content. filePath = ' + dirPath)
                                console.log('[ERROR] err.stack = ' + err.stack)
                                respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                return
                            }
                        }
                    }

                    function readMyWorkspaces() {
                        let dirPath = global.env.PATH_TO_MY_WORKSPACES
                        try {
                            let fs = require('fs')
                            fs.readdir(dirPath, onDirRead)

                            function onDirRead(err, fileList) {
                                if (err) {
                                    // This happens the first time you run the software.
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
                            console.log('[ERROR] Error reading a directory content. filePath = ' + dirPath)
                            console.log('[ERROR] err.stack = ' + err.stack)
                            respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                            return
                        }
                    }
                }
                break

            case 'LoadMyWorkspace':
                {
                    let fileName = unescape(requestParameters[2])
                    let filePath = global.env.PATH_TO_MY_WORKSPACES + '/' + fileName + '.json'
                    respondWithFile(filePath, httpResponse)
                }
                break

            case 'SaveWorkspace':
                {
                    getBody(processRequest)

                    async function processRequest(body) {

                        let fileContent = body
                        let fileName = unescape(requestParameters[2])
                        let filePath = global.env.PATH_TO_MY_WORKSPACES + '/' + fileName + '.json'

                        try {
                            let fs = require('fs')
                            let dir = global.env.PATH_TO_MY_WORKSPACES;

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
                    let path = global.env.PATH_TO_PROJECTS + '/' + 'ProjectsSchema.json'
                    respondWithFile(path, httpResponse)
                }
                break

            case 'ListSpaceFiles':
                {
                    let fs = require('fs')
                    let allFiles = []
                    let projects = getDirectories(global.env.PATH_TO_PROJECTS)
                    let dirCount = 0
                    let totalDirs = 0

                    for (let i = 0; i < projects.length; i++) {
                        let project = projects[i]

                        let dirPath = project + '/UI/Spaces'
                        let spaces = getDirectories(global.env.PATH_TO_PROJECTS + '/' + dirPath)

                        for (let j = 0; j < spaces.length; j++) {
                            let space = spaces[j]
                            readDirectory(dirPath + '/' + space)
                        }

                        function readDirectory(path) {
                            try {

                                totalDirs++
                                fs.readdir(global.env.PATH_TO_PROJECTS + '/' + path, onDirRead)

                                let otherDirs = getDirectories(global.env.PATH_TO_PROJECTS + '/' + path)
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
                                console.log('[ERROR] err.stack = ' + err.stack)
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
                    let filePath = global.env.PATH_TO_PROJECTS + path
                    respondWithFile(filePath, httpResponse)
                }
                break

            case 'Storage':
                {
                    let pathToFile = httpRequest.url.substring(9)
                    /* Unsavping # */
                    for (let i = 0; i < 10; i++) {
                        pathToFile = pathToFile.replace('_HASHTAG_', '#')
                    }
                    respondWithFile(global.env.PATH_TO_DATA_STORAGE + '/' + pathToFile, httpResponse)
                }
                break

            case 'main.css':
                {
                    sendStyleSheet('main.css')
                }
                break

            case 'tutorial.css':
                {
                    sendStyleSheet('tutorial.css')
                }
                break

            case 'docs.css':
                {
                    sendStyleSheet('docs.css')
                }
                break

            case 'context-menu.css':
                {
                    sendStyleSheet('context-menu.css')
                }
                break

            case 'credits.css':
                {
                    sendStyleSheet('credits.css')
                }
                break

            case 'docs.css':
                {
                    sendStyleSheet('docs.css')
                }
                break

            case 'font-awasome.css':
                {
                    sendStyleSheet('font-awasome.css')
                }
                break

            case 'prism.css':
                {
                    sendStyleSheet('prism.css')
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
                let projects = getDirectories(global.env.PATH_TO_PROJECTS)
                let projectsCount = 0

                for (let i = 0; i < projects.length; i++) {
                    let project = projects[i]

                    let dirPath = global.env.PATH_TO_PROJECTS + '/' + project + '/' + 'UI' + '/' + projectFolderName
                    try {
                        let fs = require('fs')
                        fs.readdir(dirPath, onDirRead)

                        function onDirRead(err, fileList) {
                            let updatedFileList = []
                            if (err) {
                                /*
                                If we have a problem reading this folder we will assume that it is
                                because this project does not need this folder and that's it.
                                */
                                // console.log('[WARN] Error reading a directory content. filePath = ' + dirPath)
                            } else {
                                for (let i = 0; i < fileList.length; i++) {
                                    let name = fileList[i]
                                    updatedFileList.push([project, name])
                                }
                            }
                            allLibraries = allLibraries.concat(updatedFileList)
                            projectsCount++
                            if (projectsCount === projects.length) {
                                respondWithContent(JSON.stringify(allLibraries), httpResponse)
                            }
                        }
                    } catch (err) {
                        console.log('[ERROR] Error reading a directory content. filePath = ' + dirPath)
                        console.log('[ERROR] err.stack = ' + err.stack)

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

        function sendSchema(filePath, schemaType) {
            let fs = require('fs')

            if (schemaType === 'AppSchema') {
                let fileName = 'AppSchema.json'
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
            } else {
                try {
                    let folder = ''
                    switch (schemaType) {
                        case 'DocsNodeSchema': {
                            folder = 'Docs-Nodes'
                            break
                        }
                        case 'DocsConceptSchema': {
                            folder = 'Docs-Concepts'
                            break
                        }
                        case 'DocsTopicSchema': {
                            folder = 'Docs-Topics'
                            break
                        }
                        case 'DocsTutorialSchema': {
                            folder = 'Docs-Tutorials'
                            break
                        }
                        case 'DocsReviewSchema': {
                            folder = 'Docs-Reviews'
                            break
                        }
                        case 'DocsBookSchema': {
                            folder = 'Docs-Books'
                            break
                        }
                    }

                    let schemaArray = []
                    let fileList = fs.readdirSync(filePath + '/' + folder)
                    for (let k = 0; k < fileList.length; k++) {
                        let name = fileList[k]
                        let fileContent = fs.readFileSync(filePath + '/' + folder + '/' + name)
                        let schemaDocument = JSON.parse(fileContent)
                        schemaArray.push(schemaDocument)
                    }
                    let schema = JSON.stringify(schemaArray)
                    respondWithContent(schema, httpResponse)
                } catch (err) {
                    if (err.message.indexOf('no such file or directory') < 0) {
                        console.log('Could not send Schema:', filePath, schemaType)
                        console.log(err.stack)
                    }
                    respondWithContent("[]", httpResponse)
                }
            }
        }

        function sendStyleSheet(fileName) {
            let fs = require('fs')
            try {
                let filePath = global.env.PATH_TO_CLIENT + 'WebServer/css/' + fileName
                fs.readFile(filePath, onFileRead)

                function onFileRead(err, file) {
                    try {
                        let fileContent = file.toString()

                        fileContent = fileContent.replace('HTTP_INTERFACE_PORT', global.env.HTTP_INTERFACE_PORT)
                        fileContent = fileContent.replace('HTTP_INTERFACE_PORT', global.env.HTTP_INTERFACE_PORT)
                        fileContent = fileContent.replace('HTTP_INTERFACE_PORT', global.env.HTTP_INTERFACE_PORT)
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
                    let fileName = global.env.PATH_TO_CLIENT + 'WebServer/index.html'
                    fs.readFile(fileName, onFileRead)

                    function onFileRead(err, file) {
                        try {
                            let fileContent = file.toString()

                            fileContent = fileContent.replace('HTTP_INTERFACE_PORT', global.env.HTTP_INTERFACE_PORT)
                            respondWithContent(fileContent, httpResponse)
                        } catch (err) {
                            console.log('[ERROR] httpInterface -> homePage -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
                        }
                    }
                } catch (err) {
                    console.log(err)
                }
            } else {
                respondWithFile(global.env.PATH_TO_UI + '/' + requestParameters[1], httpResponse)
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
        let fs = require('fs')
        try {
            fs.readFile(fileName, onFileRead)

            function onFileRead(err, file) {
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
        try {
            const fs = require('fs')
            return fs.readdirSync(path).filter(function (file) {
                return fs.statSync(path + '/' + file).isDirectory();
            });
        } catch (err) {
            return []
        }
    }
}