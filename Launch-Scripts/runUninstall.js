const path = require("path")
const os   = require("os")
const { exec } = require("child_process")

const uninstall = () => {
  // Get the name of the main directory
  let cwd = __dirname
  let dirs = cwd.split(path.sep)
  let name = dirs[dirs.length - 1]

  // Remove Windows Shortcuts
  if (os.platform() == "win32") {
    let desktop = path.join( os.homedir(), "SocialTrading", `${name}.lnk`)
    let startMenu = path.join( os.homedir(), "AppData", "Roaming", "Microsoft", "Windows", "Start Menu", "Programs", `${name}.lnk`)

    // Remove .desktop files
    let command = `del "${desktop}" & del "${startMenu}"`
    exec(command, (error) => {
      if (error) {
        console.log('')
        console.log("There was an error uninstalling shortcuts: ")
        console.log('')
        console.log(error)
        return false
      } else {
        console.log('')
        console.log("Shortcuts have been uninstalled successfully.")
      }
    })

    return 'Uninstall successful (Windows)'
  
  } // Remove Linux Shortcuts
  if (os.platform() == "linux") {
    // Check for Ubuntu
    let version = os.version()
    if (version.includes("Ubuntu")) {

      // Remove .desktop files
      let command = `rm ~/SocialTrading/${name}.desktop & rm ~/.local/share/applications/${name}.desktop`
      exec(command, (error) => {
        if (error) {
          console.log('')
          console.log("There was an error uninstalling shortcuts: ")
          console.log('')
          console.log( error )
          return false
        } else {
          console.log('')
          console.log("Shortcuts have been uninstalled successfully.")
        }
      })

      return 'Uninstall successful (Ubuntu)'
    }
    else {
      return 'Uninstall not supported on non-Ubuntu Linux systems'
    }  
  } // Mac Shortcuts
  if (os.platform() == "darwin") {
    // Remove .desktop files
    let command = `rm ~/SocialTrading/${name}.command`
    exec(command, (error) => {
      if (error) {
        console.log('')
        console.log("There was an error uninstalling shortcuts: ")
        console.log('')
        console.log( error )
        return
      } else {
        console.log('')
        console.log("Shortcuts have been uninstalled successfully.")
      }
    })

    return 'Uninstall successuful (MacOS)'
  }
}

module.exports = uninstall