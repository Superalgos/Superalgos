const path = require("path");
const process = require("process");
const { exec } = require("child_process");
const systemCheck = require('./Launch-Scripts/system-check')

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

    }
}

// Create Operating System compatable paths to each node_modules directory.
let nodeModulesDirs = [
    path.join( process.cwd(), "Client"),
    path.join( process.cwd(), "Projects", "Foundations", "TS", "Bot-Modules", "Sensor-Bot", "Exchange-Raw-Data"),
    path.join( process.cwd(), "Projects", "Foundations", "TS", "Bot-Modules", "API-Data-Fetcher-Bot"),
    path.join( process.cwd(), "Projects", "Foundations", "TS", "Bot-Modules", "Trading-Bot", "Announcements"),
    path.join( process.cwd(), "Projects", "Foundations", "TS", "Bot-Modules", "Trading-Bot", "Low-Frequency-Trading", "APIs"),
    path.join( process.cwd(), "Projects", "Foundations", "TS", "Task-Modules"),
    path.join( process.cwd(), "Projects", "TensorFlow", "TS", "Bot-Modules", "Learning-Bot", "Low-Frequency-Learning")
];

console.log('');
console.log("Installing node dependencies at the following directories:");
console.log('');
console.log(nodeModulesDirs);
console.log('');

for (let dir of nodeModulesDirs) {
    // Loop through directories and run npm ci in a child process shell.
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
                return;
            }
            console.log('');
            console.log( stdout );
        });
};