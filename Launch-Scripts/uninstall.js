const path = require("path");
const os   = require("os"); 
const { exec } = require("child_process");

// Get the name of the main directory
let cwd = __dirname;
let dirs = cwd.split(path.sep);
let name = dirs[dirs.length - 2];

// Windows Shortcuts
if (os.platform() == "win32") {
    
// Linux Shortcuts
} else if (os.platform() == "linux") {
    // Check for Ubuntu
    let version = os.version();
    if (version.includes("Ubuntu")) {
        
    // Remove .desktop files
    let command = `rm ~/Desktop/${name}.desktop & rm ~/.local/share/applications/${name}.desktop`
    exec( command,
        function ( error, stdout ){
            if (error) {
                console.log('');
                console.log("There was an error uninstalling shortcuts: ");
                console.log('');
                console.log( error );
                return;
            } else {
                console.log('');
                console.log("Shortcuts have been uninstalled successfully.");
            }
        });
    }
   
// Mac Shortcuts
} else if (os.platform() == "darwin") {
    // Uninstall Mac shortcuts here once they have been added.
}