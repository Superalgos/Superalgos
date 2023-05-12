runRoot()

async function runRoot() {
  /*
  This module represents the execution root of the Task Server.
  We use this module that is outside the Task Server folder to
  load all node dependencies and get them ready to the actual App.
  */

  /*
  The TS object is accessible everywhere at the Superalgos Platform Client.
  It provides access to all modules built for the Task Server.
  */
  global.TS = {}
  /*
  The SA object is accessible everywhere at the Superalgos Social Trading App.
  It provides access to all modules built for Superalgos in general.
  */
  global.SA = {}
  /* Load Environment Variables */
  let ENVIRONMENT = require('./Environment.js')
  let ENVIRONMENT_MODULE = ENVIRONMENT.newEnvironment()
  global.env = ENVIRONMENT_MODULE
  /*
  First thing is to load the project schema file.
  */
  global.PROJECTS_SCHEMA = require(global.env.PATH_TO_PROJECT_SCHEMA)
  global.PROJECTS_SCHEMA_MAP = new Map()

  for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
    let projectDefinition = PROJECTS_SCHEMA[i]
    PROJECTS_SCHEMA_MAP.set(projectDefinition.name, projectDefinition)
  }
  /*
  Setting up the modules that will be available, defined at the Project Schema file.
  */
  let MULTI_PROJECT = require('./MultiProject.js')
  let MULTI_PROJECT_MODULE = MULTI_PROJECT.newMultiProject()
  MULTI_PROJECT_MODULE.initialize(TS, 'TS')
  MULTI_PROJECT_MODULE.initialize(SA, 'SA')
  /*
  Setting up external dependencies.
  */
  SA.nodeModules = {
    fs: require('fs'),
    util: require('util'),
    path: require('path'),
    ws: require('ws'),
    ip: require('ip'),
    telegraf: require('telegraf'),
    https: require('https'),
    http: require('http'),
    web3: require('web3'),
    nodeFetch: require('node-fetch'),
    ccxt: require('ccxt'),
    ccxtMisc: require('./node_modules/ccxt/js/base/functions/misc'),
    lookpath: require('lookpath'),
    twitter: require('twitter-api-v2'),
    slack: require('@slack/web-api'),
    discordjs: require('discord.js'),
    discordRest: require('@discordjs/rest'),
    discordTypes: require('discord-api-types/v9'),
    octokit: require('@octokit/rest'),
    graphql: require('@octokit/graphql'),
    axios: require('axios'),
    crypto: require('crypto'),
    simpleGit: require('simple-git'),
    ethers: require('ethers'),
    vaderSentiment: require('vader-sentiment')
  }
  SA.version = require('./package.json').version

  /**
   * creates a path for the log file under a Tasks folder and each task will be in a subfolder 
   * using the taskId as a folder name
   * if taskId is undefined then we have a debug action going on and taskId will be set to debug
   * `<PATH_TO_LOG_FILES>/Tasks/<TASK_ID>`
   */
  let taskId = (process.argv[2] == undefined) ? "debug" : process.argv[2]
  const saLogsPath = SA.nodeModules.path.join(global.env.PATH_TO_LOG_FILES, 'Tasks', taskId)
  SA.logger = require('./loggerFactory').loggerFactory(saLogsPath, 'TS')
  
  /* 
  Setting up the App Schema Memory Map. 
  */
  let APP_SCHEMAS = require('./AppSchemas.js')
  let APP_SCHEMAS_MODULE = APP_SCHEMAS.newAppSchemas()
  await APP_SCHEMAS_MODULE.initialize()
  /*
  Setting up Secrets.
  */
  let SECRETS = require('./Secrets.js').newSecrets()
  SECRETS.initialize()

  run()

  async function run() {
    TS.app = require('./TaskServer/TaskServer.js').newTaskServer()
    await TS.app.run()
    console.log('Superalgos TaskServer is Running!')
  }
}
