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
    path.join( process.cwd(), "Projects", "TensorFlow", "TS", "Bot-Modules")
];

console.log('');
console.log("Installing node dependencies at the following directories:");
console.log('');
console.log(nodeModulesDirs);
console.log('');

// Loop through directories and run node ci in a child process shell.
let dir;
for (dir in nodeModulesDirs) {
    let command = "npm ci";
    exec( command,
        {
            cwd: nodeModulesDirs[dir] 
        },
        function ( error, stdout, stderr ){
            if (error) {
                console.log("there was an error: ", error);
                return;
            }
            console.log( "Results of install at " + nodeModulesDirs[dir] );
            console.log('');
            console.log( stdout );
        });
};
/*
    cd %~dp0
    cd ..
    cd %%a
    cmd /k "npm ci"
))

REM cmd /k "cd %~dp0 && cd .."
REM cmd /k "npm ci && cd %~dp0"
REM cmd /k "npm ci"
*/