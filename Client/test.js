
doIt()

async function doIt() {
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
