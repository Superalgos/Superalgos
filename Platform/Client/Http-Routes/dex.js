exports.newDEXRoute = function newDEXRoute() {
    const thisObject = {
        endpoint: 'DEX',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        switch(requestPath[2]) {
            case 'CreateNewWallet':
                SA.logger.info('creating new wallet')
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
                                SA.logger.error(err)
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                            })
                    })
                    .catch(err => {
                        SA.logger.error(err)
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                    })
                break
            case 'ImportWalletFromMnemonic':
                SA.logger.info('importing wallet from mnemonic')
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
                                        SA.logger.error(err)
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    })
                            })
                            .catch(err => {
                                SA.logger.error(err)
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                            })
                    })
                    .catch(err => {
                        SA.logger.error(err)
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                    })
                break
            case 'ImportWalletFromPrivateKey':
                SA.logger.info('importing wallet from private key')
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
                                        SA.logger.error(err)
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    })
                            })
                            .catch(err => {
                                SA.logger.error(err)
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                            })
                    })
                    .catch(err => {
                        SA.logger.error(err)
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                    })
                break
            case 'GetTokens':
                SA.logger.info('adding missing tokens to wallet assets.')
                SA.projects.foundations.utilities.httpRequests.getRequestBodyAsync(httpRequest, httpResponse)
                    .then(body => {
                        let config = JSON.parse(body)
                        if(config.network === 'bsc') {
                            SA.projects.decentralizedExchanges.utilities.bsc.getTokens()
                                .then(response => {
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                                })
                                .catch(err => {
                                    SA.logger.error(err)
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                })
                        }
                    })
                    .catch(err => {
                        SA.logger.error(err)
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                    })
        }
    }
}