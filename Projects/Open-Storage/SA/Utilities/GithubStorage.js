exports.newOpenStorageUtilitiesGithubStorage = function () {

    let thisObject = {
        saveData: saveData,
        fetchData: fetchData
    }

    return thisObject

    async function saveData(fileName, filePath, fileContent, sotrageContainer) {

        const token = 'GET THE TOKEN FROM THE SECRETS FILE'
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
            console.log('[ERROR] Github Storage -> Save Data -> SHA graphql failed.')
            return
        }

        const sha = repository.object.oid

        if (
            sha === undefined
        ) {
            console.log('[ERROR] Github Storage -> Save Data -> SHA calculation failed.')
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

    async function fetchData(fileName, sotrageContainer) {

    }
}