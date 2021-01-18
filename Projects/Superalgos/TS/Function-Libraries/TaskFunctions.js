exports.newSuperalgosFunctionLibrariesTaskFunctions = function () {

    let thisObject = {
        taskError: taskError,
        getBotModuleByName: getBotModuleByName,
    }

    return thisObject

    function taskError(node, errorMessage, docs) {
        let event
        if (node !== undefined) {
            event = {
                nodeName: node.name,
                nodeType: node.type,
                nodeId: node.id,
                errorMessage: errorMessage,
                docs: docs
            }
        } else {
            event = {
                errorMessage: errorMessage,
                docs: docs
            }
        }
        let key = TS.projects.superalgos.globals.taskConstants.TASK_NODE.name + '-' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.type + '-' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.id
        TS.projects.superalgos.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(key, 'Error', event)
    }

    function getBotModuleByName(botModuleName) {
            /* 
            We will scan the project schema until we find the module that will run the bot
            botModule with the name provided. 
            */
           for (let i = 0; i < TS.projects.superalgos.globals.taskConstants.PROJECTS_SCHEMA.length; i++) {
            let project = TS.projects.superalgos.globals.taskConstants.PROJECTS_SCHEMA[i]
            if (project.name !== TS.projects.superalgos.globals.taskConstants.PROJECT_DEFINITION_NODE.config.codeName) { continue }
            for (let j = 0; j < project.TS.botModules.length; j++) {
                botModuleDefinition = project.TS.botModules[j]
                if (botModuleDefinition.name === botModuleName) {
                    return botModuleDefinition
                }
            }
        }
    }
 }