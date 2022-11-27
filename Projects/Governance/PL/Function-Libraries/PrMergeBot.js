exports.newGovernanceFunctionLibraryPrMergeBot = function () {

    let thisObject = {
        run: run,
    }

    return thisObject

    async function run (commitMessage, username, token) {

        let serverResponse = await PL.servers.GITHUB_SERVER.mergePullRequests(
            commitMessage,
            username,
            token
        )

        setInterval(
            PL.servers.GITHUB_SERVER.mergePullRequests,
            60000,
            commitMessage,
            username,
            token
        )

        return serverResponse
    }
}