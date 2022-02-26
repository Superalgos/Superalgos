const path = require("path");
const fs = require("fs");
const process = require("process");
const { exec } = require("child_process");
const systemCheck = require('./Launch-Scripts/system-check')
const platform = require('os').platform();  // Possible values are: 'aix', 'darwin', 'freebsd', 'linux', 'openbsd', 'sunos', and 'win32'.
const https = require("https");
const externalScriptsDir = path.join(process.cwd(), "Platform", "WebServer", "externalScripts");
const externalScripts = [
    "https://code.jquery.com/jquery-3.6.0.js",
    "https://code.jquery.com/ui/1.13.0/jquery-ui.js"
];
const projectPluginMap = require('./Plugins/project-plugin-map.json')
const createShortcut = require('./Launch-Scripts/create-shortcut')

// Check system is set up correctly 
systemCheck();

// Handle adding shortcuts
if (process.argv.includes("shortcuts")) {
    // Run create-shortcuts script
    try {
        console.log('\nshortcuts ................................................... Creating desktop shortcuts.\n')
        createShortcut()
    } catch (err) {
        console.log('')
        console.log(err)
        console.log('')
        process.exit(1)
    }
}

// Create Operating System compatible paths to each node_modules directory.
let nodeModulesDirs = [
    path.join(process.cwd(), "Platform"),
    path.join(process.cwd(), "Projects", "Foundations", "TS", "Bot-Modules", "Sensor-Bot", "Exchange-Raw-Data"),
    path.join(process.cwd(), "Projects", "Foundations", "TS", "Bot-Modules", "API-Data-Fetcher-Bot"),
    path.join(process.cwd(), "Projects", "Foundations", "TS", "Bot-Modules", "Trading-Bot", "Announcements"),
    path.join(process.cwd(), "Projects", "Foundations", "TS", "Bot-Modules", "Trading-Bot", "Low-Frequency-Trading", "APIs"),
    path.join(process.cwd(), "Projects", "Foundations", "TS", "Task-Modules")
];

if (
    process.argv.includes("TensorFlow") ||
    process.argv.includes("tensorflow") ||
    process.argv.includes("--TensorFlow") ||
    process.argv.includes("-TensorFlow") ||
    process.argv.includes("--tensorflow") ||
    process.argv.includes("--tensorflow")
) {

    console.log('');
    console.log('tensorflow ................................................... Setting TensorFlow Dependencies.')

    nodeModulesDirs = [
        path.join(process.cwd(), "Projects", "TensorFlow", "TS", "Bot-Modules", "Learning-Bot", "Low-Frequency-Learning")
    ]
}

// Check if WinOS because extra dependencies may be required for tfjs:
var tfjsWinInstallFlag = false;
if (platform === 'win32') {  // *Note: win32 == win32 || win64
    tfjsWinInstallFlag = true;
}

// Install Node_Modules to Main Superalgos Directory
let dir = process.cwd()
let command = "echo Results of install at " + dir + " & npm ci";
let nodeInstPromise = new Promise(resolve => {
    exec(command,
        {
            cwd: dir
        },
        function (error, stdout) {
            if (error) {
                console.log('');
                console.log("There was an error installing some dependencies error: ");
                console.log('');
                console.log(error);
                if (tfjsWinInstallFlag == true && dir == path.join(process.cwd(), "Projects", "TensorFlow", "TS", "Bot-Modules", "Learning-Bot", "Low-Frequency-Learning")) {
                    tfjsWinInstall();
                }
                process.exit(1)
            }
            console.log('');
            console.log(stdout);
        });
})

/*  If WinOS && error with tfjs installation:
 *  This is a well known and documented issue with @Tensorflow/tfjs-node installation on WinOS.
 *  npm's windows-build-tools via: `npm install --global --production windows-build-tools` &&
 *  `npm install -g node-gyp`  can sometimes correct the issue but not always depending on the
 *  version and options the user defined when installing npm/nodejs.
 *  The best reliable way to correct that I (Pluvtech) have found to work on many versions of WinOS
 *  is to reinstall nodejs and select to install chocolatey during the installation configuration.
 */
