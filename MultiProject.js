exports.newMultiProject = function () {
/* TODO add init method to DK*/
    let thisObject = {
        initialize: initialize
    }

    return thisObject;

    function initialize(rootObject, rootObjectName) {
        /*
        Here we will setup the rootObject object, with all the
        projects and modules that will have inside.
        */
        rootObject.projects = {}

        for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
            let projectDefinition = PROJECTS_SCHEMA[i]
            global[rootObjectName].projects[projectDefinition.propertyName] = {}
            let projectInstance = global[rootObjectName].projects[projectDefinition.propertyName]

            projectInstance.utilities = {}
            projectInstance.globals = {}
            projectInstance.functionLibraries = {}
            projectInstance.modules = {}
            projectInstance.taskModules = {}
            projectInstance.processModules = {}
            projectInstance.botModules = {}

            if (projectDefinition[rootObjectName] === undefined) { continue }

            /* Set up Utilities of this Project */
            if (projectDefinition[rootObjectName].utilities !== undefined) {
                for (let j = 0; j < projectDefinition[rootObjectName].utilities.length; j++) {
                    let utilityDefinition = projectDefinition[rootObjectName].utilities[j]
                    let path = global.env.PATH_TO_PROJECTS_REQUIRED + '/' + projectDefinition.name + '/' + rootObjectName + '/' + 'Utilities' + '/' + utilityDefinition.fileName

                    let requiredObject = require(path)
                    let requiredFunction = requiredObject[utilityDefinition.functionName]
                    projectInstance.utilities[utilityDefinition.propertyName] = requiredFunction.call()
                }
            }

            /* Set up Globals of this Project */
            if (projectDefinition[rootObjectName].globals !== undefined) {
                for (let j = 0; j < projectDefinition[rootObjectName].globals.length; j++) {
                    let globalDefinition = projectDefinition[rootObjectName].globals[j]
                    let path = global.env.PATH_TO_PROJECTS_REQUIRED + '/' + projectDefinition.name + '/' + rootObjectName + '/' + 'Globals' + '/' + globalDefinition.fileName

                    let requiredObject = require(path)
                    let requiredFunction = requiredObject[globalDefinition.functionName]
                    projectInstance.globals[globalDefinition.propertyName] = requiredFunction.call()
                }
            }

            /* Set up Function Libraries of this Project */
            if (projectDefinition[rootObjectName].functionLibraries !== undefined) {
                for (let j = 0; j < projectDefinition[rootObjectName].functionLibraries.length; j++) {
                    let functionLibraryDefinition = projectDefinition[rootObjectName].functionLibraries[j]
                    let path = global.env.PATH_TO_PROJECTS_REQUIRED + '/' + projectDefinition.name + '/' + rootObjectName + '/' + 'Function-Libraries' + '/' + functionLibraryDefinition.fileName

                    let requiredObject = require(path)
                    let requiredFunction = requiredObject[functionLibraryDefinition.functionName]
                    projectInstance.functionLibraries[functionLibraryDefinition.propertyName] = requiredFunction.call()
                }
            }

            /*
            From here we will require and get the modules, but without instantiating thisObject. 
            */

            /* Set up  Modules for this Project */
            if (projectDefinition[rootObjectName].modules !== undefined) {
                for (let j = 0; j < projectDefinition[rootObjectName].modules.length; j++) {
                    let taskModuleDefinition = projectDefinition[rootObjectName].modules[j]
                    let path = global.env.PATH_TO_PROJECTS_REQUIRED + '/' + projectDefinition.name + '/' + rootObjectName + '/' + 'Modules' + '/' + taskModuleDefinition.fileName

                    let requiredObject = require(path)
                    projectInstance.modules[taskModuleDefinition.propertyName] = requiredObject
                }
            }

            /* Set up Task Modules for this Project */
            if (projectDefinition[rootObjectName].taskModules !== undefined) {
                for (let j = 0; j < projectDefinition[rootObjectName].taskModules.length; j++) {
                    let taskModuleDefinition = projectDefinition[rootObjectName].taskModules[j]
                    let path = global.env.PATH_TO_PROJECTS_REQUIRED + '/' + projectDefinition.name + '/' + rootObjectName + '/' + 'Task-Modules' + '/' + taskModuleDefinition.fileName

                    let requiredObject = require(path)
                    projectInstance.taskModules[taskModuleDefinition.propertyName] = requiredObject
                }
            }

            /* Set up Process Modules for this Project */
            if (projectDefinition[rootObjectName].processModules !== undefined) {
                for (let j = 0; j < projectDefinition[rootObjectName].processModules.length; j++) {
                    let processModuleDefinition = projectDefinition[rootObjectName].processModules[j]
                    let path = global.env.PATH_TO_PROJECTS_REQUIRED + '/' + projectDefinition.name + '/' + rootObjectName + '/' + 'Process-Modules' + '/' + processModuleDefinition.fileName

                    let requiredObject = require(path)
                    projectInstance.processModules[processModuleDefinition.propertyName] = requiredObject
                }
            }

            /* Set up Bot Modules for this Project */
            if (projectDefinition[rootObjectName].botModules !== undefined) {
                for (let j = 0; j < projectDefinition[rootObjectName].botModules.length; j++) {
                    let botModuleDefinition = projectDefinition[rootObjectName].botModules[j]
                    let path = global.env.PATH_TO_PROJECTS_REQUIRED + '/' + projectDefinition.name + '/' + rootObjectName + '/' + 'Bot-Modules' + '/' + botModuleDefinition.folderName + '/' + botModuleDefinition.fileName

                    let requiredObject = require(path)
                    projectInstance.botModules[botModuleDefinition.propertyName] = requiredObject
                }
            }
        }
    }
}