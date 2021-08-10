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
        Here we will setup the CL object, with all the
        projects and modules that will have inside.
        */
        global.CL = {
            projects: {}
        }
        for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
            let projectDefinition = PROJECTS_SCHEMA[i]
            global.CL.projects[projectDefinition.propertyName] = {}
            let projectInstance = global.CL.projects[projectDefinition.propertyName]

            projectInstance.utilities = {}
            projectInstance.globals = {}
            projectInstance.functionLibraries = {}
            projectInstance.taskModules = {}
            projectInstance.processModules = {}
            projectInstance.botModules = {}

            if (projectDefinition.CL === undefined) { continue }

            /* Set up Utilities of this Project */
            if (projectDefinition.CL.utilities !== undefined) {
                for (let j = 0; j < projectDefinition.CL.utilities.length; j++) {
                    let utilityDefinition = projectDefinition.CL.utilities[j]
                    let path = global.env.PATH_TO_PROJECTS_REQUIRED + '/' + projectDefinition.name + '/' + 'CL' + '/' + 'Utilities' + '/' + utilityDefinition.fileName

                    let requiredObject = require(path)
                    let requiredFunction = requiredObject[utilityDefinition.functionName]
                    projectInstance.utilities[utilityDefinition.propertyName] = requiredFunction.call()
                }
            }

            /* Set up Globals of this Project */
            if (projectDefinition.CL.globals !== undefined) {
                for (let j = 0; j < projectDefinition.CL.globals.length; j++) {
                    let globalDefinition = projectDefinition.CL.globals[j]
                    let path = global.env.PATH_TO_PROJECTS_REQUIRED + '/' + projectDefinition.name + '/' + 'CL' + '/' + 'Globals' + '/' + globalDefinition.fileName

                    let requiredObject = require(path)
                    let requiredFunction = requiredObject[globalDefinition.functionName]
                    projectInstance.globals[globalDefinition.propertyName] = requiredFunction.call()
                }
            }

            /* Set up Function Libraries of this Project */
            if (projectDefinition.CL.functionLibraries !== undefined) {
                for (let j = 0; j < projectDefinition.CL.functionLibraries.length; j++) {
                    let functionLibraryDefinition = projectDefinition.CL.functionLibraries[j]
                    let path = global.env.PATH_TO_PROJECTS_REQUIRED + '/' + projectDefinition.name + '/' + 'CL' + '/' + 'Function-Libraries' + '/' + functionLibraryDefinition.fileName

                    let requiredObject = require(path)
                    let requiredFunction = requiredObject[functionLibraryDefinition.functionName]
                    projectInstance.functionLibraries[functionLibraryDefinition.propertyName] = requiredFunction.call()
                }
            }
        }
    }
}