const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const chalk = require('chalk')
const boxen = require('boxen')

exports.runRoot = function runRoot(cwd) {
    const welcomeMessage = `
USAGE:
  ${chalk.red('superalgos')} ${chalk.italic.red('[command] [options]')}

PRIMARY COMMAND LIST:
  - ${chalk.red('run')}
  - ${chalk.red('read')}
  - ${chalk.red('restart')}
  - ${chalk.red('stop')}

For more details of each command and their options run with the ${chalk.italic('--help')} argument
`
    const logo = `
                                  ///////
                               ,    ///////
                                      //////
                          *           ,/////
                        ((             /////
                     /((      ///      ////
                 (((((      ((////     ////
          ,(((((((((       (((////*     ///
       (((((((((.        (((((/////      //
     (((((((*         ((((((((//////      /,
    ((((((          ((((((((((////////     /
     ((((           ((((((((((/////////
        (((                       /////
                   *(((/.
                          /(((/////            /    
                               /////////     ///    
                                  //////////////    
                                      ////////
`

    const welcomeBox = boxen(chalk.red(logo) + '\n' + welcomeMessage, {
        borderColor: 'yellow',
        title: 'Welcome to Superalgos Ecosystem App Management',
        titleAlignment: 'center',
        padding: 1,
        margin: 1
    })

    // even though the install allows users to run the command `superalgos` 
    // the args still receive `node manageApps`
    if(process.argv.length < 3) {
        console.log(welcomeBox)
        return
    }

    const commands = [
        require('./Commands/run/index').runCommands(cwd),
        require('./Commands/read/index').readCommands(),
        require('./Commands/restart/index').restartCommands(),
        require('./Commands/stop/index').stopCommands(),
    ]

    let builder = yargs(hideBin(process.argv))
        .version(require('../package.json').version)
        .alias('h', 'help')
        .help()
        
    builder = commands.reduce((args, c) => args.command(c.name, c.description, c.options, c.runner).help(), builder)
    builder.parse()
}

/*
following commands would need to be applied in the code to allow the 
pm2 process to be restarted after an application update

const { spawn } = require('node:child_process');

const subprocess = spawn('node', ['manageApps', 'restart', name], {
  detached: true,
  stdio: 'ignore',
});

subprocess.unref();
*/