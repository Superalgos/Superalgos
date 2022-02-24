exports.newOpenStorageUtilitiesGithubStorage = function () {

    let thisObject = {
        saveFile: saveFile,
        loadFile: loadFile
    }

    return thisObject

    async function saveFile(fileName, filePath, fileContent, storageContainer) {

        let promise = new Promise(saveAtGithub)

        async function saveAtGithub(resolve, reject) {

            const secret = SA.secrets.apisSecrets.map.get(storageContainer.config.codeName)
            if (secret === undefined) {
                console.log('[WARN] You need at the Apis Secrets File a record for the codeName = ' + storageContainer.config.codeName)
                reject()
                return
            }
            const token = secret.apiToken
            const { Octokit } = SA.nodeModules.octokit
            const octokit = new Octokit({
                auth: token,
                userAgent: 'Superalgos ' + SA.version
            })
            const repo = storageContainer.config.repositoryName
            const owner = storageContainer.config.githubUserName
            const branch = 'main'
            const message = 'Open Storage: New File.'
            const completePath = filePath + '/' + fileName + '.json'
            const buff = new Buffer.from(fileContent, 'utf-8');
            const content = buff.toString('base64');

            try {
                const { data: { sha } } = await octokit.request('GET /repos/{owner}/{repo}/contents/{file_path}', {
                    owner: owner,
                    repo: repo,
                    file_path: completePath
                });
                if (sha) {
                    await octokit.repos.createOrUpdateFileContents({
                        owner: owner,
                        repo: repo,
                        path: completePath,
                        message: message,
                        content: content,
                        branch: branch,
                        sha: sha
                    })
                        .then(githubSaysOK)
                        .catch(githubError)
                } else {
                    createNewFile()
                }

            } catch (err) {
                if (err.status === 404) {
                    createNewFile()
                } else {
                    console.log('[ERROR] File could not be saved at Github.com. -> err.stack = ' + err.stack)
                    reject(err)
                }
            }

            async function createNewFile() {
                await octokit.repos.createOrUpdateFileContents({
                    owner: owner,
                    repo: repo,
                    path: completePath,
                    message: message,
                    content: content,
                    branch: branch,
                })
                    .then(githubSaysOK)
                    .catch(githubError)
            }

            function githubSaysOK() {
                resolve()
            }

            function githubError(err) {
                console.log('[ERROR] Github Storage -> saveFile -> err.stack = ' + err.stack)
                reject()
            }
        }

        return promise
    }

    async function loadFile(fileName, filePath, storageContainer) {

        const completePath = filePath + '/' + fileName + '.json'
        const repo = storageContainer.config.repositoryName
        const owner = storageContainer.config.githubUserName
        const branch = 'main'
        const URL = "https://raw.githubusercontent.com/" + owner + "/" + repo + "/" + branch + "/" + completePath
        /*
        This function helps a caller to use await syntax while the called
        function uses callbacks, specifically for retrieving files.
        */
        let promise = new Promise((resolve, reject) => {

            const axios = SA.nodeModules.axios
            axios
                .get(URL)
                .then(res => {
                    //console.log(`statusCode: ${res.status}`)

                    resolve(res.data)
                })
                .catch(error => {
                    console.error('[ERROR] Github Storage -> Load File -> Error = ' + error)
                    reject()
                })
        })

        return promise
    }
}