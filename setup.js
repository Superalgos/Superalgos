const path = require("path");
const process = require("process");
const { exec } = require("child_process");

// Create Operating System compatable paths to each node_modules directory.
let nodeModulesDirs = [
    path.join( process.cwd(), "Client"),
    path.join( process.cwd(), "Projects", "Superalgos", "TS", "Bot-Modules", "Sensor-Bot", "Exchange-Raw-Data"),
    path.join( process.cwd(), "Projects", "Superalgos", "TS", "Bot-Modules", "Trading-Bot", "Announcements"),
    path.join( process.cwd(), "Projects", "Superalgos", "TS", "Bot-Modules", "Trading-Bot", "Low-Frequency-Trading", "APIs"),
    path.join( process.cwd(), "Projects", "Superalgos", "TS", "Task-Modules"),
    path.join( process.cwd(), "Projects", "TensorFlow", "TS", "Bot-Modules", "Learning-Bot", "Low-Frequency-Learning")
];

console.log('');
console.log("Installing node dependencies at the following directories:");
console.log('');
console.log(nodeModulesDirs);
console.log('');


let dir;
let ifError;
for (dir in nodeModulesDirs) {
    // Loop through directories and run node ci in a child process shell.
    let command = "echo Results of install at "+ nodeModulesDirs[dir] + " & npm ci";
    exec( command,
        {
            cwd: nodeModulesDirs[dir] 
        },
        function ( error, stdout ){
            if (error) {
                console.log('');
                console.log("There was an error installing some dependencies error: ");
                console.log('');
                console.log( error );
                ifError = true;
                return;
            }
            console.log('');
            console.log( stdout );
        });
    
    // Print closing message
    if (dir == nodeModulesDirs.length) {
        if ( ifError = true ) {
            console.log('');
            console.log("Installation of node dependencies finished with errors.  See error messages above.")
        } else {
            console.log('');
            console.log("Node dependencies installed successfully!")
        }
    }
};