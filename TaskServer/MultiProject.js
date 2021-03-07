exports.newMultiProject = function () {

    let thisObject = {
        initialize: initialize
    }

    return thisObject;

    function initialize() {
        /*
        First thing is to load the project schema file.
        */
        let PROJECTS_SCHEMA = require(global.env.PATH_TO_PROJECTS_REQUIRED + '/' + 'ProjectsSchema.json')

        /*
        Here we will setup the TS object, with all the
        projects and modules that will have inside.
        */
        global.TS = {
            projects: {}
        }
        for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
            let projectDefinition = PROJECTS_SCHEMA[i]
            global.TS.projects[projectDefinition.propertyName] = {}
            let projectInstance = global.TS.projects[projectDefinition.propertyName]

            projectInstance.utilities = {}
            projectInstance.globals = {}
            projectInstance.functionLibraries = {}
            projectInstance.taskModules = {}
            projectInstance.processModules = {}
            projectInstance.botModules = {}

            /* Set up Utilities of this Project */
            if (projectDefinition.TS.utilities !== undefined) {
                for (let j = 0; j < projectDefinition.TS.utilities.length; j++) {
                    let utilityDefinition = projectDefinition.TS.utilities[j]
                    let path = global.env.PATH_TO_PROJECTS_REQUIRED + '/' + projectDefinition.name + '/' + 'TS' + '/' + 'Utilities' + '/' + utilityDefinition.fileName

                    let requiredObject = require(path)
                    let requiredFunction = requiredObject[utilityDefinition.functionName]
                    projectInstance.utilities[utilityDefinition.propertyName] = requiredFunction.call()
                }
            }

            /* Set up Globals of this Project */
            if (projectDefinition.TS.globals !== undefined) {
                for (let j = 0; j < projectDefinition.TS.globals.length; j++) {
                    let globalDefinition = projectDefinition.TS.globals[j]
                    let path = global.env.PATH_TO_PROJECTS_REQUIRED + '/' + projectDefinition.name + '/' + 'TS' + '/' + 'Globals' + '/' + globalDefinition.fileName

                    let requiredObject = require(path)
                    let requiredFunction = requiredObject[globalDefinition.functionName]
                    projectInstance.globals[globalDefinition.propertyName] = requiredFunction.call()
                }
            }

            /* Set up Function Libraries of this Project */
            if (projectDefinition.TS.functionLibraries !== undefined) {
                for (let j = 0; j < projectDefinition.TS.functionLibraries.length; j++) {
                    let functionLibraryDefinition = projectDefinition.TS.functionLibraries[j]
                    let path = global.env.PATH_TO_PROJECTS_REQUIRED + '/' + projectDefinition.name + '/' + 'TS' + '/' + 'Function-Libraries' + '/' + functionLibraryDefinition.fileName

                    let requiredObject = require(path)
                    let requiredFunction = requiredObject[functionLibraryDefinition.functionName]
                    projectInstance.functionLibraries[functionLibraryDefinition.propertyName] = requiredFunction.call()
                }
            }

            /* Set up Process Modules for this Project */
            if (projectDefinition.TS.taskModules !== undefined) {
                for (let j = 0; j < projectDefinition.TS.taskModules.length; j++) {
                    let taskModuleDefinition = projectDefinition.TS.taskModules[j]
                    let path = global.env.PATH_TO_PROJECTS_REQUIRED + '/' + projectDefinition.name + '/' + 'TS' + '/' + 'Task-Modules' + '/' + taskModuleDefinition.fileName

                    let requiredObject = require(path)
                    projectInstance.taskModules[taskModuleDefinition.propertyName] = requiredObject
                }
            }

            /* Set up Process Modules for this Project */
            if (projectDefinition.TS.processModules !== undefined) {
                for (let j = 0; j < projectDefinition.TS.processModules.length; j++) {
                    let processModuleDefinition = projectDefinition.TS.processModules[j]
                    let path = global.env.PATH_TO_PROJECTS_REQUIRED + '/' + projectDefinition.name + '/' + 'TS' + '/' + 'Process-Modules' + '/' + processModuleDefinition.fileName

                    let requiredObject = require(path)
                    projectInstance.processModules[processModuleDefinition.propertyName] = requiredObject
                }
            }

            /* Set up Bot Modules for this Project */
            if (projectDefinition.TS.botModules !== undefined) {
                for (let j = 0; j < projectDefinition.TS.botModules.length; j++) {
                    let botModuleDefinition = projectDefinition.TS.botModules[j]
                    let path = global.env.PATH_TO_PROJECTS_REQUIRED + '/' + projectDefinition.name + '/' + 'TS' + '/' + 'Bot-Modules' + '/' + botModuleDefinition.folderName + '/' + botModuleDefinition.fileName

                    let requiredObject = require(path)
                    projectInstance.botModules[botModuleDefinition.propertyName] = requiredObject
                }
            }
        }

        TS.projects.superalgos.globals.taskConstants.PROJECTS_SCHEMA = PROJECTS_SCHEMA

    }
}