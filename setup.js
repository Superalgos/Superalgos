const path = require("path");
const fs = require("fs");
const process = require("process");
const { exec } = require("child_process");
const systemCheck = require('./Launch-Scripts/system-check')
const platform = require('os').platform();  // Possible values are: 'aix', 'darwin', 'freebsd', 'linux', 'openbsd', 'sunos', and 'win32'.

// Check system is set up correctly 
systemCheck();

// Handle adding shortcuts
if (process.argv.includes("noShortcuts")) {
    // Cancel running script if flag provided
    console.log('');
    console.log('noShortcuts ................................................... Setting up without shortcuts.')

} else {
    // Run create-shortcuts script
    try {
        const { fork } = require('child_process')
        fork('./Launch-Scripts/create-shortcut.js')
    } catch (err) {
        console.log('')
        console.log(err)
        console.log('')
        process.exit(1)
    }
}

// Create Operating System compatible paths to each node_modules directory.
let nodeModulesDirs = [
    path.join( process.cwd(), "Platform"),
    path.join( process.cwd(), "Projects", "Foundations", "TS", "Bot-Modules", "Sensor-Bot", "Exchange-Raw-Data"),
    path.join( process.cwd(), "Projects", "Foundations", "TS", "Bot-Modules", "API-Data-Fetcher-Bot"),
    path.join( process.cwd(), "Projects", "Foundations", "TS", "Bot-Modules", "Trading-Bot", "Announcements"),
    path.join( process.cwd(), "Projects", "Foundations", "TS", "Bot-Modules", "Trading-Bot", "Low-Frequency-Trading", "APIs"),
    path.join( process.cwd(), "Projects", "Foundations", "TS", "Task-Modules")
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
        path.join( process.cwd(), "Projects", "TensorFlow", "TS", "Bot-Modules", "Learning-Bot", "Low-Frequency-Learning")
    ]
}

// Check if WinOS because extra dependencies may be required for tfjs:
var tfjsWinInstallFlag = false;
if (platform === 'win32') {  // *Note: win32 == win32 || win64
    tfjsWinInstallFlag = true;
}

console.log('');
console.log("Removing node dependencies at the following directories:");
console.log('');
console.log(nodeModulesDirs);
console.log('');

// Remove old Node_Modules
for (let dir of nodeModulesDirs) {
    // Loop through directories and remove node_modules.
    
    let removeCommand
    if (platform == "win32") {
        removeCommand = "echo Removing old Node_Modules at "+ dir + " & rmdir /Q /s node_modules"
    } else {
        removeCommand = "echo Removing old Node_Modules at "+ dir + " & rm -rf node_modules/";
    }

    let node_dir = path.join(dir, "node_modules")
    if (fs.existsSync(node_dir)) {
        exec( removeCommand,
            {
                cwd: dir 
            },
            function ( error, stdout ){
                if (error) {
                    console.log('');
                    console.log("There was an error installing some dependencies error: ");
                    console.log('');
                    console.log( error );
                    process.exit(1)
                }
                console.log('');
                console.log( stdout );
            });
    }
};

// Install Node_Modules to Main Superalgos Directory
let dir = process.cwd()
let command = "echo Results of install at "+ dir + " & npm ci";
exec( command,
    {
        cwd: dir 
    },
    function ( error, stdout ){
        if (error) {
            console.log('');
            console.log("There was an error installing some dependencies error: ");
            console.log('');
            console.log( error );
            if (tfjsWinInstallFlag == true && dir == path.join(process.cwd(), "Projects", "TensorFlow", "TS", "Bot-Modules", "Learning-Bot", "Low-Frequency-Learning")) {
                tfjsWinInstall();
            }
            process.exit(1)
        }
        console.log('');
        console.log( stdout );
    });


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
