const { execSync } = require("child_process")
const os = require("os")
const env = require("../Environment").newEnvironment()

// moved 'minimum versions required' to environment file, this 
// centralizes them in one place & makes tests more robust

// Also removed semicolons

function systemCheck () {
  try {
    
    // Gather installed versions of Node, NPM and Git
    const npmVersionRaw = execSync( "npm -v",{ encoding: 'utf8', timeout: 30000 })
    const nodeVersionRaw = execSync( "node -v",{ encoding: 'utf8',timeout: 30000 })
    const gitVersionRaw = execSync( "git --version",{ encoding: 'utf8',timeout: 30000 })
    const npmVersionStrArray = npmVersionRaw.trim().split('.')
    const nodeVersionStrArray = nodeVersionRaw.trim().substring(1).split('.')
    const gitVersionStrArray = gitVersionRaw.trim().split(' ')[2].split('.')
    /* Gather required versions of Node, NPM and Git from Environment.js */
    const npmNeededVersionStrArray = env.NPM_NEEDED_VERSION.trim().split('.')
    const nodeNeededVersionStrArray = env.NODE_NEEDED_VERSION.trim().split('.')
    const gitNeededVersionStrArray = env.GIT_NEEDED_VERSION.trim().split('.')
    /* Convert version strings into integers */
    const npmVersion = parseArrayToInt(npmVersionStrArray)
    const nodeVersion = parseArrayToInt(nodeVersionStrArray)
    const gitVersion = parseArrayToInt(gitVersionStrArray)
    const npmNeededVersion = parseArrayToInt(npmNeededVersionStrArray)
    const nodeNeededVersion = parseArrayToInt(nodeNeededVersionStrArray)
    const gitNeededVersion = parseArrayToInt(gitNeededVersionStrArray)

    // Make sure required version of npm is installed
    compareVersions(npmVersion, npmNeededVersion, "npm")
    
    // Make sure required version of node is installed 
    compareVersions(nodeVersion, nodeNeededVersion, "node")

    // Make sure required version of git is installed
    compareVersions(gitVersion, gitNeededVersion, "git")


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

}

function parseArrayToInt(array) {
  return array.map(function(item) {
    return parseInt(item, 10)
  })
}

function compareVersions(actualVersion, neededVersion, application) {
  let pos = 0
  let continueCheck = true
  
  while (continueCheck) {
    /* End check as successful if next part of version number is undefined */
    if (typeof actualVersion[pos] === 'undefined' || typeof neededVersion[pos] === 'undefined' || !actualVersion[pos] || !neededVersion[pos]) {
      continueCheck = false
      /* Output warning message if main version of an application can not be obtained */
      if (pos === 0) {
        console.log('')
        console.log('Warning: Unable to conduct version check for ' + application + '. If you face issues during setup, please check if this application is correctly installed on your system.') 
        console.log('')
      }
      break
    /* Fail if version number is too low */
    } else if (actualVersion[pos] < neededVersion[pos]) {
      const versionString = 'env.' + application.toUpperCase() + '_NEEDED_VERSION'
      console.log('')
      console.log('ERROR: The version of ' + application + ' you have installed is out of date (required: >= ' + eval(versionString) + '). Please update your installation of ' + application + ' and try again.')
      console.log('')
      continueCheck = false
      process.exit()    
    /* Continue check with next segment of version number if current segment is equal */
    } else if (actualVersion[pos] === neededVersion[pos]) {
      pos = pos + 1
    /* End check as successful if current version segment is higher than needed version segment */
    } else if (actualVersion[pos] > neededVersion[pos]) {
      continueCheck = false
    }
  }
}

module.exports = systemCheck
