exports.newGithubServer = function newGithubServer() {

    let thisObject = {
        getGithubStars: getGithubStars,
        getGithubWatchers: getGithubWatchers,
        getGithubForks: getGithubForks,
        createGithubFork: createGithubFork,
        mergePullRequests: mergePullRequests,
        initialize: initialize,
        finalize: finalize,
        run: run
    }

    const GITHUB_API_WAITING_TIME = 250
    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    function run() {

    }

    async function getGithubStars(repository, username, token) {
        return await getGithubUsernames('activity', 'listStargazersForRepo', repository, username, token)
    }

    async function getGithubWatchers(repository, username, token) {
        return await getGithubUsernames('activity', 'listWatchersForRepo', repository, username, token)
    }

    async function getGithubForks(repository, username, token) {
        return await getGithubUsernames('repos', 'listForks', repository, username, token)
    }

    async function mergePullRequests(commitMessage, username, token) {
        return await mergeGithubPullRequests(commitMessage, username, token)
    }

    async function getGithubUsernames(endpoint, method, repository, username, token) {
        try {

            repository = unescape(repository)
            username = unescape(username)
            token = unescape(token)
            let error
            let githubListArray = []

            return await getRepoInfo()

            async function getRepoInfo() {
                await doGithub()
                if (error !== undefined) {

                    let docs = {
                        project: 'Governance',
                        category: 'Topic',
                        type: 'Gov Error - Get Repository Information',
                        anchor: undefined,
                        placeholder: {}
                    }

                    return respondWithDocsObject(docs, error)
                }

                return {
                    result: global.DEFAULT_OK_RESPONSE.result,
                    githubListArray: githubListArray
                }
            }

            async function doGithub() {

                const { Octokit } = SA.nodeModules.octokit

                const octokit = new Octokit({
                    auth: token,
                    userAgent: 'Superalgos ' + SA.version
                })
                await getList()

                async function getList() {
                    const repo = repository
                    const owner = 'Superalgos'
                    const per_page = 100 // Max
                    let page = 0
                    let lastPage = false

                    while (lastPage === false) {
                        try {
                            page++
                            await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                            let listResponse = await octokit[endpoint][method]({
                                owner,
                                repo,
                                per_page,
                                page
                            });

                            if (listResponse.data.length < 100) {
                                lastPage = true
                            }

                            for (let i = 0; i < listResponse.data.length; i++) {
                                let listItem = listResponse.data[i]
                                let githubUsername
                                switch (endpoint) {
                                    case 'activity': {
                                        githubUsername = listItem.login
                                        break
                                    }
                                    case 'repos': {
                                        githubUsername = listItem.owner.login
                                        break
                                    }
                                }
                                //console.log(listItem)

                                githubListArray.push(githubUsername)
                            }
                            console.log('[INFO] Github Server -> getRepoInfo -> doGithub -> getList -> ' + method + ' Page = ' + page)
                            console.log('[INFO] Github Server -> getRepoInfo -> doGithub -> getList -> ' + method + ' Received = ' + listResponse.data.length)

                        } catch (err) {
                            console.log(err)

                            if (err.stack.indexOf('last page') >= 0) {
                                return
                            } else {
                                console.log('[ERROR] Github Server -> getRepoInfo -> doGithub -> getList ->Method call produced an error.')
                                console.log('[ERROR] Github Server -> getRepoInfo -> doGithub -> getList ->err.stack = ' + err.stack)
                                console.log('[ERROR] Github Server -> getRepoInfo -> doGithub -> getList ->repository = ' + repository)
                                console.log('[ERROR] Github Server -> getRepoInfo -> doGithub -> getList ->username = ' + username)
                                console.log('[ERROR] Github Server -> getRepoInfo -> doGithub -> getList ->token starts with = ' + token.substring(0, 10) + '...')
                                console.log('[ERROR] Github Server -> getRepoInfo -> doGithub -> getList ->token ends with = ' + '...' + token.substring(token.length - 10))
                                error = err
                                return
                            }
                        }
                    }
                }
            }

        } catch (err) {
            console.log('[ERROR] Github Server -> getRepoInfo -> Method call produced an error.')
            console.log('[ERROR] Github Server -> getRepoInfo -> err.stack = ' + err.stack)
            console.log('[ERROR] Github Server -> getRepoInfo -> repository = ' + repository)
            console.log('[ERROR] Github Server -> getRepoInfo -> username = ' + username)
            console.log('[ERROR] Github Server -> getRepoInfo -> token starts with = ' + token.substring(0, 10) + '...')
            console.log('[ERROR] Github Server -> getRepoInfo -> token ends with = ' + '...' + token.substring(token.length - 10))

            let error = {
                result: 'Fail Because',
                message: err.message,
                stack: err.stack
            }
            return error
        }
    }

    async function createGithubFork(token) {
        try {
            token = unescape(token)

            await doGithub()

            async function doGithub() {
                try {
                    const { Octokit } = SA.nodeModules.octokit
                    const octokit = new Octokit({
                        auth: token,
                        userAgent: 'Superalgos ' + SA.version
                    })

                    await octokit.repos.createFork({
                        owner: 'Superalgos',
                        repo: 'Superalgos'
                    })
                } catch (err) {
                    if (err === undefined) { return }
                    console.log('[ERROR] Github Server -> createGithubFork -> doGithub -> err.stack = ' + err.stack)
                }
            }
        } catch (err) {
            console.log('[ERROR] Github Server -> createGithubFork -> Method call produced an error.')
            console.log('[ERROR] Github Server -> createGithubFork -> err.stack = ' + err.stack)
            console.log('[ERROR] Github Server -> createGithubFork -> repository = ' + repository)
            console.log('[ERROR] Github Server -> createGithubFork -> username = ' + username)
            console.log('[ERROR] Github Server -> createGithubFork -> token starts with = ' + token.substring(0, 10) + '...')
            console.log('[ERROR] Github Server -> createGithubFork -> token ends with = ' + '...' + token.substring(token.length - 10))

            let error = {
                result: 'Fail Because',
                message: err.message,
                stack: err.stack
            }
            return error
        }
    }

    async function mergeGithubPullRequests(commitMessage, username, token) {
        try {
            commitMessage = unescape(commitMessage)
            username = unescape(username)
            token = unescape(token)
            const repository = 'Superalgos'

            /* Unsavping # */
            for (let i = 0; i < 10; i++) {
                commitMessage = commitMessage.replace('_SLASH_', '/')
                commitMessage = commitMessage.replace('_HASHTAG_', '#')
            }

            let error
            let githubPrListArray = []

            return await processOpenPullRequests()

            async function processOpenPullRequests() {
                await doGithub()
                if (error !== undefined) {

                    let docs = {
                        project: 'Governance',
                        category: 'Topic',
                        type: 'Gov Error - Pull Requests Not Processed',
                        anchor: undefined,
                        placeholder: {}
                    }

                    return respondWithDocsObject(docs, error)
                }

                return {
                    result: global.DEFAULT_OK_RESPONSE.result
                }
            }

            async function doGithub() {
                try {
                    const repo = repository
                    const owner = 'Superalgos'
                    const { Octokit } = SA.nodeModules.octokit
                    const octokit = new Octokit({
                        auth: token,
                        userAgent: 'Superalgos ' + SA.version
                    })
                    await getPrList()
                    await mergePrs()
                    await closePrsToMaster()

                    async function getPrList() {

                        const per_page = 100 // Max
                        let page = 0
                        let lastPage = false

                        while (lastPage === false) {
                            try {
                                page++

                                await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)

                                let listResponse = await octokit.rest.pulls.list({
                                    owner: owner,
                                    repo: repo,
                                    state: 'open',
                                    head: 'develop',
                                    base: 'develop',
                                    sort: undefined,
                                    direction: undefined,
                                    per_page: per_page,
                                    page: page
                                });

                                if (listResponse.data.length < 100) {
                                    lastPage = true
                                }
                                console.log('[INFO] Github Server -> mergeGithubPullRequests -> doGithub -> getPrList -> Receiving Page = ' + page)
                                for (let i = 0; i < listResponse.data.length; i++) {
                                    let pullRequest = listResponse.data[i]
                                    console.log('[INFO] Github Server -> mergeGithubPullRequests -> doGithub -> getPrList -> Pull Request "' + pullRequest.title + '" found and added to the list to validate. ')
                                    githubPrListArray.push(pullRequest)
                                }
                                console.log('[INFO] Github Server -> mergeGithubPullRequests -> doGithub -> getPrList -> Received = ' + listResponse.data.length)

                            } catch (err) {
                                console.log(err)

                                if (err.stack.indexOf('last page') >= 0) {
                                    return
                                } else {
                                    console.log('[ERROR] Github Server -> mergeGithubPullRequests -> doGithub -> getPrList ->Method call produced an error.')
                                    console.log('[ERROR] Github Server -> mergeGithubPullRequests -> doGithub -> getPrList ->err.stack = ' + err.stack)
                                    console.log('[ERROR] Github Server -> mergeGithubPullRequests -> doGithub -> getPrList ->repository = ' + repository)
                                    console.log('[ERROR] Github Server -> mergeGithubPullRequests -> doGithub -> getPrList ->username = ' + username)
                                    console.log('[ERROR] Github Server -> mergeGithubPullRequests -> doGithub -> getPrList ->token starts with = ' + token.substring(0, 10) + '...')
                                    console.log('[ERROR] Github Server -> mergeGithubPullRequests -> doGithub -> getPrList ->token ends with = ' + '...' + token.substring(token.length - 10))
                                    error = err
                                    return
                                }
                            }
                        }
                    }

                    async function mergePrs() {
                        /*
                        In order to automatically merge a PRs we will run several validations first.
                        We want to automate specifically the merging of Profile File changes at the
                        Governance System done by the same Github user name that matches the profile
                        changed. We will also not do the merge if there are more than one file at the 
                        PR. 

                        We will go through the list of open PRs and run the validations at each one of them.
                        */
                        console.log('[INFO] Github Server -> mergeGithubPullRequests -> Ready to Validate ' + githubPrListArray.length + ' pull requests. ')

                        for (let i = 0; i < githubPrListArray.length; i++) {
                            let pullRequest = githubPrListArray[i]
                            /*
                            Lets get the files changed at this Pull Request.
                            */
                            let filesChanged = []
                            const per_page = 100 // Max
                            let page = 0
                            let lastPage = false

                            while (lastPage === false) {
                                page++
                                await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                let listResponse = await octokit.rest.pulls.listFiles({
                                    owner: owner,
                                    repo: repo,
                                    pull_number: pullRequest.number,
                                    per_page: per_page,
                                    page: page
                                });

                                if (listResponse.data.length < 100) {
                                    lastPage = true
                                }
                                for (let i = 0; i < listResponse.data.length; i++) {
                                    let listItem = listResponse.data[i]
                                    filesChanged.push(listItem)
                                }
                            }
                            let fileContentUrl  // URL to the only file at the PR
                            let fileContent     // File content of the only file at the PR
                            let userProfile     // User Profile Object
                            let githubUsername  // The Github user name of who is submitting the Pull Request
                            let mergeResponse   // The response received from the call to Github to merge the Pull Request

                            if (await validatePrHasMoreThanOneFile() === false) { continue }
                            if (await validateFileNameEqualsGithubUsername() === false) { continue }
                            if (await validateFileChangedIsUserProfile() === false) { continue }
                            if (await validateMessageSignedIsGithubUsername() === false) { continue }
                            if (await validateMessageSignedHashIsSignatureHash() === false) { continue }
                            if (await validateUserProfileNodeNameEqualsGithubUsername() === false) { continue }
                            if (await validateUserProfileIdDoesNotBelongtoAnotherUserProfile() === false) { continue }
                            if (await validateUserProfileBlockchainAccountDoesNotBelongtoAnotherUserProfile() === false) { continue }
                            if (await validateUserProfileSigningAccountsDoesNotBelongtoAnotherUserProfile() === false) { continue }

                            /*
                                TODO: We need to check before merging a User Profile that none of id of the node of the profile hierearchy exists at any other
                                User Profile already at the repository, to avoid atacts of users highjacking references of other user profiles. 
                            */

                            if (await mergePullRequest() === false) {
                                console.log('[WARN] Github Server -> mergeGithubPullRequests -> Merge Failed -> Pull Request "' + pullRequest.title + '" not merged because Github could not merge it. -> mergeResponse.message = ' + mergeResponse.data.message)
                            } else {
                                console.log('[INFO] Github Server -> mergeGithubPullRequests -> Merge Succeed -> Pull Request "' + pullRequest.title + '" successfully merged. -> mergeResponse.message = ' + mergeResponse.data.message)
                                await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                await octokit.rest.issues.createComment({
                                    owner: owner,
                                    repo: repo,
                                    issue_number: pullRequest.number,
                                    body: 'This Pull Request was automatically merged by the Superalgos Governance System because it was detected that the Github User " ' + githubUsername + '" who submitted it, modified its own User Profile Plugin File and nothing else but that file. All validations were successful.'
                                });
                            }

                            async function validatePrHasMoreThanOneFile() {
                                /*
                                Validation #1: If the PR has more than one file, then we will not automatically
                                merge it.
                                */
                                if (filesChanged.length !== 1) {
                                    console.log('[INFO] Github Server -> mergeGithubPullRequests -> Validation #1 Failed -> Pull Request "' + pullRequest.title + '" not merged because it contains more than 1 file. -> fileCount = ' + filesChanged.length)
                                    /*
                                    We will close PRs that contains any User Profile file together with other files in the same Pull Request.
                                    This will avoid manual merges to include User Profile files.
                                    */
                                    for (let j = 0; j < filesChanged.length; j++) {
                                        let pullRequestFile = filesChanged[j]
                                        let fileContentUrl = pullRequestFile.raw_url
                                        if (fileContentUrl.indexOf('Governance/Plugins/User-Profiles') >= 0) {
                                            await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                            await octokit.rest.issues.createComment({
                                                owner: owner,
                                                repo: repo,
                                                issue_number: pullRequest.number,
                                                body: 'This Pull Request could not be automatically merged and was closed by the Superalgos Governance System because it was detected that a User Profile file... \n\n' + fileContentUrl + '\n\n...was submitted together with  ' + (filesChanged.length - 1) + ' other file/s. User Profiles files as per the Governance System rules, must be the only file present at a Pull Request in order to pass all the validations and be automatically merged. \n\n If you intentionally submitted the extra files, the way to get your work merged is by first removing your User Profile file from the Plugins folder at your local installation and executing an app.contribute again. Then wait until the PR is merged (manually reviewed) and after that you put your User Profile file again and create a new PR only with that file with an app.contribute. That last PR should be merged automatically.'
                                            });

                                            await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                            await octokit.rest.pulls.update({
                                                owner: owner,
                                                repo: repo,
                                                pull_number: pullRequest.number,
                                                state: 'closed'
                                            });
                                            break
                                        }
                                    }
                                    return false
                                }
                            }

                            async function validateFileNameEqualsGithubUsername() {
                                /*
                                Validation #2: File Name must be the same to the Github Username of the PR owner.
                                */
                                let pullRequestFile = filesChanged[0]
                                fileContentUrl = pullRequestFile.raw_url

                                if (fileContentUrl.indexOf('Governance/Plugins/User-Profiles') < 0) {
                                    /*
                                    If it is not a user profile then there is no need to auto merge.
                                    */
                                    console.log('[INFO] Github Server -> mergeGithubPullRequests -> Validation #2 Failed -> Pull Request "' + pullRequest.title + '" not merged because the file modified at the Pull Request is not a User Profile file. -> fileContentUrl = ' + fileContentUrl)
                                    return false
                                }

                                let splittedURL = fileContentUrl.split('/')
                                let fileName = splittedURL[splittedURL.length - 1]
                                let splittedFileName = fileName.split('.')
                                fileName = splittedFileName[0]
                                githubUsername = pullRequest.user.login

                                if (githubUsername.toLowerCase() !== fileName.toLowerCase()) {
                                    console.log('[INFO] Github Server -> mergeGithubPullRequests -> Validation #2 Failed -> Pull Request "' + pullRequest.title + '" not merged because the Github Username is not equal to the File Name. -> Github Username = ' + githubUsername + '-> fileName = ' + fileName)

                                    await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                    await octokit.rest.issues.createComment({
                                        owner: owner,
                                        repo: repo,
                                        issue_number: pullRequest.number,
                                        body: 'This Pull Request could not be automatically merged and was closed by the Superalgos Governance System because it was detected that the Github User "' + githubUsername + '" who submitted it, is not equal to the name of the User Profile Plugin File.\n\n File Name = "' + fileName + '"'
                                    });

                                    await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                    await octokit.rest.pulls.update({
                                        owner: owner,
                                        repo: repo,
                                        pull_number: pullRequest.number,
                                        state: 'closed'
                                    });
                                    return false
                                }
                            }

                            async function validateFileChangedIsUserProfile() {
                                /*
                                Validation #3: The file changed at the PR is a User Profile.
                                */
                                await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                fileContent = await PL.projects.foundations.utilities.webAccess.fetchAPIDataFile(fileContentUrl)
                                userProfile = JSON.parse(fileContent)

                                if (userProfile.type !== 'User Profile') {
                                    console.log('[INFO] Github Server -> mergeGithubPullRequests -> Validation #3 Failed -> Pull Request "' + pullRequest.title + '" not merged because the file modified is not a User Profile. -> Type = ' + userProfile.type)
                                    return false
                                }
                            }

                            async function validateMessageSignedIsGithubUsername() {
                                /*
                                Validation #4: The message signed at the config is not the Github Username.
                                */
                                let config = JSON.parse(userProfile.config)
                                let messageSigned = config.signature.message
                                if (messageSigned.toLowerCase() !== githubUsername.toLowerCase()) {
                                    console.log('[INFO] Github Server -> mergeGithubPullRequests -> Validation #4 Failed -> Pull Request "' + pullRequest.title + '" not merged because the Github Username is not equal to the Message Signed at the User Profile. -> Github Username = ' + githubUsername + '-> messageSigned = ' + messageSigned)

                                    await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                    await octokit.rest.issues.createComment({
                                        owner: owner,
                                        repo: repo,
                                        issue_number: pullRequest.number,
                                        body: 'This Pull Request could not be automatically merged and was closed by the Superalgos Governance System because it was detected that the Github User "' + githubUsername + '" who submitted it, is not equal to the Message Signed at the User Profile.\n\n Message Signed = "' + messageSigned + '"'
                                    });

                                    await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                    await octokit.rest.pulls.update({
                                        owner: owner,
                                        repo: repo,
                                        pull_number: pullRequest.number,
                                        state: 'closed'
                                    });
                                    return false
                                }
                            }

                            async function validateMessageSignedHashIsSignatureHash() {
                                /*
                                Validation #5: The message signed has is equal to the signature messageHash.
                                */
                                let config = JSON.parse(userProfile.config)

                                let serverResponse = await PL.servers.WEB3_SERVER.hashData(
                                    config.signature.message
                                )
                                let messageSignedHash = serverResponse.hash
                                let signatureHash = config.signature.messageHash

                                if (messageSignedHash !== signatureHash) {
                                    console.log('[INFO] Github Server -> mergeGithubPullRequests -> Validation #5 Failed -> Pull Request "' + pullRequest.title + '" not merged because the Message Signed Hash is not equal to the the Signature Hash. -> messageSignedHash = ' + messageSignedHash + '-> signatureHash = ' + signatureHash)

                                    await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                    await octokit.rest.issues.createComment({
                                        owner: owner,
                                        repo: repo,
                                        issue_number: pullRequest.number,
                                        body: 'This Pull Request could not be automatically merged and was closed by the Superalgos Governance System because the Message Signed Hash is not equal to the the Signature Hash.\n\n messageSignedHash = "' + messageSignedHash + '"\n\n signatureHash = "' + signatureHash + '"'
                                    });

                                    await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                    await octokit.rest.pulls.update({
                                        owner: owner,
                                        repo: repo,
                                        pull_number: pullRequest.number,
                                        state: 'closed'
                                    });
                                    return false
                                }
                            }

                            async function validateUserProfileNodeNameEqualsGithubUsername() {
                                /*
                                Validation #6: The name of the User Profile node is not the Github Username.
                                */
                                if (userProfile.name.toLowerCase() !== githubUsername.toLowerCase()) {
                                    console.log('[INFO] Github Server -> mergeGithubPullRequests -> Validation #6 Failed -> Pull Request "' + pullRequest.title + '" not merged because the Github Username is not equal to the User Profile node\'s name. -> Github Username = ' + githubUsername + '-> userProfile.name = ' + userProfile.name)

                                    await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                    await octokit.rest.issues.createComment({
                                        owner: owner,
                                        repo: repo,
                                        issue_number: pullRequest.number,
                                        body: 'This Pull Request could not be automatically merged and was closed by the Superalgos Governance System because it was detected that the Github User "' + githubUsername + '" who submitted it, is not equal to the User Profile node\'s name.\n\n User Profile Name = "' + userProfile.name + '"'
                                    });

                                    await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                    await octokit.rest.pulls.update({
                                        owner: owner,
                                        repo: repo,
                                        pull_number: pullRequest.number,
                                        state: 'closed'
                                    });
                                    return false
                                }
                            }

                            async function validateUserProfileIdDoesNotBelongtoAnotherUserProfile() {
                                /*
                                Validation #7: The id of the User Profile can not be the id of an already existing User Profile
                                unless the existing one belongs to the same Github username.
                                */
                                let userProfileIdMap = new Map()
                                let pluginFileNames = await SA.projects.communityPlugins.utilities.plugins.getPluginFileNames(
                                    'Governance',
                                    'User-Profiles'
                                )
                                for (let i = 0; i < pluginFileNames.length; i++) {
                                    let pluginFileName = pluginFileNames[i]

                                    let pluginFileContent = await SA.projects.communityPlugins.utilities.plugins.getPluginFileContent(
                                        'Governance',
                                        'User-Profiles',
                                        pluginFileName
                                    )

                                    let otherUserProfile = JSON.parse(pluginFileContent)
                                    userProfileIdMap.set(otherUserProfile.id, otherUserProfile.name)
                                }

                                let testUserProfile = userProfileIdMap.get(userProfile.id)
                                if (testUserProfile === undefined) { return true }
                                if (testUserProfile !== userProfile.name) {

                                    console.log('[INFO] Github Server -> mergeGithubPullRequests -> Validation #7 Failed -> Pull Request "' + pullRequest.title + '" not merged because the User Profile Id already exists and belongs to another User Profile on record. -> Profile Id = ' + userProfile.id + '-> User Profile with the same Id = ' + testUserProfile)

                                    await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                    await octokit.rest.issues.createComment({
                                        owner: owner,
                                        repo: repo,
                                        issue_number: pullRequest.number,
                                        body: 'This Pull Request could not be automatically merged and was closed by the Superalgos Governance System because the User Profile Id already exists and belongs to another User Profile on record. \n\nUser Profile Id = "' + userProfile.id + '" \n\n User Profile with the same Id = "' + testUserProfile + '"'
                                    });

                                    await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                    await octokit.rest.pulls.update({
                                        owner: owner,
                                        repo: repo,
                                        pull_number: pullRequest.number,
                                        state: 'closed'
                                    });
                                    return false
                                }
                            }

                            async function validateUserProfileBlockchainAccountDoesNotBelongtoAnotherUserProfile() {
                                try {
                                    /*
                                    Validation #8 The blockchain account of the User Profile can not be the 
                                    blockchain account of an already existing User Profile
                                    unless the existing one belongs to the same Github username.
                                    */
                                    let userProfileIdMap = new Map()
                                    let pluginFileNames = await SA.projects.communityPlugins.utilities.plugins.getPluginFileNames(
                                        'Governance',
                                        'User-Profiles'
                                    )
                                    for (let i = 0; i < pluginFileNames.length; i++) {
                                        let pluginFileName = pluginFileNames[i]
                                        let pluginFileContent = await SA.projects.communityPlugins.utilities.plugins.getPluginFileContent(
                                            'Governance',
                                            'User-Profiles',
                                            pluginFileName
                                        )

                                        let otherUserProfile = JSON.parse(pluginFileContent)

                                        let config = JSON.parse(otherUserProfile.config)
                                        let messageSigned = JSON.stringify(config.signature)
                                        let serverResponse = await PL.servers.WEB3_SERVER.recoverAddress(
                                            messageSigned
                                        )
                                        userProfileIdMap.set(serverResponse.address, otherUserProfile.name)
                                    }

                                    let config = JSON.parse(userProfile.config)
                                    let messageSigned = JSON.stringify(config.signature)
                                    let serverResponse = await PL.servers.WEB3_SERVER.recoverAddress(
                                        messageSigned
                                    )

                                    let testUserProfile = userProfileIdMap.get(serverResponse.address)
                                    if (testUserProfile === undefined) { return true }
                                    if (testUserProfile !== userProfile.name) {

                                        console.log('[INFO] Github Server -> mergeGithubPullRequests -> Validation #8 Failed -> Pull Request "' + pullRequest.title + '" not merged because the User Profile Blockchain Account already exists and belongs to another User Profile on record. -> Profile Blockchain Account = ' + serverResponse.address + '-> User Profile with the same Blockchain Account = ' + testUserProfile)

                                        await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                        await octokit.rest.issues.createComment({
                                            owner: owner,
                                            repo: repo,
                                            issue_number: pullRequest.number,
                                            body: 'This Pull Request could not be automatically merged and was closed by the Superalgos Governance System because the User Profile Blockchain Account already exists and belongs to another User Profile on record. \n\nUser Profile Blockchain Account = "' + serverResponse.address + '" \n\n User Profile with the same Blockchain Account = "' + testUserProfile + '"'
                                        });

                                        await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                        await octokit.rest.pulls.update({
                                            owner: owner,
                                            repo: repo,
                                            pull_number: pullRequest.number,
                                            state: 'closed'
                                        });
                                        return false
                                    }
                                } catch (err) {
                                    console.log(err.stack)
                                }
                            }

                            async function validateUserProfileSigningAccountsDoesNotBelongtoAnotherUserProfile() {
                                try {

                                    if (userProfile.signingAccounts === undefined) { return true }

                                    for (let i = 0; i < userProfile.signingAccounts.signingAccounts.length; i++) {
                                        let signingAccount = userProfile.signingAccounts.signingAccounts[i]
                                        let config = JSON.parse(signingAccount.config)
                                        /*
                                        Validation #9 Signing accounts of the User Profile 
                                        must have a signature of the same Github username of the User Profile.
                                        */
                                        let messageSigned = config.signature.message

                                        if (messageSigned.toLowerCase() !== githubUsername.toLowerCase()) {
                                            console.log('[INFO] Github Server -> mergeGithubPullRequests -> Validation #9 Failed -> Pull Request "' + pullRequest.title + '" not merged because the Signing Account ' + signingAccount.name + ' has not signed the current Github User Account, but something else. -> messageSigned = ' + messageSigned + '-> githubUsername = ' + githubUsername)

                                            await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                            await octokit.rest.issues.createComment({
                                                owner: owner,
                                                repo: repo,
                                                issue_number: pullRequest.number,
                                                body: 'This Pull Request could not be automatically merged and was closed by the Superalgos Governance System because the Signing Account "' + signingAccount.name + '" has not signed the current Github User Account, but something else. \n\n messageSigned = "' + messageSigned + '" \n\n githubUsername = "' + githubUsername + '"'
                                            });

                                            await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                            await octokit.rest.pulls.update({
                                                owner: owner,
                                                repo: repo,
                                                pull_number: pullRequest.number,
                                                state: 'closed'
                                            });
                                            return false
                                        }
                                        /*
                                        Validation #10: The message signed has is equal to the signature messageHash.
                                        */
                                        let serverResponse = await PL.servers.WEB3_SERVER.hashData(
                                            config.signature.message
                                        )
                                        let messageSignedHash = serverResponse.hash
                                        let signatureHash = config.signature.messageHash

                                        if (messageSignedHash !== signatureHash) {
                                            console.log('[INFO] Github Server -> mergeGithubPullRequests -> Validation #10 Failed -> Pull Request "' + pullRequest.title + '" not merged because the Message Signed Hash is not equal to the the Signature Hash. -> messageSignedHash = ' + messageSignedHash + '-> signatureHash = ' + signatureHash)

                                            await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                            await octokit.rest.issues.createComment({
                                                owner: owner,
                                                repo: repo,
                                                issue_number: pullRequest.number,
                                                body: 'This Pull Request could not be automatically merged and was closed by the Superalgos Governance System because the Message Signed Hash is not equal to the the Signature Hash.\n\n messageSignedHash = "' + messageSignedHash + '"\n\n signatureHash = "' + signatureHash + '"'
                                            });

                                            await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                            await octokit.rest.pulls.update({
                                                owner: owner,
                                                repo: repo,
                                                pull_number: pullRequest.number,
                                                state: 'closed'
                                            });
                                            return false
                                        }
                                    }

                                    return true
                                } catch (err) {
                                    console.log(err.stack)
                                }
                            }

                            async function mergePullRequest() {
                                /*
                                All validations passed, we will proceed an merge this Pull Request.
                                */
                                await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                mergeResponse = await octokit.rest.pulls.merge({
                                    owner: owner,
                                    repo: repo,
                                    pull_number: pullRequest.number,
                                    commit_title: 'Changes in User Profile done by Profile Owner ' + githubUsername + ' automatically merged by Superalgos.'
                                });
                                return mergeResponse.data.merged
                            }
                        }
                    }

                    async function closePrsToMaster() {

                        let githubPrListMaster = []
                        const per_page = 100 // Max
                        let page = 0

                        try {
                            page++

                            await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)

                            let listResponse = await octokit.rest.pulls.list({
                                owner: owner,
                                repo: repo,
                                state: 'open',
                                head: undefined,
                                base: 'master',
                                sort: undefined,
                                direction: undefined,
                                per_page: per_page,
                                page: page
                            });

                            if (listResponse.data.length < 100) {
                                lastPage = true
                            }
                            console.log('[INFO] Github Server -> mergeGithubPullRequests -> doGithub -> closePrsToMaster -> Receiving Page = ' + page)
                            for (let i = 0; i < listResponse.data.length; i++) {
                                let pullRequest = listResponse.data[i]
                                console.log('[INFO] Github Server -> mergeGithubPullRequests -> doGithub -> closePrsToMaster -> Pull Request "' + pullRequest.title + '" found and added to the list to validate. ')
                                githubPrListMaster.push(pullRequest)
                            }
                            console.log('[INFO] Github Server -> mergeGithubPullRequests -> doGithub -> closePrsToMaster -> Received = ' + listResponse.data.length)

                            for (let i = 0; i < githubPrListMaster.length; i++) {
                                let pullRequest = githubPrListMaster[i]

                                await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                await octokit.rest.issues.createComment({
                                    owner: owner,
                                    repo: repo,
                                    issue_number: pullRequest.number,
                                    body: 'Hi, this is the Superalgos Governance System taking notice that you have submitted a pull request directly to the master branch.\n\nThanks for submitting a PR to the Superalgos Project. We value every contribution and everyone is welcome to send PRs. Unfortunately we are not merging pull requests directly into the master branch. Consider resubmitting to the develop branch instead. For your convenience, you can switch branches from within the app, at the footer of the Docs tab. \n\n I will close this pull request now and look forward for your next contribution either to the develop branch or any other branch available for this purpose.'
                                });

                                await PL.projects.foundations.utilities.asyncFunctions.sleep(GITHUB_API_WAITING_TIME)
                                await octokit.rest.pulls.update({
                                    owner: owner,
                                    repo: repo,
                                    pull_number: pullRequest.number,
                                    state: 'closed'
                                });
                            }

                        } catch (err) {
                            console.log(err)

                            if (err.stack.indexOf('last page') >= 0) {
                                return
                            } else {
                                console.log('[ERROR] Github Server -> mergeGithubPullRequests -> doGithub -> closePrsToMaster ->Method call produced an error.')
                                console.log('[ERROR] Github Server -> mergeGithubPullRequests -> doGithub -> closePrsToMaster ->err.stack = ' + err.stack)
                                console.log('[ERROR] Github Server -> mergeGithubPullRequests -> doGithub -> closePrsToMaster ->repository = ' + repository)
                                console.log('[ERROR] Github Server -> mergeGithubPullRequests -> doGithub -> closePrsToMaster ->username = ' + username)
                                console.log('[ERROR] Github Server -> mergeGithubPullRequests -> doGithub -> closePrsToMaster ->token starts with = ' + token.substring(0, 10) + '...')
                                console.log('[ERROR] Github Server -> mergeGithubPullRequests -> doGithub -> closePrsToMaster ->token ends with = ' + '...' + token.substring(token.length - 10))
                                error = err
                                return
                            }
                        }

                    }

                } catch (err) {
                    if (err === undefined) { return }
                    console.log('[ERROR] Github Server -> mergeGithubPullRequests -> doGithub -> err.stack = ' + err.stack)
                }
            }

        } catch (err) {
            console.log('[ERROR] Github Server -> mergeGithubPullRequests -> Method call produced an error.')
            console.log('[ERROR] Github Server -> mergeGithubPullRequests -> err.stack = ' + err.stack)
            console.log('[ERROR] Github Server -> mergeGithubPullRequests -> repository = ' + repository)
            console.log('[ERROR] Github Server -> mergeGithubPullRequests -> username = ' + username)
            console.log('[ERROR] Github Server -> mergeGithubPullRequests -> token starts with = ' + token.substring(0, 10) + '...')
            console.log('[ERROR] Github Server -> mergeGithubPullRequests -> token ends with = ' + '...' + token.substring(token.length - 10))

            let error = {
                result: 'Fail Because',
                message: err.message,
                stack: err.stack
            }
            return error
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

        return customResponse
    }
}