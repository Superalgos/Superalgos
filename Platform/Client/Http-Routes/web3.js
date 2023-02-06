exports.newWEB3Route = function newWEB3Route() {
    const thisObject = {
        endpoint: 'WEB3',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
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
                            params.chain,
                            params.walletAddress,
                            params.contractAddress
                        )

                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                        return
                    }
                    case 'getLPTokenBalance': {

                        let serverResponse = await PL.servers.WEB3_SERVER.getLPTokenBalance(
                            params.chain,
                            params.contractAddressSA,
                            params.contractAddressLP
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
                SA.logger.error('httpInterface -> WEB3s -> Method call produced an error.')
                SA.logger.error('httpInterface -> WEB3s -> err.stack = ' + err.stack)
                SA.logger.error('httpInterface -> WEB3s -> Params Received = ' + body)

                let error = {
                    result: 'Fail Because',
                    message: err.message,
                    stack: err.stack
                }
                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
            }
        }
    }
}