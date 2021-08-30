exports.newMultiProject = function () {

    let thisObject = {
        initialize: initialize
    }

    return thisObject;

    function initialize(rootObject, rootObjectName) {
        /*
        First thing is to load the project schema file.
        */
        let PROJECTS_SCHEMA = require(global.env.PATH_TO_PROJECTS_REQUIRED + '/' + 'ProjectsSchema.json')

        /*
        Here we will setup the CL object, with all the
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
        }
    }
}