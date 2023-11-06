const path = require('path')
const fs = require('fs')
const process = require('process')
const { exec } = require('child_process')
const https = require('https')
const externalScriptsDir = path.join(process.cwd(), 'Platform', 'WebServer', 'externalScripts')
const env = require('../Environment').newEnvironment()
const externalScriptsURLs = env.EXTERNAL_SCRIPTS

const errorResp = (e) => {
  console.error(e)
  process.exit()
}

// ** export setup piece by piece for more robust tests **
const installExternalScripts = () => {
  for (let i = 0; i<externalScriptsURLs.length; i++) {
    const url = externalScriptsURLs[i]
    const filename = url.split('/').pop()
    const dest = path.join(externalScriptsDir, filename)
    https.get(url, resp => {
      if (resp.statusCode !== 200) {
        console.error(
          `Error downloading ${url}: HTTP response code ${resp.statusCode}.`
          )
        return false
      } else {
        const writeStream = fs.createWriteStream(dest)
        resp.pipe(writeStream)
        writeStream.on('error', () => console.error('Error writing to ' + path.resolve(dest)))
        writeStream.on('finish', () => writeStream.close())
        return 5555
      }
    })
  }
  return 'External scripts installed'
}

const setUpstreamAndOrigin = async (dir, repo='Superalgos') => {
  console.log('Setting up github upstream and origin...')
  // initialize simpleGit
  const simpleGit = require('simple-git')
  const options = {
      binary: 'git',
      maxConcurrentProcesses: 6,
  }

  // main app repo should be the working directory
  if (repo === 'Superalgos') options.baseDir = dir || process.cwd()
  // if repo is not main app repo, assume it is a plugin, in ./Plugins.
  else options.baseDir = path.join(process.cwd(), 'Plugins', dir)
  const git = simpleGit(options)

  // Check to see it main repo has been set as upstream
  let remotes = await git.getRemotes(true).catch(errorResp)
  let isUpstreamSet
  let origin
  for (let remote in remotes) {
    if (remotes[remote].name === 'upstream') {
      isUpstreamSet = true
    } else {
      isUpstreamSet = false
      if (remotes[remote].name === 'origin') {
        origin = remotes[remote].refs.fetch
      }
    }
  }

  // If upstream has not been set. Set it now
  if (isUpstreamSet === false) {
    await git.addRemote('upstream', `https://github.com/Superalgos/${repo}.git`).catch(errorResp)
  }

  let gitUser
  let usesSSH
  // if in main Superalgos repo, set gitUser from origin
  if (repo === 'Superalgos' && origin) {
    if (origin.indexOf('@') === -1) {
      gitUser = origin.split('/')[3]
      usesSSH = false
    } else {
      gitUser = origin.split(':')[1].split('/')[0]
      usesSSH = true
    }
  }

  // Check that branches exist
  let branchSumAll = await git.branchLocal().catch(errorResp)
  let masterExists = false
  let developExists = false
  for (let i = 0; i < branchSumAll.all.length; i++) {
    if (branchSumAll.all[i] === 'master') masterExists = true
    else if (branchSumAll.all[i] === 'develop') developExists = true
  }
  if (!masterExists) {
    await git.checkout(['-B', 'master'])
  }
  if (!developExists) {
    await git.checkout(['-B', 'develop'])
  }

  // Check that a branch is checked out, otherwise checkout develop
  branchSumAll = await git.branchLocal().catch(errorResp)
  if (branchSumAll.current === '' || branchSumAll.current === 'master') {
    await git.checkout(['-B', 'develop'])
  }

  if (repo !== 'Superalgos' && origin && gitUser) {
    await git.removeRemote('origin').catch(errorResp)
  }

  if (repo !== 'Superalgos' && gitUser) {
    let orURL
    if (usesSSH) {
      orURL = `git@github.com:${gitUser}/${repo}.git`
      await git.addRemote('origin', orURL).catch(errorResp)
    }
    else {
      orURL = `https://github.com/${gitUser}/${repo}.git`
      await git.addRemote('origin', orURL).catch(errorResp)
    }
  }
  console.log('Set upstream and origin for github')
  return 'Set upstream and origin for github'
}

const runSetup = async (tfjs=false) => {
  // Output the Logo
  showLogo()

  // Install Node_Modules to Main Superalgos Directory

  // install tensorflow if user ran tensorflow setup file
  if (tfjs !== false) {
    console.log('Including tensorflow.js in your setup...')

    path.join(process.cwd(),
              "Projects",
              "TensorFlow",
              "TS",
              "Bot-Modules",
              "Learning-Bot",
              "Low-Frequency-Learning")
  }

  let dir = process.cwd()
  
  await runInstallCommands()
    .then(() => setUpstreamAndOrigin())
    .catch(errorResp)

  // Donload external scripts
  console.log('')
  console.log('Setting up your environment …')
  console.log('')
  installExternalScripts()
  return 'Setup complete'
}

async function runInstallCommands() {
  try {
    await executeCommand('echo Results of install at ' + process.cwd() + ' & npm ci --omit=optional')
  }
  catch(err) {
    if(err.message.indexOf('package.json and package-lock.json') > -1) {
      console.error('npm ci failed package.json and package-lock.json are not in sync')
      console.log('running npm install --omit=optional')
      await executeCommand('npm install --omit=optional')
    }
    else {
      throw err
    }
  }
}

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    const child = exec(command, {cwd: process.cwd()}, (err, stdout) => {
      if(err) {
        reject(err)
        return
      }
      resolve()
    })

    try {
      child.stdout.pipe(process.stdout)
      child.on('exit', () => {
        console.log('')
        console.log('Finished ' + command)
        console.log('')
      })
    }
    catch(e) {
      reject(e)
    }
  })
}

function showLogo () {
  console.log('\x1b[31m%s\x1b[0m', '                                  ///////')
  console.log('\x1b[31m%s\x1b[0m', '                               ,    ///////')
  console.log('\x1b[31m%s\x1b[0m', '                                      //////')
  console.log('\x1b[31m%s\x1b[0m', '                          *           ,/////')
  console.log('\x1b[31m%s\x1b[0m', '                        ((             /////')
  console.log('\x1b[31m%s\x1b[0m', '                     /((      ///      ////')
  console.log('\x1b[31m%s\x1b[0m', '                 (((((      ((////     ////')
  console.log('\x1b[31m%s\x1b[0m', '          ,(((((((((       (((////*     ///')
  console.log('\x1b[31m%s\x1b[0m', '       (((((((((.        (((((/////      //')
  console.log('\x1b[31m%s\x1b[0m', '     (((((((*         ((((((((//////      /,')
  console.log('\x1b[31m%s\x1b[0m', '    ((((((          ((((((((((////////     /')
  console.log('\x1b[31m%s\x1b[0m', '     ((((           ((((((((((/////////')
  console.log('\x1b[31m%s\x1b[0m', '        (((                       /////')
  console.log('\x1b[31m%s\x1b[0m', '                   *(((/.')
  console.log('\x1b[31m%s\x1b[0m', '                          /(((/////            /')
  console.log('\x1b[31m%s\x1b[0m', '                               /////////     ///')
  console.log('\x1b[31m%s\x1b[0m', '                                  //////////////')
  console.log('\x1b[31m%s\x1b[0m', '                                      ////////')
}

module.exports = {
  runSetup,
  setUpstreamAndOrigin,
  installExternalScripts,
  errorResp
}
