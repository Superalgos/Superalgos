const path     = require("path");
const fs       = require("fs");
const process  = require("process");
const { exec } = require("child_process");
const os       = require("os"); 

// Get the name of the main directory
let cwd = __dirname;
let dirs = cwd.split(path.sep);
let name = dirs[dirs.length - 2];

// Windows Shortcuts
if (os.platform() == "win32") {
    // Paths and Icon for Windows shortcuts
    let target = path.join( process.cwd(), "launch-windows.bat");
    let icon = path.join( process.cwd(), "superalgos.ico");
    let shortcutPaths = [
        path.join( os.homedir(), "Desktop", `${name}.lnk`),
        path.join( os.homedir(), "AppData", "Roaming", "Microsoft", "Windows", "Start Menu", "Programs", "Superalgos.lnk")
    ]

    // Place Shortcuts using powershell
    let dir;
    for (dir in shortcutPaths) {
        let command = `$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut("${shortcutPaths[dir]}"); $S.TargetPath = "${target}"; $S.IconLocation = "${icon}"; $S.Save()`;
     
        exec( command,
            {
                shell: "powershell.exe",
                execArgv: "-ExecutionPolicy Bypass -NoLogo -NonInteractive -NoProfile -Command"
            },
            function ( error, stdout ){
                if (error) {
                    console.log('');
                    console.log("There was an error installing a shortcut: ");
                    console.log('');
                    console.log( error );
                    return;
                } else {
                    console.log('');
                    console.log("Shortcut added successfully!");
                }
        });
    };

// Linux Shortcuts
} else if (os.platform() == "linux") {
    // Check for Ubuntu
    let version = os.version();
    if (version.includes("Ubuntu")) {
        // Paths and Icon for Ubuntu shortcuts
        let icon = path.join( __dirname,"..", "/Projects/Superalgos/Icons/superalgos.png");

        // Create .desktop shortcut file
        fs.writeFileSync( `${name}.desktop`, 
            `[Desktop Entry]
            Type=Application
            Encoding=UTF-8
            Name=${name}
            Comment=Launch Shortcut for Superalgos 
            Path=${__dirname}
            Exec=gnome-terminal -e ${__dirname}/launch-linux-mac.sh
            Terminal=true
            Icon=${icon}
            Categories=Application;`,
        );

        // Set shortcut as executable
        fs.chmodSync( `${name}.desktop`, "775" );

        // Place shortcut in proper folders
        let command = `cp ${name}.desktop ~/Desktop/${name}.desktop & cp ${name}.desktop ~/.local/share/applications/${name}.desktop`
            exec( command,
                function ( error, stdout ){
                    if (error) {
                        console.log('');
                        console.log("There was an error installing a shortcut: ");
                        console.log('');
                        console.log( error );
                        return;
                    } else {
                        console.log('');
                        console.log("Shortcuts added successfully!");
                    }
                    // Remove temporary .desktop file
                    fs.unlinkSync( `${name}.desktop` )
            });

    } else {
        console.log( "Automatic shortcut creation is not yet supported on your flavor of linux.  If you would like to see this feature add, message @harrellbm on telegram or discord to ask how you can help!")    
    }
   
// Mac Shortcuts
} else if (os.platform() == "darwin") {
    console.log( "Automatic shortcut creation is not yet supported on Mac.  If you would like to see this feature add, message @harrellbm on telegram or discord to ask how you can help!")

// Misc Operating System
} else {
    console.log("Automatic shortcut creation is not currently supported on your operating system.  If you would like to see your operating system added please reachout on discord or telegram to let the devs know.")
}