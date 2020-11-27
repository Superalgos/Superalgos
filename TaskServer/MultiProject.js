exports.newMultiProject = function () {

    let thisObject = {
        initialize: initialize
    }

    return thisObject;

    function initialize() {
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

            /* Set up Utilities of this Project */
            if (projectDefinition.TS.utilities !== undefined) {
                for (let j = 0; j < projectDefinition.TS.utilities.length; j++) {
                    let utilityDefinition = projectDefinition.TS.utilities[j]
                    let path = process.env.REQUIRED_PROJECTS_PATH + '/' + projectDefinition.name + '/' + 'TS' + '/' + 'Utilities' + '/' + utilityDefinition.fileName

                    let requiredObject = require(path)
                    let requiredFunction = requiredObject[utilityDefinition.functionName]
                    projectInstance.utilities[utilityDefinition.propertyName] = requiredFunction.call()
                }
            }

            /* Set up Globals of this Project */
            if (projectDefinition.TS.globals !== undefined) {
                for (let j = 0; j < projectDefinition.TS.globals.length; j++) {
                    let globalDefinition = projectDefinition.TS.globals[j]
                    let path = process.env.REQUIRED_PROJECTS_PATH + '/' + projectDefinition.name + '/' + 'TS' + '/' + 'Globals' + '/' + globalDefinition.fileName

                    let requiredObject = require(path)
                    let requiredFunction = requiredObject[globalDefinition.functionName]
                    projectInstance.globals[globalDefinition.propertyName] = requiredFunction.call()
                }
            }

            /* Set up Function Libraries of this Project */
            if (projectDefinition.TS.functionLibraries !== undefined) {
                for (let j = 0; j < projectDefinition.TS.functionLibraries.length; j++) {
                    let functionLibraryDefinition = projectDefinition.TS.functionLibraries[j]
                    let path = process.env.REQUIRED_PROJECTS_PATH + '/' + projectDefinition.name + '/' + 'TS' + '/' + 'Function-Libraries' + '/' + functionLibraryDefinition.fileName

                    let requiredObject = require(path)
                    let requiredFunction = requiredObject[functionLibraryDefinition.functionName]
                    projectInstance.functionLibraries[functionLibraryDefinition.propertyName] = requiredFunction.call()
                }
            }

            /* Set up Bot Classes of this Project */
            if (projectDefinition.TS.botClasses !== undefined) {
                for (let j = 0; j < projectDefinition.TS.botClasses.length; j++) {
                    let botClassDefinition = projectDefinition.TS.botClasses[j]
                    let path = process.env.REQUIRED_PROJECTS_PATH + '/' + projectDefinition.name + '/' + 'TS' + '/' + 'Bot-Classes' + '/' + botClassDefinition.fileName

                    let requiredObject = require(path)
                    let requiredFunction = requiredObject[botClassDefinition.functionName]
                    projectInstance.botClasses[botClassDefinition.propertyName] = requiredFunction.call()
                }
            }
        }
    }
}