const pm2 = require('pm2')
const path = require('path')

function manageApps() {
  if (
    process.argv.includes("help") ||
    process.argv.includes("-help") ||
    process.argv.includes("--help") ||
    process.argv.includes("h") ||
    process.argv.includes("-h") ||
    process.argv.includes("--h") ||
    process.argv.includes("/h") ||
    process.argv.includes("/help")) {

    console.log('')
    console.log('***** Welcome to Superalgos Ecosystem App Managment *****')
    console.log('')
    console.log('USAGE:    node manageApps [command] [app or app arrays]')
    console.log('')
    console.log('COMMAND:')
    console.log('          commandName:    Required. Declare the command to be used to manage the declared app/s.')
    console.log('')
    console.log('LIST OF COMMANDS: ')
    console.log('          run - use this command to run apps using pm2 process managment')
    console.log('')
    console.log('          Example: node manageApps run platform')
    console.log('')
    console.log('APP:')
    console.log('           appName:    Required. Use it to declare which app you want to launch within the manager.')
    console.log('           appFlags:   Optional. Use it to launch app with app specific flags such as minMemo or noBrowser.')
    console.log('')
    console.log('           Example: node manageApps run platform noBrowser')
    console.log('')
    console.log('APP ARRAYS: ')
    console.log('           Multiple apps can be run at the same time using the following syntax: ')
    console.log('           [appName1, appFlags1] [appName2, appFlags2]')
    console.log('')
    console.log('           Example: node manageApps run [platform,minMemo,noBrowser] [network] [dashboards,minMemo]')
    console.log('')
    console.log('FURTHER PROCESS MANAGMENT: ')
    console.log('           PM2 offers further commands to manage apps once they are running.')
    console.log('')
    console.log('           Useful commands to know: ')
    console.log('           pm2 list - list all running processes managed by pm2.')
    console.log('           pm2 logs - list all logs for processes managed by pm2. Can specify process to see process specific logs.')
    console.log('           pm2 kill - kill all processes and the pm2 dameon.')
    console.log('')
    console.log('           Addtional commands and documentation can be found at the pm2 project page: ')
    console.log('           https://pm2.keymetrics.io/docs/usage/quick-start/')

    return 'help message has been displayed'
  }

  // need to tweak each apps default config

  let optionsAccepted = 0

  if (process.argv.includes("run")) {
    optionsAccepted++
    console.log('Running Apps Using PM2')

    pm2.connect(function(err) {
      if (err) {
        console.error(err)
        process.exit(2)
      }
    
      let startSingleApp = true

      for (let value of process.argv) {
        // Start multiple apps 
        if (value.match(/.*\[.*\].*/)) {  
          startSingleApp = false

          let appDef = value.slice(1,-1).split(",")

          let appName = appDef[0]
          
          // remove app name
          appDef.shift()

          appStartProfiles(appName, appDef)
        } 
      }

      if (startSingleApp === true) {
        // Start single app
        let appArguments = ''
        for (let i = 4; i < process.argv.length; i++) {
          appArguments += ' ' + process.argv[i]
        }

        appStartProfiles(process.argv[3], appArguments)
      }

    return 'Apps running using PM2 managment'
    })

  }
  if (optionsAccepted === 0) {
    console.log('[INFO] No apps started. Enter a valid option or use the -help flag for more information')
  }

}

function appStartProfiles(app, arguments) {
  switch (app) {
    case "platform":
      console.log('[INFO] Platform app starting with the following options: ', arguments)
      pm2.start({
        script    : 'platform.js',
        name      : 'platform',
        args      : arguments,
        cwd       : path.join(__dirname),
        log_file  : path.join(__dirname, 'Platform', 'My-Log-Files', 'platform-console.log')
      }, function(err, apps) {
        if (err) {
          console.error(err)
          return pm2.disconnect()
        }
        console.log('[INFO] Platform app now running under PM2 dameon')
      })
      break;

    case "dashboards":
      console.log('[INFO] Dashboards app starting with the following options: ', arguments)
      pm2.start({
      script    : 'dashboards.js',
      name      : 'dashboards',
      args      : arguments,
      cwd       : path.join(__dirname),
      log_file  : path.join(__dirname, 'Dashboards', 'My-Log-Files', 'dashboards-console.log')
      }, function(err, apps) {
        if (err) {
        console.error(err)
        return pm2.disconnect()
      }
      console.log('[INFO] Dashboards app now running under PM2 dameon')
      })
      break;

    case "network":
      console.log("PM2 managment needs set up for this app")
      break;

    case "desktop":
      console.log("PM2 managment needs set up for this app")
      break;

    case "mergeBot":
      pm2.start({
        script    : 'mergeBot.js',
        name      : 'mergeBot',
        args      : arguments,
        cwd       : path.join(__dirname),
        log_file  : path.join(__dirname, 'Dashboards', 'My-Log-Files', 'dashboards-console.log')
      }, function(err, apps) {
        if (err) {
          console.error(err)
          return pm2.disconnect()
        }
        console.log('[INFO] Merge Bot now running under PM2 dameon')
      })
      break;
  }  
}

manageApps()