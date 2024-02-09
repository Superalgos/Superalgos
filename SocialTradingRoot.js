exports.newSocialTradingRoot = function newSocialTradingRoot() {
    /*
    This module represents the execution root of the Social Trading App.
    We use this module that is outside the Social-Trading folder to 
    load all node dependencies and get them ready to the actual App.
    */
    let thisObject = {
        run: run
    }

    return thisObject

    async function run(debugSettings, uiType) {
        /* 
        The ST object is accessible everywhere at the Superalgos Social Trading App.
        It provides access to all modules built for this App.
        */
        global.ST = {}
        /* 
        The SA object is accessible everywhere at the Superalgos Social Trading App.
        It provides access to all modules built for Superalgos in general.
        */
        global.SA = {}
        
        /* Load Environment Variables */
        let ENVIRONMENT = require('./Environment.js');
        let ENVIRONMENT_MODULE = ENVIRONMENT.newEnvironment()
        global.env = ENVIRONMENT_MODULE

        if (uiType != undefined) {
            global.env.SOCIALTRADING_APP_UI_TYPE = uiType
        }
        /*
        Here we are defining the cryptographic identity which will be used by this App to
        identify itself with the Superalgos P2P Network.
        */
        if (debugSettings !== undefined && debugSettings.SOCIALTRADING_APP_SIGNING_ACCOUNT !== undefined) {
            global.env.SOCIALTRADING_APP_SIGNING_ACCOUNT = debugSettings.SOCIALTRADING_APP_SIGNING_ACCOUNT
        }
        /*
        First thing is to load the project schema file.
        */
        global.PROJECTS_SCHEMA = require(global.env.PATH_TO_PROJECT_SCHEMA)
        /* 
        Setting up the modules that will be available, defined at the Project Schema file. 
        */
        let MULTI_PROJECT = require('./MultiProject.js')
        let MULTI_PROJECT_MODULE = MULTI_PROJECT.newMultiProject()
        MULTI_PROJECT_MODULE.initialize(ST, 'ST')
        MULTI_PROJECT_MODULE.initialize(SA, 'SA')
        /*
        Setting up external dependencies.
        */
        SA.nodeModules = {
            fs: require('fs'),
            util: require('util'),
            path: require('path'),
            web3: require('web3'),
            ws: require('ws'),
            open: require('open'),
            http: require('http'),
            octokit: require("@octokit/rest"),
            retry: require('@octokit/plugin-retry'),
            simpleGit: require('simple-git'),
            nodeFetch: require('node-fetch'),
            graphql: require("@octokit/graphql"),
            axios: require('axios'),
            crypto: require('crypto'),
            static: require('node-static'),
            childProcess: require('child_process')
        }
        SA.version = require('./package.json').version

        const saLogsPath = SA.nodeModules.path.join(global.env.PATH_TO_LOG_FILES, 'SocialTrading')
        SA.logger = require('./loggerFactory').loggerFactory(saLogsPath, 'ST')

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
        /*
        The UI Object is accessible everywhere at the Superalgos Social Trading App.
        It provides access to all UI helper modules.
        */
        global.UI = {
            projects: {},
            schemas: { projectSchema: JSON.parse(SA.nodeModules.fs.readFileSync(global.env.PATH_TO_PROJECTS + '/' + 'ProjectsSchema.json')) },
            environment: global.env,
            clientNode: undefined,
            webApp: undefined
        }
        /*
        Setup the UI helper modules
        */
        //setupRootObject(UI, 'UI')

        run()

        async function run() {
            ST.app = require('./Social-Trading/SocialTradingApp.js').newSocialTradingApp()
            await ST.app.run()
            console.log('Superalgos Social Trading App is Running!')
        }
    
        function setupRootObject(rootObject, rootObjectName) {
            /*
            Here we will setup the UI object, with all the
            projects and spaces.
            */
            for (let i = 0; i < UI.schemas.projectSchema.length; i++) {
                let projectDefinition = UI.schemas.projectSchema[i]
                rootObject.projects[projectDefinition.propertyName] = {}
                let projectInstance = rootObject.projects[projectDefinition.propertyName]

                projectInstance.utilities = {}
                projectInstance.globals = {}
                projectInstance.functionLibraries = {}
                projectInstance.modules = {}

                if (projectDefinition[rootObjectName] === undefined) { continue }

                /* Set up Globals of this Project */
                if (projectDefinition[rootObjectName].globals !== undefined) {
                    for (let j = 0; j < projectDefinition[rootObjectName].globals.length; j++) {
                        let globalDefinition = projectDefinition[rootObjectName].globals[j]

                        if (exports[globalDefinition.functionName] === undefined) {
                            projectInstance.globals[globalDefinition.propertyName] = eval(globalDefinition.functionName + '()')
                        } else {
                            projectInstance.globals[globalDefinition.propertyName] = eval('exports.' + globalDefinition.functionName + '()')
                        }
                    }
                }

                /* Set up Utilities of this Project */
                if (projectDefinition[rootObjectName].utilities !== undefined) {
                    for (let j = 0; j < projectDefinition[rootObjectName].utilities.length; j++) {
                        let utilityDefinition = projectDefinition[rootObjectName].utilities[j]

                        if (exports[utilityDefinition.functionName] === undefined) {
                            projectInstance.utilities[utilityDefinition.propertyName] = eval(utilityDefinition.functionName + '()')
                        } else {
                            projectInstance.utilities[utilityDefinition.propertyName] = eval('exports.' + utilityDefinition.functionName + '()')
                        }
                    }
                }

                /* Set up Function Libraries of this Project */
                if (projectDefinition[rootObjectName].functionLibraries !== undefined) {
                    for (let j = 0; j < projectDefinition[rootObjectName].functionLibraries.length; j++) {
                        let functionLibraryDefinition = projectDefinition[rootObjectName].functionLibraries[j]

                        if (exports[functionLibraryDefinition.functionName] === undefined) {
                            projectInstance.functionLibraries[functionLibraryDefinition.propertyName] = eval(functionLibraryDefinition.functionName + '()')
                        } else {
                            projectInstance.functionLibraries[functionLibraryDefinition.propertyName] = eval('exports.' + functionLibraryDefinition.functionName + '()')
                        }
                    }
                }

                /* Set up Modules of this Project */
                if (projectDefinition[rootObjectName].modules !== undefined) {
                    for (let j = 0; j < projectDefinition[rootObjectName].modules.length; j++) {
                        let functionLibraryDefinition = projectDefinition[rootObjectName].modules[j]

                        if (exports[functionLibraryDefinition.functionName] === undefined) {
                            projectInstance.modules[functionLibraryDefinition.propertyName] = eval(functionLibraryDefinition.functionName + '()')
                        } else {
                            projectInstance.modules[functionLibraryDefinition.propertyName] = eval('exports.' + functionLibraryDefinition.functionName + '()')
                        }
                    }
                }
            }
        }
    }
}