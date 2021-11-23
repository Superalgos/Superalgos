const path     = require("path");
const fs       = require("fs");
const { exec, execSync } = require("child_process");
const os       = require("os");

// Get the name of the main directory
let cwd = __dirname;
let dirs = cwd.split(path.sep);
let name = dirs[dirs.length - 2];

// Windows Shortcuts
if (os.platform() == "win32") {
    // Paths and Icon for Windows shortcuts
    let target = path.join( __dirname, "launch-windows.bat");
    let icon = path.join( __dirname, "superalgos.ico");
    let shortcutPaths = [
        path.join( os.homedir(), "Desktop", `${name}.lnk`),
        path.join( os.homedir(), "AppData", "Roaming", "Microsoft", "Windows", "Start Menu", "Programs", `${name}.lnk`)
    ]

    // Place Shortcuts using powershell
    for (let dir of shortcutPaths) {
        let command = `$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut("${dir}"); $S.TargetPath = "${target}"; $S.IconLocation = "${icon}"; $S.Save()`;

        exec( command,
            {
                shell: "powershell.exe",
                execArgv: "-ExecutionPolicy Bypass -NoLogo -NonInteractive -NoProfile -Command"
            },
            function ( error, stdout){
                if (error) {
                    console.log('');
                    console.log("There was an error installing a shortcut: ");
                    console.log('');
                    console.log( error );
                    return;
                } else {
                    console.log('');
                    console.log("Shortcut added successfully!");
                    console.log('');
                    console.log(stdout);
                }
        });
    };

// Linux Shortcuts
} else if (os.platform() == "linux") {
    // Check for Ubuntu
    let version = os.version();
    if (version.includes("Ubuntu")) {
        // Paths and Icon for Ubuntu shortcuts
        let icon = path.join( __dirname,"..", "/Projects/Foundations/Icons/superalgos.png");

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
    const icon = path.join( __dirname,"/superalgos.ico");
    const createShortcutCommand = `chmod +x ${name}.command & cp ${name}.command ~/Desktop/${name}.command`
    const installFileIconcommand = `npm install -g fileicon`;
    const changeIconCommand = `./node_modules/fileicon/bin/fileicon set ~/Desktop/${name}.command ./Launch-Scripts/superalgos.ico`
    const unInstallFileIconcommand = `npm uninstall -g fileicon`;

    try {
        // Create .desktop shortcut file
            fs.writeFileSync( `${name}.command`,
            `#!/bin/sh
            cd ${__dirname}
            cd ..
            node run
            "$SHELL"`,
        );

        // Place shortcut in proper folders
        execSync( createShortcutCommand,{ timeout: 30000})

        // Remove temporary .command file
        fs.unlinkSync( `${name}.command` )

        //Install fileicon utility
        execSync(installFileIconcommand, {stdio: 'inherit', timeout: 30000});

        //change Icon
        execSync(changeIconCommand, {stdio: 'inherit', timeout: 30000});

        //Un-Install fileicon utility
        execSync(unInstallFileIconcommand, {stdio: 'inherit', timeout: 30000});
    } catch (error) {
        console.log('');
        console.log("There was an error installing a shortcut: ");
        console.log('');
        console.log( error );
        return;
    }

    console.log("Shortcuts added successfully!");

// Misc Operating System
} else {
    console.log("Automatic shortcut creation is not currently supported on your operating system.  If you would like to see your operating system added please reachout on discord or telegram to let the devs know.")
}
