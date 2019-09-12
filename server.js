/*

This server creates and destroys Task Servers according to what is going on at the UI. Each of these created servers will do their own
work. The responsibility of this server is to manage those children processes in order to be in sync with what the end user want and is defining
at the user interface.

*/

const { fork } = require('child_process')
require('dotenv').config()
tasks = new Map()

const EVENT_HANDLER_MODULE = require('./SystemEventHandler.js');
const IPC = require('node-ipc');
global.SYSTEM_EVENT_HANDLER = EVENT_HANDLER_MODULE.newSystemEventHandler(IPC)
global.SYSTEM_EVENT_HANDLER.initialize('Task Manager', bootLoader)

console.log('Task Manager Server Started.')

/*

Here we will create an Event Handler for this server. After that we will listen to events happening here. Elements of the UI will raise events here,
as a way to communicate what is going on with the user interacting with UI components. That is the way this server will know for example when a new
task needs to be created or destroyed.

*/

function bootLoader() {
    global.SYSTEM_EVENT_HANDLER.createEventHandler('Task Manager')
    global.SYSTEM_EVENT_HANDLER.listenToEvent('Task Manager', 'Run Task', undefined, undefined, undefined, runTask)
    global.SYSTEM_EVENT_HANDLER.listenToEvent('Task Manager', 'Stop Task', undefined, undefined, undefined, stopTask)
}

function runTask(message) {
    console.log('[INFO] Task Manager -> server -> runTask -> Entering function.') 

    if (message.event === undefined) {
        console.log('[WARN] Task Manager -> server -> runTask -> Message Received Without Event -> message = ' + JSON.stringify(message))
        return
    }

    if (message.event.taskId === undefined) {
        console.log('[WARN] Task Manager -> server -> runTask -> Message Received Without taskId -> message = ' + JSON.stringify(message))
        return
    }

    if (message.event.definition === undefined) {
        console.log('[WARN] Task Manager -> server -> runTask -> Message Received Without Definition -> message = ' + JSON.stringify(message))
        return
    }

    console.log('[INFO] Task Manager -> server -> runTask -> Task Name = ' + message.event.taskName)
    console.log('[INFO] Task Manager -> server -> runTask -> Task Id = ' + message.event.taskId) 

    let path = process.env.TASK_SERVER_PATH + '/server.js'

    /* Workarround to avoid having the same debub port at the forked process which makes it crash. */
    for (let i = 0; i < process.execArgv.length; i++) {
        let argument = process.execArgv[i]
        if (argument.indexOf('--inspect') > -1) {
            process.execArgv[i] = ''
        }
    }

    /* Forking this process. */
    let task = {
        childProcess: fork(path , [message.event.definition], { stdio: 'inherit' }),
        id: message.event.taskId,
        name: message.event.taskName
    }
    
    tasks.set(message.event.taskId, task) 

    task.childProcess.on('error', (err) => {
        console.log('[ERROR] Task Manager -> server -> runTask -> Problem with Task Name = ' + task.name)
        console.log('[ERROR] Task Manager -> server -> runTask -> Problem with Task Id = ' + task.id)
        console.log(`[ERROR] Task Manager -> server -> runTask -> Task Manager exited with error ${err}`)
    })
    task.childProcess.on('close', (code, signal) => {
        console.log('[INFO] Task Manager -> server -> runTask -> Task Terminated. -> Task Name = ' + task.name)
        console.log('[INFO] Task Manager -> server -> runTask -> Task Terminated. -> Task Id = ' + task.id)
        tasks.delete(task.id)
    })
}

function stopTask(message) {

    console.log('[INFO] Task Manager -> server -> stopTask -> Entering function.')

    if (message.event === undefined) {
        console.log('[WARN] Task Manager -> server -> stopTask -> Message Received Without Event -> message = ' + JSON.stringify(message))
        return
    }

    if (message.event.taskId === undefined) {
        console.log('[WARN] Task Manager -> server -> stopTask -> Message Received Without taskId -> message = ' + JSON.stringify(message))
        return
    }

    console.log('[INFO] Task Manager -> server -> stopTask -> Task Name = ' + message.event.taskName)
    console.log('[INFO] Task Manager -> server -> stopTask -> Task Id = ' + message.event.taskId) 

    let task = tasks.get(message.event.taskId)

    if (task) {
        task.childProcess.send('Stop this Task');
        console.log('[INFO] Task Manager -> server -> stopTask -> Child Process instructed to finish.')
    } else {
        console.log('[WARN] Task Manager -> server -> stopTask -> Cannot delete Task that does not exist.')
    }
}