exports.newHttpInterface = function newHttpInterface() {

    /*
    IMPORTANT: If you are reviewing the code of the project please note 
    that this file is the single file in the whole system that accumulated
    more technical debt by far. I did not have the time yet to pay the 
    technical debt, and therefore there is a lot to reorganize in here. 
    I will remove this note once this job is done.
    */
    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    let webhook = new Map()

    return thisObject

    function finalize() {
        webhook = undefined
    }

    function initialize(initialWorkspace) {
        /*
        We will create an HTTP Server and leave it running forever.
        */
        SA.nodeModules.http.createServer(onHttpRequest).listen(global.env.PLATFORM_HTTP_INTERFACE_PORT)
        /* Starting the browser now is optional */
        if (process.argv.includes("noBrowser")) {
            //Running Client only with no UI.
        } else {
            let queryString = ''
            if (initialWorkspace.name !== undefined) {
                queryString = '/?initialWorkspaceName=' + initialWorkspace.name + '&initialWorkspaceProject=' + initialWorkspace.project + '&initialWorkspaceType=' + initialWorkspace.type
            }
            SA.nodeModules.open('http://localhost:' + global.env.PLATFORM_HTTP_INTERFACE_PORT + queryString)
        }
    }

    function onHttpRequest(httpRequest, httpResponse) {
        try {
            let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
            let requestPath = requestPathAndParameters[0].split('/')
            let endpointOrFile = requestPath[1]

            switch (endpointOrFile) {
                case 'Environment': {
                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.env), httpResponse)
                }
                    break
                case 'WEB3': {
                    SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                    async function processRequest(body) {
                        try {
                            if (body === undefined) {
                                return
                            }
                            let params = JSON.parse(body)

                            switch (params.method) {
                                case 'getNetworkClientStatus': {

                                    let serverResponse = await PL.servers.WEB3_SERVER.getNetworkClientStatus(
                                        params.host,
                                        params.port,
                                        params.interface
                                    )

                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                                    return
                                }
                                case 'createWalletAccount': {

                                    let serverResponse = await PL.servers.WEB3_SERVER.createWalletAccount(
                                        params.entropy
                                    )

                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                                    return
                                }
                                case 'getUserWalletBalance': {

                                    let serverResponse = await PL.servers.WEB3_SERVER.getUserWalletBalance(
                                        params.walletAddress,
                                        params.contractAddress
                                    )

                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                                    return
                                }
                                case 'getWalletBalances': {

                                    let serverResponse = await PL.servers.WEB3_SERVER.getWalletBalances(
                                        params.host,
                                        params.port,
                                        params.interface,
                                        params.walletDefinition
                                    )

                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                                    return
                                }
                                case 'signData': {

                                    let serverResponse = await PL.servers.WEB3_SERVER.signData(
                                        params.privateKey,
                                        params.data
                                    )

                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                                    return
                                }
                                case 'hashData': {

                                    let serverResponse = await PL.servers.WEB3_SERVER.hashData(
                                        params.data
                                    )

                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                                    return
                                }
                                case 'recoverAddress': {

                                    let serverResponse = await PL.servers.WEB3_SERVER.recoverAddress(
                                        params.signature
                                    )

                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                                    return
                                }
                                case 'recoverWalletAddress': {

                                    let serverResponse = await PL.servers.WEB3_SERVER.recoverWalletAddress(
                                        params.signature,
                                        params.account,
                                        params.data
                                    )

                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                                    return
                                }
                                case 'mnemonicToPrivateKey': {

                                    let serverResponse = await PL.servers.WEB3_SERVER.mnemonicToPrivateKey(
                                        params.mnemonic
                                    )

                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                                    return
                                }
                                default: {
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify({ error: 'Method ' + params.method + ' is invalid.' }), httpResponse)
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
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                        }
                    }
                }
                    break
                case 'CCXT': {
                    SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                    async function processRequest(body) {
                        try {
                            if (body === undefined) {
                                return
                            }
                            let params = JSON.parse(body)

                            switch (params.method) {
                                case 'fetchMarkets': {

                                    const exchangeClass = SA.nodeModules.ccxt[params.exchangeId]
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
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(ccxtMarkets), httpResponse)
                                    return
                                }
                                case 'listExchanges': {
                                    let exchanges = []
                                    for (let i = 0; i < SA.nodeModules.ccxt.exchanges.length; i++) {
                                        let exchangeId = SA.nodeModules.ccxt.exchanges[i]

                                        const exchangeClass = SA.nodeModules.ccxt[exchangeId]
                                        const exchangeConstructorParams = {
                                            'timeout': 30000,
                                            'enableRateLimit': true,
                                            verbose: false
                                        }
                                        let ccxtExchange
                                        try {
                                            ccxtExchange = new exchangeClass(exchangeConstructorParams)
                                        } catch (err) {
                                        }
                                        if (ccxtExchange === undefined) {
                                            continue
                                        }


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
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(exchanges), httpResponse)
                                    return
                                }
                            }

                            let content = {
                                err: global.DEFAULT_FAIL_RESPONSE // method not supported
                            }
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(content), httpResponse)

                        } catch (err) {
                            console.log('[INFO] httpInterface -> CCXT FetchMarkets -> Could not fetch markets.')
                            let error = {
                                result: 'Fail Because',
                                message: err.message
                            }
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                        }
                    }
                }
                    break
                case 'DEX':
                    switch (requestPath[2]) {
                        case 'CreateNewWallet':
                            console.log('creating new wallet')
                            let dexWallet = SA.projects.decentralizedExchanges.modules.wallets.newDecentralizedExchangesModulesWallets()
                            dexWallet.initialize()
                            .then(() => {
                                dexWallet.createWallet()
                                .then(wallet => {
                                    responseBody = JSON.stringify({
                                        address: wallet.address,
                                        mnemonic: wallet.mnemonic.phrase,
                                        privateKey: wallet.privateKey,
                                        publicKey: wallet.publicKey
                                    })
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(responseBody, httpResponse)
                                })
                                .catch(err => {
                                    console.error(err)
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                })
                            })
                            .catch(err => {
                                console.error(err)
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                            })
                            break
                        case 'ImportWalletFromMnemonic':
                            console.log('importing wallet from mnemonic')
                            SA.projects.foundations.utilities.httpRequests.getRequestBodyAsync(httpRequest, httpResponse)
                            .then(body => {
                                let config = JSON.parse(body)
                                let dexWallet = SA.projects.decentralizedExchanges.modules.wallets.newDecentralizedExchangesModulesWallets()
                                dexWallet.initialize()
                                .then(() => {
                                    dexWallet.importWalletFromMnemonic(config.mnemonic)
                                    .then(wallet => {
                                        responseBody = JSON.stringify({
                                            address: wallet.address
                                        })
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(responseBody, httpResponse)
                                    })
                                    .catch(err => {
                                        console.error(err)
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    })
                                })
                                .catch(err => {
                                    console.error(err)
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                })
                            })
                            .catch(err => {
                                console.error(err)
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                            })
                            break
                        case 'ImportWalletFromPrivateKey':
                            console.log('importing wallet from private key')
                            SA.projects.foundations.utilities.httpRequests.getRequestBodyAsync(httpRequest, httpResponse)
                            .then(body => {
                                let config = JSON.parse(body)
                                let dexWallet = SA.projects.decentralizedExchanges.modules.wallets.newDecentralizedExchangesModulesWallets()
                                dexWallet.initialize()
                                .then(() => {
                                    dexWallet.importWalletFromPrivateKey(config.privateKey)
                                    .then(wallet => {
                                        responseBody = JSON.stringify({
                                            address: wallet.address,
                                            publicKey: wallet.publicKey
                                        })
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(responseBody, httpResponse)
                                    })
                                    .catch(err => {
                                        console.error(err)
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    })
                                })
                                .catch(err => {
                                    console.error(err)
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                })
                            })
                            .catch(err => {
                                console.error(err)
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                            })
                            break
                        case 'GetTokens':
                            console.log('adding missing tokens to wallet assets.')
                            SA.projects.foundations.utilities.httpRequests.getRequestBodyAsync(httpRequest, httpResponse)
                            .then(body => {
                                let config = JSON.parse(body)
                                if (config.network === 'bsc') {
                                    SA.projects.decentralizedExchanges.utilities.bsc.getTokens()
                                        .then(response => {
                                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                                        })
                                    .catch(err => {
                                        console.error(err)
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    })
                                }
                            })
                            .catch(err => {
                                console.error(err)
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                            })
                        }
                    break
                case 'Social-Bots':
                    switch (requestPath[2]) {
                        case 'Discord-Test-Message':
                            SA.projects.foundations.utilities.httpRequests.getRequestBodyAsync(httpRequest, httpResponse)
                                .then(body => {
                                    let config = JSON.parse(body)
                                    let text = config.text
                                    let socialBot = SA.projects.socialBots.botModules.discordBot.newSocialBotsBotModulesDiscordBot()
                                    socialBot.initialize(config)
                                        .then(response => {
                                            console.log('httpInterface > Discord Bot >', response)
                                            socialBot.sendMessage(text)
                                                .then(response => {
                                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                                                })
                                                .catch(err => {
                                                    console.error(err)
                                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                                })
                                        })
                                        .catch(err => {
                                            console.error('error initializing discord bot', err)
                                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                        })
                                })
                                .catch(err => {
                                    console.error(err)
                                })
                            break
                        case 'Slack-Test-Message':
                            SA.projects.foundations.utilities.httpRequests.getRequestBodyAsync(httpRequest, httpResponse)
                                .then(body => {
                                    let config = JSON.parse(body)
                                    let text = config.text
                                    let socialBot = SA.projects.socialBots.botModules.slackBot.newSocialBotsBotModulesSlackBot()
                                    socialBot.initialize(config)
                                    socialBot.sendMessage(text)
                                        .then(response => {
                                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                                        })
                                        .catch(err => {
                                            console.error(err)
                                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                        })
                                })
                                .catch(err => {
                                    console.error(err)
                                })
                            break
                        case 'Twitter-Test-Message':
                            SA.projects.foundations.utilities.httpRequests.getRequestBodyAsync(httpRequest, httpResponse)
                                .then(body => {
                                    config = JSON.parse(body)
                                    let message = config.text
                                    let socialBot = SA.projects.socialBots.botModules.twitterBot.newSocialBotsBotModulesTwitterBot(0)
                                    socialBot.initialize(config)
                                    socialBot.sendMessage(message)
                                        .then(response => {
                                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                                        })
                                        .catch(err => {
                                            console.error(err)
                                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                        })
                                })
                                .catch(err => {
                                    console.error(err)
                                })
                            break
                    }
                    break
                case 'Webhook': {
                    switch (requestPath[2]) { // switch by command
                        case 'Fetch-Messages': {
                            let exchange = requestPath[3]
                            let market = requestPath[4]

                            /* Some validations */
                            if (exchange === undefined) {
                                console.log('[WARN] httpInterface -> Webhook -> Fetch-Messages -> Message with no Exchange received -> messageReceived = ' + messageReceived)
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                return
                            }
                            if (market === undefined) {
                                console.log('[WARN] httpInterface -> Webhook -> Fetch-Messages -> Message with no market received -> messageReceived = ' + messageReceived)
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                return
                            }

                            let key = exchange + '-' + market

                            let webhookMessages = webhook.get(key)
                            if (webhookMessages === undefined) {
                                webhookMessages = []
                            }

                            console.log('[INFO] httpInterface -> Webhook -> Fetch-Messages -> Exchange-Market = ' + exchange + '-' + market)
                            console.log('[INFO] httpInterface -> Webhook -> Fetch-Messages -> Messages Fetched by Webhooks Sensor Bot = ' + webhookMessages.length)

                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(webhookMessages), httpResponse)
                            webhookMessages = []

                            webhook.set(key, webhookMessages)
                            break
                        }
                        case 'New-Message': {
                            SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                            function processRequest(messageReceived) {
                                if (messageReceived === undefined) {
                                    return
                                }

                                let timestamp = (new Date()).valueOf()
                                let source = requestPath[3]
                                let exchange = requestPath[4]
                                let market = requestPath[5]

                                /* Some validations */
                                if (source === undefined) {
                                    console.log('[WARN] httpInterface -> Webhook -> New-Message -> Message with no Source received -> messageReceived = ' + messageReceived)
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    return
                                }
                                if (exchange === undefined) {
                                    console.log('[WARN] httpInterface -> Webhook -> New-Message -> Message with no Exchange received -> messageReceived = ' + messageReceived)
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    return
                                }
                                if (market === undefined) {
                                    console.log('[WARN] httpInterface -> Webhook -> New-Message -> Message with no market received -> messageReceived = ' + messageReceived)
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
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
                                console.log('[INFO] httpInterface -> Webhook -> New-Message -> Messages waiting to be Fetched by Webhooks Sensor Bot = ' + webhookMessages.length)
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                            }

                            break
                        }
                    }
                }
                    break
                case 'Secrets': {
                    switch (requestPath[2]) { // switch by command
                        case 'Save-Singing-Accounts-Secrets-File': {
                            SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                            async function processRequest(body) {
                                try {

                                    let filePath = global.env.PATH_TO_SECRETS + '/'
                                    let fileName = "SigningAccountsSecrets.json"

                                    SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
                                    SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, body)

                                    console.log('[SUCCESS] ' + filePath + '/' + fileName + '  created.')

                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)

                                } catch (err) {
                                    console.log('[ERROR] httpInterface -> Secrets -> Save-Singing-Accounts-Secrets-File -> Method call produced an error.')
                                    console.log('[ERROR] httpInterface -> Secrets -> Save-Singing-Accounts-Secrets-File -> err.stack = ' + err.stack)
                                    console.log('[ERROR] httpInterface -> Secrets -> Save-Singing-Accounts-Secrets-File -> Params Received = ' + body)

                                    let error = {
                                        result: 'Fail Because',
                                        message: err.message,
                                        stack: err.stack
                                    }
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                                }
                            }
                            break
                        }
                    }
                }
                    break
                case 'Docs': {
                    switch (requestPath[2]) { // switch by command
                        case 'Save-Node-Schema': {
                            SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                            async function processRequest(body) {
                                try {
                                    if (body === undefined) {
                                        return
                                    }

                                    let docsSchema = JSON.parse(body)
                                    let project = requestPath[3]
                                    let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Nodes'

                                    if (checkAllSchmemaDocuments('Node', docsSchema, filePath) === true) {
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                    } else {
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
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
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                                }
                            }

                            break
                        }

                        case 'Save-Concept-Schema': {
                            SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                            async function processRequest(body) {
                                try {
                                    if (body === undefined) {
                                        return
                                    }

                                    let docsSchema = JSON.parse(body)
                                    let project = requestPath[3]
                                    let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Concepts'

                                    if (checkAllSchmemaDocuments('Concept', docsSchema, filePath) === true) {
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                    } else {
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
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
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                                }
                            }

                            break
                        }

                        case 'Save-Topic-Schema': {
                            SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                            async function processRequest(body) {
                                try {
                                    if (body === undefined) {
                                        return
                                    }

                                    let docsSchema = JSON.parse(body)
                                    let project = requestPath[3]
                                    let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Topics'

                                    if (checkAllSchmemaDocuments('Topic', docsSchema, filePath) === true) {
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                    } else {
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
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
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                                }
                            }

                            break
                        }

                        case 'Save-Tutorial-Schema': {
                            SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                            async function processRequest(body) {
                                try {
                                    if (body === undefined) {
                                        return
                                    }

                                    let docsSchema = JSON.parse(body)
                                    let project = requestPath[3]
                                    let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Tutorials'

                                    if (checkAllSchmemaDocuments('Tutorial', docsSchema, filePath) === true) {
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                    } else {
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
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
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                                }
                            }

                            break
                        }

                        case 'Save-Review-Schema': {
                            SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                            async function processRequest(body) {
                                try {
                                    if (body === undefined) {
                                        return
                                    }

                                    let docsSchema = JSON.parse(body)
                                    let project = requestPath[3]
                                    let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Reviews'

                                    if (checkAllSchmemaDocuments('Review', docsSchema, filePath) === true) {
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                    } else {
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
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
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                                }
                            }

                            break
                        }

                        case 'Save-Book-Schema': {
                            SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                            async function processRequest(body) {
                                try {
                                    if (body === undefined) {
                                        return
                                    }

                                    let docsSchema = JSON.parse(body)
                                    let project = requestPath[3]
                                    let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Books'

                                    if (checkAllSchmemaDocuments('Book', docsSchema, filePath) === true) {
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                    } else {
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
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
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                                }
                            }

                            break
                        }
                    }

                    function checkAllSchmemaDocuments(category, docsSchema, filePath) {
                        const fs = SA.nodeModules.fs
                        let noErrorsDuringSaving = true

                        for (let i = 0; i < docsSchema.length; i++) {
                            let schemaDocument = docsSchema[i]
                            /*
                            For some type of schemas we will save the file at an extra
                            folder derived from the document's type.
                            */
                            let fileName = schemaDocument.type.toLowerCase()
                            for (let j = 0; j < 10; j++) {
                                fileName = cleanFileName(fileName)
                            }
                            let pageNumber = '00' + schemaDocument.pageNumber
                            let newFilepath = filePath
                            switch (category) {
                                case 'Topic': {
                                    fileName = schemaDocument.topic.toLowerCase() + '-' + pageNumber.substring(pageNumber.length - 3, pageNumber.length) + '-' + schemaDocument.type.toLowerCase()
                                    fileName = cleanFileName(fileName)
                                    newFilepath = createPrefixDirectories(filePath, schemaDocument.topic)
                                    break
                                }
                                case 'Tutorial': {
                                    fileName = schemaDocument.tutorial.toLowerCase() + '-' + pageNumber.substring(pageNumber.length - 3, pageNumber.length) + '-' + schemaDocument.type.toLowerCase()
                                    fileName = cleanFileName(fileName)
                                    newFilepath = createPrefixDirectories(filePath, schemaDocument.tutorial)
                                    break
                                }
                                case 'Review': {
                                    fileName = schemaDocument.review.toLowerCase() + '-' + pageNumber.substring(pageNumber.length - 3, pageNumber.length) + '-' + schemaDocument.type.toLowerCase()
                                    fileName = cleanFileName(fileName)
                                    newFilepath = createPrefixDirectories(filePath, schemaDocument.review)
                                    break
                                }
                                case 'Node': {
                                    newFilepath = createPrefixDirectories(filePath, schemaDocument.type)
                                    break
                                }
                                case 'Concept': {
                                    newFilepath = createPrefixDirectories(filePath, schemaDocument.type)
                                    break
                                }
                            }

                            function createPrefixDirectories(filePath, schemaTextToUse) {
                                let firstLetter = schemaTextToUse.substring(0, 1)
                                SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath + '/' + firstLetter)
                                let extraWord = schemaTextToUse.split(' ')[0]
                                SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath + '/' + firstLetter + '/' + extraWord)
                                return filePath + '/' + firstLetter + '/' + extraWord + '/' + cleanFileName(schemaTextToUse)
                            }

                            fileName = fileName + '.json'

                            if (schemaDocument.deleted === true) {
                                try {
                                    fs.unlinkSync(newFilepath + '/' + fileName)
                                    console.log('[SUCCESS] ' + newFilepath + '/' + fileName + ' deleted.')
                                } catch (err) {
                                    noErrorsDuringSaving = false
                                    console.log('[ERROR] httpInterface -> Docs -> Delete -> ' + newFilepath + '/' + fileName + ' could not be deleted.')
                                    console.log('[ERROR] httpInterface -> Docs -> Delete -> Resolve the issue that is preventing the Client to delete this file. Look at the error message below as a guide. At the UI you will need to delete this page again in order for the Client to retry next time you execute the docs.save command.')
                                    console.log('[ERROR] httpInterface -> Docs -> Delete -> err.stack = ' + err.stack)
                                }
                            } else {
                                if (schemaDocument.updated === true || schemaDocument.created === true) {
                                    try {
                                        let created = schemaDocument.created
                                        let updated = schemaDocument.updated
                                        schemaDocument.updated = undefined
                                        schemaDocument.created = undefined
                                        let fileContent = JSON.stringify(schemaDocument, undefined, 4)
                                        SA.projects.foundations.utilities.filesAndDirectories.createNewDir(newFilepath)
                                        fs.writeFileSync(newFilepath + '/' + fileName, fileContent)
                                        if (created === true) {
                                            console.log('[SUCCESS] ' + newFilepath + '/' + fileName + '  created.')
                                        } else {
                                            if (updated === true) {
                                                console.log('[SUCCESS] ' + newFilepath + '/' + fileName + '  updated.')
                                            }
                                        }
                                    } catch (err) {
                                        noErrorsDuringSaving = false
                                        console.log('[ERROR] httpInterface -> Docs -> Save -> ' + newFilepath + '/' + fileName + ' could not be created / updated.')
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
                    const GITHUB_API_WAITING_TIME = 3000
                    // If running the electron app do not try to get git tool. I don't allow it.
                    if (process.env.SA_MODE === 'gitDisable') {
                        console.log('[WARN] No contributions on binary distributions. Do manual installation')
                        break
                    }
                    switch (requestPath[2]) { // switch by command

                        case 'GetCreds': {
                            // We load saved Github credentials
                            try {
                                let error

                                getCreds().catch(errorResp)

                                // This error responce needs to be made compatible with the contributions space or depricated
                                function errorResp(e) {
                                    error = e
                                    console.error(error)
                                    let docs = {
                                        project: 'Foundations',
                                        category: 'Topic',
                                        type: 'Switching Branches - Current Branch Not Changed',
                                        anchor: undefined,
                                        placeholder: {}
                                    }

                                    respondWithDocsObject(docs, error)
                                }

                                async function getCreds() {
                                    let secretsDiv = global.env.PATH_TO_SECRETS
                                    if (SA.nodeModules.fs.existsSync(secretsDiv)) {
                                        let rawFile = SA.nodeModules.fs.readFileSync(secretsDiv + '/githubCredentials.json') 
                                        githubCredentials = JSON.parse(rawFile)

                                        // Now we send the credentials to the UI
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(githubCredentials), httpResponse)
                                    }
                                }

                            } catch (err) {
                                console.log('[ERROR] httpInterface -> App -> Status -> Method call produced an error.')
                                console.log('[ERROR] httpInterface -> App -> Status -> err.stack = ' + err.stack)

                                let error = {
                                    result: 'Fail Because',
                                    message: err.message,
                                    stack: err.stack
                                }
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                            }
                            break
                        }

                        case 'SaveCreds': {
                            // We save Github credentials sent from the UI
                            try {
                                requestPath.splice(0,3)
                                const username = requestPath.splice(0, 1).toString()
                                const token = requestPath.toString()

                                let creds = {
                                    "githubUsername": username,
                                    "githubToken": token
                                }
                                
                                console.log(creds)
                                let error

                                saveCreds().catch(errorResp)

                                // This error responce needs to be made compatible with the contributions space or depricated
                                function errorResp(e) {
                                    error = e
                                    console.error(error)
                                    let docs = {
                                        project: 'Foundations',
                                        category: 'Topic',
                                        type: 'Switching Branches - Current Branch Not Changed',
                                        anchor: undefined,
                                        placeholder: {}
                                    }

                                    respondWithDocsObject(docs, error)
                                }

                                async function saveCreds() {
                                    let secretsDir = global.env.PATH_TO_SECRETS
                                    
                                    // Make sure My-Secrets has been created. If not create it now
                                    if (!SA.nodeModules.fs.existsSync(secretsDir)) {
                                        SA.nodeModules.fs.mkdirSync(secretsDir)
                                    }

                                    // Now write creds to file
                                    if (SA.nodeModules.fs.existsSync(secretsDir)) {
                                        
                                       SA.nodeModules.fs.writeFileSync(secretsDir + '/githubCredentials.json', JSON.stringify(creds)) 
                                    }
                                }

                            } catch (err) {
                                console.log('[ERROR] httpInterface -> App -> SaveCreds -> Method call produced an error.')
                                console.log('[ERROR] httpInterface -> App -> SaveCreds -> err.stack = ' + err.stack)

                                let error = {
                                    result: 'Fail Because',
                                    message: err.message,
                                    stack: err.stack
                                }
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                                break
                            }

                            // If everything goes well respond back with success
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                            break
                        }                        

                        case 'Contribute': {
                            try {
                                // We create a pull request of all active changes
                                let commitMessage = unescape(requestPath[3])
                                const username = unescape(requestPath[4])
                                const token = unescape(requestPath[5])
                                const currentBranch = unescape(requestPath[6])
                                const contributionsBranch = unescape(requestPath[7])
                                let error

                                // rebuild array of commit messages if committing from contribturions space
                                if (commitMessage.charAt(0) === '[' && commitMessage.charAt(commitMessage.length -1) === ']'){
                                    commitMessage = JSON.parse(commitMessage)
                                } else { // else handle string from command line
                                    /* Unsaving # */
                                    for (let i = 0; i < 10; i++) {
                                        commitMessage = commitMessage.replace('_SLASH_', '/')
                                        commitMessage = commitMessage.replace('_HASHTAG_', '#')
                                    }
                                }

                                contribute()

                                async function contribute() {
                                    const { lookpath } = SA.nodeModules.lookpath
                                    const gitpath = await lookpath('git')
                                    if (gitpath === undefined) {
                                        console.log('[ERROR] `git` not installed.')
                                    } else {
                                        await doGit().catch(e => {
                                            error = e
                                        })
                                        if (error !== undefined) {

                                            let docs = {
                                                project: 'Foundations',
                                                category: 'Topic',
                                                type: 'App Error - Contribution Not Sent',
                                                anchor: undefined,
                                                placeholder: {}
                                            }

                                            respondWithDocsObject(docs, error)
                                            return
                                        }

                                        await doGithub().catch(e => {
                                            error = e
                                        })
                                        if (error !== undefined) {

                                            let docs = {
                                                project: 'Foundations',
                                                category: 'Topic',
                                                type: 'App Error - Contribution Not Sent',
                                                anchor: undefined,
                                                placeholder: {}
                                            }
                                            console.log('respond with docs ')

                                            respondWithDocsObject(docs, error)
                                            return
                                        }
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                    }
                                }

                                function getCommitMessage(repoName, messageArray) {
                                    let messageToSend = ''
                                    for (let message of messageArray) {
                                        if (message[0] === repoName) {
                                            messageToSend = message[1]
                                        }
                                    }
                                    return messageToSend    
                                }

                                async function doGit() {
                                    const simpleGit = SA.nodeModules.simpleGit
                                    let options = {
                                        baseDir: process.cwd(),
                                        binary: 'git',
                                        maxConcurrentProcesses: 6,
                                    }
                                    let repoURL = 'https://github.com/Superalgos/Superalgos'
                                    let repoName = 'Superalgos'
                                    console.log('[INFO] Starting process of uploading changes (if any) to ' + repoURL)
                                    let git = simpleGit(options)

                                    await pushFiles(git) // Main Repo

                                    for (const propertyName in global.env.PROJECT_PLUGIN_MAP) {
                                        /*
                                        Upload the Plugins
                                        */
                                        options = {
                                            baseDir: SA.nodeModules.path.join(process.cwd(), 'Plugins', global.env.PROJECT_PLUGIN_MAP[propertyName].dir),
                                            binary: 'git',
                                            maxConcurrentProcesses: 6,
                                        }
                                        git = simpleGit(options)
                                        repoURL = 'https://github.com/Superalgos/' + global.env.PROJECT_PLUGIN_MAP[propertyName].repo
                                        repoName = global.env.PROJECT_PLUGIN_MAP[propertyName].repo.replace('-Plugins', '')
                                        console.log('[INFO] Starting process of uploading changes (if any) to ' + repoURL)
                                        await pushFiles(git)
                                    }

                                    async function pushFiles(git) {
                                        try {
                                            await git.pull('origin', currentBranch)
                                            await git.add('./*')

                                            // If contributing from contributrions space gather the correct commit message
                                            let messageToSend
                                            if (commitMessage instanceof Array) {
                                                    messageToSend = getCommitMessage(repoName, commitMessage)

                                            } else { // Else just send the commit message string from command line
                                                messageToSend = commitMessage

                                            }
                                            await git.commit(messageToSend)

                                            await git.push('origin', currentBranch)
                                        } catch (err) {
                                            console.log('[ERROR] httpInterface -> App -> Contribute -> doGit -> Method call produced an error.')
                                            console.log('[ERROR] httpInterface -> App -> Contribute -> doGit -> err.stack = ' + err.stack)
                                            console.log('[ERROR] httpInterface -> App -> Contribute -> doGit -> commitMessage = ' + messageToSend)
                                            console.log('[ERROR] httpInterface -> App -> Contribute -> doGit -> currentBranch = ' + currentBranch)
                                            console.log('[ERROR] httpInterface -> App -> Contribute -> doGit -> contributionsBranch = ' + contributionsBranch)
                                            console.log('')
                                            console.log('Troubleshooting Tips:')
                                            console.log('')
                                            console.log('1. Make sure that you have set up your Github Username and Token at the APIs -> Github API node at the workspace.')
                                            console.log('2. Make sure you are running the latest version of Git available for your OS.')
                                            console.log('3. Make sure that you have cloned your Superalgos repository fork, and not the main Superalgos repository.')
                                            console.log('4. If your fork is old, you might need to do an app.update and also a node setup at every branch. If you just reforked all is good.')

                                            error = err
                                        }
                                    }
                                }

                                async function doGithub() {

                                    const { Octokit } = SA.nodeModules.octokit

                                    const octokit = new Octokit({
                                        auth: token,
                                        userAgent: 'Superalgos ' + SA.version
                                    })

                                    let repo = 'Superalgos'
                                    let repoName = 'Superalgos'
                                    const owner = 'Superalgos'
                                    const head = username + ':' + contributionsBranch
                                    const base = currentBranch

                                    // If contributing from contributrions space gather the correct commit message
                                    let messageToSend
                                    if (commitMessage instanceof Array) {
                                        messageToSend = getCommitMessage(repoName, commitMessage)

                                    } else { // Else just send the commit message string from command line
                                        messageToSend = commitMessage

                                    }
                                    let title = 'Contribution: ' + messageToSend

                                    await createPullRequest(repo)

                                    for (const propertyName in global.env.PROJECT_PLUGIN_MAP) {
                                        /*
                                        Upload the Plugins
                                        */
                                        
                                        if (commitMessage instanceof Map) {
                                            repoName = global.env.PROJECT_PLUGIN_MAP[propertyName].repo.replace('-Plugins', '')
                                            messageToSend = getCommitMessage(repoName, commitMessage)
                                        } else { // Else just send the commit message string from command line
                                            messageToSend = commitMessage
                                        }
                                        title = 'Contribution: ' + messageToSend

                                        repo = global.env.PROJECT_PLUGIN_MAP[propertyName].repo
                                        await createPullRequest(repo)
                                    }

                                    async function createPullRequest(repo) {
                                        try {
                                            console.log(' ')
                                            console.log('[INFO] Checking if we need to create Pull Request at repository ' + repo)
                                            await SA.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                            await octokit.pulls.create({
                                                owner,
                                                repo,
                                                title,
                                                head,
                                                base,
                                            });
                                            console.log('[INFO] A pull request has been succesfully created. ')
                                        } catch (err) {
                                            if (
                                                err.stack.indexOf('A pull request already exists') >= 0 ||
                                                err.stack.indexOf('No commits between') >= 0
                                            ) {
                                                if (err.stack.indexOf('A pull request already exists') >= 0) {
                                                    console.log('[WARN] A pull request already exists. If any, commits would added to the existing Pull Request. ')
                                                }
                                                if (err.stack.indexOf('No commits between') >= 0) {
                                                    console.log('[WARN] No commits detected. Pull request not created. ')
                                                }
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
                                }

                            } catch (err) {
                                console.log('[ERROR] httpInterface -> App -> Contribute -> Method call produced an error.')
                                console.log('[ERROR] httpInterface -> App -> Contribute -> err.stack = ' + err.stack)
                                console.log('[ERROR] httpInterface -> App -> Contribute -> commitMessage = ' + commitMessage)
                                console.log('[ERROR] httpInterface -> App -> Contribute -> username = ' + username)
                                console.log('[ERROR] httpInterface -> App -> Contribute -> token starts with = ' + token.substring(0, 10) + '...')
                                console.log('[ERROR] httpInterface -> App -> Contribute -> token ends with = ' + '...' + token.substring(token.length - 10))
                                console.log('[ERROR] httpInterface -> App -> Contribute -> currentBranch = ' + currentBranch)
                                console.log('[ERROR] httpInterface -> App -> Contribute -> contributionsBranch = ' + contributionsBranch)

                                let error = {
                                    result: 'Fail Because',
                                    message: err.message,
                                    stack: err.stack
                                }
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                            }
                            break
                        }

                        case 'ContributeSingleRepo': {
                            try {
                                // We create a pull request for the active changes of a particular repo
                                let commitMessage = unescape(requestPath[3])
                                const username = unescape(requestPath[4])
                                const token = unescape(requestPath[5])
                                const currentBranch = unescape(requestPath[6])
                                const contributionsBranch = unescape(requestPath[7])
                                const repoName = unescape(requestPath[8])
                                let error

                                /* Unsaving # */
                                for (let i = 0; i < 10; i++) {
                                    commitMessage = commitMessage.replace('_SLASH_', '/')
                                    commitMessage = commitMessage.replace('_HASHTAG_', '#')
                                }

                                contributeSingleRepo()

                                async function contributeSingleRepo() {
                                    const { lookpath } = SA.nodeModules.lookpath
                                    const gitpath = await lookpath('git')
                                    if (gitpath === undefined) {
                                        console.log('[ERROR] `git` not installed.')
                                    } else {
                                       await doGit().catch(e => {
                                            error = e
                                        })
                                        if (error !== undefined) {

                                            let docs = {
                                                project: 'Foundations',
                                                category: 'Topic',
                                                type: 'App Error - Contribution Not Sent',
                                                anchor: undefined,
                                                placeholder: {}
                                            }

                                            respondWithDocsObject(docs, error)
                                            return
                                        }

                                       await doGithub().catch(e => {
                                            error = e
                                        })
                                        if (error !== undefined) {

                                            let docs = {
                                                project: 'Foundations',
                                                category: 'Topic',
                                                type: 'App Error - Contribution Not Sent',
                                                anchor: undefined,
                                                placeholder: {}
                                            }
                                            console.log('respond with docs ')

                                            respondWithDocsObject(docs, error)
                                            return
                                        }
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                    }
                                }

                                async function doGit() {
                                    const simpleGit = SA.nodeModules.simpleGit
                                    let options = {
                                        baseDir: process.cwd(),
                                        binary: 'git',
                                        maxConcurrentProcesses: 6,
                                    }

                                    // Check if we are commiting to main repo 
                                    if (repoName === 'Superalgos') {
                                    let repoURL = 'https://github.com/Superalgos/Superalgos'
                                    console.log('[INFO] Starting process of uploading changes (if any) to ' + repoURL)
                                    let git = simpleGit(options)

                                    await pushFiles(git) // Main Repo
                                    } else {
                                        // Assume we are commiting to a plugins repo 
                                        options = {
                                            baseDir: SA.nodeModules.path.join(process.cwd(), 'Plugins', global.env.PROJECT_PLUGIN_MAP[repoName].dir),
                                            binary: 'git',
                                            maxConcurrentProcesses: 6,
                                        }
                                        git = simpleGit(options)
                                        repoURL = 'https://github.com/Superalgos/' + global.env.PROJECT_PLUGIN_MAP[repoName].repo
                                        console.log('[INFO] Starting process of uploading changes (if any) to ' + repoURL)
                                        await pushFiles(git)
                                    }

                                    async function pushFiles(git) {
                                        try {
                                            await git.pull('origin', currentBranch)
                                            await git.add('./*')
                                            await git.commit(commitMessage)
                                            await git.push('origin', currentBranch)
                                        } catch (err) {
                                            console.log('[ERROR] httpInterface -> App -> Contribute -> doGit -> Method call produced an error.')
                                            console.log('[ERROR] httpInterface -> App -> Contribute -> doGit -> err.stack = ' + err.stack)
                                            console.log('[ERROR] httpInterface -> App -> Contribute -> doGit -> commitMessage = ' + commitMessage)
                                            console.log('[ERROR] httpInterface -> App -> Contribute -> doGit -> currentBranch = ' + currentBranch)
                                            console.log('[ERROR] httpInterface -> App -> Contribute -> doGit -> contributionsBranch = ' + contributionsBranch)
                                            console.log('')
                                            console.log('Troubleshooting Tips:')
                                            console.log('')
                                            console.log('1. Make sure that you have set up your Github Username and Token at the APIs -> Github API node at the workspace.')
                                            console.log('2. Make sure you are running the latest version of Git available for your OS.')
                                            console.log('3. Make sure that you have cloned your Superalgos repository fork, and not the main Superalgos repository.')
                                            console.log('4. If your fork is old, you might need to do an app.update and also a node setup at every branch. If you just reforked all is good.')

                                            error = err
                                        }
                                    }
                                }

                                async function doGithub() {

                                    const { Octokit } = SA.nodeModules.octokit

                                    const octokit = new Octokit({
                                        auth: token,
                                        userAgent: 'Superalgos ' + SA.version
                                    })

                                    const owner = 'Superalgos'
                                    const head = username + ':' + contributionsBranch
                                    const base = currentBranch
                                    const title = 'Contribution: ' + commitMessage

                                    if (repoName === 'Superalgos') {
                                        await createPullRequest(repoName)
                                    } else {
                                        await createPullRequest(global.env.PROJECT_PLUGIN_MAP[repoName].repo)
                                    }

                                    async function createPullRequest(repo) {
                                        try {
                                            console.log(' ')
                                            console.log('[INFO] Checking if we need to create Pull Request at repository ' + repo)
                                            await SA.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                            await octokit.pulls.create({
                                                owner,
                                                repo,
                                                title,
                                                head,
                                                base,
                                            });
                                            console.log('[INFO] A pull request has been succesfully created. ')
                                        } catch (err) {
                                            if (
                                                err.stack.indexOf('A pull request already exists') >= 0 ||
                                                err.stack.indexOf('No commits between') >= 0
                                            ) {
                                                if (err.stack.indexOf('A pull request already exists') >= 0) {
                                                    console.log('[WARN] A pull request already exists. If any, commits would added to the existing Pull Request. ')
                                                }
                                                if (err.stack.indexOf('No commits between') >= 0) {
                                                    console.log('[WARN] No commits detected. Pull request not created. ')
                                                }
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
                                }

                            } catch (err) {
                                console.log('[ERROR] httpInterface -> App -> Contribute -> Method call produced an error.')
                                console.log('[ERROR] httpInterface -> App -> Contribute -> err.stack = ' + err.stack)
                                console.log('[ERROR] httpInterface -> App -> Contribute -> commitMessage = ' + commitMessage)
                                console.log('[ERROR] httpInterface -> App -> Contribute -> username = ' + username)
                                console.log('[ERROR] httpInterface -> App -> Contribute -> token starts with = ' + token.substring(0, 10) + '...')
                                console.log('[ERROR] httpInterface -> App -> Contribute -> token ends with = ' + '...' + token.substring(token.length - 10))
                                console.log('[ERROR] httpInterface -> App -> Contribute -> currentBranch = ' + currentBranch)
                                console.log('[ERROR] httpInterface -> App -> Contribute -> contributionsBranch = ' + contributionsBranch)

                                let error = {
                                    result: 'Fail Because',
                                    message: err.message,
                                    stack: err.stack
                                }
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                            }
                            break
                        }

                        case 'Update': {
                            try {
                                // We update the local repo from remote
                                const currentBranch = unescape(requestPath[3])
                                update()

                                async function update() {
                                    const { lookpath } = SA.nodeModules.lookpath
                                    const gitpath = await lookpath('git');
                                    if (gitpath === undefined) {
                                        console.log('[ERROR] `git` not installed.')
                                    } else {
                                        let result = await doGit()

                                        if (result.error === undefined) {
                                            let customResponse = {
                                                result: global.CUSTOM_OK_RESPONSE.result,
                                                message: result.message
                                            }
                                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(customResponse), httpResponse)
                                        } else {

                                            let docs = {
                                                project: 'Foundations',
                                                category: 'Topic',
                                                type: 'App Error - Update Failed',
                                                anchor: undefined,
                                                placeholder: {}
                                            }

                                            respondWithDocsObject(docs, result.error)

                                        }
                                    }
                                }

                                async function doGit() {
                                    const simpleGit = SA.nodeModules.simpleGit
                                    try {
                                        /*
                                        Update the Main Superalgos Repository.
                                        */
                                        let reposUpdated = false
                                        let options = {
                                            baseDir: process.cwd(),
                                            binary: 'git',
                                            maxConcurrentProcesses: 6,
                                        }
                                        let git = simpleGit(options)
                                        let repoURL = 'https://github.com/Superalgos/Superalgos'
                                        console.log('[INFO] Downloading from ' + repoURL)
                                        let message = await git.pull(repoURL, currentBranch)

                                        if (message.error === undefined) {
                                            addToReposUpdated(message, 'Superalgos')

                                            for (const propertyName in global.env.PROJECT_PLUGIN_MAP) {
                                                /*
                                                Update the Plugins
                                                */
                                                options = {
                                                    baseDir: SA.nodeModules.path.join(process.cwd(), 'Plugins', global.env.PROJECT_PLUGIN_MAP[propertyName].dir),
                                                    binary: 'git',
                                                    maxConcurrentProcesses: 6,
                                                }
                                                git = simpleGit(options)
                                                repoURL = 'https://github.com/Superalgos/' + global.env.PROJECT_PLUGIN_MAP[propertyName].repo
                                                console.log('[INFO] Downloading from ' + repoURL)
                                                message = await git.pull(repoURL, currentBranch)
                                                if (message.error === undefined) {
                                                    addToReposUpdated(message, global.env.PROJECT_PLUGIN_MAP[propertyName].repo)
                                                }
                                            }
                                        }

                                        message = {
                                            reposUpdated: reposUpdated
                                        }
                                        return { message: message }

                                        function addToReposUpdated(message, repo) {
                                            if (message.summary.changes + message.summary.deletions + message.summary.insertions > 0) {
                                                reposUpdated = true
                                                console.log('[INFO] Your local repository ' + repo + ' was successfully updated. ')
                                            } else {
                                                console.log('[INFO] Your local repository ' + repo + ' was already up-to-date. ')
                                            }
                                        }

                                    } catch (err) {
                                        console.log('[ERROR] Error updating ' + currentBranch)
                                        console.log(err.stack)
                                        return { error: err }
                                    }
                                }

                            } catch (err) {
                                console.log('[ERROR] httpInterface -> App -> Update -> Method call produced an error.')
                                console.log('[ERROR] httpInterface -> App -> Update -> err.stack = ' + err.stack)

                                let error = {
                                    result: 'Fail Because',
                                    message: err.message,
                                    stack: err.stack
                                }
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                            }
                            break
                        }

                        case 'Status': {
                            // We check the current status of changes made in the local repo
                            try {
                                let error

                                status().catch(errorResp)

                                // This error responce needs to be made compatible with the contributions space or depricated
                                function errorResp(e) {
                                    error = e
                                    console.error(error)
                                    let docs = {
                                        project: 'Foundations',
                                        category: 'Topic',
                                        type: 'Switching Branches - Current Branch Not Changed',
                                        anchor: undefined,
                                        placeholder: {}
                                    }

                                    respondWithDocsObject(docs, error)
                                }


                                async function status() {
                                    const { lookpath } = SA.nodeModules.lookpath
                                    const gitpath = await lookpath('git');
                                    if (gitpath === undefined) {
                                        console.log('[ERROR] `git` not installed.')
                                    } else {
                                        let repoStatus = []
                                        let status

                                        // status is an array that holds the repo name and diff summary in an array
                                        status = await doGit().catch(errorResp)
                                        repoStatus.push(status)

                                        // here status is returned as an array of arrays with repo name and diff summary
                                        status = await Promise.all(Object.values(global.env.PROJECT_PLUGIN_MAP).map(v => {
                                            return doGit(v.dir, v.repo)
                                        })).catch(errorResp)
                                        repoStatus = repoStatus.concat(status)

                                        // Now we send all the summaries to the UI
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(repoStatus), httpResponse)
                                    }
                                }

                                async function doGit(dir, repo = 'Superalgos') {
                                    const simpleGit = SA.nodeModules.simpleGit
                                    const options = {
                                        binary: 'git',
                                        maxConcurrentProcesses: 6,
                                    }
                                    // main app repo should be the working directory
                                    if (repo === 'Superalgos') options.baseDir = dir || process.cwd()
                                    // if repo is not main app repo, assume it is a plugin, in ./Plugins.
                                    else options.baseDir = SA.nodeModules.path.join(process.cwd(), 'Plugins', dir)
                                    const git = simpleGit(options)
                                    let diffObj
                                    try {
                                        // Clear the index to make sure we pick up all active changes
                                        await git.reset('mixed')
                                        // get the summary of current changes in the current repo
                                        diffObj = await git.diffSummary(responce).catch(errorResp)

                                        function responce(err, diffSummary) {
                                            if (err !== null) {
                                                console.log('[ERROR] Error while gathering diff summary for ' + repo)
                                                console.log(err.stack)
                                                error = err
                                            } else {
                                                return diffSummary
                                            }
                                        }

                                    } catch (err) {
                                        console.log('[ERROR] Error while gathering diff summary for ' + repo)
                                        console.log(err.stack)
                                        error = err
                                    }
                                    return [repo, diffObj];
                                }

                            } catch (err) {
                                console.log('[ERROR] httpInterface -> App -> Status -> Method call produced an error.')
                                console.log('[ERROR] httpInterface -> App -> Status -> err.stack = ' + err.stack)

                                let error = {
                                    result: 'Fail Because',
                                    message: err.message,
                                    stack: err.stack
                                }
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                            }
                            break
                        }

                        case 'Checkout': {
                            try {
                                // We check out the specified git branch
                                const currentBranch = unescape(requestPath[3])
                                let error

                                checkout().catch(errorResp)

                                function errorResp(e) {
                                    error = e
                                    console.error(error)
                                    let docs = {
                                        project: 'Foundations',
                                        category: 'Topic',
                                        type: 'Switching Branches - Current Branch Not Changed',
                                        anchor: undefined,
                                        placeholder: {}
                                    }

                                    respondWithDocsObject(docs, error)
                                }


                                async function checkout() {
                                    const { lookpath } = SA.nodeModules.lookpath
                                    const gitpath = await lookpath('git');
                                    if (gitpath === undefined) {
                                        console.log('[ERROR] `git` not installed.')
                                    } else {
                                        // Checkout branch from main repo
                                        await doGit().catch(errorResp)
                                        // Checkout branch from each plugin repo
                                        await Promise.all(Object.values(global.env.PROJECT_PLUGIN_MAP).map(v => {
                                            return doGit(v.dir, v.repo)
                                        })).catch(errorResp)

                                        if (error === undefined) {
                                            // Run node setup to prepare instance for branch change
                                            await runNodeSetup()
                                            // Return to UI that Branch is successfully changed
                                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                        } else {
                                            errorResp(error)
                                        }
                                    }
                                }

                                async function doGit(dir, repo = 'Superalgos') {
                                    const simpleGit = SA.nodeModules.simpleGit
                                    const options = {
                                        binary: 'git',
                                        maxConcurrentProcesses: 6,
                                    }
                                    // main app repo should be the working directory
                                    if (repo === 'Superalgos') options.baseDir = dir || process.cwd()
                                    // if repo is not main app repo, assume it is a plugin, in ./Plugins.
                                    else options.baseDir = SA.nodeModules.path.join(process.cwd(), 'Plugins', dir)
                                    const git = simpleGit(options)
                                    try {
                                        await git.checkout(currentBranch).catch(errorResp)

                                        // Pull branch from main repo
                                        await git.pull('upstream', currentBranch).catch(errorResp);
                                        // Reset branch to match main repo
                                        let upstreamLocation = `upstream/${currentBranch}`
                                        await git.reset('hard', [upstreamLocation]).catch(errorResp)

                                    } catch (err) {
                                        console.log('[ERROR] Error changing current branch to ' + currentBranch)
                                        console.log(err.stack)
                                        error = err
                                    }
                                }

                                async function runNodeSetup() {
                                    console.log("Running Node setup to adjust for new Branch")
                                    const process = SA.nodeModules.process
                                    const childProcess = SA.nodeModules.childProcess

                                    let dir = process.cwd()
                                    let command = "node setup noShortcuts";
                                    let stdout = childProcess.execSync(command,
                                        {
                                            cwd: dir
                                        }).toString();

                                    console.log("Node Setup has completed with the following result:", stdout)
                                }

                            } catch (err) {
                                console.log('[ERROR] httpInterface -> App -> Update -> Method call produced an error.')
                                console.log('[ERROR] httpInterface -> App -> Update -> err.stack = ' + err.stack)

                                let error = {
                                    result: 'Fail Because',
                                    message: err.message,
                                    stack: err.stack
                                }
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                            }
                            break
                        }

                        case 'Branch': {
                            try {
                                // We get the current git branch
                                branch()

                                async function branch() {
                                    const { lookpath } = SA.nodeModules.lookpath
                                    const gitpath = await lookpath('git');
                                    if (gitpath === undefined) {
                                        console.log('[ERROR] `git` not installed.')
                                    } else {
                                        let result = await doGit()

                                        if (result.error === undefined) {
                                            let customResponse = {
                                                result: global.CUSTOM_OK_RESPONSE.result,
                                                message: result
                                            }
                                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(customResponse), httpResponse)
                                        } else {
                                            let docs = {
                                                project: 'Foundations',
                                                category: 'Topic',
                                                type: 'App Error - Could Not Get Current Branch',
                                                anchor: undefined,
                                                placeholder: {}
                                            }

                                            respondWithDocsObject(docs, error)
                                        }
                                    }
                                }

                                async function doGit() {
                                    const simpleGit = SA.nodeModules.simpleGit
                                    const options = {
                                        baseDir: process.cwd(),
                                        binary: 'git',
                                        maxConcurrentProcesses: 6,
                                    }
                                    const git = simpleGit(options)
                                    try {
                                        return await git.branch()
                                    } catch (err) {
                                        console.log('[ERROR] Error reading current branch.')
                                        console.log(err.stack)
                                    }
                                }

                            } catch (err) {
                                console.log('[ERROR] httpInterface -> App -> Update -> Method call produced an error.')
                                console.log('[ERROR] httpInterface -> App -> Update -> err.stack = ' + err.stack)

                                let error = {
                                    result: 'Fail Because',
                                    message: err.message,
                                    stack: err.stack
                                }
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                            }
                            break
                        }

                        case 'Discard': {
                            // We discard active changes for a specific file
                            try {
                                requestPath.splice(0,3)
                                const repo = requestPath.splice(0, 1).toString().replace('-Plugins','')
                                const filePath = requestPath.toString().replaceAll(",", "/")

                                let error

                                discard().catch(errorResp)

                                // This error responce needs to be made compatible with the contributions space or depricated
                                function errorResp(e) {
                                    error = e
                                    console.error(error)
                                    let docs = {
                                        project: 'Foundations',
                                        category: 'Topic',
                                        type: 'Switching Branches - Current Branch Not Changed',
                                        anchor: undefined,
                                        placeholder: {}
                                    }

                                    respondWithDocsObject(docs, error)
                                }


                                async function discard() {
                                    const { lookpath } = SA.nodeModules.lookpath
                                    const gitpath = await lookpath('git');
                                    if (gitpath === undefined) {
                                        console.log('[ERROR] `git` not installed.')
                                    } else {
                                        let status

                                        // status should return the global ok responce 
                                        status = await doGit(repo).catch(errorResp)

                                        // Now we send the responce back to the UI
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(status), httpResponse)
                                    }
                                }

                                async function doGit(repo = 'Superalgos') {
                                    const simpleGit = SA.nodeModules.simpleGit
                                    const options = {
                                        binary: 'git',
                                        maxConcurrentProcesses: 6,
                                    }
                                    // main app repo should be the working directory
                                    if (repo === 'Superalgos') options.baseDir = process.cwd()
                                    // if repo is not main app repo, assume it is a plugin, in ./Plugins.
                                    else options.baseDir = SA.nodeModules.path.join(process.cwd(), 'Plugins', repo)

                                    const git = simpleGit(options)
                                    let status
                                    try {

                                        // Discard change in file
                                        await git.checkout([filePath]).catch(errorResp)
                                        // Make sure changes have been discarded
                                       status = await git.diff([filePath]).catch(errorResp)

                                       if (status === '') {
                                           status = global.DEFAULT_OK_RESPONSE
                                       } else {
                                           console.log('[ERROR} There are still differences found for this file')
                                           console.log (status)
                                       }

                                    } catch (err) {
                                        console.log('[ERROR] Error while discarding changes to ' + filepath)
                                        console.log(err.stack)
                                        error = err
                                    }
                                    return status
                                }

                            } catch (err) {
                                console.log('[ERROR] httpInterface -> App -> Status -> Method call produced an error.')
                                console.log('[ERROR] httpInterface -> App -> Status -> err.stack = ' + err.stack)

                                let error = {
                                    result: 'Fail Because',
                                    message: err.message,
                                    stack: err.stack
                                }
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                            }
                            break
                        }

                        case 'Reset': {
                            try {
                                // We reset the local repo to the upstream repo
                                const currentBranch = unescape(requestPath[3])
                                let error

                                reset().catch(errorResp)

                                // This error responce needs to be made compatible with the contributions space or depricated
                                function errorResp(e) {
                                    error = e
                                    console.error(error)
                                    let docs = {
                                        project: 'Foundations',
                                        category: 'Topic',
                                        type: 'Switching Branches - Current Branch Not Changed',
                                        anchor: undefined,
                                        placeholder: {}
                                    }

                                    respondWithDocsObject(docs, error)
                                }


                                async function reset() {
                                    const { lookpath } = SA.nodeModules.lookpath
                                    const gitpath = await lookpath('git');
                                    if (gitpath === undefined) {
                                        console.log('[ERROR] `git` not installed.')
                                    } else {
                                        // Reset main repo
                                        await doGit().catch(errorResp)
                                        // Reset each plugin repo
                                        await Promise.all(Object.values(global.env.PROJECT_PLUGIN_MAP).map(v => {
                                            return doGit(v.dir, v.repo)
                                        })).catch(errorResp)

                                        if (error === undefined) {
                                            // Return to UI that reset was successful
                                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                        } else {
                                            errorResp(error)
                                        }
                                    }
                                }

                                async function doGit(dir, repo = 'Superalgos') {
                                    const simpleGit = SA.nodeModules.simpleGit
                                    const options = {
                                        binary: 'git',
                                        maxConcurrentProcesses: 6,
                                    }
                                    // main app repo should be the working directory
                                    if (repo === 'Superalgos') options.baseDir = dir || process.cwd()
                                    // if repo is not main app repo, assume it is a plugin, in ./Plugins.
                                    else options.baseDir = SA.nodeModules.path.join(process.cwd(), 'Plugins', dir)
                                    const git = simpleGit(options)
                                    try {

                                        // Check to see if upstream repo has been set
                                        let remotes = await git.getRemotes(true).catch(errorResp);
                                        let isUpstreamSet
                                        for (let remote in remotes) {
                                        if (remotes[remote].name === 'upstream') {
                                            isUpstreamSet = true
                                        } else {
                                            isUpstreamSet = false
                                            }
                                        }

                                        // If upstream has not been set. Set it now
                                        if (isUpstreamSet === false) {
                                            await git.addRemote('upstream', `https://github.com/Superalgos/${repo}`).catch(errorResp);
                                        }

                                        // Pull branch from upstream repo
                                        await git.pull('upstream', currentBranch).catch(errorResp);
                                        // Reset branch to match upstream repo
                                        let upstreamLocation = `upstream/${currentBranch}`
                                        await git.reset('hard', [upstreamLocation]).catch(errorResp)

                                    } catch (err) {
                                        console.log('[ERROR] Error changing current branch to ' + currentBranch)
                                        console.log(err.stack)
                                        error = err
                                    }
                                }

                            } catch (err) {
                                console.log('[ERROR] httpInterface -> App -> Update -> Method call produced an error.')
                                console.log('[ERROR] httpInterface -> App -> Update -> err.stack = ' + err.stack)

                                let error = {
                                    result: 'Fail Because',
                                    message: err.message,
                                    stack: err.stack
                                }
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                            }
                            break
                        }


                        case 'FixAppSchema': {
                            /*
                            We will use this process when we have moved APP SCHEMA files from one project to another, and we need to fix the
                            actions where this node was referenced, so that it points to the new project where the node has moved to.
                            */
                            let customResponse = {
                                result: global.CUSTOM_OK_RESPONSE.result,
                                message: ''
                            }
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(customResponse), httpResponse)

                            console.log('Fixing App Schemas...')

                            let projects = SA.projects.foundations.utilities.filesAndDirectories.getDirectories(global.env.PATH_TO_PROJECTS)
                            let PROJECTS_MAP = new Map()
                            let directoryCount = 0
                            let allAppSchemas = []
                            let allAppSchemasFilePaths = []
                            let allAppSchemasFileProjects = []

                            for (let i = 0; i < projects.length; i++) {
                                let project = projects[i]


                                const fs = SA.nodeModules.fs
                                let folder = 'App-Schema'
                                let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/'
                                SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories(filePath + folder, onFilesReady)

                                function onFilesReady(files) {
                                    try {
                                        let SCHEMA_MAP = new Map()

                                        console.log('files.length... ' + files.length)

                                        for (let k = 0; k < files.length; k++) {
                                            let name = files[k]
                                            let nameSplitted = name.split(folder)
                                            let fileName = nameSplitted[1]
                                            for (let i = 0; i < 10; i++) {
                                                fileName = fileName.replace('\\', '/')
                                            }
                                            let fileToRead = filePath + folder + fileName

                                            console.log('Reading file... ' + fileToRead)

                                            let fileContent = fs.readFileSync(fileToRead)
                                            let schemaDocument
                                            try {
                                                schemaDocument = JSON.parse(fileContent)
                                                SCHEMA_MAP.set(schemaDocument.type, schemaDocument)
                                                allAppSchemas.push(schemaDocument)
                                                allAppSchemasFilePaths.push(fileToRead)
                                                allAppSchemasFileProjects.push(project)
                                            } catch (err) {
                                                console.log('[WARN] sendSchema -> Error Parsing JSON File: ' + fileToRead + ' .Error = ' + err.stack)
                                                continue
                                            }
                                        }
                                        PROJECTS_MAP.set(project, SCHEMA_MAP)
                                        directoryCount++

                                        console.log('directoryCount = ' + directoryCount, 'projects.length = ' + projects.length)
                                        //console.log(Array.from(PROJECTS_MAP.get(project).keys()))
                                        if (directoryCount === projects.length) {
                                            fixSchemas()
                                        }
                                    } catch (err) {
                                        console.log(err.stack)
                                    }
                                }
                            }

                            function fixSchemas() {
                                try {
                                    console.log('fixSchemas...' + allAppSchemas.length)
                                    let projects = SA.projects.foundations.utilities.filesAndDirectories.getDirectories(global.env.PATH_TO_PROJECTS)
                                    //const fs = SA.nodeModules.fs
                                    let needFixing = 0
                                    for (let i = 0; i < allAppSchemas.length; i++) {
                                        let schemaDocument = allAppSchemas[i]
                                        let wasUpdated = false
                                        for (let j = 0; j < schemaDocument.menuItems.length; j++) {
                                            let menuItem = schemaDocument.menuItems[j]
                                            if (menuItem.relatedUiObject !== undefined && menuItem.relatedUiObjectProject === undefined) {
                                                needFixing++

                                                let hits = 0
                                                let foundProject
                                                let multiProject = ''
                                                for (let k = 0; k < projects.length; k++) {
                                                    let project = projects[k]

                                                    let testDocument = PROJECTS_MAP.get(project).get(menuItem.relatedUiObject)
                                                    if (testDocument !== undefined) {
                                                        hits++
                                                        foundProject = project
                                                        multiProject = multiProject + ' -> ' + project

                                                        let fileProject = allAppSchemasFileProjects[i]
                                                        //console.log(fileProject, project)
                                                        if (fileProject === project) {
                                                            /* If the project of the file is the same as the project found, then we consider this a match*/
                                                            hits = 1
                                                            continue
                                                        }
                                                    }
                                                }

                                                if (hits === 0) {
                                                    console.log('Problem With No Solution #' + needFixing, '         Type: ' + schemaDocument.type, '          Action: ' + menuItem.action, '              Related UI Object: ' + menuItem.relatedUiObject)
                                                    console.log('This Node Type was NOT FOUND at any project. ' + menuItem.relatedUiObject)
                                                    continue
                                                }
                                                if (hits === 1) {
                                                    console.log('Problem With One Solution #' + needFixing, '         Type: ' + schemaDocument.type, '          Action: ' + menuItem.action, '              Related UI Object: ' + menuItem.relatedUiObject, '              Found Project:' + foundProject)

                                                    menuItem.relatedUiObjectProject = foundProject
                                                    wasUpdated = true
                                                    continue
                                                }
                                                console.log('Problem With MULTIPLE Solutions #' + needFixing, '         Type: ' + schemaDocument.type, '          Action: ' + menuItem.action, '              Related UI Object: ' + menuItem.relatedUiObject, '              Found at these Projects:' + multiProject)
                                            }
                                        }

                                        //if (wasUpdated === true) {
                                        //let fileContent = JSON.stringify(schemaDocument, undefined, 4)
                                        //let filePath = allAppSchemasFilePaths[i]
                                        //console.log('Saving File at ' + filePath)
                                        //console.log(fileContent)
                                        //fs.writeFileSync(filePath, fileContent)
                                        //}
                                    }
                                } catch (err) {
                                    console.log(err.stack)
                                }
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

                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(customResponse), httpResponse)

                    }
                }
                    break
                case 'GOV': {
                    /*
                    This is the Governance endpoint at the Http Interface. All methods
                    related to the Governance System are implemented here and routed
                    to the backend Servers that can process them.
                    */
                    SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                    async function processRequest(body) {
                        try {
                            if (body === undefined) {
                                return
                            }

                            let params = JSON.parse(body)

                            switch (params.method) {
                                case 'getGithubStars': {

                                    let serverResponse = await PL.servers.GITHUB_SERVER.getGithubStars(
                                        params.repository,
                                        params.username,
                                        params.token
                                    )

                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                                    return
                                }
                                case 'getGithubWatchers': {

                                    let serverResponse = await PL.servers.GITHUB_SERVER.getGithubWatchers(
                                        params.repository,
                                        params.username,
                                        params.token
                                    )

                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                                    return
                                }
                                case 'getGithubForks': {

                                    let serverResponse = await PL.servers.GITHUB_SERVER.getGithubForks(
                                        params.repository,
                                        params.username,
                                        params.token
                                    )

                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                                    return
                                }
                                case 'createGithubFork': {

                                    let serverResponse = await PL.servers.GITHUB_SERVER.createGithubFork(
                                        params.username,
                                        params.token
                                    )

                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                                    return
                                }
                                case 'mergePullRequests': {

                                    let serverResponse = await PL.servers.GITHUB_SERVER.mergePullRequests(
                                        params.commitMessage,
                                        params.username,
                                        params.token
                                    )

                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)

                                    setInterval(
                                        PL.servers.GITHUB_SERVER.mergePullRequests,
                                        60000,
                                        params.commitMessage,
                                        params.username,
                                        params.token
                                    )

                                    return
                                }

                                case 'UserProfile': {
                                    try {

                                        let mess = unescape(params.commitMessage)
                                        const username = unescape(params.username)
                                        const token = unescape(params.token)
                                        const currentBranch = unescape(params.currentBranch)
                                        const contributionsBranch = unescape(params.contributionsBranch)

                                        let error

                                        await checkFork()
                                        await checkFork('Governance-Plugins')
                                        await updateUser()

                                        async function checkFork(repo = 'Superalgos') {
                                            let serverResponse = await PL.servers.GITHUB_SERVER.createGithubFork(
                                                username,
                                                token,
                                                repo
                                            )

                                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)

                                            if (error != undefined) {
                                                console.log(`[ERROR] httpInterface -> Gov -> createFork -> You already have a ${repo} fork. Good for you!`)
                                            }
                                        }

                                        async function updateUser() {

                                            await doGithubUser()
                                            if (error !== undefined) {

                                                let docs = {
                                                    project: 'Governance',
                                                    category: 'Topic',
                                                    type: 'Gov Error - Contribution Not Sent',
                                                    anchor: undefined,
                                                    placeholder: {}
                                                }
                                                console.log('respond with docs ')

                                                respondWithDocsObject(docs, error)
                                                return
                                            }
                                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)

                                        }

                                        async function doGithubUser() {

                                            const { Octokit } = SA.nodeModules.octokit

                                            const octokit = new Octokit({
                                                auth: token,
                                                userAgent: 'Superalgos ' + SA.version
                                            })

                                            const repo = 'Governance-Plugins'
                                            const owner = 'Superalgos'
                                            const head = username + ':' + contributionsBranch
                                            //const base = currentBranch
                                            let base = undefined
                                            if (process.env.SA_MODE === 'gitDisable') {
                                                base = 'develop'
                                            } else {
                                                base = currentBranch
                                            }
                                            const title = 'Governance: ' + mess
                                            const path = 'User-Profiles/' + username + '.json';
                                            const sha = await getSHA(path);

                                            if (sha === undefined) {
                                                console.log('***** Abort GOV.USERPROFILE *****')
                                                return
                                            }

                                            let file = await SA.projects.communityPlugins.utilities.plugins.getPluginFileContent(
                                                'Governance',
                                                'User-Profiles',
                                                username + '.json'
                                            )

                                            let buff = new Buffer.from(file, 'utf-8');
                                            let encodedFile = buff.toString('base64');
                                            try {
                                                await octokit.repos.createOrUpdateFileContents({
                                                    owner: username,
                                                    repo: repo,
                                                    path: path,
                                                    message: title,
                                                    content: encodedFile,
                                                    sha: sha,
                                                    branch: base
                                                });
                                            } catch (err) {
                                                if (err.stack.indexOf('Error User Commit') >= 0) {
                                                    return
                                                } else {
                                                    console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> Method call produced an error.')
                                                    console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> err.stack = ' + err.stack)
                                                    console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> commitMessage = ' + mess)
                                                    console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> username = ' + username)
                                                    console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> token starts with = ' + token.substring(0, 10) + '...')
                                                    console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> token ends with = ' + '...' + token.substring(token.length - 10))
                                                    console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> currentBranch = ' + currentBranch)
                                                    console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> contributionsBranch = ' + contributionsBranch)
                                                    error = err
                                                }
                                            }
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
                                                    console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> Method call produced an error.')
                                                    console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> err.stack = ' + err.stack)
                                                    console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> commitMessage = ' + mess)
                                                    console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> username = ' + username)
                                                    console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> token starts with = ' + token.substring(0, 10) + '...')
                                                    console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> token ends with = ' + '...' + token.substring(token.length - 10))
                                                    console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> currentBranch = ' + currentBranch)
                                                    console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> contributionsBranch = ' + contributionsBranch)
                                                    error = err
                                                }

                                            }

                                        }

                                        async function getSHA(path) {
                                            let sha = ''
                                            const { graphql } = SA.nodeModules.graphql

                                            try {

                                                const { repository } = await graphql(
                                                    '{  ' +
                                                    '  repository(name: "Governance-Plugins", owner: "' + username + '") {' +
                                                    '    object(expression: "develop:' + path + '") {' +
                                                    '      ... on Blob {' +
                                                    '        oid' +
                                                    '      }' +
                                                    '    }' +
                                                    '    name' +
                                                    '  }' +
                                                    '}',
                                                    {
                                                        headers: {
                                                            authorization: 'token ' + token
                                                        },
                                                    }
                                                )

                                                if (repository.name === undefined) {
                                                    console.log('***** Token permission needed : User:READ *****')
                                                    sha = undefined
                                                    error = '***** Token permission needed : User:READ *****'
                                                    return sha
                                                }

                                                if (repository.object === null) {
                                                    console.log("[User Not Found] -> Creating new user")
                                                    return sha
                                                }
                                                sha = repository.object.oid
                                                return sha

                                            } catch (err) {

                                                console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> Method call produced an error.')
                                                console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> err.stack = ' + err.stack)
                                                console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> commitMessage = ' + mess)
                                                console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> username = ' + username)
                                                console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> token starts with = ' + token.substring(0, 10) + '...')
                                                console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> token ends with = ' + '...' + token.substring(token.length - 10))
                                                console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> currentBranch = ' + currentBranch)
                                                console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> doGithub -> contributionsBranch = ' + contributionsBranch)
                                                return sha

                                            }
                                        }

                                    } catch (err) {
                                        console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> Method call produced an error.')
                                        console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> err.stack = ' + err.stack)
                                        console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> commitMessage = ' + mess)
                                        console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> username = ' + username)
                                        console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> token starts with = ' + token.substring(0, 10) + '...')
                                        console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> token ends with = ' + '...' + token.substring(token.length - 10))
                                        console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> currentBranch = ' + currentBranch)
                                        console.log('[ERROR] httpInterface -> Gov -> contributeUserProfile -> contributionsBranch = ' + contributionsBranch)

                                        let error = {
                                            result: 'Fail Because',
                                            message: err.message,
                                            stack: err.stack
                                        }
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                                    }
                                    break
                                }

                                case 'payContributors': {
                                    console.log('----------------------------------------------------------------------------------------------')
                                    console.log('DISTRIBUTION PROCESS STARTED')
                                    console.log('----------------------------------------------------------------------------------------------')

                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)


                                    await PL.servers.WEB3_SERVER.payContributors(
                                        params.contractAddress,
                                        params.contractAbi,
                                        params.paymentsArray,
                                        params.mnemonic
                                    )

                                    return
                                }
                                default: {
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify({ error: 'Method ' + params.method + ' is invalid.' }), httpResponse)
                                }
                            }
                        } catch (err) {
                            console.log('[ERROR] httpInterface -> GOV -> Method call produced an error.')
                            console.log('[ERROR] httpInterface -> GOV -> err.stack = ' + err.stack)
                            console.log('[ERROR] httpInterface -> GOV -> Params Received = ' + body)

                            let error = {
                                result: 'Fail Because',
                                message: err.message,
                                stack: err.stack
                            }
                            try {
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                            } catch (err) {
                                // we just try to respond to the web app, but maybe the response has already been sent.
                            }
                        }
                    }
                }
                    break
                case 'LegacyPlotter.js': {
                    SA.projects.foundations.utilities.httpResponses.respondWithFile(global.env.PATH_TO_PLATFORM + '/WebServer/LegacyPlotter.js', httpResponse)
                }
                    break
                case 'PlotterPanel.js': {
                    SA.projects.foundations.utilities.httpResponses.respondWithFile(global.env.PATH_TO_PLATFORM + '/WebServer/PlotterPanel.js', httpResponse)
                }
                    break
                case 'Images': // This means the Images folder.
                    {
                        let path = global.env.PATH_TO_PLATFORM + '/WebServer/Images/' + requestPath[2]

                        if (requestPath[3] !== undefined) {
                            path = path + '/' + requestPath[3]
                        }

                        if (requestPath[4] !== undefined) {
                            path = path + '/' + requestPath[4]
                        }

                        if (requestPath[5] !== undefined) {
                            path = path + '/' + requestPath[5]
                        }

                        path = unescape(path)

                        SA.projects.foundations.utilities.httpResponses.respondWithImage(path, httpResponse)
                    }
                    break
                case 'Icons': // This means the Icons folder under Projects.
                    {
                        let path = global.env.PATH_TO_PROJECTS + '/' + requestPath[2] + '/Icons'

                        if (requestPath[3] !== undefined) {
                            path = path + '/' + requestPath[3]
                        }

                        if (requestPath[4] !== undefined) {
                            path = path + '/' + requestPath[4]
                        }

                        if (requestPath[5] !== undefined) {
                            path = path + '/' + requestPath[5]
                        }

                        path = unescape(path)

                        SA.projects.foundations.utilities.httpResponses.respondWithImage(path, httpResponse)
                    }
                    break
                case 'GIFs': // This means the GIFs folder under Projects.
                    {
                        let path = global.env.PATH_TO_PROJECTS + '/' + requestPath[2] + '/GIFs'

                        if (requestPath[3] !== undefined) {
                            path = path + '/' + requestPath[3]
                        }

                        if (requestPath[4] !== undefined) {
                            path = path + '/' + requestPath[4]
                        }

                        if (requestPath[5] !== undefined) {
                            path = path + '/' + requestPath[5]
                        }

                        path = unescape(path)
                        SA.projects.foundations.utilities.httpResponses.respondWithImage(path, httpResponse)
                    }
                    break
                case 'PNGs': // This means the PNGs folder under Projects.
                    {
                        let path = global.env.PATH_TO_PROJECTS + '/' + requestPath[2] + '/PNGs'

                        if (requestPath[3] !== undefined) {
                            path = path + '/' + requestPath[3]
                        }

                        if (requestPath[4] !== undefined) {
                            path = path + '/' + requestPath[4]
                        }

                        if (requestPath[5] !== undefined) {
                            path = path + '/' + requestPath[5]
                        }

                        path = unescape(path)
                        SA.projects.foundations.utilities.httpResponses.respondWithImage(path, httpResponse)
                    }
                    break
                case 'WebServer': // This means the WebServer folder.
                    {
                        SA.projects.foundations.utilities.httpResponses.respondWithFile(global.env.PATH_TO_PLATFORM + '/WebServer/' + requestPath[2], httpResponse)
                    }
                    break
                case 'externalScripts': // This means the WebServer folder.
                    {
                        // This allows to have sub-folders in externalScripts
                        let fullPath = ''
                        for (let i = 2; i < requestPath.length; i++) {
                            fullPath += requestPath[i]
                            if (i !== requestPath.length - 1) {
                                fullPath += '/'
                            }
                        }

                        /**
                         *  Sometimes libs will call fonts/images etc. by themselves thus we should have a filter for file type to respond with the correct content and headers, but from the externalScripts folder
                         *  This code should be improved when needed with specific file types
                         */

                        let requestedFileExtension = requestPath[requestPath.length - 1].split('.').pop()
                        switch (requestedFileExtension) {
                            case 'otf':
                            case 'ttf':
                            case 'eot':
                            case 'woff':
                            case 'woff2':
                                SA.projects.foundations.utilities.httpResponses.respondWithFont(global.env.PATH_TO_PLATFORM + '/WebServer/externalScripts/' + fullPath, httpResponse)
                                break
                            default:
                                SA.projects.foundations.utilities.httpResponses.respondWithFile(global.env.PATH_TO_PLATFORM + '/WebServer/externalScripts/' + fullPath, httpResponse)
                        }

                    }
                    break
                case 'Plotters': // This means the plotter folder, not to be confused with the Plotters script!
                    {
                        let project = requestPath[2]
                        let dataMine = requestPath[3]
                        let codeName = requestPath[4]
                        let moduleName = requestPath[5]
                        let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/' + 'Bots-Plotters-Code' + '/' + dataMine + '/plotters/' + codeName + '/' + moduleName
                        SA.projects.foundations.utilities.httpResponses.respondWithFile(filePath, httpResponse)
                    }
                    break
                case 'ChartLayers': {
                    SA.projects.foundations.utilities.httpResponses.respondWithFile(global.env.PATH_TO_PLATFORM + '/UI/' + endpointOrFile + '/' + requestPath[2], httpResponse)
                }
                    break
                case 'Files': {
                    SA.projects.foundations.utilities.httpResponses.respondWithFile(global.env.PATH_TO_PLATFORM + '/UI/Data-Files/' + requestPath[2], httpResponse)
                }
                    break
                case 'Fonts': {
                    SA.projects.foundations.utilities.httpResponses.respondWithFont(global.env.PATH_TO_FONTS + '/' + requestPath[2], httpResponse)
                }
                    break
                case 'Schema': {
                    sendSchema(global.env.PATH_TO_PROJECTS + '/' + requestPath[2] + '/Schemas/', requestPath[3])

                    function sendSchema(filePath, schemaType) {
                        let fs = SA.nodeModules.fs
                        try {
                            let folder = ''
                            switch (schemaType) {
                                case 'AppSchema': {
                                    folder = 'App-Schema'
                                    break
                                }
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
                            SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories(filePath + folder, onFilesReady)

                            function onFilesReady(files) {

                                let schemaArray = []
                                for (let k = 0; k < files.length; k++) {
                                    let name = files[k]
                                    let nameSplitted = name.split(folder)
                                    let fileName = nameSplitted[1]
                                    for (let i = 0; i < 10; i++) {
                                        fileName = fileName.replace('\\', '/')
                                    }
                                    let fileToRead = filePath + folder + fileName

                                    let fileContent = fs.readFileSync(fileToRead)
                                    let schemaDocument
                                    try {
                                        schemaDocument = JSON.parse(fileContent)
                                    } catch (err) {
                                        console.log('[WARN] sendSchema -> Error Parsing JSON File: ' + fileToRead + ' .Error = ' + err.stack)
                                        continue
                                    }
                                    schemaArray.push(schemaDocument)
                                }
                                let schema = JSON.stringify(schemaArray)
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(schema, httpResponse)
                            }
                        } catch (err) {
                            if (err.message.indexOf('no such file or directory') < 0) {
                                console.log('Could not send Schema:', filePath, schemaType)
                                console.log(err.stack)
                            }
                            SA.projects.foundations.utilities.httpResponses.respondWithContent("[]", httpResponse)
                        }
                    }
                }
                    break
                case 'DirContent': {
                    let folderPath = unescape(requestPath[2])
                    if (requestPath[3] !== undefined) {
                        folderPath = folderPath + '/' + requestPath[3]
                    }

                    if (requestPath[4] !== undefined) {
                        folderPath = folderPath + '/' + requestPath[4]
                    }

                    if (requestPath[5] !== undefined) {
                        folderPath = folderPath + '/' + requestPath[5]
                    }
                    let folder
                    if (requestPath[2] === 'Root') {
                        folder = folderPath.replace('Root', '../Superalgos/')
                    } else {
                        folder = global.env.PATH_TO_PROJECTS + '/' + folderPath
                    }

                    SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories(folder, onFilesReady)

                    function onFilesReady(files) {
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(files), httpResponse)
                    }
                }
                    break
                case 'IconNames': {
                    let projects = SA.projects.foundations.utilities.filesAndDirectories.getDirectories(global.env.PATH_TO_PROJECTS)
                    let icons = []
                    let totalProjects = projects.length
                    let projectCounter = 0

                    for (let i = 0; i < projects.length; i++) {
                        let project = projects[i]

                        const folder = global.env.PATH_TO_PROJECTS + '/' + project + '/Icons/'

                        SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories(folder, onFilesReady)

                        function onFilesReady(files) {
                            for (let j = 0; j < files.length; j++) {
                                let file = files[j]
                                for (let i = 0; i < 10; i++) {
                                    file = file.replace('/', '\\')
                                }
                                icons.push([project, file])
                            }

                            projectCounter++
                            if (projectCounter === totalProjects) {
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(icons), httpResponse)
                            }
                        }
                    }
                }
                    break
                case 'PluginFileNames': {
                    processRequest()

                    async function processRequest(body) {
                        try {
                            let project = unescape(requestPath[2])
                            let folder = unescape(requestPath[3])

                            let response = await SA.projects.communityPlugins.utilities.plugins.getPluginFileNames(
                                project,
                                folder
                            ).catch(err => {
                                console.log('[ERROR] httpInterface -> PluginFileNames -> err.stack = ' + err.stack)
                            })

                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)

                        } catch (err) {
                            console.log('[ERROR] httpInterface -> PluginFileNames -> Method call produced an error.')
                            console.log('[ERROR] httpInterface -> PluginFileNames -> err.stack = ' + err.stack)
                            console.log('[ERROR] httpInterface -> PluginFileNames -> Params Received = ' + body)

                            let error = {
                                result: 'Fail Because',
                                message: err.message,
                                stack: err.stack
                            }
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                        }
                    }
                }
                    break
                case 'LoadPlugin': {
                    processRequest()

                    async function processRequest(body) {
                        try {
                            let project = unescape(requestPath[2])
                            let folder = unescape(requestPath[3])
                            let fileName = unescape(requestPath[4])

                            /*Refactoring Code: Remove this before releasing 1.0.0*/
                            if (fileName === 'Superalgos-CL.json') {
                                fileName = 'Superalgos-PL.json'
                            }

                            await SA.projects.communityPlugins.utilities.plugins.getPluginFileContent(
                                project,
                                folder,
                                fileName
                            )
                                .then(response => {
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(response, httpResponse)
                                }
                                )
                                .catch(err => {
                                    let error = {
                                        result: 'Fail Because',
                                        message: err
                                    }
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                                    return
                                })

                        } catch (err) {
                            console.log('[ERROR] httpInterface -> LoadPlugin -> Method call produced an error.')
                            console.log('[ERROR] httpInterface -> LoadPlugin -> err.stack = ' + err.stack)
                            console.log('[ERROR] httpInterface -> LoadPlugin -> Params Received = ' + body)

                            let error = {
                                result: 'Fail Because',
                                message: err.message,
                                stack: err.stack
                            }
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                        }
                    }
                }
                    break
                case 'SavePlugin': {
                    SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                    async function processRequest(body) {
                        try {
                            if (body === undefined) {
                                return
                            }

                            let plugin = JSON.parse(body)
                            let project = requestPath[2]
                            let folder = requestPath[3]
                            let fileName = requestPath[4]
                            let pluginName = global.env.PROJECT_PLUGIN_MAP[project].dir || project
                            let filePath = global.env.PATH_TO_PLUGINS + '/' + pluginName + '/' + folder
                            let fileContent = JSON.stringify(plugin, undefined, 4)
                            const fs = SA.nodeModules.fs
                            fs.writeFileSync(filePath + '/' + fileName + '.json', fileContent)
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                        } catch (err) {
                            console.log('[ERROR] httpInterface -> SavePlugin -> Method call produced an error.')
                            console.log('[ERROR] httpInterface -> SavePlugin -> err.stack = ' + err.stack)
                            console.log('[ERROR] httpInterface -> SavePlugin -> Params Received = ' + body)

                            let error = {
                                result: 'Fail Because',
                                message: err.message,
                                stack: err.stack
                            }
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                        }
                    }
                }
                    break
                case 'Workspace.js': {
                    let fs = SA.nodeModules.fs

                    try {
                        let filePath = global.env.PATH_TO_DEFAULT_WORKSPACE + '/Getting-Started-Tutorials.json'
                        fs.readFile(filePath, onFileRead)
                    } catch (e) {
                        console.log('[ERROR] Error reading the Workspace.', e)
                    }

                    function onFileRead(err, workspace) {
                        if (err) {
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(undefined, httpResponse)
                        } else {
                            let responseContent = 'function getWorkspace(){ return ' + workspace + '}'
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(responseContent, httpResponse)
                        }
                    }
                }
                    break
                case 'ListWorkspaces': {
                    let allWorkspaces = []
                    let projects = SA.projects.foundations.utilities.filesAndDirectories.getDirectories(global.env.PATH_TO_PROJECTS)
                    let projectsCount = 0

                    for (let i = 0; i < projects.length; i++) {
                        let project = projects[i]
                        readPluginWorkspaces()

                        function readPluginWorkspaces() {
                            let pluginName = project
                            if (global.env.PROJECT_PLUGIN_MAP[project] && global.env.PROJECT_PLUGIN_MAP[project].dir) pluginName = global.env.PROJECT_PLUGIN_MAP[project].dir
                            let dirPath = global.env.PATH_TO_PLUGINS + '/' + pluginName + '/Workspaces'
                            try {
                                let fs = SA.nodeModules.fs
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
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                return
                            }
                        }
                    }

                    function readMyWorkspaces() {
                        let dirPath = global.env.PATH_TO_MY_WORKSPACES
                        try {
                            let fs = SA.nodeModules.fs
                            fs.readdir(dirPath, onDirRead)

                            function onDirRead(err, fileList) {
                                if (err) {
                                    // This happens the first time you run the software.
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(allWorkspaces), httpResponse)
                                    return
                                } else {
                                    let updatedFileList = []
                                    for (let i = 0; i < fileList.length; i++) {
                                        let name = fileList[i]
                                        updatedFileList.push(['', name])
                                    }
                                    allWorkspaces = allWorkspaces.concat(updatedFileList)
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(allWorkspaces), httpResponse)
                                    return
                                }
                            }
                        } catch (err) {
                            console.log('[ERROR] Error reading a directory content. filePath = ' + dirPath)
                            console.log('[ERROR] err.stack = ' + err.stack)
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                            return
                        }
                    }
                }
                    break
                case 'LoadMyWorkspace': {
                    let fileName = unescape(requestPath[2])
                    let filePath = global.env.PATH_TO_MY_WORKSPACES + '/' + fileName + '.json'
                    SA.projects.foundations.utilities.httpResponses.respondWithFile(filePath, httpResponse)
                }
                    break
                case 'SaveWorkspace': {
                    SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                    async function processRequest(body) {

                        if (body === undefined) {
                            return
                        }

                        let fileContent = body
                        let fileName = unescape(requestPath[2])
                        let filePath = global.env.PATH_TO_MY_WORKSPACES + '/' + fileName + '.json'

                        try {
                            let fs = SA.nodeModules.fs
                            let dir = global.env.PATH_TO_MY_WORKSPACES;

                            /* Create Dir if it does not exist */
                            if (!fs.existsSync(dir)) {
                                fs.mkdirSync(dir, { recursive: true });
                            }

                            fs.writeFile(filePath, fileContent, onFileWritten)

                            function onFileWritten(err) {
                                if (err) {
                                    console.log('[ERROR] SaveWorkspace -> onFileWritten -> Error writing the Workspace file. fileName = ' + fileName)
                                    console.log('[ERROR] SaveWorkspace -> onFileWritten -> err.stack = ' + err.stack)
                                    let error = {
                                        result: 'Fail Because',
                                        message: err.message,
                                        stack: err.stack
                                    }
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                                } else {
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                                }
                            }

                        } catch (err) {
                            console.log('[ERROR] SaveWorkspace -> Error writing the Workspace file. fileName = ' + fileName)
                            console.log('[ERROR] SaveWorkspace -> err.stack = ' + err.stack)
                            let error = {
                                result: 'Fail Because',
                                message: err.message,
                                stack: err.stack
                            }
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                        }
                    }
                }
                    break
                case 'ProjectsSchema': {
                    let path = global.env.PATH_TO_PROJECTS + '/' + 'ProjectsSchema.json'
                    SA.projects.foundations.utilities.httpResponses.respondWithFile(path, httpResponse)
                }
                    break
                case 'ProjectsMenu': {
                    let path = global.env.PATH_TO_PROJECTS + '/' + 'ProjectsMenu.json'
                    SA.projects.foundations.utilities.httpResponses.respondWithFile(path, httpResponse)
                }
                    break
                case 'ListSpaceFiles': {
                    let fs = SA.nodeModules.fs
                    let allFiles = []
                    let projects = SA.projects.foundations.utilities.filesAndDirectories.getDirectories(global.env.PATH_TO_PROJECTS)
                    let dirCount = 0
                    let totalDirs = 0

                    for (let i = 0; i < projects.length; i++) {
                        let project = projects[i]

                        let dirPath = project + '/UI/Spaces'
                        let spaces = SA.projects.foundations.utilities.filesAndDirectories.getDirectories(global.env.PATH_TO_PROJECTS + '/' + dirPath)

                        for (let j = 0; j < spaces.length; j++) {
                            let space = spaces[j]
                            readDirectory(dirPath + '/' + space)
                        }

                        function readDirectory(path) {
                            try {

                                totalDirs++
                                fs.readdir(global.env.PATH_TO_PROJECTS + '/' + path, onDirRead)

                                let otherDirs = SA.projects.foundations.utilities.filesAndDirectories.getDirectories(global.env.PATH_TO_PROJECTS + '/' + path)
                                for (let m = 0; m < otherDirs.length; m++) {
                                    let otherDir = otherDirs[m]
                                    readDirectory(path + '/' + otherDir)
                                }

                                function onDirRead(err, fileList) {
                                    if (err) {
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    } else {
                                        let updatedFileList = []
                                        for (let k = 0; k < fileList.length; k++) {
                                            let name = fileList[k]
                                            if (name.indexOf('.js') < 0) {
                                                continue
                                            }
                                            updatedFileList.push(path + '/' + name)
                                        }
                                        allFiles = allFiles.concat(updatedFileList)
                                        dirCount++
                                        if (dirCount === totalDirs) {
                                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(allFiles), httpResponse)
                                        }
                                    }
                                }
                            } catch (err) {
                                console.log('[ERROR] Error reading a directory content. filePath = ' + path)
                                console.log('[ERROR] err.stack = ' + err.stack)
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                return
                            }
                        }
                    }
                }
                    break
                case 'ListFunctionLibraries': {
                    SA.projects.foundations.utilities.httpResponses.respondWithProjectFolderFileList(httpResponse, 'Function-Libraries', 'UI')
                }
                    break
                case 'ListNodeActionFunctions': {
                    SA.projects.foundations.utilities.httpResponses.respondWithProjectFolderFileList(httpResponse, 'Node-Action-Functions', 'UI')
                }
                    break
                case 'ListSystemActionFunctions': {
                    SA.projects.foundations.utilities.httpResponses.respondWithProjectFolderFileList(httpResponse, 'System-Action-Functions', 'UI')
                }
                    break
                case 'ListUtilitiesFiles': {
                    SA.projects.foundations.utilities.httpResponses.respondWithProjectFolderFileList(httpResponse, 'Utilities', 'UI')
                }
                    break
                case 'ListGlobalFiles': {
                    SA.projects.foundations.utilities.httpResponses.respondWithProjectFolderFileList(httpResponse, 'Globals', 'UI')
                }
                    break
                case 'Projects': {
                    let path = ''
                    for (let i = 2; i < 10; i++) {
                        if (requestPath[i] !== undefined) {
                            let parameter = unescape(requestPath[i])
                            path = path + '/' + parameter
                        }

                    }
                    let filePath = global.env.PATH_TO_PROJECTS + path
                    SA.projects.foundations.utilities.httpResponses.respondWithFile(filePath, httpResponse)
                }
                    break
                case 'Storage': {
                    let pathToFile = httpRequest.url.substring(9)
                    /* Unsaving # */
                    for (let i = 0; i < 10; i++) {
                        pathToFile = pathToFile.replace('_HASHTAG_', '#')
                    }
                    SA.projects.foundations.utilities.httpResponses.respondWithFile(global.env.PATH_TO_DATA_STORAGE + '/' + pathToFile, httpResponse)
                }
                    break
                default: {
                    SA.projects.foundations.utilities.httpResponses.respondWithWebFile(httpResponse, endpointOrFile, global.env.PATH_TO_PLATFORM)
                }
            }
        } catch (err) {
            if (err.stack !== undefined) {
                console.log(err.stack)
            }
            if (err.message !== undefined) {
                console.log('[ERROR] onHttpRequest -> err.message = ' + err.message)
            }
        }
    }
}
