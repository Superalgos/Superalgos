//const commitMessage = unescape(requestParameters[3])
const commitMessage = 'My Message'

contribute()

async function contribute() {
    await doGit()
    await doGithub()
    console.log('Finished')
}

async function doGit() {
    const simpleGit = require('simple-git');
    const options = {
        baseDir: process.cwd(),
        binary: 'git',
        maxConcurrentProcesses: 6,
    }
    const git = simpleGit(options)

    await git.add('./*')
    await git.commit(commitMessage)
    await git.push('origin', 'in-app-documentation')
}

async function doGithub() {

    const token = ""
    const { Octokit } = require("@octokit/rest")

    const octokit = new Octokit({
        auth: token,
        userAgent: 'Superalgos Beta 8'
    })

    const repo = 'Superalgos'
    const owner = 'Superalgos'
    const head = 'Luis-Fernando-Molina:in-app-documentation'
    const base = 'in-app-documentation'
    const title = 'My Contribution to Superalgos'

    await octokit.pulls.create({
        owner,
        repo,
        title,
        head,
        base,
    });
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
