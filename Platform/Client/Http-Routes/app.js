exports.newAppRoute = function newAppRoute() {
    const thisObject = {
        endpoint: 'App',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        const GITHUB_API_WAITING_TIME = 3000
        // If running the electron app do not try to get git tool. I don't allow it.
        if(process.env.SA_MODE === 'gitDisable') {
            PL.logger.warn('No contributions on binary distributions. Do manual installation')
            return
        }
        switch(requestPath[2]) { // switch by command

            case 'GetCreds': {
                // We load saved Github credentials
                try {
                    let error

                    getCreds().catch(errorResp)

                    // This error responce needs to be made compatible with the contributions space or depricated
                    function errorResp(e) {
                        error = e
                        PL.logger.error(error)
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
                        if(SA.nodeModules.fs.existsSync(secretsDiv)) {
                            let rawFile = SA.nodeModules.fs.readFileSync(secretsDiv + '/githubCredentials.json')
                            githubCredentials = JSON.parse(rawFile)

                            // Now we send the credentials to the UI
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(githubCredentials), httpResponse)
                        }
                    }

                } catch(err) {
                    basicErrorResponse('GetCreds', err)
                }
                break
            }

            case 'SaveCreds': {
                // We save Github credentials sent from the UI
                try {
                    requestPath.splice(0, 3)
                    const username = requestPath.splice(0, 1).toString()
                    const token = requestPath.toString()

                    let creds = {
                        "githubUsername": username,
                        "githubToken": token
                    }

                    PL.logger.info(creds)
                    let error

                    saveCreds().catch(errorResp)

                    // This error responce needs to be made compatible with the contributions space or depricated
                    function errorResp(e) {
                        error = e
                        PL.logger.error(error)
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
                        if(!SA.nodeModules.fs.existsSync(secretsDir)) {
                            SA.nodeModules.fs.mkdirSync(secretsDir)
                        }

                        // Now write creds to file
                        if(SA.nodeModules.fs.existsSync(secretsDir)) {

                            SA.nodeModules.fs.writeFileSync(secretsDir + '/githubCredentials.json', JSON.stringify(creds))
                        }
                    }

                } catch(err) {
                    basicErrorResponse('SaveCreds', err)
                    break
                }

                // If everything goes well respond back with success
                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                break
            }

            case 'Contribute': {
                try {
                    // We create a pull request of all active changes
                    let commitMessage = decodeURIComponent(requestPath[3])
                    const username = decodeURIComponent(requestPath[4])
                    const token = decodeURIComponent(requestPath[5])
                    const currentBranch = decodeURIComponent(requestPath[6])
                    const contributionsBranch = decodeURIComponent(requestPath[7])
                    let error

                    // rebuild array of commit messages if committing from contribturions space
                    if(commitMessage.charAt(0) === '[' && commitMessage.charAt(commitMessage.length - 1) === ']') {
                        commitMessage = JSON.parse(commitMessage)
                    } else { // else handle string from command line
                        /* Unsaving # */
                        for(let i = 0; i < 10; i++) {
                            commitMessage = commitMessage.replace('_SLASH_', '/')
                            commitMessage = commitMessage.replace('_HASHTAG_', '#')
                        }
                    }

                    contribute()

                    async function contribute() {
                        const {lookpath} = SA.nodeModules.lookpath
                        const gitpath = await lookpath('git')
                        if(gitpath === undefined) {
                            PL.logger.error('`git` not installed.')
                        } else {
                            await doGit().catch(e => {
                                error = e
                            })
                            if(error !== undefined) {

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
                            if(error !== undefined) {

                                let docs = {
                                    project: 'Foundations',
                                    category: 'Topic',
                                    type: 'App Error - Contribution Not Sent',
                                    anchor: undefined,
                                    placeholder: {}
                                }
                                TS.logger.info('respond with docs ')

                                respondWithDocsObject(docs, error)
                                return
                            }
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                        }
                    }

                    function getCommitMessage(repoName, messageArray) {
                        let messageToSend = ''
                        for(let message of messageArray) {
                            if(message[0] === repoName) {
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
                        PL.logger.info('Starting process of uploading changes (if any) to ' + repoURL)
                        let git = simpleGit(options)

                        await pushFiles(git) // Main Repo

                        for(const propertyName in global.env.PROJECT_PLUGIN_MAP) {
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
                            PL.logger.info('Starting process of uploading changes (if any) to ' + repoURL)
                            await pushFiles(git)
                        }

                        async function pushFiles(git) {
                            try {
                                // If contributing from contributrions space gather the correct commit message
                                let messageToSend
                                if(commitMessage instanceof Array) {
                                    messageToSend = getCommitMessage(repoName, commitMessage)

                                } else { // Else just send the commit message string from command line
                                    messageToSend = commitMessage

                                }
                                if(messageToSend === undefined || messageToSend === '') {
                                    messageToSend = 'No commit message defined'
                                }
                                await git.pull('origin', currentBranch)
                                await git.add('./*')

                                /* Deactivate Unit Tests for the Contributions Space by setting UNITTESTS environment variable within the commit call. */
                                const UNITTESTS = 'false'
                                await git
                                    .env({...process.env, UNITTESTS})
                                    .commit(messageToSend)

                                await git.push('origin', currentBranch)
                            } catch(err) {
                                PL.logger.error('httpInterface -> App -> Contribute -> doGit -> Method call produced an error.')
                                PL.logger.error('httpInterface -> App -> Contribute -> doGit -> err.stack = ' + err.stack)
                                PL.logger.error('httpInterface -> App -> Contribute -> doGit -> commitMessage = ' + messageToSend)
                                PL.logger.error('httpInterface -> App -> Contribute -> doGit -> currentBranch = ' + currentBranch)
                                PL.logger.error('httpInterface -> App -> Contribute -> doGit -> contributionsBranch = ' + contributionsBranch)
                                PL.logger.error('')
                                PL.logger.error('Troubleshooting Tips:')
                                PL.logger.error('')
                                PL.logger.error('1. Make sure that you have set up your Github Username and Token at the APIs -> Github API node at the workspace.')
                                PL.logger.error('2. Make sure you are running the latest version of Git available for your OS.')
                                PL.logger.error('3. Make sure that you have cloned your Superalgos repository fork, and not the main Superalgos repository.')
                                PL.logger.error('4. If your fork is old, you might need to do an app.update and also a node setup at every branch. If you just reforked all is good.')

                                error = err
                            }
                        }
                    }

                    async function doGithub() {

                        const {Octokit} = SA.nodeModules.octokit

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
                        if(commitMessage instanceof Array) {
                            messageToSend = getCommitMessage(repoName, commitMessage)

                        } else { // Else just send the commit message string from command line
                            messageToSend = commitMessage

                        }
                        let title = 'Contribution: ' + messageToSend

                        await createPullRequest(repo)

                        for(const propertyName in global.env.PROJECT_PLUGIN_MAP) {
                            /*
                            Upload the Plugins
                            */

                            if(commitMessage instanceof Map) {
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
                                PL.logger.info(' ')
                                PL.logger.info('Checking if we need to create Pull Request at repository ' + repo)
                                await SA.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                await octokit.pulls.create({
                                    owner,
                                    repo,
                                    title,
                                    head,
                                    base,
                                });
                                PL.logger.info('A pull request has been succesfully created. ')
                            } catch(err) {
                                if(
                                    err.stack.indexOf('A pull request already exists') >= 0 ||
                                    err.stack.indexOf('No commits between') >= 0
                                ) {
                                    if(err.stack.indexOf('A pull request already exists') >= 0) {
                                        PL.logger.warn('A pull request already exists. If any, commits would added to the existing Pull Request. ')
                                    }
                                    if(err.stack.indexOf('No commits between') >= 0) {
                                        PL.logger.warn('No commits detected. Pull request not created. ')
                                    }
                                    return
                                } else {
                                    PL.logger.error('httpInterface -> App -> Contribute -> doGithub -> Method call produced an error.')
                                    PL.logger.error('httpInterface -> App -> Contribute -> doGithub -> err.stack = ' + err.stack)
                                    PL.logger.error('httpInterface -> App -> Contribute -> doGithub -> commitMessage = ' + commitMessage)
                                    PL.logger.error('httpInterface -> App -> Contribute -> doGithub -> username = ' + username)
                                    PL.logger.error('httpInterface -> App -> Contribute -> doGithub -> token starts with = ' + token.substring(0, 10) + '...')
                                    PL.logger.error('httpInterface -> App -> Contribute -> doGithub -> token ends with = ' + '...' + token.substring(token.length - 10))
                                    PL.logger.error('httpInterface -> App -> Contribute -> doGithub -> currentBranch = ' + currentBranch)
                                    PL.logger.error('httpInterface -> App -> Contribute -> doGithub -> contributionsBranch = ' + contributionsBranch)
                                    error = err
                                }
                            }
                        }
                    }

                } catch(err) {
                    PL.logger.error('httpInterface -> App -> Contribute -> Method call produced an error.')
                    PL.logger.error('httpInterface -> App -> Contribute -> err.stack = ' + err.stack)
                    PL.logger.error('httpInterface -> App -> Contribute -> commitMessage = ' + commitMessage)
                    PL.logger.error('httpInterface -> App -> Contribute -> username = ' + username)
                    PL.logger.error('httpInterface -> App -> Contribute -> token starts with = ' + token.substring(0, 10) + '...')
                    PL.logger.error('httpInterface -> App -> Contribute -> token ends with = ' + '...' + token.substring(token.length - 10))
                    PL.logger.error('httpInterface -> App -> Contribute -> currentBranch = ' + currentBranch)
                    PL.logger.error('httpInterface -> App -> Contribute -> contributionsBranch = ' + contributionsBranch)

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
                    let commitMessage = decodeURIComponent(requestPath[3])
                    const username = decodeURIComponent(requestPath[4])
                    const token = decodeURIComponent(requestPath[5])
                    const currentBranch = decodeURIComponent(requestPath[6])
                    const contributionsBranch = decodeURIComponent(requestPath[7])
                    const repoName = decodeURIComponent(requestPath[8])
                    let error

                    /* Unsaving # */
                    for(let i = 0; i < 10; i++) {
                        commitMessage = commitMessage.replace('_SLASH_', '/')
                        commitMessage = commitMessage.replace('_HASHTAG_', '#')
                    }

                    contributeSingleRepo()

                    async function contributeSingleRepo() {
                        const {lookpath} = SA.nodeModules.lookpath
                        const gitpath = await lookpath('git')
                        if(gitpath === undefined) {
                            PL.logger.error('`git` not installed.')
                        } else {
                            await doGit().catch(e => {
                                error = e
                            })
                            if(error !== undefined) {

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
                            if(error !== undefined) {

                                let docs = {
                                    project: 'Foundations',
                                    category: 'Topic',
                                    type: 'App Error - Contribution Not Sent',
                                    anchor: undefined,
                                    placeholder: {}
                                }
                                PL.logger.info('respond with docs ')

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
                        if(repoName === 'Superalgos') {
                            let repoURL = 'https://github.com/Superalgos/Superalgos'
                            PL.logger.info('Starting process of uploading changes (if any) to ' + repoURL)
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
                            PL.logger.info('Starting process of uploading changes (if any) to ' + repoURL)
                            await pushFiles(git)
                        }

                        async function pushFiles(git) {
                            try {
                                await git.pull('origin', currentBranch)
                                await git.add('./*')
                                /* Deactivate Unit Tests for the Contribution Space by setting UNITTESTS environment variable within the commit call. */
                                const UNITTESTS = 'false'
                                await git
                                    .env({...process.env, UNITTESTS})
                                    .commit(commitMessage)
                                await git.push('origin', currentBranch)
                            } catch(err) {
                                PL.logger.error('httpInterface -> App -> Contribute -> doGit -> Method call produced an error.')
                                PL.logger.error('httpInterface -> App -> Contribute -> doGit -> err.stack = ' + err.stack)
                                PL.logger.error('httpInterface -> App -> Contribute -> doGit -> commitMessage = ' + commitMessage)
                                PL.logger.error('httpInterface -> App -> Contribute -> doGit -> currentBranch = ' + currentBranch)
                                PL.logger.error('httpInterface -> App -> Contribute -> doGit -> contributionsBranch = ' + contributionsBranch)
                                PL.logger.error('')
                                PL.logger.error('Troubleshooting Tips:')
                                PL.logger.error('')
                                PL.logger.error('1. Make sure that you have set up your Github Username and Token at the APIs -> Github API node at the workspace.')
                                PL.logger.error('2. Make sure you are running the latest version of Git available for your OS.')
                                PL.logger.error('3. Make sure that you have cloned your Superalgos repository fork, and not the main Superalgos repository.')
                                PL.logger.error('4. If your fork is old, you might need to do an app.update and also a node setup at every branch. If you just reforked all is good.')

                                error = err
                            }
                        }
                    }

                    async function doGithub() {

                        const {Octokit} = SA.nodeModules.octokit

                        const octokit = new Octokit({
                            auth: token,
                            userAgent: 'Superalgos ' + SA.version
                        })

                        const owner = 'Superalgos'
                        const head = username + ':' + contributionsBranch
                        const base = currentBranch
                        const title = 'Contribution: ' + commitMessage

                        if(repoName === 'Superalgos') {
                            await createPullRequest(repoName)
                        } else {
                            await createPullRequest(global.env.PROJECT_PLUGIN_MAP[repoName].repo)
                        }

                        async function createPullRequest(repo) {
                            try {
                                PL.logger.info(' ')
                                PL.logger.info('Checking if we need to create Pull Request at repository ' + repo)
                                await SA.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                await octokit.pulls.create({
                                    owner,
                                    repo,
                                    title,
                                    head,
                                    base,
                                });
                                PL.logger.info('A pull request has been succesfully created. ')
                            } catch(err) {
                                if(
                                    err.stack.indexOf('A pull request already exists') >= 0 ||
                                    err.stack.indexOf('No commits between') >= 0
                                ) {
                                    if(err.stack.indexOf('A pull request already exists') >= 0) {
                                        PL.logger.warn('A pull request already exists. If any, commits would added to the existing Pull Request. ')
                                    }
                                    if(err.stack.indexOf('No commits between') >= 0) {
                                        PL.logger.warn('No commits detected. Pull request not created. ')
                                    }
                                    return
                                } else {
                                    PL.logger.error('httpInterface -> App -> Contribute -> doGithub -> Method call produced an error.')
                                    PL.logger.error('httpInterface -> App -> Contribute -> doGithub -> err.stack = ' + err.stack)
                                    PL.logger.error('httpInterface -> App -> Contribute -> doGithub -> commitMessage = ' + commitMessage)
                                    PL.logger.error('httpInterface -> App -> Contribute -> doGithub -> username = ' + username)
                                    PL.logger.error('httpInterface -> App -> Contribute -> doGithub -> token starts with = ' + token.substring(0, 10) + '...')
                                    PL.logger.error('httpInterface -> App -> Contribute -> doGithub -> token ends with = ' + '...' + token.substring(token.length - 10))
                                    PL.logger.error('httpInterface -> App -> Contribute -> doGithub -> currentBranch = ' + currentBranch)
                                    PL.logger.error('httpInterface -> App -> Contribute -> doGithub -> contributionsBranch = ' + contributionsBranch)
                                    error = err
                                }
                            }
                        }
                    }

                } catch(err) {
                    PL.logger.error('httpInterface -> App -> Contribute -> Method call produced an error.')
                    PL.logger.error('httpInterface -> App -> Contribute -> err.stack = ' + err.stack)
                    PL.logger.error('httpInterface -> App -> Contribute -> commitMessage = ' + commitMessage)
                    PL.logger.error('httpInterface -> App -> Contribute -> username = ' + username)
                    PL.logger.error('httpInterface -> App -> Contribute -> token starts with = ' + token.substring(0, 10) + '...')
                    PL.logger.error('httpInterface -> App -> Contribute -> token ends with = ' + '...' + token.substring(token.length - 10))
                    PL.logger.error('httpInterface -> App -> Contribute -> currentBranch = ' + currentBranch)
                    PL.logger.error('httpInterface -> App -> Contribute -> contributionsBranch = ' + contributionsBranch)

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
                    PL.logger.info('Update command received')
                    // We update the local repo from remote
                    let currentBranch = unescape(requestPath[3])
                    if(['master','develop'].indexOf(currentBranch) == -1) {
                        currentBranch = 'develop'
                    }
                    update().catch(error => {
                        PL.logger.error(error.message)
                        basicErrorResponse('Update', err)
                    })

                    async function update() {
                        const {lookpath} = SA.nodeModules.lookpath
                        const gitpath = await lookpath('git');
                        if(gitpath === undefined) {
                            PL.logger.error('`git` not installed.')
                            throw new Error('`git` not installed.')
                        } else {
                            let result = await doGit()

                            if(result.error === undefined) {
                                let customResponse = {
                                    result: global.CUSTOM_OK_RESPONSE.result,
                                    message: result.message
                                }
                                if(result.message.reposUpdated === true) {
                                    SA.restartRequired = true
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
                                throw new Error('App Error - Git Update Failed')
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
                            PL.logger.info('Downloading from ' + repoURL)
                            let message = await git.pull(repoURL, currentBranch)

                            if(message.error === undefined) {
                                addToReposUpdated(message, 'Superalgos')

                                for(const propertyName in global.env.PROJECT_PLUGIN_MAP) {
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
                                    PL.logger.info('Downloading branch "' + currentBranch + '" from "' + repoURL + '"')
                                    message = await git.pull(repoURL, currentBranch)
                                    if(message.error === undefined) {
                                        addToReposUpdated(message, global.env.PROJECT_PLUGIN_MAP[propertyName].repo)
                                    }
                                }
                            }

                            message = {
                                reposUpdated: reposUpdated
                            }
                            return {message: message}

                            function addToReposUpdated(message, repo) {
                                if(message.summary.changes + message.summary.deletions + message.summary.insertions > 0) {
                                    reposUpdated = true
                                    PL.logger.info('Your local repository ' + repo + ' was successfully updated. ')
                                } else {
                                    PL.logger.info('Your local repository ' + repo + ' was already up-to-date. ')
                                }
                            }

                        } catch(err) {
                            PL.logger.error('Error updating ' + currentBranch)
                            PL.logger.error(err.stack)
                            return {error: err}
                        }
                    }

                } catch(err) {
                    basicErrorResponse('Update', err)
                }
                break
            }

            case 'Restart': {
                PL.logger.info('Restart command received')
                PL.servers.RESTART_SERVER.tryRestart([
                    process.pid,
                    process.ppid
                ]).catch(error => {
                    PL.logger.error(error.message)
                    basicErrorResponse('Restart', err)
                })
                let customResponse = {
                    result: global.CUSTOM_OK_RESPONSE.result,
                    message: {
                        restarting: true
                    }
                }
                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(customResponse), httpResponse)
                break
            }

            case 'RestartRequired': {
                try {
                    let customResponse = {
                        result: global.CUSTOM_OK_RESPONSE.result,
                        message: SA.restartRequired
                    }
                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(customResponse), httpResponse)
                } catch(err) {
                    basicErrorResponse('RestartRequired', err)
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
                        PL.logger.error(error)
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
                        const {lookpath} = SA.nodeModules.lookpath
                        const gitpath = await lookpath('git');
                        if(gitpath === undefined) {
                            PL.logger.error('`git` not installed.')
                        } else {
                            let repoStatus = []
                            let status

                            // status is an array that holds the repo name, diff summary, and status of local repo compared to remote in an array
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
                        if(repo === 'Superalgos') options.baseDir = dir || process.cwd()
                        // if repo is not main app repo, assume it is a plugin, in ./Plugins.
                        else options.baseDir = SA.nodeModules.path.join(process.cwd(), 'Plugins', dir)
                        const git = simpleGit(options)
                        let diffObj
                        let upstreamArray = []
                        try {
                            // Clear the index to make sure we pick up all active changes
                            await git.reset('mixed')
                            // get the summary of current changes in the current repo
                            diffObj = await git.diffSummary(responce).catch(errorResp)

                            // get the status of current repo compaired to upstream
                            let raw = await git.remote(['show', 'upstream'])
                            let split = raw.split('\n')
                            // Keep only end of returned message and format for UI
                            for(let str of split) {
                                // TODO: needs localized for all supported languages 
                                if(str.includes('pushes') || str.includes('pousse') || str.includes('versendet')) {
                                    // Get name of Branch
                                    let branch = str.trim().split(' ')[0]
                                    // Get status of branch
                                    let value = str.match(/\(([^]+)\)/)
                                    upstreamArray.push([branch, value[1]])
                                }
                            }

                            if(upstreamArray.length === 0) {
                                PL.logger.error('Unexpected response from command git remote. Responded with:', raw)
                            }

                            function responce(err, diffSummary) {
                                if(err !== null) {
                                    PL.logger.error('Error while gathering diff summary for ' + repo)
                                    PL.logger.error(err.stack)
                                    error = err
                                } else {
                                    return diffSummary
                                }
                            }

                        } catch(err) {
                            PL.logger.error('Error while gathering diff summary for ' + repo)
                            PL.logger.error(err.stack)
                            error = err
                        }
                        return [repo, diffObj, upstreamArray];
                    }

                } catch(err) {
                    basicErrorResponse('Status', err)
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
                        PL.logger.error(error)
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
                        const {lookpath} = SA.nodeModules.lookpath
                        const gitpath = await lookpath('git');
                        if(gitpath === undefined) {
                            PL.logger.error('`git` not installed.')
                        } else {
                            // Checkout branch from main repo
                            await doGit().catch(errorResp)
                            // Checkout branch from each plugin repo
                            await Promise.all(Object.values(global.env.PROJECT_PLUGIN_MAP).map(v => {
                                return doGit(v.dir, v.repo)
                            })).catch(errorResp)

                            if(error === undefined) {
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
                        if(repo === 'Superalgos') options.baseDir = dir || process.cwd()
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

                        } catch(err) {
                            PL.logger.error('Error changing current branch to ' + currentBranch)
                            PL.logger.error(err.stack)
                            error = err
                        }
                    }

                    async function runNodeSetup() {
                        PL.logger.info("Running Node setup to adjust for new Branch")
                        const process = SA.nodeModules.process
                        const childProcess = SA.nodeModules.childProcess

                        let dir = process.cwd()
                        let command = "node setup noShortcuts";
                        let stdout = childProcess.execSync(command,
                            {
                                cwd: dir
                            }).toString();

                        PL.logger.info("Node Setup has completed with the following result:", stdout)
                    }

                } catch(err) {
                    basicErrorResponse('Checkout', err)
                }
                break
            }

            case 'Branch': {
                try {
                    // We get the current git branch
                    branch()

                    async function branch() {
                        const {lookpath} = SA.nodeModules.lookpath
                        const gitpath = await lookpath('git');
                        if(gitpath === undefined) {
                            PL.logger.error('`git` not installed.')
                        } else {
                            let result = await doGit()

                            if(result.error === undefined) {
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
                        } catch(err) {
                            PL.logger.error('Error reading current branch.')
                            PL.logger.error(err.stack)
                        }
                    }

                } catch(err) {
                    basicErrorResponse('Branch', err)
                }
                break
            }

            case 'Discard': {
                // We discard active changes for a specific file
                try {
                    requestPath.splice(0, 3)
                    const repo = requestPath.splice(0, 1).toString().replace('-Plugins', '')
                    const filePath = requestPath.toString().replaceAll(",", "/")

                    let error

                    discard().catch(errorResp)

                    // This error responce needs to be made compatible with the contributions space or depricated
                    function errorResp(e) {
                        error = e
                        PL.logger.error(error)
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
                        const {lookpath} = SA.nodeModules.lookpath
                        const gitpath = await lookpath('git');
                        if(gitpath === undefined) {
                            PL.logger.error('`git` not installed.')
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
                        if(repo === 'Superalgos') options.baseDir = process.cwd()
                        // if repo is not main app repo, assume it is a plugin, in ./Plugins.
                        else options.baseDir = SA.nodeModules.path.join(process.cwd(), 'Plugins', repo)

                        const git = simpleGit(options)
                        let status
                        try {

                            // Discard change in file
                            await git.checkout([filePath]).catch(errorResp)
                            // Make sure changes have been discarded
                            status = await git.diff([filePath]).catch(errorResp)

                            if(status === '') {
                                status = global.DEFAULT_OK_RESPONSE
                            } else {
                                PL.logger.error('[ERROR} There are still differences found for this file')
                                PL.logger.error(status)
                            }

                        } catch(err) {
                            PL.logger.error('Error while discarding changes to ' + filepath)
                            PL.logger.error(err.stack)
                            error = err
                        }
                        return status
                    }

                } catch(err) {
                    basicErrorResponse('Discard', err)
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
                        PL.logger.error(error)
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
                        const {lookpath} = SA.nodeModules.lookpath
                        const gitpath = await lookpath('git');
                        if(gitpath === undefined) {
                            PL.logger.error('`git` not installed.')
                        } else {
                            // Reset main repo
                            await doGit().catch(errorResp)
                            // Reset each plugin repo
                            await Promise.all(Object.values(global.env.PROJECT_PLUGIN_MAP).map(v => {
                                return doGit(v.dir, v.repo)
                            })).catch(errorResp)

                            if(error === undefined) {
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
                        if(repo === 'Superalgos') options.baseDir = dir || process.cwd()
                        // if repo is not main app repo, assume it is a plugin, in ./Plugins.
                        else options.baseDir = SA.nodeModules.path.join(process.cwd(), 'Plugins', dir)
                        const git = simpleGit(options)
                        try {

                            // Check to see if upstream repo has been set
                            let remotes = await git.getRemotes(true).catch(errorResp);
                            let isUpstreamSet
                            for(let remote in remotes) {
                                if(remotes[remote].name === 'upstream') {
                                    isUpstreamSet = true
                                } else {
                                    isUpstreamSet = false
                                }
                            }

                            // If upstream has not been set. Set it now
                            if(isUpstreamSet === false) {
                                await git.addRemote('upstream', `https://github.com/Superalgos/${repo}`).catch(errorResp);
                            }

                            // Pull branch from upstream repo
                            await git.pull('upstream', currentBranch).catch(errorResp);
                            // Reset branch to match upstream repo
                            let upstreamLocation = `upstream/${currentBranch}`
                            await git.reset('hard', [upstreamLocation]).catch(errorResp)

                        } catch(err) {
                            PL.logger.error('Error changing current branch to ' + currentBranch)
                            PL.logger.error(err.stack)
                            error = err
                        }
                    }

                } catch(err) {
                    basicErrorResponse('Reset', err)
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

                PL.logger.info('Fixing App Schemas...')

                let projects = SA.projects.foundations.utilities.filesAndDirectories.getDirectories(global.env.PATH_TO_PROJECTS)
                let PROJECTS_MAP = new Map()
                let directoryCount = 0
                let allAppSchemas = []
                let allAppSchemasFilePaths = []
                let allAppSchemasFileProjects = []

                for(let i = 0; i < projects.length; i++) {
                    let project = projects[i]


                    const fs = SA.nodeModules.fs
                    let folder = 'App-Schema'
                    let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/'
                    SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories(filePath + folder, onFilesReady)

                    function onFilesReady(files) {
                        try {
                            let SCHEMA_MAP = new Map()

                            PL.logger.info('files.length... ' + files.length)

                            for(let k = 0; k < files.length; k++) {
                                let name = files[k]
                                let nameSplitted = name.split(folder)
                                let fileName = nameSplitted[1]
                                for(let i = 0; i < 10; i++) {
                                    fileName = fileName.replace('\\', '/')
                                }
                                let fileToRead = filePath + folder + fileName

                                PL.logger.info('Reading file... ' + fileToRead)

                                let fileContent = fs.readFileSync(fileToRead)
                                let schemaDocument
                                try {
                                    schemaDocument = JSON.parse(fileContent)
                                    SCHEMA_MAP.set(schemaDocument.type, schemaDocument)
                                    allAppSchemas.push(schemaDocument)
                                    allAppSchemasFilePaths.push(fileToRead)
                                    allAppSchemasFileProjects.push(project)
                                } catch(err) {
                                    PL.logger.warn('sendSchema -> Error Parsing JSON File: ' + fileToRead + ' .Error = ' + err.stack)
                                    continue
                                }
                            }
                            PROJECTS_MAP.set(project, SCHEMA_MAP)
                            directoryCount++

                            PL.logger.info('directoryCount = ' + directoryCount, 'projects.length = ' + projects.length)
                            //PL.logger.info(Array.from(PROJECTS_MAP.get(project).keys()))
                            if(directoryCount === projects.length) {
                                fixSchemas()
                            }
                        } catch(err) {
                            PL.logger.error(err.stack)
                        }
                    }
                }

                function fixSchemas() {
                    try {
                        PL.logger.info('fixSchemas...' + allAppSchemas.length)
                        let projects = SA.projects.foundations.utilities.filesAndDirectories.getDirectories(global.env.PATH_TO_PROJECTS)
                        //const fs = SA.nodeModules.fs
                        let needFixing = 0
                        for(let i = 0; i < allAppSchemas.length; i++) {
                            let schemaDocument = allAppSchemas[i]
                            let wasUpdated = false
                            for(let j = 0; j < schemaDocument.menuItems.length; j++) {
                                let menuItem = schemaDocument.menuItems[j]
                                if(menuItem.relatedUiObject !== undefined && menuItem.relatedUiObjectProject === undefined) {
                                    needFixing++

                                    let hits = 0
                                    let foundProject
                                    let multiProject = ''
                                    for(let k = 0; k < projects.length; k++) {
                                        let project = projects[k]

                                        let testDocument = PROJECTS_MAP.get(project).get(menuItem.relatedUiObject)
                                        if(testDocument !== undefined) {
                                            hits++
                                            foundProject = project
                                            multiProject = multiProject + ' -> ' + project

                                            let fileProject = allAppSchemasFileProjects[i]
                                            //PL.logger.info(fileProject, project)
                                            if(fileProject === project) {
                                                /* If the project of the file is the same as the project found, then we consider this a match*/
                                                hits = 1
                                                continue
                                            }
                                        }
                                    }

                                    if(hits === 0) {
                                        PL.logger.info('Problem With No Solution #' + needFixing, '         Type: ' + schemaDocument.type, '          Action: ' + menuItem.action, '              Related UI Object: ' + menuItem.relatedUiObject)
                                        PL.logger.info('This Node Type was NOT FOUND at any project. ' + menuItem.relatedUiObject)
                                        continue
                                    }
                                    if(hits === 1) {
                                        PL.logger.info('Problem With One Solution #' + needFixing, '         Type: ' + schemaDocument.type, '          Action: ' + menuItem.action, '              Related UI Object: ' + menuItem.relatedUiObject, '              Found Project:' + foundProject)

                                        menuItem.relatedUiObjectProject = foundProject
                                        wasUpdated = true
                                        continue
                                    }
                                    PL.logger.info('Problem With MULTIPLE Solutions #' + needFixing, '         Type: ' + schemaDocument.type, '          Action: ' + menuItem.action, '              Related UI Object: ' + menuItem.relatedUiObject, '              Found at these Projects:' + multiProject)
                                }
                            }

                            //if (wasUpdated === true) {
                            //let fileContent = JSON.stringify(schemaDocument, undefined, 4)
                            //let filePath = allAppSchemasFilePaths[i]
                            //PL.logger.info('Saving File at ' + filePath)
                            //PL.logger.info(fileContent)
                            //fs.writeFileSync(filePath, fileContent)
                            //}
                        }
                    } catch(err) {
                        PL.logger.error(err.stack)
                    }
                }

                break
            }
        }

        function basicErrorResponse(command, err) {
            PL.logger.error('httpInterface -> App -> ' + command + ' -> Method call produced an error.')
            PL.logger.error('httpInterface -> App -> ' + command + ' -> err.stack = ' + err.stack)

            let error = {
                result: 'Fail Because',
                message: err.message,
                stack: err.stack
            }
            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
        }

        function respondWithDocsObject(docs, error) {

            if(error.message !== undefined) {
                docs.placeholder.errorMessage = {
                    style: 'Error',
                    text: error.message
                }
            }
            if(error.stack !== undefined) {
                docs.placeholder.errorStack = {
                    style: 'Javascript',
                    text: error.stack
                }
            }
            if(error.status !== undefined) {
                docs.placeholder.errorCode = {
                    style: 'Json',
                    text: error.status
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
}