exports.newOpenStorageUtilitiesGithubStorage = function () {

    let thisObject = {
        saveFile: saveFile,
        loadFile: loadFile
    }

    return thisObject

    async function saveFile(fileName, filePath, fileContent, sotrageContainer) {

        const token = SA.secrets.apisSecrets.map.get(sotrageContainer.config.codeName).apiToken
        const { Octokit } = SA.nodeModules.octokit
        const octokit = new Octokit({
            auth: token,
            userAgent: 'Superalgos ' + SA.version
        })
        const repo = sotrageContainer.config.repositoryName
        const owner = sotrageContainer.config.githubUserName
        const branch = 'main'
        const message = 'Open Storage: New File.'
        const completePath = filePath + '/' + fileName + '.json'
        const { graphql } = SA.nodeModules.graphql
        const { repository } = await graphql(
            '{  ' +
            '  repository(name: "SuperAlgos", owner: "' + owner + '") {' +
            '    object(expression: "' + branch + ':' + completePath + '") {' +
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
                }
            }
        )

        if (
            repository.name === undefined ||
            repository.object === null
        ) {
            console.log('[ERROR] Github Storage -> Save File -> SHA graphql failed.')
            return
        }

        const sha = repository.object.oid

        if (
            sha === undefined
        ) {
            console.log('[ERROR] Github Storage -> Save File -> SHA calculation failed.')
            return
        }

        const buff = new Buffer.from(fileContent, 'utf-8');
        const content = buff.toString('base64');

        await octokit.repos.createOrUpdateFileContents({
            owner: owner,
            repo: repo,
            filePath: completePath,
            message: message,
            content: content,
            sha: sha,
            branch: branch
        })
    }

    async function loadFile(fileName, filePath, sotrageContainer) {

        const completePath = filePath + '/' + fileName + '.json'
        const repo = sotrageContainer.config.repositoryName
        const owner = sotrageContainer.config.githubUserName
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