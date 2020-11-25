exports.newNodeJsProcess = function newNodeJsProcess() {

    let thisObject = {
        initialize: initialize
    }

    return thisObject;

    function initialize() {

        process.on('uncaughtException', function (err) {
            console.log('[ERROR] Task Server -> server -> uncaughtException -> err.message = ' + err.message)
            console.log('[ERROR] Task Server -> server -> uncaughtException -> err.stack = ' + err.stack)
            console.log(err.stack)
            global.EXIT_NODE_PROCESS()
        })

        process.on('unhandledRejection', (reason, p) => {
            console.log('[ERROR] Task Server -> server -> unhandledRejection -> reason = ' + JSON.stringify(reason))
            console.log('[ERROR] Task Server -> server -> unhandledRejection -> p = ' + JSON.stringify(p))
            console.log(reason.stack)
            global.EXIT_NODE_PROCESS()
        })

        process.on('exit', function (config) {

            if (global.TASK_NODE !== undefined) {
                /* We send an event signaling that the Task is being terminated. */
                let key = global.TASK_NODE.name + '-' + global.TASK_NODE.type + '-' + global.TASK_NODE.id

                global.EVENT_SERVER_CLIENT_MODULE.raiseEvent(key, 'Stopped') // Meaning Task Stopped
                global.EVENT_SERVER_CLIENT_MODULE.finalize()
                global.EVENT_SERVER_CLIENT_MODULE = undefined
            }

            //console.log('[INFO] Task Server -> server -> process.on.exit -> About to exit -> config = ' + config)
        })

        /* Here we listen for the message to stop this Task / Process comming from the Task Manager, which is the paret of this node js process. */
        process.on('message', message => {
            if (message === 'Stop this Task') {

                global.STOP_TASK_GRACEFULLY = true;

                /*
                There are some process that might no be able to end grafully, for example the ones schedulle to process information in a future day or month.
                In order to be sure that the process will be terminated, we schedulle one forced exit in 2 minutes from now.
                */
                let key = global.TASK_NODE.name + '-' + global.TASK_NODE.type + '-' + global.TASK_NODE.id
                console.log('[INFO] Task Server -> server -> process.on -> Stopping Task ' + key + '. Nodejs process will be exited in less than 1 minute.')
                setTimeout(global.EXIT_NODE_PROCESS, 60000);
            }
        });

    }
}