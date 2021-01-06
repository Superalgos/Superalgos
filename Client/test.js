githubTest()
//gitTest()


async function githubTest() {

    const token = ""
    const { Octokit } = require("@octokit/rest")

    const octokit = new Octokit({
        auth: token,
        userAgent: 'Superalgos Beta 8',
        //previews: ['jean-grey', 'symmetra'],
        //timeZone: 'Europe/London',
        //baseUrl: 'https://api.github.com',
        /*
        log: {
            debug: () => { },
            info: () => { },
            warn: console.warn,
            error: console.error
        },
        request: {
            agent: undefined,
            fetch: undefined,
            timeout: 0
        }
        */
    })

    const repo = 'Superalgos'
    const owner = 'Luis-Fernando-Molina'
    const username = 'Luis-Fernando-Molina'
    const head = 'Luis-Fernando-Molina:in-app-documentation'
    const base = 'in-app-documentation'

    /*
    let user = await octokit.users.getByUsername({
        username,
    });

    let superalgosRepo = await octokit.repos.get({
        owner,
        repo,
      });
    */

    let pullRequest = await octokit.pulls.create({
        owner,
        repo,
        head,
        base,
    });

    console.log(pullRequest)
}




async function gitTest() {
    const simpleGit = require('simple-git');
    const options = {
        baseDir: process.cwd(),
        binary: 'git',
        maxConcurrentProcesses: 6,
    }
    const git = simpleGit(options)

    let remotes = await git.getRemotes(true)



    console.log('JSON remotes list: ', JSON.stringify(remotes))
    console.log('remotes list: ', remotes)
}
