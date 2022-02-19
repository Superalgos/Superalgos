const process = require("process")
const systemCheck = require('./Launch-Scripts/systemCheck')
const createShortcut = require('./Launch-Scripts/createShortcut')
const { runSetup } = require("./Launch-Scripts/runSetup")

// Check system is set up correctly 
systemCheck()

// Handle adding shortcuts
if (process.argv.includes("noShortcuts")) {
    // Cancel running script if flag provided
    console.log('')
    console.log('noShortcuts ................................................... Setting up without shortcuts.')

} else {
    // Run create-shortcuts script
    try {
        createShortcut()
    } catch (err) {
        console.log('')
        console.log(err)
        console.log('')
        process.exit(1)
    }
}

runSetup()