function tfjsWinInstall() {
    console.log("\n*** Note to Windows Users Regarding the Superalgos TensorFlow Project ***");
    console.log("If you have no other errors with this setup script and do not wish to use the TensorFlow Project:\nThen all is successful with your Superalgos setup and you may proceed to use the software.");
    console.log("\nIf you do wish to install the @Tensorflow/tfjs-node modules required for use with the Superalgos TensorFlow Project:");
    console.log("In this case it is likely your system is missing some dependencies required to build the TensorFlow (tfjs-node) bindings and you will need to follow the below steps:");
    console.log("\n1.) Reinstall node.js from https://nodejs.org/en/download/ @Version 14.17.5 or higher.\nDuring installation, when you arrive at the 'Tools for Native Modules' screen you need to select the box to:\n\t'Automatically install the necessary tools...Chocolatey...'");
    console.log("Doing this will cause a pop-up script in a new window which will install many npm/node tools and dependencies for use within the WinOS ecosystem.");
    console.log("2.) When the installations finally complete you need to navigate back to your Superalgos directory and run `node setup` again.\n");
}

/*
Here we will go and clone all the plugins repositories that have not been cloned yet.
Temporarily commenting this section as source for githubUserName and token in this script are not clear.

const SETUP_PLUGINS_MODULE = require("./setupPlugins.js")
SETUP_PLUGINS_MODULE.run(githubUserName, token)
*/


// Donload external scripts
console.log("");
console.log("Downloading external scripts …");
console.log("");

for (let url of externalScripts) {
    const filename = url.split("/").pop();
    const dest = path.join(externalScriptsDir, filename);
    https.get(url, response => {
        if (response.statusCode !== 200) {
            console.error(`Error downloading ${url}: HTTP response code ${response.statusCode}.`);
            return;
        }
        const writeStream = fs.createWriteStream(dest);
        response.pipe(writeStream);
        writeStream.on("error", () => console.error("Error writing to " + path.resolve(dest)));
        writeStream.on("finish", () => writeStream.close());
    });
};

// wait until node installation is complete
nodeInstPromise.then(() => {
    // Initialize and update git repositories
    // Ensure upstream and origin are set for this repo and submodules
    const simpleGit = require("simple-git")

    let gitUser;
    let usesSSH = false
    setUpstreamAndOrigin().then(async () => {
        Object.values(projectPluginMap).forEach(plugin => {
            setUpstreamAndOrigin(plugin.dir, plugin.repo)
        })
    }).catch(errorResp)

    function errorResp(e) {
        console.error(e)
        process.exit(1)
    }

    async function setUpstreamAndOrigin(dir, repo = "Superalgos") {
        // initialize simpleGit
        const options = {
            binary: 'git',
            maxConcurrentProcesses: 6,
        }
        // main app repo should be the working directory
        if (repo === 'Superalgos') options.baseDir = dir || process.cwd()
        // if repo is not main app repo, assume it is a plugin, in ./Plugins.
        else options.baseDir = path.join(process.cwd(), 'Plugins', dir)
        const git = simpleGit(options)

        // Check to see it main repo has been set as upstream
        let remotes = await git.getRemotes(true).catch(errorResp);
        let isUpstreamSet
        let origin
        for (let remote in remotes) {
            if (remotes[remote].name === 'upstream') {
                isUpstreamSet = true
            } else {
                isUpstreamSet = false
                if (remotes[remote].name === 'origin') {
                    origin = remotes[remote].refs.fetch
                }
            }
        }
        // If upstream has not been set. Set it now
        if (isUpstreamSet === false) {
            await git.addRemote('upstream', `https://github.com/Superalgos/${repo}`).catch(errorResp);
        }
        // if in main Superalgos repo, set gitUser from origin
        if (repo === "Superalgos" && origin) {
            if (origin.indexOf('@') === -1) {
                gitUser = origin.split('/')[3]
            } else {
                gitUser = origin.split(':')[1].split('/')[0]
                usesSSH = true
            }
        }

        // Check that branches exist
        let branchSumAll = await git.branchLocal().catch(errorResp)
        let masterExists = false
        let developExists = false
        for (let i = 0; i < branchSumAll.all.length; i++) {
            if (branchSumAll.all[i] === 'master') masterExists = true
            else if (branchSumAll.all[i] === 'develop') developExists = true
        }
        if (!masterExists) await git.checkout(['-B', 'master'])
        if (!developExists) await git.checkout(['-B', 'develop'])
        // Check that a branch is checked out, otherwise checkout develop
        branchSumAll = await git.branchLocal().catch(errorResp)
        if (branchSumAll.current === '' || branchSumAll.current === 'master') await git.checkout(['-B', 'develop'])

        if (repo !== "Superalgos" && origin && gitUser) await git.removeRemote('origin').catch(errorResp)
        if (repo !== "Superalgos" && gitUser) {
            let orURL
            if (usesSSH) orURL = `git@github.com:${gitUser}/${repo}.git`
            else orURL = `https://github.com/${gitUser}/${repo}.git`
            await git.addRemote('origin', orURL).catch(errorResp)
        }
    }
})
