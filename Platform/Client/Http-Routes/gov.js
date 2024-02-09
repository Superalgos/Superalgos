exports.newGOVRoute = function newGOVRoute() {
    const thisObject = {
        endpoint: 'GOV',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        /*
        This is the Governance endpoint at the Http Interface. All methods
        related to the Governance System are implemented here and routed
        to the backend Servers that can process them.
        */
        SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

        async function processRequest(body) {
            try {
                if(body === undefined) {
                    return
                }

                let params = JSON.parse(body)

                switch(params.method) {
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

                        let serverResponse = await PL.projects.governance.functionLibraries.prMergeBot.run(
                            params.commitMessage,
                            params.username,
                            params.token
                        )

                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                        return
                    }

                    case 'getRewardsFile': {

                        let serverResponse = PL.servers.BITCOIN_FACTORY_SERVER.getRewardsFile(
                            params.firstTimestamp,
                            params.lastTimestamp
                        )

                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
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

                                if(error != undefined) {
                                    SA.logger.error(`[ERROR] httpInterface -> Gov -> createFork -> You already have a ${repo} fork. Good for you!`)
                                }
                            }

                            async function updateUser() {

                                await doGithubUser()
                                if(error !== undefined) {

                                    let docs = {
                                        project: 'Governance',
                                        category: 'Topic',
                                        type: 'Gov Error - Contribution Not Sent',
                                        anchor: undefined,
                                        placeholder: {}
                                    }
                                    SA.logger.info('respond with docs ')

                                    respondWithDocsObject(docs, error)
                                    return
                                }
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)

                            }

                            async function doGithubUser() {

                                const {Octokit} = SA.nodeModules.octokit

                                const octokit = new Octokit({
                                    auth: token,
                                    userAgent: 'Superalgos ' + SA.version
                                })

                                const repo = 'Governance-Plugins'
                                const owner = 'Superalgos'
                                const head = username + ':' + contributionsBranch
                                //const base = currentBranch
                                let base = undefined
                                if(process.env.SA_MODE === 'gitDisable') {
                                    base = 'develop'
                                } else {
                                    base = currentBranch
                                }
                                const title = 'Governance: ' + mess
                                const path = 'User-Profiles/' + username + '.json';
                                const sha = await getSHA(path);

                                if(sha === undefined) {
                                    SA.logger.warn('***** Abort GOV.USERPROFILE *****')
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
                                } catch(err) {
                                    if(err.stack.indexOf('Error User Commit') >= 0) {
                                        return
                                    } else {
                                        SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> Method call produced an error.')
                                        SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> err.stack = ' + err.stack)
                                        SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> commitMessage = ' + mess)
                                        SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> username = ' + username)
                                        SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> token starts with = ' + token.substring(0, 10) + '...')
                                        SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> token ends with = ' + '...' + token.substring(token.length - 10))
                                        SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> currentBranch = ' + currentBranch)
                                        SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> contributionsBranch = ' + contributionsBranch)
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
                                } catch(err) {
                                    if(err.stack.indexOf('A pull request already exists') >= 0) {
                                        return
                                    } else {
                                        SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> Method call produced an error.')
                                        SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> err.stack = ' + err.stack)
                                        SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> commitMessage = ' + mess)
                                        SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> username = ' + username)
                                        SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> token starts with = ' + token.substring(0, 10) + '...')
                                        SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> token ends with = ' + '...' + token.substring(token.length - 10))
                                        SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> currentBranch = ' + currentBranch)
                                        SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> contributionsBranch = ' + contributionsBranch)
                                        error = err
                                    }

                                }

                            }

                            async function getSHA(path) {
                                let sha = ''
                                const {graphql} = SA.nodeModules.graphql

                                try {

                                    const {repository} = await graphql(
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

                                    if(repository.name === undefined) {
                                        SA.logger.warn('***** Token permission needed : User:READ *****')
                                        sha = undefined
                                        error = '***** Token permission needed : User:READ *****'
                                        return sha
                                    }

                                    if(repository.object === null) {
                                        SA.logger.warn("[User Not Found] -> Creating new user")
                                        return sha
                                    }
                                    sha = repository.object.oid
                                    return sha

                                } catch(err) {

                                    SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> Method call produced an error.')
                                    SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> err.stack = ' + err.stack)
                                    SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> commitMessage = ' + mess)
                                    SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> username = ' + username)
                                    SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> token starts with = ' + token.substring(0, 10) + '...')
                                    SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> token ends with = ' + '...' + token.substring(token.length - 10))
                                    SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> currentBranch = ' + currentBranch)
                                    SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> doGithub -> contributionsBranch = ' + contributionsBranch)
                                    return sha

                                }
                            }

                        } catch(err) {
                            SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> Method call produced an error.')
                            SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> err.stack = ' + err.stack)
                            SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> commitMessage = ' + mess)
                            SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> username = ' + username)
                            SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> token starts with = ' + token.substring(0, 10) + '...')
                            SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> token ends with = ' + '...' + token.substring(token.length - 10))
                            SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> currentBranch = ' + currentBranch)
                            SA.logger.error('httpInterface -> Gov -> contributeUserProfile -> contributionsBranch = ' + contributionsBranch)

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
                        SA.logger.info('----------------------------------------------------------------------------------------------')
                        SA.logger.info('DISTRIBUTION PROCESS STARTED')
                        SA.logger.info('----------------------------------------------------------------------------------------------')

                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)


                        await PL.servers.WEB3_SERVER.payContributors(
                            params.contractAddressDict,
                            params.treasuryAccountDict,
                            params.contractABIDict,
                            params.decimalFactorDict,
                            params.paymentsArray,
                            params.paymentsBlacklist,
                            params.paymentsWhitelist,
                            params.mnemonic
                        )

                        return
                    }
                    default: {
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify({error: 'Method ' + params.method + ' is invalid.'}), httpResponse)
                    }
                }
            } catch(err) {
                SA.logger.error('httpInterface -> GOV -> Method call produced an error.')
                SA.logger.error('httpInterface -> GOV -> err.stack = ' + err.stack)
                SA.logger.error('httpInterface -> GOV -> Params Received = ' + body)

                let error = {
                    result: 'Fail Because',
                    message: err.message,
                    stack: err.stack
                }
                try {
                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                } catch(err) {
                    // we just try to respond to the web app, but maybe the response has already been sent.
                }
            }
        }
    }
}