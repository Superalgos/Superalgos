run()

async function run() {
    let username = process.argv[2]
    let token = process.argv[3]
    let ENVIRONMENT = require('./Environment.js')
    let ENVIRONMENT_MODULE = ENVIRONMENT.newEnvironment()
    global.env = ENVIRONMENT_MODULE

    // Save github credentials for later
    const credentials = {
        "githubUsername": username,
        "githubToken": token
    }
    const fs = require("fs")
    let secretsDir = "./My-Secrets"
    // Make sure My-Secrets has been created
    if (!fs.existsSync(secretsDir)) {
        fs.mkdirSync(secretsDir)
    }
    fs.writeFile(secretsDir + "/githubCredentials.json", JSON.stringify(credentials), function(err) {
        if(err) {
            console.log('[ERROR] Github Credentials were not saved correctly ' + err)
        }
    } )


    await forkPluginRepos(username, token)
    clonePluginRepos(username)

    async function forkPluginRepos(username, token) {

        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {
            if (username === undefined || token === undefined) {
                console.log('[WARN] You need to provide your Github username and token in order for this script to Fork the Plugins repositories into your acccount for you.')
                console.log('[WARN] Add your user name and token to the parameters of this script and try again please. ')
                resolve()
                return
            }
            const Octokit = require('@octokit/rest').Octokit
            const octokit = new Octokit({
                auth: token,
                userAgent: 'Superalgos'
            })
            let reponsesCount = 0
            for (const propertyName in global.env.PROJECT_PLUGIN_MAP) {
                let repo = global.env.PROJECT_PLUGIN_MAP[propertyName].repo

                await octokit.repos.get({
                    owner: username,
                    repo: repo,
                })
                    .then(async err => {
                        console.log('[INFO] Dont need to fork plugin repo Superalgos/' + repo + ' because a fork already exists at the ' + username + ' account.')
                        reponsesCount++
                        if (reponsesCount === Object.keys(global.env.PROJECT_PLUGIN_MAP).length) { resolve() }
                    })
                    .catch(async err => {
                        await octokit.repos.createFork({
                            owner: 'Superalgos',
                            repo: repo
                        })
                        console.log('[INFO] Plugin repo Superalgos/' + repo + ' forked into the ' + username + ' account.')
                        reponsesCount++
                        if (reponsesCount === Object.keys(global.env.PROJECT_PLUGIN_MAP).length) { resolve() }
                    })

            }
        }
    }

    async function clonePluginRepos(username) {

        if (username === undefined) {
            console.log('[WARN] You need to provide your Github username for this script to Clone the Plugins repositories forks from your acccount.')
            console.log('[WARN] Add your user name to the parameters of this script and try again please. ')
            return
        }

        const { exec } = require("child_process")
        const path = require("path")
        const fs = require('fs');

        /* 
        Here we will clone all the Plugins Repos if they do not exist.
        */
        for (const propertyName in global.env.PROJECT_PLUGIN_MAP) {
            let cloneDir = path.join(global.env.PATH_TO_PLUGINS, global.env.PROJECT_PLUGIN_MAP[propertyName].dir)
            let repoURL = 'https://github.com/' + username + '/' + global.env.PROJECT_PLUGIN_MAP[propertyName].repo

            if (fs.existsSync(cloneDir)) {
                console.log(' ')
                console.log('[INFO] Directory ' + cloneDir + ' already exists.')
                console.log('[INFO] No need to clone repo ' + repoURL)
                continue
            }

            console.log(' ')
            console.log('[INFO] Cloning plugin repo from ' + repoURL + ' into ' + cloneDir)
            await cloneTheRepo()

            async function cloneTheRepo() {
                return new Promise(promiseWork)

                async function promiseWork(resolve, reject) {
                    exec('git clone ' + repoURL + ' ' + global.env.PROJECT_PLUGIN_MAP[propertyName].dir + ' --branch develop',
                        {
                            cwd: path.join(global.env.PATH_TO_PLUGINS)
                        },
                        async function (error) {
                            if (error) {
                                console.log('')
                                console.log("[ERROR] There was an error cloning the plugin this repo. ");
                                console.log('')
                                console.log(error)
                            } else {
                                console.log('[INFO] Cloning repo ' + global.env.PROJECT_PLUGIN_MAP[propertyName].repo + ' succeed.')
                                /*
                                Final step is to set the remote to the main Superalgos account.
                                */
                                const simpleGit = require("simple-git")
                                const options = {
                                    baseDir: cloneDir,
                                    binary: 'git',
                                    maxConcurrentProcesses: 6,
                                }
                                const git = simpleGit(options)

                                await git.addRemote('upstream', `https://github.com/Superalgos/${global.env.PROJECT_PLUGIN_MAP[propertyName].repo}`)
                                    .then(remoteSetSuccesfully)
                                    .catch(errorSettingRemote)

                                function remoteSetSuccesfully() {
                                    console.log('[INFO] Setup of repo ' + global.env.PROJECT_PLUGIN_MAP[propertyName].repo + ' succeed.')
                                    resolve()
                                }
                                function errorSettingRemote(err) {
                                    console.log('[ERROR] Setup of repo ' + global.env.PROJECT_PLUGIN_MAP[propertyName].repo + ' failed. You will need to set the git remote manually.')
                                    console.log('')
                                    console.log(err)
                                    resolve()
                                }
                            }
                        })
                }
            }
        }
    }
}
