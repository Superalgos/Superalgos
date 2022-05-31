const fs = require("fs")
const { exec } = require("child_process")
const path = require("path")
let ENVIRONMENT = require('../Environment')
const simpleGit = require("simple-git")
const {Octokit} = require("@octokit/rest");

let originUserName

const checkDirectory = (directory) => {
    if (!fs.existsSync(directory)) {
        return false
    }
    return true
}

async function checkRepository(remote, git) {
    const origin = remote.find(remote => remote.name === 'origin')
    if (!origin) {
        console.log('[ERROR] There are no remotes configured for this repository. Please add a remote to this repository and try again.');
        return false
    }
    originUserName = origin.refs.fetch.split('/')[3];
    const upstream = remote.find(remote => remote.name === 'upstream')
    let upstreamUsername
    //if there is no upstream, then we are adding remote
    if (!upstream) {
        const repo = origin.refs.fetch.split('/')[4];
        await git.addRemote('upstream', `https://github.com/Superalgos/${repo}.git`);
        upstreamUsername = 'Superalgos';
    } else {
        upstreamUsername = upstream.refs.fetch.split('/')[3];
    }

    if (upstreamUsername !== 'Superalgos') {
        console.log('[ERROR] Upstream repository username is wrong!: ' + upstreamUsername)
        return false;
    }
    return true;
}

function getCred() {
    let secretsDiv = global.env.PATH_TO_SECRETS
    if (fs.existsSync(secretsDiv)) {
        let rawFile = fs.readFileSync(secretsDiv + '/githubCredentials.json')
        return JSON.parse(rawFile)
    }
}

function updateRepo(cloneDir, repo) {
    const options = {
        baseDir: cloneDir,
        binary: 'git',
        maxConcurrentProcesses: 6,
    };
    const git = simpleGit(options)
    git.getRemotes(true).then(remote => {
        checkRepository(remote, git).then(r => {
            if (!r) {
                return false
            }
        })

    }).catch((err => {
        console.log(err)
    }));
    git.status((err) => {
        if (!err) {
            const branch = 'develop'
            git.fetch('upstream', branch)
            const token = getCred().githubToken

            const octokit = new Octokit({
                auth: token,
                userAgent: 'Superalgos'
            })

            octokit.git.getRef({
                owner: 'Superalgos',
                repo: repo,
                ref: `heads/${branch}`
            }).catch((err) => {
                console.log(err)
            }).then(value => {
                const sha = value.data.object.sha
                octokit.git.updateRef({
                    owner: originUserName,
                    repo: repo,
                    ref: `heads/${branch}`,
                    sha: sha,
                    force: true
                }).catch((err) => {
                    console.log(err)
                }).then(() => {
                    git.pull('origin', branch)
                })

            })
        } else {
            console.log(err)
        }
    })


    console.log(' ')
    console.log('[INFO] Updated (Pull) plugin repo from upstream Directory: ' + cloneDir)
}

const updateFromUpstreamPromise = async () => {
    let dir = process.cwd()
    let command = 'npm ci'
    new Promise(() => {
        let child = exec(command,
            {
                cwd: dir
            },
            (error, stdout) => {
                if (error) {
                    console.log('')
                    console.log('There was an error installing some dependencies error: ')
                    console.log('')
                    console.log(error)
                    process.exit(1)
                }
                console.log('')
                console.log(stdout)
            })
        child.stdout.pipe(process.stdout)
        child.on('exit', () => {

            // update plugin repos
            for (const propertyName in global.env.PROJECT_PLUGIN_MAP) {
                let cloneDir = path.join(global.env.PATH_TO_PLUGINS, global.env.PROJECT_PLUGIN_MAP[propertyName].dir)
                let repo = global.env.PROJECT_PLUGIN_MAP[propertyName].repo
                if (!checkDirectory(cloneDir)) {
                    console.log(`[INFO] Please run node setupPlugins <username> <github_token> to setup the plugins.`)
                    return 'No Plugins'
                }
                updateRepo(cloneDir, repo);
            }

            //update main repo
            updateRepo(process.cwd(), 'Superalgos');

            console.log('')
            console.log('[INFO] All repositories are updated.')
        })
    })
}

const run = () => {
    let ENVIRONMENT_MODULE = ENVIRONMENT.newEnvironment()
    global.env = ENVIRONMENT_MODULE

    updateFromUpstreamPromise()
}

module.exports = {
    run
}
