function newWebApp() {

    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {
        try {
            /*
            Here we will setup the UI object, with all the
            projects and spaces.
            */
            for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
                let projectDefinition = PROJECTS_SCHEMA[i]
                UI.projects[projectDefinition.propertyName] = {}
                let projectInstance = UI.projects[projectDefinition.propertyName]
 
                projectInstance.utilities = {}
                projectInstance.globals = {}
                projectInstance.functionLibraries = {}


                if (projectDefinition.UI === undefined) { continue }

                /* Set up Globals of this Project */
                if (projectDefinition.UI.globals !== undefined) {
                    for (let j = 0; j < projectDefinition.UI.globals.length; j++) {
                        let globalDefinition = projectDefinition.UI.globals[j]

                        projectInstance.globals[globalDefinition.propertyName] = eval(globalDefinition.functionName + '()')
                    }
                }

                /* Set up Utilities of this Project */
                if (projectDefinition.UI.utilities !== undefined) {
                    for (let j = 0; j < projectDefinition.UI.utilities.length; j++) {
                        let utilityDefinition = projectDefinition.UI.utilities[j]

                        projectInstance.utilities[utilityDefinition.propertyName] = eval(utilityDefinition.functionName + '()')
                    }
                }

                /* Set up Function Libraries of this Project */
                if (projectDefinition.UI.functionLibraries !== undefined) {
                    for (let j = 0; j < projectDefinition.UI.functionLibraries.length; j++) {
                        let functionLibraryDefinition = projectDefinition.UI.functionLibraries[j]

                        projectInstance.functionLibraries[functionLibraryDefinition.propertyName] = eval(functionLibraryDefinition.functionName + '()')
                    }
                }
            }
        } catch (err) {
           console.log('[ERROR] initialize -> err.stack = ' + err.stack)
        }
    }
}
