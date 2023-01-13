exports.newPluginsUtilitiesPluginsAtGithub = function () {

    let thisObject = {
        pushPluginFileAndPullRequest: pushPluginFileAndPullRequest
    }

    return thisObject

    async function pushPluginFileAndPullRequest(
        fileContent,
        token,
        repo,
        owner,
        filePath,
        fileName,
        branch
    ) {
        /*
        Create a Pull Request with the changed or new plugin, so that it can eventually be merged into
        the Superalgos Plugin repo.
        */
        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {

            const { Octokit } = SA.nodeModules.octokit
            const { retry } = SA.nodeModules.retry
            const RetryOctokit = Octokit.plugin(retry)
            const octokit = new RetryOctokit({
                auth: token,
                userAgent: 'Superalgos ' + SA.version
            })
            const completePath = filePath + '/' + fileName + '.json'
            const buff = new Buffer.from(fileContent, 'utf-8');
            const content = buff.toString('base64');
            try {
                const { data: { sha } } = await octokit.request('GET /repos/{owner}/{repo}/contents/{file_path}?ref={branch}', {
                    owner: owner,
                    repo: repo,
                    branch: branch,
                    file_path: completePath
                });
                if (sha) {
                    await octokit.repos.createOrUpdateFileContents({
                        owner: owner,
                        repo: repo,
                        path: completePath,
                        message: 'Profile Update from Social Trading App',
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
                        SA.logger.error('File could not be saved at Github.com. -> err.stack = ' + err.stack)
                        reject(err)
                    }
                }
    
                async function createNewFile() {
                    await octokit.repos.createOrUpdateFileContents({
                        owner: owner,
                        repo: repo,
                        path: completePath,
                        message: 'New Profile from Social Trading App',
                        content: content,
                        branch: branch
                    })
                        .then(githubSaysOK)
                        .catch(githubError)
                }

            async function githubSaysOK() {
                await octokit.rest.pulls.create({
                    owner: 'Superalgos',
                    repo: repo,
                    title: "Profile Update from Social Trading App",
                    head: owner + ":" + branch,
                    base: branch,
                  })
                .then(response => SA.logger.info('Pull Request #' + response.data.number +' created'))
                resolve()
            }

            function githubError(err) {
                SA.logger.error('Plugins at Github -> err.stack = ' + err.stack)
                reject(err)
            }
        }
    }
}