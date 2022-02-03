exports.run = function () {

    const { exec } = require("child_process")
    const path = require("path")
    const fs = require('fs');

    let ENVIRONMENT = require('../Environment.js')
    let ENVIRONMENT_MODULE = ENVIRONMENT.newEnvironment()
    global.env = ENVIRONMENT_MODULE
    /*
    Here we will clone all the Plugins Repos if they do not exist.
    */
    let rootDir = process.cwd()
    for (const propertyName in global.env.PROJECT_PLUGIN_MAP) {
        let cloneDir = path.join(global.env.PATH_TO_PLUGINS, global.env.PROJECT_PLUGIN_MAP[propertyName].dir)
        let repoURL = 'https://github.com/Superalgos/' + global.env.PROJECT_PLUGIN_MAP[propertyName].repo

        if (fs.existsSync(cloneDir)) {
            console.log('[INFO] Directory ' + cloneDir + ' already exists. ')
            continue
        }

        console.log('[INFO] Clonning plugin repo from ' + repoURL + ' into ' + cloneDir)

        exec(`git clone ` + repoURL + ' ' + global.env.PROJECT_PLUGIN_MAP[propertyName].dir,
            {
                cwd: path.join(global.env.PATH_TO_PLUGINS)
            },
            function (error, stdout) {
                if (error) {
                    console.log('')
                    console.log("[ERROR] There was an error clonning the plugin this repo. ");
                    console.log('')
                    console.log(error)
                }
                console.log('[INFO] Clonning repo ' + global.env.PROJECT_PLUGIN_MAP[propertyName].repo + ' succeed.')
            })
    }
}