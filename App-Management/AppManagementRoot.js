const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const chalk = require('chalk')
const { stdBoxedMessage } = global.SAM

exports.runRoot = function runRoot() {
    const welcomeMessage = `
USAGE:
  ${chalk.red('superalgos')} ${chalk.italic.red('[command] [options]')}

PRIMARY COMMAND LIST:
  - ${chalk.red('run')}
  - ${chalk.red('read')}
  - ${chalk.red('restart')}
  - ${chalk.red('stop')}
  - ${chalk.red('profile')}

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

    const welcomeBox = stdBoxedMessage(chalk.red(logo) + '\n' + welcomeMessage)

    const commands = [
        require('./Commands/run/index').runCommands(),
        require('./Commands/read/index').readCommands(),
        require('./Commands/restart/index').restartCommands(),
        require('./Commands/stop/index').stopCommands(),
    ].concat(require('../Profile-Scripts/index').commands)

    let builder = yargs(hideBin(process.argv))
        .version(require('../package.json').version)
        .alias('h', 'help')
        .help()
        
    builder = commands.reduce((args, c) => args.command(c.name, c.description, c.options, c.runner).help(), builder)
    builder
      .command('$0', 'the default command', () => {}, (_) => {
        console.log(welcomeBox)
      })
      .parse()
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