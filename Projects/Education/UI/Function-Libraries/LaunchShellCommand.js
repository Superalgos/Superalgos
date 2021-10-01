const path = require("path");
const process = require("process");
const { exec } = require("child_process");

function newEducationFunctionLibraryLaunchShellCommand() {
    let thisObject = {
        launchShellCommand: launchShellCommand
    }

    return thisObject

    function launchShellCommand() {


        let dir = path.join( process.cwd(), "..", "..", "..", "..", ".." )
        let command = "node setup";
        exec( command,
            {
                cwd: dir 
            },
            function ( error, stdout ){
                if (error) {
                    console.log('');
                    console.log("There was an error updating dependencies for this branch: ");
                    console.log('');
                    console.log( error );
                    return;
                }                

                console.log('');
                console.log( stdout );
            });
    }
}