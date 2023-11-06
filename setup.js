const process = require("process")
const systemCheck = require('./Launch-Scripts/systemCheck')
const createShortcut = require('./Launch-Scripts/createShortcut')
const { runSetup } = require("./Launch-Scripts/runSetup")

// Check system is set up correctly 
systemCheck()

// Handle adding shortcuts
if (process.argv.includes("shortcuts")) {
  // Run create-shortcuts script
  try {
    console.log('\nshortcuts ................................................... Creating desktop shortcuts.\n')
    createShortcut()
  } catch (err) {
    console.log('')
    console.log(err)
    console.log('')
    process.exit(1)
  }
}

runSetup()