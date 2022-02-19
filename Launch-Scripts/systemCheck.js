const { execSync } = require("child_process")
const os = require("os")
const env = require("../Environment").newEnvironment()

// moved 'minimum versions required' to environment file, this 
// centralizes them in one place & makes tests more robust

// Also removed semicolons

function systemCheck () {
    try {
        
        // Gather Installed Versions of Node, NPM and Git
        const npmVersionRaw = execSync( "npm -v",{ encoding: 'utf8', timeout: 30000 })
        const nodeVersionRaw = execSync( "node -v",{ encoding: 'utf8',timeout: 30000 })
        const gitVersionRaw = execSync( "git --version",{ encoding: 'utf8',timeout: 30000 })
        const npmVersion = npmVersionRaw.trim().split('.')
        const nodeVersion = nodeVersionRaw.trim().substring(1).split('.')
        const gitVersion = gitVersionRaw.trim().split(' ')[2].split('.')

        // Make sure update version of npm is installed
        if ( npmVersion[0] < env.NPM_NEEDED_VERSION ) {
            console.log('')
            console.log("ERROR: the version of npm you have installed is out of date. Please update your installation of npm and try again.")
            console.log('')
            process.exit()
        }
        
        // Make sure update version of node is installed 
        if ( nodeVersion[0] < env.NODE_NEEDED_VERSION ) {
            console.log('')
            console.log("ERROR: the version of node you have installed is out of date. Please update your installation of node and try again.")
            console.log('')
            process.exit()
        }

        // Make sure updated version of git is installed
        if ( gitVersion[0] < env.GIT_NEEDED_VERSION ) {
            console.log('')
            console.log("ERROR: the version of git you have installed is out of date. Please update your installation of git and try again.")
            console.log('')
            process.exit()
        }

        // Check windows system
        // console.log(os.platform())
        if (os.platform() === "win32") {

            // Verify C:\Windows\System32 is on the windows PATH
            const path = execSync( "echo %PATH%",{ encoding: 'utf8',timeout: 30000 })
            let check = path.includes('System32')
            if ( check === false ) {
                console.log('')
                console.log("ERROR: it appears C:\\Windows\\System32 is missing from your PATH.  Please add to your path and try again.")
                console.log('')
                process.exit()
            }

        }
    
    } catch (error) {
        console.log('')
        console.log("There was an error with your system: ")
        console.log('')
        console.log( error )
        return false
    }
    return true

};

module.exports = systemCheck
