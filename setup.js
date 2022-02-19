const path = require("path")
const fs = require("fs")
const process = require("process")
const { exec } = require("child_process")
const systemCheck = require('./Launch-Scripts/systemCheck')
const platform = require('os').platform()  // Possible values are: 'aix', 'darwin', 'freebsd', 'linux', 'openbsd', 'sunos', and 'win32'.
const https = require("https")
const externalScriptsDir = path.join(process.cwd(), "Platform", "WebServer", "externalScripts")
const externalScripts = [
    "https://code.jquery.com/jquery-3.6.0.js",
    "https://code.jquery.com/ui/1.13.0/jquery-ui.js"
]
const projectPluginMap = require('./Plugins/project-plugin-map.json')
const createShortcut = require('./Launch-Scripts/createShortcut')
const runSetup = require("./Launch-Scripts/runSetup")

// Check system is set up correctly 
systemCheck()

// Handle adding shortcuts
if (process.argv.includes("noShortcuts")) {
    // Cancel running script if flag provided
    console.log('');
    console.log('noShortcuts ................................................... Setting up without shortcuts.')

} else {
    // Run create-shortcuts script
    try {
        createShortcut()
    } catch (err) {
        console.log('')
        console.log(err)
        console.log('')
        process.exit(1)
    }
}

runSetup()