exports.newSuperalgosFunctionLibrariesTaskFunctions = function () {

    let thisObject = {
        taskError: taskError
    }

    return thisObject

    function taskError(node, errorMessage) {
        let event
        if (node !== undefined) {
            event = {
                nodeName: node.name,
                nodeType: node.type,
                nodeId: node.id,
                errorMessage: errorMessage
            }
        } else {
            event = {
                errorMessage: errorMessage
            }
        }
        let key = global.TASK_NODE.name + '-' + global.TASK_NODE.type + '-' + global.TASK_NODE.id
        global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(key, 'Error', event)
    }
}