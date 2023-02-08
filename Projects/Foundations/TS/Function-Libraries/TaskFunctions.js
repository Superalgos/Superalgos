exports.newFoundationsFunctionLibrariesTaskFunctions = function () {

    let thisObject = {
        taskHearBeat: taskHearBeat,
        taskError: taskError,
        getBotModuleByName: getBotModuleByName,
    }

    return thisObject

    function taskHearBeat(status, outputToConsole) {

        let key = TS.projects.foundations.globals.taskConstants.TASK_NODE.name + '-' + TS.projects.foundations.globals.taskConstants.TASK_NODE.type + '-' + TS.projects.foundations.globals.taskConstants.TASK_NODE.id

        /* The heartbeat event is raised at the event handler of the instance of this task, created at the TS. */
        let event = {
            seconds: (new Date()).getSeconds(),
            status: status
        }
        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(key, 'Heartbeat', event)
        if (outputToConsole === undefined || outputToConsole === true) {
            SA.logger.info('taskHearBeat -> status = ' + status)
        }

    }

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
        let key = TS.projects.foundations.globals.taskConstants.TASK_NODE.name + '-' + TS.projects.foundations.globals.taskConstants.TASK_NODE.type + '-' + TS.projects.foundations.globals.taskConstants.TASK_NODE.id
        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(key, 'Error', event)
    }

    function getBotModuleByName(botModuleName, botProject) {
        /* 
        We will scan the project schema until we find the module that will run the bot
        botModule with the name provided. 
        */
        for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
            let project = PROJECTS_SCHEMA[i]
            if (project.name !== botProject) { continue }
            if (project.TS === undefined || project.TS.botModules === undefined) { continue }
            for (let j = 0; j < project.TS.botModules.length; j++) {
                botModuleDefinition = project.TS.botModules[j]
                if (botModuleDefinition.name === botModuleName) {
                    return botModuleDefinition
                }
            }
        }
    }
}