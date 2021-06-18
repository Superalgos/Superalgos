const { execSync } = require("child_process");

const npmNeededVersion = '5'
const nodeNeededVersion = '12'
const gitNeededVersion = '2'

function systemCheck () {
    try {
        
        // Gather Installed Versions of Node, NPM and Git
        const npmVersionRaw = execSync( "npm -v",{ encoding: 'utf8', timeout: 30000 })
        const nodeVersionRaw = execSync( "node -v",{ encoding: 'utf8',timeout: 30000 })
        const gitVersionRaw = execSync( "git --version",{ encoding: 'utf8',timeout: 30000 })
        const npmVersion = npmVersionRaw.trim().split('.')
        const nodeVersion = nodeVersionRaw.trim().substring(1).split('.')
        const gitVersion = gitVersionRaw.trim().split(' ')[2].split('.')

        // Check needed versions against those that are installed
        if ( npmVersion[0] < npmNeededVersion ) {
            console.log('');
            console.log("ERROR: the version of npm you have installed is out of date. Please update your installation of npm and try again.");
            console.log('');
            process.exit();
        }
        
        if ( nodeVersion[0] < nodeNeededVersion ) {
            console.log('');
            console.log("ERROR: the version of node you have installed is out of date. Please update your installation of node and try again.");
            console.log('');
            process.exit();
        }

        if ( gitVersion[0] < gitNeededVersion ) {
            console.log('');
            console.log("ERROR: the version of git you have installed is out of date. Please update your installation of git and try again.");
            console.log('');
            process.exit();
        }
    
    } catch (error) {
        console.log('');
        console.log("There was an error with your system: ");
        console.log('');
        console.log( error );
        return;
    }

};

module.exports = systemCheck