/**
 * @typedef {{
 *   config: string
 * }} Config
 * 
 * @typedef {{
 *   keys: Config[]
 * }} UserKey
 * 
 * @typedef {{
 *   userKeys: UserKey
 * }} UserAccount
 * 
 * @typedef {{
 *   exchangeAccounts: {
 *     userAccounts: UserAccount[]
 *   }
 * }} Exchange
 * 
 * @typedef {{
 *   exchanges: Exchange[]
 * }} CryptoExchange
 * 
 * @typedef {{
 *   rootNodes: {
 *     project: string,
 *     type: string,
 *     githubAPI: Config|undefined,
 *     cryptoExchanges: CryptoExchange[]
 *   }[]
 * }} Payload
 * 
 * @typedef {{
 *   type: 'github'|'exchange',
 *   key: string,
 *   value: string
 * }} Credentials
*/

exports.newFoundationsUtilitiesCredentials = function newFoundationsUtilitiesCredentials() {
    let thisObject = {
        loadExchangesCredentials: loadExchangesCredentials,
        loadGithubCredentials: loadGithubCredentials,
        storeExchangesCredentials: storeExchangesCredentials,
        storeGithubCredentials: storeGithubCredentials,
    }

    const githubType = 'github'
    const exchangeType = 'exchange'

    return thisObject

    /**
     * @param {Payload} payload 
     * @returns {Payload}
     */
    function loadGithubCredentials(payload) {
        const node = payload.rootNodes.find(node => node.project == 'Foundations' && node.type == 'APIs' && node.githubAPI !== undefined)
        if (node !== undefined) {
            const config = JSON.parse(node.githubAPI.config)
            if (config.username !== undefined && config.username.length > 0) {
                const credentials = readCredentialsFile()
                const match = credentials.find(creds => creds.type == githubType && creds.key == config.username)
                if (match !== undefined) {
                    config.token = match.value
                }
            }
            node.githubAPI.config = JSON.stringify(config, null, 4)
        }
        return payload
    }

    /**
     * @param {Payload} payload 
     * @returns {Payload}
     */
    function loadExchangesCredentials(payload) {
        const node = payload.rootNodes.find(node => node.project == 'Foundations' && node.type == 'Crypto Ecosystem' && node.cryptoExchanges !== undefined && node.cryptoExchanges.length > 0)
        if (node !== undefined) {
            iterateCryptoExchanges(node.cryptoExchanges, iterateUserKeys)
        }
        return payload

        /**
         * @param {Config[]} userKeys 
         */
        function iterateUserKeys(userKeys) {
            for (let i = 0; i < userKeys.length; i++) {
                const config = JSON.parse(userKeys[i].config)
                if (config.codeName !== undefined && config.codeName.length > 0) {
                    const credentials = readCredentialsFile()
                    const match = credentials.find(creds => creds.type == exchangeType && creds.key == config.codeName)
                    if (match !== undefined) {
                        config.secret = match.value
                    }
                }
                userKeys[i].config = JSON.stringify(config, null, 4)
            }
        }
    }

    /**
     * @param {Payload} payload 
     * @returns {Payload}
     */
    function storeGithubCredentials(payload) {
        const node = payload.rootNodes.find(node => node.project == 'Foundations' && node.type == 'APIs' && node.githubAPI !== undefined)
        if (node !== undefined) {
            const config = JSON.parse(node.githubAPI.config)
            if (config.username !== undefined && config.username.length > 0 && config.token !== undefined && config.token.length > 0) {
                const credentials = readCredentialsFile()
                const matchIdx = credentials.findIndex(creds => creds.type == githubType && creds.key == config.username)
                if (matchIdx > -1) {
                    credentials[matchIdx].value = config.token
                }
                else {
                    credentials.push({
                        type: githubType,
                        key: config.username,
                        value: config.token
                    })
                }
                writeCredentialsFile(credentials)
            }
            config.token = ''
            node.githubAPI.config = JSON.stringify(config, null, 4)
        }
        return payload
    }

    /**
     * @param {Payload} payload 
     * @returns {Payload}
    */
    function storeExchangesCredentials(payload) {
        const node = payload.rootNodes.find(node => node.project == 'Foundations' && node.type == 'Crypto Ecosystem' && node.cryptoExchanges !== undefined && node.cryptoExchanges.length > 0)
        if (node !== undefined) {
            iterateCryptoExchanges(node.cryptoExchanges, iterateUserKeys)
        }
        return payload

        /**
         * @param {Config[]} userKeys 
         */
        function iterateUserKeys(userKeys) {
            for (let i = 0; i < userKeys.length; i++) {
                const config = JSON.parse(userKeys[i].config)
                if (config.codeName !== undefined && config.codeName.length > 0 && config.secret !== undefined && config.secret.length > 0) {
                    const credentials = readCredentialsFile()
                    const matchIdx = credentials.findIndex(creds => creds.type == exchangeType && creds.key == config.codeName)
                    if (matchIdx > -1) {
                        credentials[matchIdx].value = config.secret
                    }
                    else {
                        credentials.push({
                            type: exchangeType,
                            key: config.codeName,
                            value: config.secret
                        })
                    }
                    writeCredentialsFile(credentials)
                }
                config.secret = ''
                userKeys[i].config = JSON.stringify(config, null, 4)
            }
        }
    }

    /**
     * @param {CryptoExchange[]} cryptoExchanges 
     * @param {(userKeys: Config[]) => void} keyFunction
     */
    function iterateCryptoExchanges(cryptoExchanges, keyFunction) {
        for (let i = 0; i < cryptoExchanges.length; i++) {
            iterateExchanges(cryptoExchanges[i].exchanges, keyFunction)
        }
    }

    /**
     * @param {Exchange[]} exchanges 
     */
    function iterateExchanges(exchanges, keyFunction) {
        for (let i = 0; i < exchanges.length; i++) {
            if (exchanges[i].exchangeAccounts !== undefined) {
                iterateUserAccounts(exchanges[i].exchangeAccounts.userAccounts, keyFunction)
            }
        }
    }

    /**
     * @param {UserAccount[]} userAccounts 
     */
    function iterateUserAccounts(userAccounts, keyFunction) {
        for (let i = 0; i < userAccounts.length; i++) {
            if (userAccounts[i].userKeys !== undefined) {
                keyFunction(userAccounts[i].userKeys.keys)
            }
        }
    }

    /**
     * @returns {Credentials[]}
     */
    function readCredentialsFile() {
        const filePath = secretsFilePath()
        if (!SA.nodeModules.fs.existsSync(filePath)) {
            writeCredentialsFile([])
        }

        const secretsFileContent = SA.nodeModules.fs.readFileSync(filePath)
        return JSON.parse(secretsFileContent)
    }

    /**
     * @param {Credentials[]} credentials 
     */
    function writeCredentialsFile(credentials) {
        SA.nodeModules.fs.writeFileSync(secretsFilePath(), JSON.stringify(credentials, null, 4))
    }

    /**
     * @returns {string}
     */
    function secretsFilePath() {
        return SA.nodeModules.path.join(global.env.PATH_TO_SECRETS, 'workspace-credentials.json')
    }
}