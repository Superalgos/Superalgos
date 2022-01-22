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
        fileName
    ) {
        /*
        Create a Pull Request with the changed or new plugin, so that it can eventually be merged into
        the Superalgos Plugin repo.
        */
        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {

            const { Octokit } = SA.nodeModules.octokit
            const octokit = new Octokit({
                auth: token,
                userAgent: 'Superalgos ' + SA.version
            })
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
                        message: 'Plugin Update',
                        content: content,
                        branch: GOVERNANCE_PLUGINS_REPO_BRANCH,
                        sha: sha
                    })
                        .then(githubSaysOK)
                        .catch(githubError)
                } else {
                    await octokit.repos.createOrUpdateFileContents({
                        owner: owner,
                        repo: repo,
                        path: completePath,
                        message: 'New Plugin',
                        content: content,
                        branch: GOVERNANCE_PLUGINS_REPO_BRANCH,
                    })
                        .then(githubSaysOK)
                        .catch(githubError)
                }
            } catch (err) {
                reject(err)
            }

            function githubSaysOK() {
                resolve()
            }

            function githubError(err) {
                reject(err)
            }
        }
    }
}