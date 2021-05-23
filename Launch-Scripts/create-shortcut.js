const path     = require("path");
const fs       = require("fs");
const process  = require("process");
const { exec } = require("child_process");
const os       = require("os"); 

// Get the name of the main directory
let cwd = process.cwd();
let dirs = cwd.split(path.sep);
let name = dirs[dirs.length - 2];

if (os.platform() == "win32") {
    // Paths and Icon for Windows shortcuts
    let target = path.join( process.cwd(), "launch-windows.bat")
    let icon = path.join( process.cwd(), "superalgos.ico")
    let ShortcutPaths = [
        path.join( os.homedir(), "Desktop", `${name}.lnk`),
        path.join( os.homedir(), "AppData", "Roaming", "Microsoft", "Windows", "Start Menu", "Programs", "Superalgos.lnk")
    ]

    // Place Shortcuts using powershell
    let dir;
    for (dir in ShortcutPaths) {
        let command = `$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut("${ShortcutPaths[dir]}"); $S.TargetPath = "${target}"; $S.IconLocation = "${icon}"; $S.Save()`;
     
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
                    console.log("A shortcut added successfully!");
                }
        });

    };

} else if (os.platform() == "linux") {
    // Paths and Icon for Windows shortcuts
    console.log("still working on linux")

} else if (os.platform() == "darwin") {
    console.log( "Automatic shortcut creation is not currently supported on mac yet.  If you would like to see this feature add, ask the devs on telegram or discord!")
}